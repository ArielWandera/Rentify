<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\PaymentController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
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
});
