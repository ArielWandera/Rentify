<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PropertyFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'            => fake()->words(3, true),
            'address'         => fake()->streetAddress() . ', Kampala',
            'description'     => fake()->sentence(),
            'price_per_month' => fake()->numberBetween(300000, 2000000),
            'bedrooms'        => fake()->numberBetween(1, 5),
            'bathrooms'       => fake()->numberBetween(1, 3),
            'owner_id'        => User::factory()->create(['role' => 'owner'])->id,
        ];
    }
}
