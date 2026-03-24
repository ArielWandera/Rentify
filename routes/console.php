<?php

use App\Mail\PaymentReminder;
use App\Models\Tenant;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-send payment reminders on the 1st of every month
Schedule::call(function () {
    $tenants = Tenant::with(['user', 'rentals.property.owner'])
        ->where('outstanding_balance', '>', 0)
        ->get();

    foreach ($tenants as $tenant) {
        if ($tenant->user?->email) {
            Mail::to($tenant->user->email)->send(new PaymentReminder($tenant));
        }
    }
})->monthlyOn(1, '08:00')->name('send-monthly-payment-reminders');
