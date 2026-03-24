<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Rental;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class MobileMoneyController extends Controller
{
    private string $baseUrl = 'https://api.flutterwave.com/v3';

    private function headers(): array
    {
        return [
            'Authorization' => 'Bearer ' . config('services.flutterwave.secret_key'),
            'Content-Type'  => 'application/json',
        ];
    }

    // Initiate a mobile money payment (MTN or Airtel Uganda)
    public function initiate(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'rental_id'    => 'required|exists:rentals,id',
            'amount'       => 'required|numeric|min:500',
            'phone'        => 'required|string',
            'network'      => 'required|in:MTN,AIRTEL',
        ]);

        $rental = Rental::with(['property', 'tenant.user'])->findOrFail($validated['rental_id']);

        // Make sure this tenant owns this rental
        $tenant = Tenant::where('user_id', $user->id)->first();
        if (!$tenant || $rental->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $txRef = 'RNT-' . strtoupper(Str::random(10));

        $payload = [
            'tx_ref'        => $txRef,
            'amount'        => $validated['amount'],
            'currency'      => 'UGX',
            'email'         => $user->email,
            'phone_number'  => $validated['phone'],
            'fullname'      => $user->name,
            'network'       => $validated['network'],
            'meta'          => [
                'rental_id' => $rental->id,
                'tenant_id' => $tenant->id,
            ],
        ];

        $response = Http::withHeaders($this->headers())
            ->post("{$this->baseUrl}/charges?type=mobile_money_uganda", $payload);

        if (!$response->successful()) {
            return response()->json([
                'error' => 'Payment initiation failed. Please try again.'
            ], 422);
        }

        $data = $response->json();

        return response()->json([
            'status'  => $data['status'],
            'message' => $data['message'],
            'tx_ref'  => $txRef,
            'data'    => $data['data'] ?? null,
        ]);
    }

    // Verify payment after user confirms on phone
    public function verify(Request $request)
    {
        $validated = $request->validate([
            'tx_ref'    => 'required|string',
            'rental_id' => 'required|exists:rentals,id',
            'amount'    => 'required|numeric',
        ]);

        // Verify with Flutterwave
        $response = Http::withHeaders($this->headers())
            ->get("{$this->baseUrl}/transactions/verify_by_reference", [
                'tx_ref' => $validated['tx_ref'],
            ]);

        if (!$response->successful()) {
            return response()->json(['error' => 'Verification failed'], 422);
        }

        $result = $response->json();
        $txData = $result['data'] ?? null;

        if (!$txData || $txData['status'] !== 'successful') {
            return response()->json(['error' => 'Payment was not successful'], 422);
        }

        // Prevent duplicate recording
        if (Payment::where('flutterwave_ref', $validated['tx_ref'])->exists()) {
            return response()->json(['message' => 'Payment already recorded'], 200);
        }

        $rental = Rental::with(['tenant'])->findOrFail($validated['rental_id']);

        // Record the payment
        $payment = Payment::create([
            'rental_id'       => $rental->id,
            'amount_paid'     => $txData['amount'],
            'type'            => 'rent',
            'status'          => 'completed',
            'payment_date'    => now(),
            'notes'           => 'Mobile money payment via ' . ($txData['payment_type'] ?? 'Flutterwave'),
            'flutterwave_ref' => $validated['tx_ref'],
        ]);

        // Update outstanding balance
        $tenant = $rental->tenant;
        $tenant->outstanding_balance -= $txData['amount'];
        $tenant->save();

        return response()->json([
            'message' => 'Payment successful and recorded.',
            'payment' => $payment,
        ]);
    }

    // Flutterwave webhook (optional but good practice)
    public function webhook(Request $request)
    {
        $secretHash = config('services.flutterwave.secret_hash');
        $signature  = $request->header('verif-hash');

        if ($signature !== $secretHash) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $payload = $request->json()->all();

        if (($payload['event'] ?? '') === 'charge.completed' && $payload['data']['status'] === 'successful') {
            $txRef    = $payload['data']['tx_ref'];
            $rentalId = $payload['data']['meta']['rental_id'] ?? null;

            if ($rentalId && !Payment::where('flutterwave_ref', $txRef)->exists()) {
                $rental = Rental::with('tenant')->find($rentalId);
                if ($rental) {
                    Payment::create([
                        'rental_id'       => $rental->id,
                        'amount_paid'     => $payload['data']['amount'],
                        'type'            => 'rent',
                        'status'          => 'completed',
                        'payment_date'    => now(),
                        'notes'           => 'Mobile money payment (webhook)',
                        'flutterwave_ref' => $txRef,
                    ]);

                    $rental->tenant->decrement('outstanding_balance', $payload['data']['amount']);
                }
            }
        }

        return response()->json(['status' => 'ok']);
    }
}
