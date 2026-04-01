<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect(config('app.url') . '/login?error=google_failed');
        }

        $user = User::updateOrCreate(
            ['google_id' => $googleUser->getId()],
            [
                'name'  => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'role'  => 'tenant',
            ]
        );

        // If a user with same email already exists without google_id, link them
        if (!$user->wasRecentlyCreated && !$user->google_id) {
            $user->update(['google_id' => $googleUser->getId()]);
        }

        $token = $user->createToken('google-token')->plainTextToken;

        AuditLog::record('login', "{$user->name} logged in via Google", $user);

        return redirect(config('app.url') . '/auth/callback?token=' . $token);
    }
}
