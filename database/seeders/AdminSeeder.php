<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email    = env('ADMIN_EMAIL', 'admin@rentify.pro');
        $password = env('ADMIN_PASSWORD', 'Password1!');
        $name     = env('ADMIN_NAME', 'Admin');

        // Remove any stale admin accounts before creating the definitive one
        User::where('role', 'admin')->where('email', '!=', $email)->delete();

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