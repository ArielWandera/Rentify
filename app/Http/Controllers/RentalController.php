<?php

namespace App\Http\Controllers;

use App\Models\Rental;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RentalController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $query = Rental::with(['property', 'tenant.user']);

        if ($user->role === 'owner') {
            $query->whereHas('property', fn($q) => $q->where('owner_id', $user->id));
        } elseif ($user->role === 'tenant') {
            $query->whereHas('tenant', fn($q) => $q->where('user_id', $user->id));
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'tenant_id' => 'required|exists:tenants,id',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'monthly_rent' => 'required|numeric|min:0',
            'deposit' => 'numeric|min:0',
            'status' => 'required|in:active,pending,terminated',
        ]);

        $rental = Rental::create($validated);

        return response()->json($rental->load(['property', 'tenant.user']), 201);
    }

    public function show(Rental $rental)
    {
        return response()->json($rental->load(['property', 'tenant.user', 'payments']));
    }

    public function update(Request $request, Rental $rental)
    {
        $validated = $request->validate([
            'start_date' => 'date',
            'end_date' => 'nullable|date|after:start_date',
            'monthly_rent' => 'numeric|min:0',
            'deposit' => 'numeric|min:0',
            'status' => 'in:active,pending,terminated',
        ]);

        $rental->update($validated);

        return response()->json($rental->load(['property', 'tenant.user']));
    }

    public function destroy(Rental $rental)
    {
        $user = Auth::user();

        if ($user->role !== 'admin' && $rental->property->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $rental->delete();

        return response()->json(null, 204);
    }
}
