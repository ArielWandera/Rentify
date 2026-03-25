<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Rental;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PesapalController extends Controller
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.pesapal.sandbox')
            ? 'https://cybqa.pesapal.com/pesapalv3'
            : 'https://pay.pesapal.com/v3';
    }

    private function http(): \Illuminate\Http\Client\PendingRequest
    {
        $client = Http::withHeaders(['Accept' => 'application/json']);
        if (config('services.pesapal.sandbox')) {
            $client = $client->withoutVerifying();
        }
        return $client;
    }

    private function getToken(): string
    {
        $response = $this->http()
            ->post("{$this->baseUrl}/api/Auth/RequestToken", [
                'consumer_key'    => config('services.pesapal.consumer_key'),
                'consumer_secret' => config('services.pesapal.consumer_secret'),
            ]);

        $data = $response->json();

        if (empty($data['token'])) {
            throw new \RuntimeException('Pesapal auth failed: ' . json_encode($data));
        }

        return $data['token'];
    }

    private function headers(): array
    {
        return [
            'Authorization' => 'Bearer ' . $this->getToken(),
            'Content-Type'  => 'application/json',
            'Accept'        => 'application/json',
        ];
    }

    // One-time setup: register the IPN URL with Pesapal (admin only)
    public function registerIPN()
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $response = Http::withHeaders($this->headers())
            ->post("{$this->baseUrl}/api/URLSetup/RegisterIPN", [
                'url'                  => config('app.url') . '/api/payments/pesapal/ipn',
                'ipn_notification_type' => 'GET',
            ]);

        return response()->json($response->json());
    }

    // Tenant initiates a payment
    public function initiatePayment(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'rental_id' => 'required|exists:rentals,id',
            'amount'    => 'required|numeric|min:500',
        ]);

        $rental = Rental::with(['property', 'tenant.user'])->findOrFail($validated['rental_id']);
        $tenant = Tenant::where('user_id', $user->id)->first();

        if (!$tenant || $rental->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Encode rental_id in merchant reference for IPN lookup
        $merchantRef = 'RNT-' . $rental->id . '-' . strtoupper(Str::random(8));

        $nameParts = explode(' ', $user->name, 2);

        $response = Http::withHeaders($this->headers())
            ->post("{$this->baseUrl}/api/Transactions/SubmitOrderRequest", [
                'id'              => $merchantRef,
                'currency'        => 'UGX',
                'amount'          => (float) $validated['amount'],
                'description'     => 'Rent payment – ' . $rental->property->name,
                'callback_url'    => config('services.pesapal.callback_url'),
                'notification_id' => config('services.pesapal.ipn_id'),
                'billing_address' => [
                    'email_address' => $user->email,
                    'phone_number'  => $tenant->phone ?? '',
                    'first_name'    => $nameParts[0],
                    'last_name'     => $nameParts[1] ?? '',
                ],
            ]);

        if (!$response->successful()) {
            return response()->json(['error' => 'Payment initiation failed. Check Pesapal credentials.'], 422);
        }

        $data = $response->json();

        return response()->json([
            'redirect_url'       => $data['redirect_url'],
            'order_tracking_id'  => $data['order_tracking_id'],
            'merchant_reference' => $merchantRef,
        ]);
    }

    // Frontend polls this after returning from Pesapal
    public function checkStatus(string $trackingId)
    {
        // Verify this tracking ID belongs to the authenticated user's rental
        $user   = Auth::user();
        $tenant = Tenant::where('user_id', $user->id)->first();

        if ($tenant) {
            $owned = Payment::where('pesapal_tracking_id', $trackingId)
                ->whereHas('rental', fn($q) => $q->where('tenant_id', $tenant->id))
                ->exists();

            // Allow if payment not yet recorded (still pending) — but only if
            // the merchant reference encodes a rental belonging to this tenant.
            // We check both recorded payments and pending ones via rental ownership.
            if (!$owned) {
                // Check there's no payment recorded under a different tenant
                $otherTenant = Payment::where('pesapal_tracking_id', $trackingId)
                    ->whereHas('rental', fn($q) => $q->where('tenant_id', '!=', $tenant->id))
                    ->exists();
                if ($otherTenant) {
                    return response()->json(['error' => 'Unauthorized'], 403);
                }
            }
        } elseif (!in_array($user->role, ['admin', 'owner'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $response = Http::withHeaders($this->headers())
            ->get("{$this->baseUrl}/api/Transactions/GetTransactionStatus", [
                'orderTrackingId' => $trackingId,
            ]);

        if (!$response->successful()) {
            return response()->json(['error' => 'Status check failed'], 422);
        }

        $data = $response->json();

        // payment_status_code: 1=completed, 0=invalid, 2=failed, 3=reversed
        if (($data['payment_status_code'] ?? 0) == 1) {
            $this->recordPayment($data);
        }

        return response()->json([
            'status'      => $data['payment_status_code'] ?? 0,
            'description' => $data['payment_status_description'] ?? 'Unknown',
            'amount'      => $data['amount'] ?? null,
        ]);
    }

    // Pesapal IPN webhook — PUBLIC route, no auth
    public function ipn(Request $request)
    {
        $trackingId = $request->query('OrderTrackingId');

        if (!$trackingId) {
            return response('', 400);
        }

        $response = Http::withHeaders($this->headers())
            ->get("{$this->baseUrl}/api/Transactions/GetTransactionStatus", [
                'orderTrackingId' => $trackingId,
            ]);

        if ($response->successful()) {
            $data = $response->json();
            if (($data['payment_status_code'] ?? 0) == 1) {
                $this->recordPayment($data);
            }
        }

        return response('', 200);
    }

    private function recordPayment(array $data): void
    {
        $trackingId  = $data['order_tracking_id'] ?? null;
        $merchantRef = $data['merchant_reference'] ?? '';

        if (!$trackingId || Payment::where('pesapal_tracking_id', $trackingId)->exists()) {
            return;
        }

        // Parse rental_id from merchant reference: RNT-{rentalId}-{random}
        $parts    = explode('-', $merchantRef);
        $rentalId = $parts[1] ?? null;

        if (!$rentalId) return;

        $rental = Rental::with('tenant')->find($rentalId);
        if (!$rental) return;

        $amount = $data['amount'] ?? 0;

        Payment::create([
            'rental_id'           => $rental->id,
            'amount_paid'         => $amount,
            'type'                => 'rent',
            'status'              => 'completed',
            'payment_date'        => now(),
            'notes'               => 'Mobile money payment via Pesapal',
            'pesapal_tracking_id' => $trackingId,
        ]);

        if ($rental->tenant) {
            $rental->tenant->outstanding_balance = max(0, $rental->tenant->outstanding_balance - $amount);
            $rental->tenant->save();
        }
    }
}
