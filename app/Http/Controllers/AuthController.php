<?php

namespace App\Http\Controllers;

use App\Mail\WelcomeOwner;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
      $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|min:8|confirmed',
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
}