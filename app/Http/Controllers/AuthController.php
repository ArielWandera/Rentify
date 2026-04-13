<?php

namespace App\Http\Controllers;

use App\Mail\PasswordChanged;
use App\Mail\PasswordResetMail;
use App\Mail\WelcomeOwner;
use Illuminate\Support\Facades\Password as PasswordBroker;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
      $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
      ]);

      $user = User::create([
        'name'     => $request->name,
        'email'    => $request->email,
        'password' => Hash::make($request->password),
        'role'     => 'owner',
      ]);

      Mail::to($user->email)->queue(new WelcomeOwner($user));
      AuditLog::record('register', "{$user->name} registered as a landlord", $user);

      $token = $user->createToken('api-token')->plainTextToken;

      return response()->json(['user' => $user, 'token' => $token]);
    }

    public function login(Request $request)
    {
      $request->validate([
        'email' => 'required|email',
        'password' => 'required',
      ]);

      $user = User::where('email', $request->email)->first();

      if (! $user || ! Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
          'email' => ['The provided credentials are incorrect.'],
        ]);
      }

      $token = $user->createToken('api-token')->plainTextToken;

      AuditLog::record('login', "{$user->name} logged in", $user);

      return response()->json(['user' => $user, 'token' => $token]);
    }

    public function user(Request $request)
    {
      return response()->json($request->user());
    }

    public function logout(Request $request)
    {
      AuditLog::record('logout', "{$request->user()->name} logged out", $request->user());
      $request->user()->currentAccessToken()->delete();

      return response()->json(['message' => 'Logged out']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        // Always return success — don't reveal whether email exists
        if ($user) {
            $token    = PasswordBroker::broker()->createToken($user);
            $resetUrl = config('app.url') . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);
            Mail::to($user->email)->queue(new PasswordResetMail($user, $resetUrl));
        }

        return response()->json(['message' => 'If that email is registered you will receive a reset link shortly.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'token'    => 'required',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        $status = PasswordBroker::broker()->reset(
            $request->only('email', 'token', 'password', 'password_confirmation'),
            function ($user, $password) {
                $user->password = Hash::make($password);
                $user->save();
                Mail::to($user->email)->queue(new PasswordChanged($user));
                AuditLog::record('password_reset', "{$user->name} reset their password via email link", $user);
            }
        );

        if ($status === PasswordBroker::PASSWORD_RESET) {
            return response()->json(['message' => 'Password reset successfully.']);
        }

        return response()->json(['errors' => ['token' => [__($status)]]], 422);
    }

    public function changePassword(Request $request)
    {
      $request->validate([
        'current_password' => 'required',
        'password'         => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
      ]);

      $user = $request->user();

      if (!Hash::check($request->current_password, $user->password)) {
        return response()->json(['errors' => ['current_password' => ['Current password is incorrect.']]], 422);
      }

      $user->password = Hash::make($request->password);
      $user->save();

      Mail::to($user->email)->queue(new PasswordChanged($user));
      AuditLog::record('password_changed', "{$user->name} changed their password", $user);

      return response()->json(['message' => 'Password updated successfully.']);
    }
}