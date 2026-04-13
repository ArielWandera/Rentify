<?php

namespace Tests\Feature;

use App\Mail\PasswordChanged;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PasswordChangeTest extends TestCase
{
    use RefreshDatabase;

    private function user(): array
    {
        $user  = User::factory()->create(['password' => bcrypt('OldPass1!')]);
        $token = $user->createToken('test')->plainTextToken;
        return [$user, $token];
    }

    public function test_user_can_change_password(): void
    {
        Mail::fake();
        [$user, $token] = $this->user();

        $this->withToken($token)->putJson('/api/user/password', [
            'current_password'      => 'OldPass1!',
            'password'              => 'NewPass2@',
            'password_confirmation' => 'NewPass2@',
        ])->assertStatus(200);

        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('NewPass2@', $user->fresh()->password));
    }

    public function test_wrong_current_password_returns_422(): void
    {
        [$user, $token] = $this->user();

        $this->withToken($token)->putJson('/api/user/password', [
            'current_password'      => 'WrongPass1!',
            'password'              => 'NewPass2@',
            'password_confirmation' => 'NewPass2@',
        ])->assertStatus(422)
          ->assertJsonPath('errors.current_password.0', 'Current password is incorrect.');
    }

    public function test_mismatched_confirmation_returns_422(): void
    {
        [$user, $token] = $this->user();

        $this->withToken($token)->putJson('/api/user/password', [
            'current_password'      => 'OldPass1!',
            'password'              => 'NewPass2@',
            'password_confirmation' => 'DifferentPass3#',
        ])->assertStatus(422);
    }

    public function test_weak_new_password_returns_422(): void
    {
        [$user, $token] = $this->user();

        $this->withToken($token)->putJson('/api/user/password', [
            'current_password'      => 'OldPass1!',
            'password'              => 'weak',
            'password_confirmation' => 'weak',
        ])->assertStatus(422);
    }

    public function test_security_email_is_queued_after_change(): void
    {
        Mail::fake();
        [$user, $token] = $this->user();

        $this->withToken($token)->putJson('/api/user/password', [
            'current_password'      => 'OldPass1!',
            'password'              => 'NewPass2@',
            'password_confirmation' => 'NewPass2@',
        ]);

        Mail::assertQueued(PasswordChanged::class, fn ($mail) => $mail->hasTo($user->email));
    }

    public function test_unauthenticated_cannot_change_password(): void
    {
        $this->putJson('/api/user/password', [
            'current_password'      => 'OldPass1!',
            'password'              => 'NewPass2@',
            'password_confirmation' => 'NewPass2@',
        ])->assertStatus(401);
    }
}
