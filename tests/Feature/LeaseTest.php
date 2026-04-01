<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Rental;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LeaseTest extends TestCase
{
    use RefreshDatabase;

    private function makeOwnerWithRental(): array
    {
        $owner    = User::factory()->create(['role' => 'owner']);
        $property = Property::factory()->create(['owner_id' => $owner->id]);
        $tenant   = Tenant::factory()->create();
        $rental   = Rental::factory()->create(['property_id' => $property->id, 'tenant_id' => $tenant->id]);
        $token    = $owner->createToken('test')->plainTextToken;
        return [$owner, $rental, $tenant, $token];
    }

    public function test_owner_can_upload_lease(): void
    {
        Storage::fake('local');
        [$owner, $rental, $tenant, $token] = $this->makeOwnerWithRental();

        $file = UploadedFile::fake()->create('lease.pdf', 100, 'application/pdf');

        $this->withToken($token)
            ->postJson("/api/rentals/{$rental->id}/lease", ['lease' => $file])
            ->assertStatus(200)
            ->assertJsonPath('message', 'Lease uploaded successfully');

        $this->assertNotNull($rental->fresh()->lease_path);
    }

    public function test_tenant_can_download_own_lease(): void
    {
        Storage::fake('local');
        [$owner, $rental, $tenantModel, $ownerToken] = $this->makeOwnerWithRental();

        $file = UploadedFile::fake()->create('lease.pdf', 100, 'application/pdf');
        $this->withToken($ownerToken)->postJson("/api/rentals/{$rental->id}/lease", ['lease' => $file]);

        $tenantToken = $tenantModel->user->createToken('test')->plainTextToken;

        $this->withToken($tenantToken)
            ->getJson("/api/rentals/{$rental->id}/lease")
            ->assertStatus(200);
    }

    public function test_other_tenant_cannot_download_lease(): void
    {
        Storage::fake('local');
        [$owner, $rental, $tenantModel, $ownerToken] = $this->makeOwnerWithRental();

        $file = UploadedFile::fake()->create('lease.pdf', 100, 'application/pdf');
        $this->withToken($ownerToken)->postJson("/api/rentals/{$rental->id}/lease", ['lease' => $file]);

        $otherTenant = Tenant::factory()->create();

        // Use actingAs to avoid session bleed from the previous withToken request
        $this->actingAs($otherTenant->user, 'sanctum')
            ->getJson("/api/rentals/{$rental->id}/lease")
            ->assertStatus(403);
    }

    public function test_download_returns_404_when_no_lease_uploaded(): void
    {
        [$owner, $rental, $tenant, $token] = $this->makeOwnerWithRental();

        $this->withToken($token)
            ->getJson("/api/rentals/{$rental->id}/lease")
            ->assertStatus(404);
    }

    public function test_only_pdf_files_are_accepted(): void
    {
        Storage::fake('local');
        [$owner, $rental, $tenant, $token] = $this->makeOwnerWithRental();

        $file = UploadedFile::fake()->create('lease.exe', 100, 'application/octet-stream');

        $this->withToken($token)
            ->postJson("/api/rentals/{$rental->id}/lease", ['lease' => $file])
            ->assertStatus(422);
    }
}
