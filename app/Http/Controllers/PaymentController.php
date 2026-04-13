<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\UpdatePaymentRequest;
use App\Mail\PaymentReceipt;
use App\Models\Payment;
use App\Models\Rental;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

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

    public function store(StorePaymentRequest $request, Rental $rental)
    {
        $validated = $request->validated();

        // Check if user has permission to create payment for this rental
        $user = Auth::user();
        if ($user->role !== 'admin' && $rental->property->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated['rental_id'] = $rental->id;
        $validated['status'] = 'completed'; // Assuming payments are completed when recorded

        $payment = Payment::create($validated);

        // Update tenant's outstanding balance, floor at 0
        if (in_array($validated['type'], ['rent', 'deposit'])) {
            $tenant = $rental->tenant;
            if ($tenant) {
                $tenant->outstanding_balance = max(0, $tenant->outstanding_balance - $validated['amount_paid']);
                $tenant->save();
            }
        }

        $payment->load(['rental.tenant.user', 'rental.property']);

        // Send receipt to tenant
        $tenantEmail = $payment->rental->tenant?->user?->email;
        if ($tenantEmail) {
            Mail::to($tenantEmail)->queue(new PaymentReceipt($payment));
        }

        return response()->json($payment, 201);
    }

    public function show(Payment $payment)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $payment->rental->property->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($payment->load(['rental.tenant.user', 'rental.property']));
    }

    public function update(UpdatePaymentRequest $request, Payment $payment)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $payment->rental->property->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validated();

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

        return response()->json(null, 204);
    }
}
