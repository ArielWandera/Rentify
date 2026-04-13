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
  .info-box { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 16px; margin: 20px 0; }
  .info-box p { margin: 4px 0; font-size: 13px; }
  .info-box strong { color: #7c3aed; }
  .cta { text-align: center; margin: 28px 0; }
  .cta a { background: #7c3aed; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; }
  .expiry { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 8px; }
  .footer { background: #f9fafb; padding: 16px 32px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>Welcome to Rentify</h1>
    <p>Your landlord has added you as a tenant</p>
  </div>
  <div class="body">
    <p>Hi <strong>{{ $tenantName }}</strong>,</p>
    <p><strong>{{ $landlordName }}</strong> has added you as a tenant on Rentify. Click the button below to set your password and access your tenant dashboard.</p>

    <div class="info-box">
      <p><strong>Property:</strong> {{ $propertyName }}</p>
      <p><strong>Landlord:</strong> {{ $landlordName }}</p>
    </div>

    <p>From your dashboard you'll be able to:</p>
    <ul style="color:#4b5563; font-size:13px; line-height:1.8;">
      <li>View your lease details and rental agreement</li>
      <li>See your payment history and outstanding balance</li>
      <li>Make payments via mobile money</li>
    </ul>

    <div class="cta">
      <a href="{{ $inviteUrl }}">Set my password &amp; get started</a>
    </div>
    <p class="expiry">This link expires in 48 hours. If you did not expect this email, you can ignore it.</p>

    <p>Welcome aboard,<br><strong>The Rentify Team</strong></p>
  </div>
  <div class="footer">
    Rentify Property Management &nbsp;|&nbsp; You're receiving this because your landlord added you as a tenant
  </div>
</div>
</body>
</html>
