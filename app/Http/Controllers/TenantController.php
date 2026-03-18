<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\Rental;
use App\Models\Payment;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    public function index()
    {
        return Tenant::with(['user', 'rentals.property'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:tenants',
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'outstanding_balance' => 'numeric|min:0',
        ]);

        $tenant = Tenant::create($validated);

        return response()->json($tenant->load('user'), 201);
    }

    public function show(Tenant $tenant)
    {
        return response()->json($tenant->load(['user', 'rentals.property', 'rentals.payments']));
    }

    public function update(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'outstanding_balance' => 'numeric|min:0',
        ]);

        $tenant->update($validated);

        return response()->json($tenant->load('user'));
    }

    public function destroy(Tenant $tenant)
    {
        // Check if tenant has active rentals
        if ($tenant->rentals()->where('status', 'active')->exists()) {
            return response()->json(['error' => 'Cannot delete tenant with active rentals'], 400);
        }

        $tenant->delete();

        return response()->json(null, 204);
    }

    public function assignProperty(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'monthly_rent' => 'required|numeric|min:0',
            'deposit' => 'numeric|min:0',
        ]);

        // Check if property is available
        $property = \App\Models\Property::find($validated['property_id']);
        if (!$property->isAvailable()) {
            return response()->json(['error' => 'Property is not available'], 400);
        }

        $rental = Rental::create([
            'property_id' => $validated['property_id'],
            'tenant_id' => $tenant->id,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'monthly_rent' => $validated['monthly_rent'],
            'deposit' => $validated['deposit'] ?? 0,
            'status' => 'active',
        ]);

        // Create initial payment for deposit if provided
        if ($validated['deposit'] > 0) {
            Payment::create([
                'rental_id' => $rental->id,
                'amount_paid' => $validated['deposit'],
                'type' => 'deposit',
                'status' => 'completed',
                'payment_date' => now(),
                'notes' => 'Initial deposit payment',
            ]);
        }

        // Increment outstanding balance by first month's rent
        // (deposit cancels out since it's immediately paid above)
        $tenant->outstanding_balance += $validated['monthly_rent'];
        $tenant->save();

        return response()->json($rental->load(['property', 'tenant.user']), 201);
    }

    public function unassignProperty(Tenant $tenant, Rental $rental)
    {
        if ($rental->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Rental does not belong to this tenant'], 403);
        }

        $rental->update(['status' => 'terminated', 'end_date' => now()]);

        return response()->json($rental);
    }

    public function getBalance(Tenant $tenant)
    {
        $totalPaid = $tenant->rentals()->join('payments', 'rentals.id', '=', 'payments.rental_id')
            ->where('payments.status', 'completed')
            ->sum('payments.amount_paid');

        $totalOwed = $tenant->rentals()->sum('monthly_rent') + $tenant->rentals()->sum('deposit');

        $balance = $totalOwed - $totalPaid;

        return response()->json([
            'tenant_id' => $tenant->id,
            'total_paid' => $totalPaid,
            'total_owed' => $totalOwed,
            'outstanding_balance' => $balance,
        ]);
    }
}
