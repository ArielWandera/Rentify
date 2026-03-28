<?php

namespace App\Http\Controllers;

use App\Mail\PaymentReminder;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class ReminderController extends Controller
{
    // Send reminder to a single tenant manually
    public function sendToTenant(Request $request, Tenant $tenant)
    {
        $user = Auth::user();
        if (!in_array($user->role, ['admin', 'owner'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($tenant->outstanding_balance <= 0) {
            return response()->json(['message' => 'Tenant has no outstanding balance'], 200);
        }

        $tenant->load(['user', 'rentals.property.owner']);
        $notes = $request->input('notes', '');

        Mail::to($tenant->user->email)->send(new PaymentReminder($tenant, $notes));

        return response()->json(['message' => 'Reminder sent to ' . $tenant->user->name]);
    }

    // Send reminders to ALL tenants with outstanding balances (admin/owner)
    public function sendAll(Request $request)
    {
        $user = Auth::user();
        if (!in_array($user->role, ['admin', 'owner'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $notes = $request->input('notes', '');

        $query = Tenant::with(['user', 'rentals.property.owner'])
            ->where('outstanding_balance', '>', 0);

        // Owners only send to their own tenants
        if ($user->role === 'owner') {
            $query->whereHas('rentals.property', fn($q) => $q->where('owner_id', $user->id));
        }

        $tenants = $query->get();
        $sent = 0;

        foreach ($tenants as $tenant) {
            if ($tenant->user?->email) {
                Mail::to($tenant->user->email)->queue(new PaymentReminder($tenant, $notes));
                $sent++;
            }
        }

        return response()->json(['message' => "Reminders queued for {$sent} tenant(s)"]);
    }
}
