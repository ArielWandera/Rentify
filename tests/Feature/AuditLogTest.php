<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    private function makeAdmin(): array
    {
        $user = User::factory()->create(['role' => 'admin']);
        return [$user, $user->createToken('test')->plainTextToken];
    }

    public function test_login_creates_audit_entry(): void
    {
        User::factory()->create(['email' => 'test@example.com', 'password' => bcrypt('password'), 'role' => 'owner']);

        $this->postJson('/api/login', ['email' => 'test@example.com', 'password' => 'password'])
            ->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', ['action' => 'login']);
    }

    public function test_admin_can_view_audit_logs(): void
    {
        [$admin, $token] = $this->makeAdmin();
        AuditLog::create(['user_id' => $admin->id, 'action' => 'login', 'description' => 'Logged in', 'ip_address' => '127.0.0.1']);

        $this->withToken($token)->getJson('/api/audit-logs')
            ->assertStatus(200)
            ->assertJsonPath('data.0.action', 'login');
    }

    public function test_non_admin_cannot_view_audit_logs(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $token = $owner->createToken('test')->plainTextToken;

        $this->withToken($token)->getJson('/api/audit-logs')
            ->assertStatus(403);
    }

    public function test_unauthenticated_cannot_view_audit_logs(): void
    {
        $this->getJson('/api/audit-logs')->assertStatus(401);
    }
}
