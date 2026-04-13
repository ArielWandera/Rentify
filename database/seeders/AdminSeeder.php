<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email    = env('ADMIN_EMAIL', 'admin@rentify.pro');
        $password = env('ADMIN_PASSWORD', 'ChangeMe123!');
        $name     = env('ADMIN_NAME', 'Admin');

        User::updateOrCreate(
            ['email' => $email],
            [
                'name'     => $name,
                'password' => bcrypt($password),
                'role'     => 'admin',
            ]
        );
    }
}