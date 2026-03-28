<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiErrorHandlingTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_api_request_returns_json_not_html(): void
    {
        $response = $this->getJson('/api/rentals');

        $response->assertStatus(401)
            ->assertJsonStructure(['message']);
    }

    public function test_missing_resource_returns_json_404(): void
    {
        $user  = User::factory()->create(['role' => 'admin']);
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->getJson('/api/rentals/99999')
            ->assertStatus(404)
            ->assertJsonStructure(['message']);
    }

    public function test_validation_failure_returns_json_422_with_errors(): void
    {
        $user  = User::factory()->create(['role' => 'admin']);
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/rentals', [])
            ->assertStatus(422)
            ->assertJsonStructure(['message', 'errors']);
    }
}
