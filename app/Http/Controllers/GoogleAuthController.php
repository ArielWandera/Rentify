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

        // Returning Google user
        $user = User::where('google_id', $googleUser->getId())->first();

        if (!$user) {
            // Existing account registered with email — link it
            $user = User::where('email', $googleUser->getEmail())->first();
            if ($user) {
                $user->update(['google_id' => $googleUser->getId()]);
            } else {
                // Brand-new user via Google
                $user = User::create([
                    'name'      => $googleUser->getName(),
                    'email'     => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'role'      => 'tenant',
                ]);
            }
        }

        $token = $user->createToken('google-token')->plainTextToken;

        AuditLog::record('login', "{$user->name} logged in via Google", $user);

        return redirect(config('app.url') . '/auth/callback?token=' . $token);
    }
}
