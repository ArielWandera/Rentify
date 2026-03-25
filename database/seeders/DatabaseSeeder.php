<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Models\Property;
use App\Models\Rental;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ──────────────────────────────────────────────
        $admin = User::updateOrCreate(
            ['email' => 'admin@rentify.com'],
            ['name' => 'Admin User', 'password' => Hash::make('password'), 'role' => 'admin']
        );

        // ── Owners ─────────────────────────────────────────────
        $owner1 = User::updateOrCreate(
            ['email' => 'john.kamau@rentify.com'],
            ['name' => 'John Kamau', 'password' => Hash::make('password'), 'role' => 'owner']
        );

        $owner2 = User::updateOrCreate(
            ['email' => 'sarah.nakato@rentify.com'],
            ['name' => 'Sarah Nakato', 'password' => Hash::make('password'), 'role' => 'owner']
        );

        // ── Properties ─────────────────────────────────────────
        $prop1 = Property::updateOrCreate(
            ['name' => 'Kololo Heights Apartment', 'owner_id' => $owner1->id],
            [
                'address'         => 'Plot 14, Kololo Hill Drive, Kampala',
                'description'     => 'Modern 2-bedroom apartment in the heart of Kololo with great city views.',
                'price_per_month' => 1500000,
                'bedrooms'        => 2,
                'bathrooms'       => 1,
                'owner_id'        => $owner1->id,
            ]
        );

        $prop2 = Property::updateOrCreate(
            ['name' => 'Ntinda Studio', 'owner_id' => $owner1->id],
            [
                'address'         => '22 Ntinda Road, Kampala',
                'description'     => 'Cozy studio apartment, ideal for a single professional.',
                'price_per_month' => 700000,
                'bedrooms'        => 1,
                'bathrooms'       => 1,
                'owner_id'        => $owner1->id,
            ]
        );

        $prop3 = Property::updateOrCreate(
            ['name' => 'Entebbe Lakeside Villa', 'owner_id' => $owner2->id],
            [
                'address'         => 'Plot 8, Lakeside Crescent, Entebbe',
                'description'     => 'Spacious 3-bedroom villa with lake views, parking, and garden.',
                'price_per_month' => 2500000,
                'bedrooms'        => 3,
                'bathrooms'       => 2,
                'owner_id'        => $owner2->id,
            ]
        );

        $prop4 = Property::updateOrCreate(
            ['name' => 'Muyenga Bungalow', 'owner_id' => $owner2->id],
            [
                'address'         => '5 Tank Hill Road, Muyenga, Kampala',
                'description'     => 'Quiet 2-bedroom bungalow in upscale Muyenga neighbourhood.',
                'price_per_month' => 1800000,
                'bedrooms'        => 2,
                'bathrooms'       => 2,
                'owner_id'        => $owner2->id,
            ]
        );

        // ── Tenant Users ───────────────────────────────────────
        $tenantUser1 = User::updateOrCreate(
            ['email' => 'david.ochieng@gmail.com'],
            ['name' => 'David Ochieng', 'password' => Hash::make('password'), 'role' => 'tenant']
        );

        $tenantUser2 = User::updateOrCreate(
            ['email' => 'grace.atim@gmail.com'],
            ['name' => 'Grace Atim', 'password' => Hash::make('password'), 'role' => 'tenant']
        );

        // ── Tenant Profiles ────────────────────────────────────
        // owner_id tracks which owner manages this tenant
        $tenant1 = Tenant::updateOrCreate(
            ['user_id' => $tenantUser1->id],
            ['owner_id' => $owner1->id, 'phone' => '256782345678', 'date_of_birth' => '1990-05-14', 'outstanding_balance' => 1500000]
        );

        $tenant2 = Tenant::updateOrCreate(
            ['user_id' => $tenantUser2->id],
            ['owner_id' => $owner2->id, 'phone' => '256701234567', 'date_of_birth' => '1995-11-22', 'outstanding_balance' => 0]
        );

        // ── Rentals ────────────────────────────────────────────
        $rental1 = Rental::updateOrCreate(
            ['property_id' => $prop1->id, 'tenant_id' => $tenant1->id],
            [
                'start_date'   => '2025-01-01',
                'monthly_rent' => 1500000,
                'deposit'      => 1500000,
                'status'       => 'active',
            ]
        );

        $rental2 = Rental::updateOrCreate(
            ['property_id' => $prop3->id, 'tenant_id' => $tenant2->id],
            [
                'start_date'   => '2024-09-01',
                'monthly_rent' => 2500000,
                'deposit'      => 2500000,
                'status'       => 'active',
            ]
        );

        // ── Payments for tenant1 (has outstanding balance — missed Jan) ──
        foreach (['2025-01-01', '2025-02-01', '2025-03-01'] as $date) {
            Payment::updateOrCreate(
                ['rental_id' => $rental1->id, 'payment_date' => $date, 'type' => 'rent'],
                ['amount_paid' => 1500000, 'status' => 'completed', 'notes' => 'Monthly rent']
            );
        }

        // ── Payments for tenant2 (fully paid up) ──────────────
        foreach (['2024-09-01', '2024-10-01', '2024-11-01', '2024-12-01', '2025-01-01', '2025-02-01', '2025-03-01'] as $date) {
            Payment::updateOrCreate(
                ['rental_id' => $rental2->id, 'payment_date' => $date, 'type' => 'rent'],
                ['amount_paid' => 2500000, 'status' => 'completed', 'notes' => 'Monthly rent']
            );
        }
    }
}
