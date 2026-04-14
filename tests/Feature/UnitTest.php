<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UnitTest extends TestCase
{
    use RefreshDatabase;

    private function ownerWithProperty(): array
    {
        $owner    = User::factory()->create(['role' => 'owner']);
        $token    = $owner->createToken('test')->plainTextToken;
        $property = Property::factory()->create(['owner_id' => $owner->id]);
        return [$owner, $token, $property];
    }

    // ── Generate ──────────────────────────────────────────────────────────────

    public function test_owner_can_generate_units_numeric_pattern(): void
    {
        [, $token, $property] = $this->ownerWithProperty();

        $res = $this->withToken($token)->postJson("/api/properties/{$property->id}/units/generate", [
            'floors'          => 2,
            'units_per_floor' => 3,
            'pattern'         => 'numeric',
            'price_per_month' => 800000,
            'bedrooms'        => 1,
            'bathrooms'       => 1,
        ]);

        $res->assertStatus(201);
        $this->assertCount(6, $res->json('created'));
        $this->assertDatabaseCount('units', 6);

        // Spot-check naming
        $numbers = collect($res->json('created'))->pluck('unit_number');
        $this->assertTrue($numbers->contains('101'));
        $this->assertTrue($numbers->contains('203'));
    }

    public function test_owner_can_generate_units_alpha_pattern(): void
    {
        [, $token, $property] = $this->ownerWithProperty();

        $res = $this->withToken($token)->postJson("/api/properties/{$property->id}/units/generate", [
            'floors'          => 2,
            'units_per_floor' => 2,
            'pattern'         => 'alpha',
            'price_per_month' => 500000,
            'bedrooms'        => 1,
            'bathrooms'       => 1,
        ]);

        $res->assertStatus(201);
        $numbers = collect($res->json('created'))->pluck('unit_number');
        $this->assertTrue($numbers->contains('A1'));
        $this->assertTrue($numbers->contains('B2'));
    }

    public function test_generate_skips_existing_unit_numbers(): void
    {
        [, $token, $property] = $this->ownerWithProperty();

        // Pre-create unit 101
        $property->units()->create(['unit_number' => '101', 'floor' => 1, 'bedrooms' => 1, 'bathrooms' => 1, 'price_per_month' => 500000]);

        $res = $this->withToken($token)->postJson("/api/properties/{$property->id}/units/generate", [
            'floors'          => 1,
            'units_per_floor' => 3,
            'pattern'         => 'numeric',
            'price_per_month' => 600000,
            'bedrooms'        => 1,
            'bathrooms'       => 1,
        ]);

        $res->assertStatus(201);
        $this->assertCount(2, $res->json('created'));   // 102, 103
        $this->assertCount(1, $res->json('skipped'));   // 101
        $this->assertDatabaseCount('units', 3);         // 1 pre-existing + 2 new
    }

    public function test_generate_sets_floor_on_each_unit(): void
    {
        [, $token, $property] = $this->ownerWithProperty();

        $this->withToken($token)->postJson("/api/properties/{$property->id}/units/generate", [
            'floors'          => 3,
            'units_per_floor' => 1,
            'pattern'         => 'numeric',
            'price_per_month' => 700000,
            'bedrooms'        => 1,
            'bathrooms'       => 1,
        ]);

        $this->assertDatabaseHas('units', ['unit_number' => '101', 'floor' => 1]);
        $this->assertDatabaseHas('units', ['unit_number' => '201', 'floor' => 2]);
        $this->assertDatabaseHas('units', ['unit_number' => '301', 'floor' => 3]);
    }

    public function test_generate_validates_required_fields(): void
    {
        [, $token, $property] = $this->ownerWithProperty();

        $this->withToken($token)
            ->postJson("/api/properties/{$property->id}/units/generate", [])
            ->assertStatus(422);
    }

    public function test_owner_cannot_generate_units_for_another_owners_property(): void
    {
        [, $token] = $this->ownerWithProperty();
        $other     = User::factory()->create(['role' => 'owner']);
        $property2 = Property::factory()->create(['owner_id' => $other->id]);

        $this->withToken($token)->postJson("/api/properties/{$property2->id}/units/generate", [
            'floors'          => 1,
            'units_per_floor' => 1,
            'pattern'         => 'numeric',
            'price_per_month' => 500000,
            'bedrooms'        => 1,
            'bathrooms'       => 1,
        ])->assertStatus(403);
    }

    // ── Bulk update ───────────────────────────────────────────────────────────

    public function test_owner_can_bulk_update_selected_units(): void
    {
        [, $token, $property] = $this->ownerWithProperty();

        $u1 = $property->units()->create(['unit_number' => 'A1', 'floor' => 1, 'bedrooms' => 1, 'bathrooms' => 1, 'price_per_month' => 500000]);
        $u2 = $property->units()->create(['unit_number' => 'A2', 'floor' => 1, 'bedrooms' => 1, 'bathrooms' => 1, 'price_per_month' => 500000]);
        $u3 = $property->units()->create(['unit_number' => 'A3', 'floor' => 1, 'bedrooms' => 1, 'bathrooms' => 1, 'price_per_month' => 500000]);

        // Only update A1 and A2
        $res = $this->withToken($token)->postJson("/api/properties/{$property->id}/units/bulk", [
            'unit_ids'        => [$u1->id, $u2->id],
            'price_per_month' => 750000,
            'bedrooms'        => 2,
        ]);

        $res->assertStatus(200);
        $this->assertDatabaseHas('units', ['id' => $u1->id, 'price_per_month' => 750000, 'bedrooms' => 2]);
        $this->assertDatabaseHas('units', ['id' => $u2->id, 'price_per_month' => 750000, 'bedrooms' => 2]);
        // A3 untouched
        $this->assertDatabaseHas('units', ['id' => $u3->id, 'price_per_month' => 500000, 'bedrooms' => 1]);
    }

    public function test_bulk_update_returns_422_when_no_fields_given(): void
    {
        [, $token, $property] = $this->ownerWithProperty();
        $u1 = $property->units()->create(['unit_number' => 'A1', 'floor' => 1, 'bedrooms' => 1, 'bathrooms' => 1, 'price_per_month' => 500000]);

        $this->withToken($token)->postJson("/api/properties/{$property->id}/units/bulk", [
            'unit_ids' => [$u1->id],
        ])->assertStatus(422);
    }

    public function test_bulk_update_cannot_touch_another_owners_units(): void
    {
        [, $token, $property] = $this->ownerWithProperty();
        $other     = User::factory()->create(['role' => 'owner']);
        $property2 = Property::factory()->create(['owner_id' => $other->id]);
        $alien     = $property2->units()->create(['unit_number' => 'B1', 'floor' => 1, 'bedrooms' => 1, 'bathrooms' => 1, 'price_per_month' => 500000]);

        // Passes unit ID from another property — should be ignored silently (scoped to own property)
        $this->withToken($token)->postJson("/api/properties/{$property->id}/units/bulk", [
            'unit_ids'        => [$alien->id],
            'price_per_month' => 999999,
        ])->assertStatus(200);

        // Price must not have changed
        $this->assertDatabaseHas('units', ['id' => $alien->id, 'price_per_month' => 500000]);
    }

    // ── Floor field ───────────────────────────────────────────────────────────

    public function test_store_unit_accepts_floor(): void
    {
        [, $token, $property] = $this->ownerWithProperty();

        $this->withToken($token)->postJson("/api/properties/{$property->id}/units", [
            'unit_number'     => '301',
            'floor'           => 3,
            'bedrooms'        => 2,
            'bathrooms'       => 1,
            'price_per_month' => 900000,
        ])->assertStatus(201)->assertJsonPath('floor', 3);
    }

    public function test_update_unit_can_change_floor(): void
    {
        [, $token, $property] = $this->ownerWithProperty();
        $unit = $property->units()->create(['unit_number' => 'A1', 'floor' => 1, 'bedrooms' => 1, 'bathrooms' => 1, 'price_per_month' => 500000]);

        $this->withToken($token)->putJson("/api/units/{$unit->id}", ['floor' => 5])
            ->assertStatus(200)
            ->assertJsonPath('floor', 5);
    }
}
