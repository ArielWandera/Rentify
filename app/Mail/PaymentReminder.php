<?php

namespace App\Mail;

use App\Models\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentReminder extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Tenant $tenant,
        public string $notes = ''
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Payment Reminder — Outstanding Balance on Your Rental',
        );
    }

    public function content(): Content
    {
        $activeRental = $this->tenant->rentals->firstWhere('status', 'active');

        return new Content(
            view: 'emails.payment_reminder',
            with: [
                'tenantName'         => $this->tenant->user->name,
                'outstandingBalance' => $this->tenant->outstanding_balance,
                'activeRental'       => $activeRental,
                'notes'              => $this->notes,
            ],
        );
    }
}
