<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(): array
    {
        $admin = User::factory()->create(['role' => 'admin']);
        return [$admin, $admin->createToken('test')->plainTextToken];
    }

    private function ownerToken(): array
    {
        $owner = User::factory()->create(['role' => 'owner']);
        return [$owner, $owner->createToken('test')->plainTextToken];
    }

    public function test_admin_can_list_all_properties(): void
    {
        [$admin, $token] = $this->adminToken();
        $owner = User::factory()->create(['role' => 'owner']);
        Property::factory()->count(3)->create(['owner_id' => $owner->id]);

        $response = $this->withToken($token)->getJson('/api/properties');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_owner_only_sees_own_properties(): void
    {
        [$owner, $token] = $this->ownerToken();
        $other = User::factory()->create(['role' => 'owner']);

        Property::factory()->count(2)->create(['owner_id' => $owner->id]);
        Property::factory()->count(3)->create(['owner_id' => $other->id]);

        $response = $this->withToken($token)->getJson('/api/properties');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_owner_can_create_property(): void
    {
        [$owner, $token] = $this->ownerToken();

        $response = $this->withToken($token)->postJson('/api/properties', [
            'name'            => 'Test House',
            'address'         => '123 Main St',
            'price_per_month' => 500000,
            'bedrooms'        => 2,
            'bathrooms'       => 1,
            'owner_id'        => $owner->id,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('properties', ['name' => 'Test House']);
    }

    public function test_owner_can_update_own_property(): void
    {
        [$owner, $token] = $this->ownerToken();
        $property = Property::factory()->create(['owner_id' => $owner->id]);

        $response = $this->withToken($token)->putJson("/api/properties/{$property->id}", [
            'name'            => 'Updated Name',
            'address'         => $property->address,
            'price_per_month' => $property->price_per_month,
            'bedrooms'        => $property->bedrooms,
            'bathrooms'       => $property->bathrooms,
            'owner_id'        => $owner->id,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('properties', ['name' => 'Updated Name']);
    }

    public function test_owner_cannot_update_other_owners_property(): void
    {
        [$owner, $token] = $this->ownerToken();
        $other    = User::factory()->create(['role' => 'owner']);
        $property = Property::factory()->create(['owner_id' => $other->id]);

        $response = $this->withToken($token)->putJson("/api/properties/{$property->id}", [
            'name'            => 'Hijacked',
            'address'         => $property->address,
            'price_per_month' => $property->price_per_month,
            'bedrooms'        => $property->bedrooms,
            'bathrooms'       => $property->bathrooms,
            'owner_id'        => $other->id,
        ]);

        $response->assertStatus(403);
    }

    public function test_owner_can_delete_own_property(): void
    {
        [$owner, $token] = $this->ownerToken();
        $property = Property::factory()->create(['owner_id' => $owner->id]);

        $this->withToken($token)->deleteJson("/api/properties/{$property->id}")
            ->assertStatus(204);

        $this->assertSoftDeleted('properties', ['id' => $property->id]);
    }
}
