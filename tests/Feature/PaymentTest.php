<?php

namespace Tests\Feature;

use App\Mail\PaymentReceipt;
use App\Models\Payment;
use App\Models\Property;
use App\Models\Rental;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    private function setupRental(): array
    {
        $owner   = User::factory()->create(['role' => 'owner']);
        $property = Property::factory()->create(['owner_id' => $owner->id]);

        $tenantUser = User::factory()->create(['role' => 'tenant']);
        $tenant     = Tenant::factory()->create(['user_id' => $tenantUser->id, 'outstanding_balance' => 500000]);

        $rental = Rental::factory()->create([
            'property_id'  => $property->id,
            'tenant_id'    => $tenant->id,
            'monthly_rent' => 500000,
            'status'       => 'active',
        ]);

        return compact('owner', 'tenant', 'tenantUser', 'rental');
    }

    public function test_admin_can_record_payment(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;
        ['rental' => $rental] = $this->setupRental();

        $response = $this->withToken($token)->postJson("/api/rentals/{$rental->id}/payments", [
            'amount_paid'  => 500000,
            'type'         => 'rent',
            'payment_date' => now()->toDateString(),
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('payments', [
            'rental_id'   => $rental->id,
            'amount_paid' => 500000,
        ]);
    }

    public function test_payment_decrements_outstanding_balance(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;
        ['rental' => $rental, 'tenant' => $tenant] = $this->setupRental();

        $this->withToken($token)->postJson("/api/rentals/{$rental->id}/payments", [
            'amount_paid'  => 200000,
            'type'         => 'rent',
            'payment_date' => now()->toDateString(),
        ]);

        $this->assertEquals(300000, $tenant->fresh()->outstanding_balance);
    }

    public function test_admin_can_list_payments(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;
        ['rental' => $rental] = $this->setupRental();

        Payment::factory()->count(3)->create(['rental_id' => $rental->id]);

        $this->withToken($token)->getJson('/api/payments')
            ->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_balance_does_not_go_negative(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;
        ['rental' => $rental, 'tenant' => $tenant] = $this->setupRental();

        // Pay more than the outstanding balance
        $this->withToken($token)->postJson("/api/rentals/{$rental->id}/payments", [
            'amount_paid'  => 999999,
            'type'         => 'rent',
            'payment_date' => now()->toDateString(),
        ]);

        $this->assertEquals(0, $tenant->fresh()->outstanding_balance);
    }

    public function test_unauthenticated_cannot_access_payments(): void
    {
        $this->getJson('/api/payments')->assertStatus(401);
    }

    public function test_receipt_email_queued_when_payment_recorded(): void
    {
        Mail::fake();
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;
        ['rental' => $rental, 'tenantUser' => $tenantUser] = $this->setupRental();

        $this->withToken($token)->postJson("/api/rentals/{$rental->id}/payments", [
            'amount_paid'  => 500000,
            'type'         => 'rent',
            'payment_date' => now()->toDateString(),
        ])->assertStatus(201);

        Mail::assertQueued(PaymentReceipt::class, fn ($mail) => $mail->hasTo($tenantUser->email));
    }
}
