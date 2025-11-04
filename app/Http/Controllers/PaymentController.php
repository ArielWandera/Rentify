<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Rental;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            $payments = Payment::with(['rental.tenant.user', 'rental.property'])->get();
        } elseif ($user->role === 'owner') {
            $payments = Payment::whereHas('rental.property', function ($query) use ($user) {
                $query->where('owner_id', $user->id);
            })->with(['rental.tenant.user', 'rental.property'])->get();
        } else {
            // For tenants, show only their own payments
            $payments = Payment::whereHas('rental.tenant', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->with(['rental.tenant.user', 'rental.property'])->get();
        }

        return response()->json($payments);
    }

    public function store(Request $request, Rental $rental)
    {
        $validated = $request->validate([
            'amount_paid' => 'required|numeric|min:0',
            'type' => 'required|in:rent,deposit,maintenance,other',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        // Check if user has permission to create payment for this rental
        $user = Auth::user();
        if ($user->role !== 'admin' && $rental->property->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated['rental_id'] = $rental->id;
        $validated['status'] = 'completed'; // Assuming payments are completed when recorded

        $payment = Payment::create($validated);

        // Update tenant's outstanding balance
        if ($validated['type'] === 'rent' || $validated['type'] === 'deposit') {
            $tenant = $rental->tenant;
            $tenant->outstanding_balance -= $validated['amount_paid'];
            $tenant->save();
        }

        return response()->json($payment->load(['rental.tenant.user', 'rental.property']), 201);
    }

    public function show(Payment $payment)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $payment->rental->property->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($payment->load(['rental.tenant.user', 'rental.property']));
    }

    public function update(Request $request, Payment $payment)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $payment->rental->property->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'amount_paid' => 'numeric|min:0',
            'type' => 'in:rent,deposit,maintenance,other',
            'payment_date' => 'date',
            'notes' => 'nullable|string|max:500',
            'status' => 'in:pending,completed,failed',
        ]);

        $payment->update($validated);

        return response()->json($payment->load(['rental.tenant.user', 'rental.property']));
    }

    public function destroy(Payment $payment)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $payment->rental->property->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $payment->delete();

        return response()->json(['message' => 'Payment deleted successfully']);
    }
}
