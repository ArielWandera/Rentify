<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeOwner extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to Rentify — Start Managing Your Properties',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome_owner',
            with: [
                'name'   => $this->user->name,
                'appUrl' => config('app.url'),
            ],
        );
    }
}
