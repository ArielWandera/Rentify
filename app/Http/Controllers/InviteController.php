<?php

namespace App\Http\Controllers;

use App\Models\InvitationToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class InviteController extends Controller
{
    // Validate a token and return the associated user's name/email
    public function show(string $token)
    {
        $record = InvitationToken::with('user')->where('token', $token)->first();

        if (!$record || !$record->isValid()) {
            return response()->json(['error' => 'This invitation link is invalid or has expired.'], 410);
        }

        return response()->json([
            'name'  => $record->user->name,
            'email' => $record->user->email,
        ]);
    }

    // Accept invite — set password and return auth token
    public function accept(Request $request, string $token)
    {
        $record = InvitationToken::with('user')->where('token', $token)->first();

        if (!$record || !$record->isValid()) {
            return response()->json(['error' => 'This invitation link is invalid or has expired.'], 410);
        }

        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $record->user;
        $user->password = Hash::make($request->password);
        $user->save();

        $record->update(['used_at' => now()]);

        $authToken = $user->createToken('invite-token')->plainTextToken;

        return response()->json([
            'token' => $authToken,
            'user'  => $user,
        ]);
    }
}
