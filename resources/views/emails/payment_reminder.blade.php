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
  .balance-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
  .balance-box .amount { font-size: 32px; font-weight: bold; color: #dc2626; }
  .balance-box .label { font-size: 13px; color: #6b7280; margin-top: 4px; }
  .rental-details { background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0; }
  .rental-details table { width: 100%; }
  .rental-details td { padding: 6px 0; font-size: 13px; }
  .rental-details td:first-child { color: #6b7280; width: 40%; }
  .rental-details td:last-child { font-weight: 600; }
  .cta { text-align: center; margin: 28px 0; }
  .footer { background: #f9fafb; padding: 16px 32px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>Payment Reminder</h1>
    <p>Rentify Property Management</p>
  </div>
  <div class="body">
    <p>Dear <strong>{{ $tenantName }}</strong>,</p>
    <p>This is a friendly reminder that you have an outstanding rental balance on your account.</p>

    <div class="balance-box">
      <div class="amount">UGX {{ number_format($outstandingBalance) }}</div>
      <div class="label">Outstanding Balance</div>
    </div>

    @if($activeRental)
    <div class="rental-details">
      <table>
        <tr>
          <td>Property</td>
          <td>{{ $activeRental->property->name }}</td>
        </tr>
        <tr>
          <td>Address</td>
          <td>{{ $activeRental->property->address }}</td>
        </tr>
        <tr>
          <td>Monthly Rent</td>
          <td>UGX {{ number_format($activeRental->monthly_rent) }}</td>
        </tr>
        <tr>
          <td>Landlord</td>
          <td>{{ $activeRental->property->owner->name ?? 'N/A' }}</td>
        </tr>
      </table>
    </div>
    @endif

    <p>Please arrange payment at your earliest convenience. If you have already made a payment, please disregard this notice.</p>

    @if($notes)
    <p style="background:#fffbeb; border:1px solid #fde68a; padding:12px; border-radius:6px; font-size:13px;">
      <strong>Note from your landlord:</strong> {{ $notes }}
    </p>
    @endif

    <p>If you have any questions, please contact your landlord directly.</p>

    <p>Thank you,<br><strong>Rentify Property Management</strong></p>
  </div>
  <div class="footer">
    This is an automated reminder from Rentify &nbsp;|&nbsp; Please do not reply to this email
  </div>
</div>
</body>
</html>
