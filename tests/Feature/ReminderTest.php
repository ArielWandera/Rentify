<?php

namespace Tests\Feature;

use App\Mail\PaymentReminder;
use App\Models\Property;
use App\Models\Rental;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ReminderTest extends TestCase
{
    use RefreshDatabase;

    private function makeAdmin(): array
    {
        $user = User::factory()->create(['role' => 'admin']);
        return [$user, $user->createToken('test')->plainTextToken];
    }

    private function makeOwner(): array
    {
        $user = User::factory()->create(['role' => 'owner']);
        return [$user, $user->createToken('test')->plainTextToken];
    }

    public function test_unauthenticated_cannot_send_reminders(): void
    {
        $this->postJson('/api/reminders/send-all')->assertStatus(401);
    }

    public function test_admin_queues_reminders_for_tenants_with_balance(): void
    {
        Mail::fake();

        [$admin, $token] = $this->makeAdmin();

        Tenant::factory()->create(['outstanding_balance' => 5000]);
        Tenant::factory()->create(['outstanding_balance' => 0]);

        $this->withToken($token)->postJson('/api/reminders/send-all')
            ->assertStatus(200)
            ->assertJsonFragment(['queued' => 1]);

        Mail::assertQueued(PaymentReminder::class, 1);
    }

    public function test_owner_only_queues_reminders_for_own_tenants(): void
    {
        Mail::fake();

        [$owner, $token] = $this->makeOwner();
        $otherOwner = User::factory()->create(['role' => 'owner']);

        $ownProperty   = Property::factory()->create(['owner_id' => $owner->id]);
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);

        $ownTenant   = Tenant::factory()->create(['outstanding_balance' => 5000]);
        $otherTenant = Tenant::factory()->create(['outstanding_balance' => 5000]);

        Rental::factory()->create(['property_id' => $ownProperty->id,   'tenant_id' => $ownTenant->id]);
        Rental::factory()->create(['property_id' => $otherProperty->id, 'tenant_id' => $otherTenant->id]);

        $this->withToken($token)->postJson('/api/reminders/send-all')
            ->assertStatus(200);

        Mail::assertQueued(PaymentReminder::class, 1);
    }

    public function test_admin_can_send_reminder_to_single_tenant(): void
    {
        Mail::fake();

        [$admin, $token] = $this->makeAdmin();
        $tenant = Tenant::factory()->create(['outstanding_balance' => 3000]);

        $this->withToken($token)
            ->postJson("/api/reminders/tenant/{$tenant->id}", ['notes' => 'Please pay soon'])
            ->assertStatus(200);

        Mail::assertSent(PaymentReminder::class, 1);
    }

    public function test_no_reminder_sent_when_tenant_has_no_balance(): void
    {
        Mail::fake();

        [$admin, $token] = $this->makeAdmin();
        $tenant = Tenant::factory()->create(['outstanding_balance' => 0]);

        $this->withToken($token)
            ->postJson("/api/reminders/tenant/{$tenant->id}")
            ->assertStatus(200)
            ->assertJsonFragment(['message' => 'Tenant has no outstanding balance']);

        Mail::assertNothingSent();
    }

    public function test_tenant_role_cannot_send_reminders(): void
    {
        $user  = User::factory()->create(['role' => 'tenant']);
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/reminders/send-all')
            ->assertStatus(403);
    }
}
