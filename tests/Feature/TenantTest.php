<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Rental;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_all_tenants(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;

        Tenant::factory()->count(4)->create();

        $this->withToken($token)->getJson('/api/tenants')
            ->assertStatus(200)
            ->assertJsonCount(4);
    }

    public function test_owner_only_sees_tenants_on_their_properties(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $token = $owner->createToken('test')->plainTextToken;

        $myProperty    = Property::factory()->create(['owner_id' => $owner->id]);
        $otherOwner    = User::factory()->create(['role' => 'owner']);
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);

        $myTenant    = Tenant::factory()->create();
        $otherTenant = Tenant::factory()->create();

        Rental::factory()->create([
            'property_id' => $myProperty->id,
            'tenant_id'   => $myTenant->id,
            'status'      => 'active',
        ]);
        Rental::factory()->create([
            'property_id' => $otherProperty->id,
            'tenant_id'   => $otherTenant->id,
            'status'      => 'active',
        ]);

        $this->withToken($token)->getJson('/api/tenants')
            ->assertStatus(200)
            ->assertJsonCount(1);
    }

    public function test_tenant_can_access_own_profile(): void
    {
        $user   = User::factory()->create(['role' => 'tenant']);
        $tenant = Tenant::factory()->create(['user_id' => $user->id]);
        $token  = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->getJson('/api/tenants/me')
            ->assertStatus(200)
            ->assertJsonFragment(['id' => $tenant->id]);
    }

    public function test_non_tenant_cannot_access_tenant_me_endpoint(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $token = $owner->createToken('test')->plainTextToken;

        $this->withToken($token)->getJson('/api/tenants/me')
            ->assertStatus(404);
    }

    public function test_admin_can_create_tenant(): void
    {
        $admin     = User::factory()->create(['role' => 'admin']);
        $token     = $admin->createToken('test')->plainTextToken;
        $tenantUser = User::factory()->create(['role' => 'tenant']);

        $this->withToken($token)->postJson('/api/tenants', [
            'user_id' => $tenantUser->id,
            'phone'   => '256700000000',
        ])->assertStatus(201);

        $this->assertDatabaseHas('tenants', ['user_id' => $tenantUser->id]);
    }
}
