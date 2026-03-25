<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\Rental;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TenantController extends Controller
{
    public function index(Request $request)
    {
        $user       = Auth::user();
        $unassigned = $request->boolean('unassigned');

        if ($user->role === 'admin') {
            $query = Tenant::with(['user', 'rentals.property']);
        } elseif ($user->role === 'owner') {
            // Owners only see tenants they created
            $query = Tenant::with(['user', 'rentals.property'])
                ->where('owner_id', $user->id);
        } else {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Filter to tenants without an active rental (for assignment modal)
        if ($unassigned) {
            $query->whereDoesntHave('rentals', fn($q) => $q->where('status', 'active'));
        }

        return $query->get();
    }

    public function me()
    {
        $user = Auth::user();
        $tenant = Tenant::with(['rentals.property', 'rentals.payments'])
            ->where('user_id', $user->id)
            ->first();

        if (!$tenant) {
            return response()->json(['message' => 'No tenant record found for this user.'], 404);
        }

        $activeRental = $tenant->rentals->firstWhere('status', 'active');

        $payments = $tenant->rentals
            ->flatMap(fn($r) => $r->payments)
            ->sortByDesc('payment_date')
            ->values();

        return response()->json([
            'tenant'        => $tenant,
            'active_rental' => $activeRental,
            'payments'      => $payments,
        ]);
    }

    public function store(Request $request)
    {
        $authUser = Auth::user();

        $request->validate([
            'name'                => 'required|string|max:255',
            'email'               => 'required|email|unique:users,email',
            'password'            => 'nullable|string|min:8',
            'phone'               => 'nullable|string|max:20',
            'date_of_birth'       => 'nullable|date',
            'outstanding_balance' => 'numeric|min:0',
        ]);

        // Create the user account for the tenant
        $tenantUser = \App\Models\User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => bcrypt($request->password ?? 'password'),
            'role'     => 'tenant',
        ]);

        $tenant = Tenant::create([
            'user_id'             => $tenantUser->id,
            'owner_id'            => $authUser->role === 'owner' ? $authUser->id : null,
            'phone'               => $request->phone,
            'date_of_birth'       => $request->date_of_birth,
            'outstanding_balance' => $request->outstanding_balance ?? 0,
        ]);

        return response()->json($tenant->load('user'), 201);
    }

    public function show(Tenant $tenant)
    {
        $user = Auth::user();
        if ($user->role === 'owner' && $tenant->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        return response()->json($tenant->load(['user', 'rentals.property', 'rentals.payments']));
    }

    public function update(Request $request, Tenant $tenant)
    {
        $user = Auth::user();
        if ($user->role === 'owner' && $tenant->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

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
        $user = Auth::user();
        if ($user->role === 'owner' && $tenant->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($tenant->rentals()->where('status', 'active')->exists()) {
            return response()->json(['error' => 'Cannot delete tenant with active rentals'], 400);
        }

        $tenant->delete();

        return response()->json(null, 204);
    }

    public function assignProperty(Request $request, Tenant $tenant)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'monthly_rent' => 'required|numeric|min:0',
            'deposit' => 'numeric|min:0',
        ]);

        $property = \App\Models\Property::findOrFail($validated['property_id']);

        // Owners can only assign their own tenants to their own properties
        if ($user->role === 'owner') {
            if ($tenant->owner_id !== $user->id || $property->owner_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
        }

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
