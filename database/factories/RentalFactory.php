<?php

namespace Database\Factories;

use App\Models\Property;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class RentalFactory extends Factory
{
    public function definition(): array
    {
        return [
            'property_id'  => Property::factory(),
            'tenant_id'    => Tenant::factory(),
            'start_date'   => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'monthly_rent' => fake()->numberBetween(300000, 1500000),
            'deposit'      => fake()->numberBetween(300000, 1500000),
            'status'       => 'active',
        ];
    }
}
