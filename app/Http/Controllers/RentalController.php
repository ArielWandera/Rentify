<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRentalRequest;
use App\Http\Requests\UpdateRentalRequest;
use App\Models\Rental;
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

    public function store(StoreRentalRequest $request)
    {
        $validated = $request->validated();

        $rental = Rental::create($validated);

        return response()->json($rental->load(['property', 'tenant.user']), 201);
    }

    public function show(Rental $rental)
    {
        return response()->json($rental->load(['property', 'tenant.user', 'payments']));
    }

    public function update(UpdateRentalRequest $request, Rental $rental)
    {
        $validated = $request->validated();

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
