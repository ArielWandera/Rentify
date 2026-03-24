<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\PesapalController;

Route::middleware('throttle:10,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});
Route::middleware('auth:sanctum')->group(function () {
  Route::get('/user', [AuthController::class, 'user']);
  Route::apiResource('properties', PropertyController::class);
  Route::apiResource('users', UserController::class);
  Route::get('/tenants/me', [TenantController::class, 'me']);
  Route::apiResource('tenants', TenantController::class);
  Route::post('/tenants/{tenant}/assign-property', [TenantController::class, 'assignProperty']);
  Route::post('/tenants/{tenant}/unassign-property/{rental}', [TenantController::class, 'unassignProperty']);
  Route::get('/tenants/{tenant}/balance', [TenantController::class, 'getBalance']);
  Route::apiResource('payments', PaymentController::class);
  Route::apiResource('rentals', \App\Http\Controllers\RentalController::class);
  Route::post('/rentals/{rental}/payments', [PaymentController::class, 'store']);

  // Reports
  Route::get('/reports/admin',  [ReportController::class, 'adminReport']);
  Route::get('/reports/owner',  [ReportController::class, 'ownerReport']);
  Route::get('/reports/tenant', [ReportController::class, 'tenantReport']);

  // Reminders
  Route::post('/reminders/send-all',          [ReminderController::class, 'sendAll']);
  Route::post('/reminders/tenant/{tenant}',   [ReminderController::class, 'sendToTenant']);

  // Pesapal payments
  Route::post('/payments/pesapal/initiate', [PesapalController::class, 'initiatePayment']);
  Route::get('/payments/pesapal/status/{trackingId}', [PesapalController::class, 'checkStatus']);
  Route::post('/payments/pesapal/register-ipn', [PesapalController::class, 'registerIPN']);
});

Route::get('/payments/pesapal/ipn', [PesapalController::class, 'ipn']);
