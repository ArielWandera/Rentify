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
  .cta { text-align: center; margin: 28px 0; }
  .cta a { background: #7c3aed; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; }
  .expire-note { background: #f3f4f6; border-radius: 6px; padding: 12px 16px; font-size: 13px; color: #6b7280; margin: 20px 0; }
  .footer { background: #f9fafb; padding: 16px 32px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>Reset your password</h1>
    <p>You requested a password reset for your Rentify account</p>
  </div>
  <div class="body">
    <p>Hi <strong>{{ $name }}</strong>,</p>
    <p>We received a request to reset the password for your account. Click the button below to choose a new password.</p>

    <div class="cta">
      <a href="{{ $resetUrl }}">Reset my password</a>
    </div>

    <div class="expire-note">
      This link expires in <strong>60 minutes</strong>. If you didn't request a password reset, you can safely ignore this email — your password will not change.
    </div>

    <p>The Rentify Team</p>
  </div>
  <div class="footer">
    Rentify Property Management &nbsp;|&nbsp; This is an automated security email
  </div>
</div>
</body>
</html>
