<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TenantFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'             => User::factory()->create(['role' => 'tenant'])->id,
            'phone'               => '256' . fake()->numerify('#########'),
            'date_of_birth'       => fake()->date('Y-m-d', '-18 years'),
            'outstanding_balance' => 0,
        ];
    }
}
