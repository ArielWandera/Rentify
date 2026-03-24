<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Tenant;
use App\Models\Payment;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function adminReport()
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $properties = Property::with(['owner', 'rentals.tenant.user'])->get();
        $tenants    = Tenant::with(['user', 'rentals.property'])->get();
        $payments   = Payment::with(['rental.tenant.user', 'rental.property'])
                        ->orderBy('payment_date', 'desc')->get();

        $totalRevenue     = $payments->where('status', 'completed')->sum('amount_paid');
        $totalOutstanding = $tenants->sum('outstanding_balance');

        $pdf = Pdf::loadView('reports.admin', [
            'admin'               => $user,
            'properties'          => $properties,
            'tenants'             => $tenants,
            'payments'            => $payments,
            'totalRevenue'        => $totalRevenue,
            'totalOutstanding'    => $totalOutstanding,
            'totalProperties'     => $properties->count(),
            'availableProperties' => $properties->filter(fn($p) => $p->isAvailable())->count(),
            'totalTenants'        => $tenants->count(),
            'generatedAt'         => now()->format('d M Y, H:i'),
        ])->setPaper('a4', 'portrait');

        return $pdf->download('rentify-admin-report-' . now()->format('Y-m-d') . '.pdf');
    }

    public function ownerReport()
    {
        $user = Auth::user();
        if (!in_array($user->role, ['admin', 'owner'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $properties = Property::with(['owner', 'rentals.tenant.user'])
                        ->where('owner_id', $user->id)->get();

        $tenants = Tenant::with(['user', 'rentals.property'])
                    ->whereHas('rentals.property', fn($q) => $q->where('owner_id', $user->id))
                    ->get();

        $payments = Payment::with(['rental.tenant.user', 'rental.property'])
                    ->whereHas('rental.property', fn($q) => $q->where('owner_id', $user->id))
                    ->orderBy('payment_date', 'desc')->get();

        $totalRevenue     = $payments->where('status', 'completed')->sum('amount_paid');
        $totalOutstanding = $tenants->sum('outstanding_balance');

        $pdf = Pdf::loadView('reports.owner', [
            'owner'            => $user,
            'properties'       => $properties,
            'tenants'          => $tenants,
            'payments'         => $payments,
            'totalRevenue'     => $totalRevenue,
            'totalOutstanding' => $totalOutstanding,
            'generatedAt'      => now()->format('d M Y, H:i'),
        ])->setPaper('a4', 'portrait');

        return $pdf->download('rentify-owner-report-' . now()->format('Y-m-d') . '.pdf');
    }

    public function tenantReport()
    {
        $user   = Auth::user();
        $tenant = Tenant::with(['user', 'rentals.property.owner', 'rentals.payments'])
                    ->where('user_id', $user->id)->first();

        if (!$tenant) {
            return response()->json(['error' => 'No tenant profile found'], 404);
        }

        $activeRental = $tenant->rentals->firstWhere('status', 'active');
        $payments     = $tenant->rentals
                            ->flatMap(fn($r) => $r->payments)
                            ->sortByDesc('payment_date')
                            ->values();

        $pdf = Pdf::loadView('reports.tenant', [
            'tenant'        => $tenant,
            'activeRental'  => $activeRental,
            'payments'      => $payments,
            'generatedAt'   => now()->format('d M Y, H:i'),
        ])->setPaper('a4', 'portrait');

        return $pdf->download('rentify-rental-statement-' . now()->format('Y-m-d') . '.pdf');
    }
}
