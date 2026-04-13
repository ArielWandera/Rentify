<?php

namespace Tests\Feature;

use App\Models\InvitationToken;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class InviteTest extends TestCase
{
    use RefreshDatabase;

    private function makeToken(array $overrides = []): array
    {
        $user  = User::factory()->create(['role' => 'tenant', 'password' => null]);
        $token = InvitationToken::create(array_merge([
            'user_id'    => $user->id,
            'token'      => Str::random(64),
            'expires_at' => now()->addHours(48),
            'used_at'    => null,
        ], $overrides));

        return [$user, $token];
    }

    public function test_valid_token_returns_user_info(): void
    {
        [$user, $token] = $this->makeToken();

        $this->getJson("/api/invite/{$token->token}")
            ->assertStatus(200)
            ->assertJsonFragment(['email' => $user->email, 'name' => $user->name]);
    }

    public function test_expired_token_returns_410(): void
    {
        [$user, $token] = $this->makeToken(['expires_at' => now()->subHour()]);

        $this->getJson("/api/invite/{$token->token}")->assertStatus(410);
    }

    public function test_used_token_returns_410(): void
    {
        [$user, $token] = $this->makeToken(['used_at' => now()->subMinute()]);

        $this->getJson("/api/invite/{$token->token}")->assertStatus(410);
    }

    public function test_nonexistent_token_returns_410(): void
    {
        $this->getJson('/api/invite/' . Str::random(64))->assertStatus(410);
    }

    public function test_accept_sets_password_and_returns_auth_token(): void
    {
        [$user, $token] = $this->makeToken();

        $response = $this->postJson("/api/invite/{$token->token}", [
            'password'              => 'NewPass1!',
            'password_confirmation' => 'NewPass1!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user']);

        // Password was actually set
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('NewPass1!', $user->fresh()->password));

        // Token is now marked used
        $this->assertNotNull($token->fresh()->used_at);
    }

    public function test_accept_rejects_weak_password(): void
    {
        [$user, $token] = $this->makeToken();

        $this->postJson("/api/invite/{$token->token}", [
            'password'              => 'weakpassword',
            'password_confirmation' => 'weakpassword',
        ])->assertStatus(422);
    }

    public function test_accept_rejects_mismatched_confirmation(): void
    {
        [$user, $token] = $this->makeToken();

        $this->postJson("/api/invite/{$token->token}", [
            'password'              => 'StrongPass1!',
            'password_confirmation' => 'DifferentPass1!',
        ])->assertStatus(422);
    }

    public function test_used_token_cannot_be_accepted_again(): void
    {
        [$user, $token] = $this->makeToken(['used_at' => now()->subMinute()]);

        $this->postJson("/api/invite/{$token->token}", [
            'password'              => 'NewPass1!',
            'password_confirmation' => 'NewPass1!',
        ])->assertStatus(410);
    }
}
