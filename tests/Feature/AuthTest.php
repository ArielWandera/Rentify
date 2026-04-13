<?php

namespace Tests\Feature;

use App\Mail\WelcomeOwner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials(): void
    {
        User::factory()->create([
            'email'    => 'test@example.com',
            'password' => bcrypt('password123'),
            'role'     => 'admin',
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/login', [
            'email'    => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422);
    }

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'New Landlord',
            'email'                 => 'newlandlord@example.com',
            'password'              => 'Password1!',
            'password_confirmation' => 'Password1!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user']);

        $this->assertDatabaseHas('users', [
            'email' => 'newlandlord@example.com',
            'role'  => 'owner',
        ]);
    }

    public function test_authenticated_user_can_get_profile(): void
    {
        $user  = User::factory()->create(['role' => 'owner']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJsonFragment(['email' => $user->email]);
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $this->getJson('/api/user')->assertStatus(401);
    }

    public function test_register_creates_owner_role(): void
    {
        Mail::fake();

        $this->postJson('/api/register', [
            'name'                  => 'Landlord Joe',
            'email'                 => 'joe@example.com',
            'password'              => 'Password1!',
            'password_confirmation' => 'Password1!',
        ])->assertStatus(200);

        $this->assertDatabaseHas('users', ['email' => 'joe@example.com', 'role' => 'owner']);
    }

    public function test_register_queues_welcome_email(): void
    {
        Mail::fake();

        $this->postJson('/api/register', [
            'name'                  => 'Landlord Joe',
            'email'                 => 'joe@example.com',
            'password'              => 'Password1!',
            'password_confirmation' => 'Password1!',
        ]);

        Mail::assertQueued(WelcomeOwner::class, fn ($mail) => $mail->hasTo('joe@example.com'));
    }

    public function test_register_rejects_weak_password(): void
    {
        $this->postJson('/api/register', [
            'name'                  => 'Landlord Joe',
            'email'                 => 'joe@example.com',
            'password'              => 'weakpassword',
            'password_confirmation' => 'weakpassword',
        ])->assertStatus(422);
    }

    public function test_register_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $this->postJson('/api/register', [
            'name'                  => 'Another User',
            'email'                 => 'existing@example.com',
            'password'              => 'Password1!',
            'password_confirmation' => 'Password1!',
        ])->assertStatus(422);
    }

    public function test_user_can_logout(): void
    {
        $user  = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/logout')->assertStatus(200);

        // Token should be deleted from the database
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
