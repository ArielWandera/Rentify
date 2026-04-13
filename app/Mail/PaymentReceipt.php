<?php

namespace App\Mail;

use App\Models\Payment;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentReceipt extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Payment $payment) {}

    public function envelope(): Envelope
    {
        $ref = strtoupper(substr(md5($this->payment->id), 0, 8));
        return new Envelope(
            subject: "Payment Receipt #{$ref} – " . config('app.name'),
        );
    }

    public function content(): Content
    {
        $payment  = $this->payment;
        $rental   = $payment->rental;
        $tenant   = $rental->tenant;
        $property = $rental->property;
        $ref      = 'RCT-' . strtoupper(substr(md5($payment->id), 0, 8));

        $qrData = implode("\n", [
            'Rentify Payment Receipt',
            "Ref: {$ref}",
            'Amount: UGX ' . number_format($payment->amount_paid),
            'Property: ' . $property->name,
            'Date: ' . \Carbon\Carbon::parse($payment->payment_date)->format('d M Y'),
        ]);

        $writer = new Writer(new ImageRenderer(new RendererStyle(120), new SvgImageBackEnd()));
        $qrSvg  = $writer->writeString($qrData);

        return new Content(
            view: 'emails.payment_receipt',
            with: compact('payment', 'rental', 'tenant', 'property', 'ref', 'qrSvg'),
        );
    }
}
