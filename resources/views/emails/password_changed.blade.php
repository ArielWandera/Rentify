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
  .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #92400e; }
  .cta { text-align: center; margin: 28px 0; }
  .cta a { background: #7c3aed; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; }
  .footer { background: #f9fafb; padding: 16px 32px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>Password changed</h1>
    <p>Security notification from Rentify</p>
  </div>
  <div class="body">
    <p>Hi <strong>{{ $name }}</strong>,</p>
    <p>Your Rentify account password was successfully changed.</p>

    <div class="alert">
      <strong>Wasn't you?</strong> If you did not make this change, your account may be compromised. Please sign in immediately and change your password, or contact support.
    </div>

    <div class="cta">
      <a href="{{ $appUrl }}">Go to my account</a>
    </div>

    <p>The Rentify Team</p>
  </div>
  <div class="footer">
    Rentify Property Management &nbsp;|&nbsp; This is an automated security notification
  </div>
</div>
</body>
</html>
