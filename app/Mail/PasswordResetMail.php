<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User   $user,
        public string $resetUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Reset your Rentify password');
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.password_reset',
            with: [
                'name'     => $this->user->name,
                'resetUrl' => $this->resetUrl,
            ],
        );
    }
}
