<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Rental;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RentalTest extends TestCase
{
    use RefreshDatabase;

    private function makeAdmin(): array
    {
        $user = User::factory()->create(['role' => 'admin']);
        return [$user, $user->createToken('test')->plainTextToken];
    }

    private function makeOwner(): array
    {
        $user = User::factory()->create(['role' => 'owner']);
        return [$user, $user->createToken('test')->plainTextToken];
    }

    private function makeTenant(): array
    {
        $user   = User::factory()->create(['role' => 'tenant']);
        $tenant = Tenant::factory()->create(['user_id' => $user->id]);
        return [$user, $tenant, $user->createToken('test')->plainTextToken];
    }

    // -------------------------------------------------------------------------
    // index
    // -------------------------------------------------------------------------

    public function test_unauthenticated_request_is_rejected(): void
    {
        $this->getJson('/api/rentals')->assertStatus(401);
    }

    public function test_admin_can_list_all_rentals(): void
    {
        [$admin, $token] = $this->makeAdmin();
        Rental::factory()->count(3)->create();

        $this->withToken($token)->getJson('/api/rentals')
            ->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_owner_only_sees_rentals_for_own_properties(): void
    {
        [$owner, $token] = $this->makeOwner();
        $otherOwner = User::factory()->create(['role' => 'owner']);

        $ownProperty   = Property::factory()->create(['owner_id' => $owner->id]);
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);

        Rental::factory()->count(2)->create(['property_id' => $ownProperty->id]);
        Rental::factory()->count(3)->create(['property_id' => $otherProperty->id]);

        $this->withToken($token)->getJson('/api/rentals')
            ->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_tenant_only_sees_own_rentals(): void
    {
        [$tenantUser, $tenant, $token] = $this->makeTenant();
        $otherTenant = Tenant::factory()->create();

        Rental::factory()->count(1)->create(['tenant_id' => $tenant->id]);
        Rental::factory()->count(2)->create(['tenant_id' => $otherTenant->id]);

        $this->withToken($token)->getJson('/api/rentals')
            ->assertStatus(200)
            ->assertJsonCount(1);
    }

    // -------------------------------------------------------------------------
    // destroy
    // -------------------------------------------------------------------------

    public function test_admin_can_delete_any_rental(): void
    {
        [$admin, $token] = $this->makeAdmin();
        $rental = Rental::factory()->create();

        $this->withToken($token)->deleteJson("/api/rentals/{$rental->id}")
            ->assertStatus(204);

        $this->assertSoftDeleted('rentals', ['id' => $rental->id]);
    }

    public function test_owner_can_delete_rental_on_own_property(): void
    {
        [$owner, $token] = $this->makeOwner();
        $property = Property::factory()->create(['owner_id' => $owner->id]);
        $rental   = Rental::factory()->create(['property_id' => $property->id]);

        $this->withToken($token)->deleteJson("/api/rentals/{$rental->id}")
            ->assertStatus(204);

        $this->assertSoftDeleted('rentals', ['id' => $rental->id]);
    }

    public function test_owner_cannot_delete_rental_on_other_owners_property(): void
    {
        [$owner, $token] = $this->makeOwner();
        $otherOwner = User::factory()->create(['role' => 'owner']);
        $property   = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $rental     = Rental::factory()->create(['property_id' => $property->id]);

        $this->withToken($token)->deleteJson("/api/rentals/{$rental->id}")
            ->assertStatus(403);
    }

    public function test_tenant_cannot_delete_rentals(): void
    {
        [$tenantUser, $tenant, $token] = $this->makeTenant();
        $rental = Rental::factory()->create(['tenant_id' => $tenant->id]);

        $this->withToken($token)->deleteJson("/api/rentals/{$rental->id}")
            ->assertStatus(403);
    }
}
