<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Rental;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TerminationTest extends TestCase
{
    use RefreshDatabase;

    private function makeRental(): array
    {
        $owner    = User::factory()->create(['role' => 'owner']);
        $property = Property::factory()->create(['owner_id' => $owner->id]);
        $tenant   = Tenant::factory()->create();
        $rental   = Rental::factory()->create(['property_id' => $property->id, 'tenant_id' => $tenant->id, 'status' => 'active']);
        $token    = $owner->createToken('test')->plainTextToken;
        return [$rental, $token];
    }

    public function test_owner_can_terminate_tenant(): void
    {
        [$rental, $token] = $this->makeRental();

        $this->withToken($token)
            ->postJson("/api/rentals/{$rental->id}/terminate")
            ->assertStatus(200)
            ->assertJsonPath('status', 'terminated');

        $this->assertDatabaseHas('rentals', ['id' => $rental->id, 'status' => 'terminated']);
    }

    public function test_admin_can_terminate_any_tenant(): void
    {
        [$rental] = $this->makeRental();
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson("/api/rentals/{$rental->id}/terminate")
            ->assertStatus(200);
    }

    public function test_other_owner_cannot_terminate(): void
    {
        [$rental] = $this->makeRental();
        $otherOwner = User::factory()->create(['role' => 'owner']);
        $token      = $otherOwner->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson("/api/rentals/{$rental->id}/terminate")
            ->assertStatus(403);
    }

    public function test_termination_sets_end_date_to_today(): void
    {
        [$rental, $token] = $this->makeRental();

        $this->withToken($token)->postJson("/api/rentals/{$rental->id}/terminate");

        $this->assertDatabaseHas('rentals', [
            'id'       => $rental->id,
            'end_date' => now()->toDateString(),
        ]);
    }

    public function test_termination_creates_audit_log(): void
    {
        [$rental, $token] = $this->makeRental();

        $this->withToken($token)->postJson("/api/rentals/{$rental->id}/terminate");

        $this->assertDatabaseHas('audit_logs', ['action' => 'terminated']);
    }
}
