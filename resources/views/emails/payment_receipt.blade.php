<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: Arial, sans-serif; font-size: 14px; color: #1f2937; background: #f9fafb; margin: 0; padding: 0; }
  .wrapper { max-width: 600px; margin: 32px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .header { background: #7c3aed; color: white; padding: 28px 32px; }
  .header h1 { margin: 0; font-size: 22px; }
  .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.85; }
  .body { padding: 28px 32px; }
  .success-badge { display: inline-flex; align-items: center; gap: 6px; background: #d1fae5; color: #065f46; border-radius: 20px; padding: 6px 14px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
  .amount-box { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
  .amount-box .amount { font-size: 36px; font-weight: bold; color: #7c3aed; }
  .amount-box .label { font-size: 13px; color: #6b7280; margin-top: 4px; }
  .details { background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0; }
  .details table { width: 100%; border-collapse: collapse; }
  .details td { padding: 8px 0; font-size: 13px; border-bottom: 1px solid #e5e7eb; }
  .details tr:last-child td { border-bottom: none; }
  .details td:first-child { color: #6b7280; width: 45%; }
  .details td:last-child { font-weight: 600; text-align: right; }
  .ref { font-size: 11px; color: #9ca3af; text-align: center; margin-top: 8px; }
  .qr-stamp { display: flex; align-items: center; gap: 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; margin: 20px 0; }
  .qr-stamp svg { flex-shrink: 0; }
  .qr-label { font-size: 11px; color: #6b7280; line-height: 1.6; }
  .qr-label strong { display: block; font-size: 12px; color: #374151; margin-bottom: 2px; }
  .footer { background: #f9fafb; padding: 16px 32px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>Payment Receipt</h1>
    <p>Rentify Property Management</p>
  </div>
  <div class="body">
    <p>Dear <strong>{{ $tenant->user->name }}</strong>,</p>
    <p>Your payment has been received and recorded. Please keep this receipt for your records.</p>

    <div class="success-badge">
      ✓ &nbsp;Payment Confirmed
    </div>

    <div class="amount-box">
      <div class="amount">UGX {{ number_format($payment->amount_paid) }}</div>
      <div class="label">{{ ucfirst($payment->type) }} Payment</div>
    </div>

    <div class="details">
      <table>
        <tr>
          <td>Receipt No.</td>
          <td>{{ $ref }}</td>
        </tr>
        <tr>
          <td>Date</td>
          <td>{{ \Carbon\Carbon::parse($payment->payment_date)->format('d M Y') }}</td>
        </tr>
        <tr>
          <td>Property</td>
          <td>{{ $property->name }}</td>
        </tr>
        <tr>
          <td>Address</td>
          <td>{{ $property->address }}</td>
        </tr>
        <tr>
          <td>Landlord</td>
          <td>{{ $property->owner->name ?? 'N/A' }}</td>
        </tr>
        <tr>
          <td>Monthly Rent</td>
          <td>UGX {{ number_format($rental->monthly_rent) }}</td>
        </tr>
        @if($payment->pesapal_tracking_id)
        <tr>
          <td>Transaction ID</td>
          <td style="font-size:11px;">{{ $payment->pesapal_tracking_id }}</td>
        </tr>
        @endif
        @if($payment->notes)
        <tr>
          <td>Notes</td>
          <td>{{ $payment->notes }}</td>
        </tr>
        @endif
        <tr>
          <td>Remaining Balance</td>
          <td style="color: {{ $tenant->outstanding_balance > 0 ? '#dc2626' : '#059669' }}">
            UGX {{ number_format($tenant->outstanding_balance) }}
          </td>
        </tr>
      </table>
    </div>

    <div class="qr-stamp">
      {!! $qrSvg !!}
      <div class="qr-label">
        <strong>Digital verification stamp</strong>
        Scan to verify this receipt.<br>
        Ref: {{ $ref }}<br>
        Issued by Rentify Property Management
      </div>
    </div>

    <p style="font-size:13px; color:#6b7280;">
      If you have any questions about this receipt, please contact your landlord directly.
    </p>

    <p>Thank you,<br><strong>Rentify Property Management</strong></p>
  </div>
  <div class="footer">
    This is an automated receipt from Rentify &nbsp;|&nbsp; Please do not reply to this email
  </div>
</div>
</body>
</html>
