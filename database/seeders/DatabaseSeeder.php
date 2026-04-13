<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Models\Property;
use App\Models\Rental;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin (reads ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME from .env) ──
        $this->call(AdminSeeder::class);

        // ── Owner ──────────────────────────────────────────────────────────────
        $owner = User::updateOrCreate(
            ['email' => 'john.kamau@rentify.com'],
            ['name' => 'John Kamau', 'password' => Hash::make('Password1!'), 'role' => 'owner']
        );

        // ── Properties ─────────────────────────────────────────────────────────

        // 1. Single-unit property
        $singleProp = Property::updateOrCreate(
            ['name' => 'Kololo Heights Apartment', 'owner_id' => $owner->id],
            [
                'address'         => 'Plot 14, Kololo Hill Drive, Kampala',
                'description'     => 'Modern 2-bedroom apartment in the heart of Kololo with great city views and 24h security.',
                'price_per_month' => 1500000,
                'bedrooms'        => 2,
                'bathrooms'       => 1,
                'owner_id'        => $owner->id,
            ]
        );

        // 2. Multi-unit property
        $multiProp = Property::updateOrCreate(
            ['name' => 'Bukoto Court Apartments', 'owner_id' => $owner->id],
            [
                'address'         => 'Plot 22, Bukoto Street, Kampala',
                'description'     => 'Modern apartment block with 3 self-contained units. Each unit has its own kitchen and bathroom. Secure parking, 24h security.',
                'price_per_month' => 900000,
                'bedrooms'        => 2,
                'bathrooms'       => 1,
                'owner_id'        => $owner->id,
            ]
        );

        // Units — A1 and A2 will be occupied, A3 free
        $unitA1 = Unit::updateOrCreate(
            ['property_id' => $multiProp->id, 'unit_number' => 'A1'],
            ['bedrooms' => 1, 'bathrooms' => 1, 'price_per_month' => 750000]
        );
        $unitA2 = Unit::updateOrCreate(
            ['property_id' => $multiProp->id, 'unit_number' => 'A2'],
            ['bedrooms' => 2, 'bathrooms' => 1, 'price_per_month' => 900000]
        );
        Unit::updateOrCreate(
            ['property_id' => $multiProp->id, 'unit_number' => 'A3'],
            ['bedrooms' => 3, 'bathrooms' => 2, 'price_per_month' => 1200000]
        );

        // ── Tenants ────────────────────────────────────────────────────────────

        // Tenant 1: David — Kololo Heights, 1 month arrears (demonstrates outstanding balance + Pay Now)
        $davidUser = User::updateOrCreate(
            ['email' => 'david.ochieng@gmail.com'],
            ['name' => 'David Ochieng', 'password' => Hash::make('Password1!'), 'role' => 'tenant']
        );
        $david = Tenant::updateOrCreate(
            ['user_id' => $davidUser->id],
            ['owner_id' => $owner->id, 'phone' => '256782345678', 'date_of_birth' => '1990-05-14', 'outstanding_balance' => 1500000]
        );
        $rentalDavid = Rental::updateOrCreate(
            ['property_id' => $singleProp->id, 'tenant_id' => $david->id],
            ['start_date' => '2025-01-01', 'monthly_rent' => 1500000, 'deposit' => 1500000, 'status' => 'active']
        );
        foreach (['2025-01-01', '2025-02-01', '2025-03-01'] as $date) {
            Payment::updateOrCreate(
                ['rental_id' => $rentalDavid->id, 'payment_date' => $date, 'type' => 'rent'],
                ['amount_paid' => 1500000, 'status' => 'completed', 'notes' => 'Monthly rent']
            );
        }

        // Tenant 2: Grace — Unit A1, fully paid up (demonstrates clean state + download statement)
        $graceUser = User::updateOrCreate(
            ['email' => 'grace.atim@gmail.com'],
            ['name' => 'Grace Atim', 'password' => Hash::make('Password1!'), 'role' => 'tenant']
        );
        $grace = Tenant::updateOrCreate(
            ['user_id' => $graceUser->id],
            ['owner_id' => $owner->id, 'phone' => '256701234567', 'date_of_birth' => '1995-11-22', 'outstanding_balance' => 0]
        );
        $rentalGrace = Rental::updateOrCreate(
            ['property_id' => $multiProp->id, 'tenant_id' => $grace->id],
            ['unit_id' => $unitA1->id, 'start_date' => '2025-02-01', 'monthly_rent' => 750000, 'deposit' => 750000, 'status' => 'active']
        );
        foreach (['2025-02-01', '2025-03-01', '2025-04-01'] as $date) {
            Payment::updateOrCreate(
                ['rental_id' => $rentalGrace->id, 'payment_date' => $date, 'type' => 'rent'],
                ['amount_paid' => 750000, 'status' => 'completed', 'notes' => 'Monthly rent']
            );
        }

        // Tenant 3: Amina — Unit A2, 1 month arrears (demonstrates multi-unit occupancy in payout report)
        $aminaUser = User::updateOrCreate(
            ['email' => 'amina.nakato@gmail.com'],
            ['name' => 'Amina Nakato', 'password' => Hash::make('Password1!'), 'role' => 'tenant']
        );
        $amina = Tenant::updateOrCreate(
            ['user_id' => $aminaUser->id],
            ['owner_id' => $owner->id, 'phone' => '256703456789', 'date_of_birth' => '1992-07-30', 'outstanding_balance' => 900000]
        );
        $rentalAmina = Rental::updateOrCreate(
            ['property_id' => $multiProp->id, 'tenant_id' => $amina->id],
            ['unit_id' => $unitA2->id, 'start_date' => '2025-03-01', 'monthly_rent' => 900000, 'deposit' => 900000, 'status' => 'active']
        );
        Payment::updateOrCreate(
            ['rental_id' => $rentalAmina->id, 'payment_date' => '2025-03-01', 'type' => 'rent'],
            ['amount_paid' => 900000, 'status' => 'completed', 'notes' => 'Monthly rent']
        );
    }
}
