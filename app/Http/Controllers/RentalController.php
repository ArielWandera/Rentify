<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRentalRequest;
use App\Http\Requests\UpdateRentalRequest;
use App\Models\AuditLog;
use App\Models\Rental;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

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

        AuditLog::record('deleted', "Rental for '{$rental->property->name}' deleted", $rental);
        $rental->delete();

        return response()->json(null, 204);
    }

    public function terminate(Rental $rental)
    {
        $user = Auth::user();

        if ($user->role !== 'admin' && $rental->property->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $rental->update(['status' => 'terminated', 'end_date' => now()->toDateString()]);

        AuditLog::record('terminated', "Tenant '{$rental->tenant?->user?->name}' terminated from '{$rental->property->name}'", $rental);

        return response()->json($rental->load(['property', 'tenant.user']));
    }

    public function uploadLease(Request $request, Rental $rental)
    {
        $user = Auth::user();

        if ($user->role !== 'admin' && $rental->property->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate(['lease' => 'required|file|mimes:pdf|max:10240']);

        if ($rental->lease_path) {
            Storage::disk('local')->delete($rental->lease_path);
        }

        $path = $request->file('lease')->store("leases/{$rental->id}", 'local');
        $rental->update(['lease_path' => $path]);

        AuditLog::record('lease_uploaded', "Lease uploaded for rental #{$rental->id} ({$rental->property->name})", $rental);

        return response()->json(['message' => 'Lease uploaded successfully']);
    }

    public function downloadLease(Rental $rental)
    {
        $user = Auth::user();
        $rental->loadMissing(['tenant', 'property']);
        $isTenant = $user->role === 'tenant' && (int) $rental->tenant?->user_id === (int) $user->id;
        $isOwnerOrAdmin = $user->role === 'admin' || (int) $rental->property?->owner_id === (int) $user->id;

        if (!$isTenant && !$isOwnerOrAdmin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!$rental->lease_path || !Storage::disk('local')->exists($rental->lease_path)) {
            return response()->json(['error' => 'No lease document uploaded yet'], 404);
        }

        return Storage::disk('local')->download($rental->lease_path, 'lease-agreement.pdf');
    }
}
