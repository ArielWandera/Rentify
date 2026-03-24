<?php

namespace Database\Factories;

use App\Models\Rental;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'rental_id'    => Rental::factory(),
            'amount_paid'  => fake()->numberBetween(100000, 1000000),
            'type'         => fake()->randomElement(['rent', 'deposit', 'fee']),
            'status'       => 'completed',
            'payment_date' => fake()->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),
            'notes'        => null,
        ];
    }
}
