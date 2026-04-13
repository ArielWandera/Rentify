<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TenantInvite extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User   $tenant,
        public string $inviteUrl,
        public string $propertyName,
        public string $landlordName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "You've been added as a tenant on Rentify",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.tenant_invite',
            with: [
                'tenantName'   => $this->tenant->name,
                'inviteUrl'    => $this->inviteUrl,
                'propertyName' => $this->propertyName,
                'landlordName' => $this->landlordName,
            ],
        );
    }
}
