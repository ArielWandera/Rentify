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
  .steps { margin: 24px 0; }
  .step { display: flex; gap: 16px; margin-bottom: 18px; align-items: flex-start; }
  .step-num { background: #7c3aed; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px; flex-shrink: 0; }
  .step-body strong { display: block; margin-bottom: 2px; }
  .step-body p { margin: 0; color: #6b7280; font-size: 13px; }
  .cta { text-align: center; margin: 28px 0; }
  .cta a { background: #7c3aed; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; }
  .footer { background: #f9fafb; padding: 16px 32px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>Welcome to Rentify</h1>
    <p>Your property management dashboard is ready</p>
  </div>
  <div class="body">
    <p>Hi <strong>{{ $name }}</strong>,</p>
    <p>Your landlord account has been created. Here's how to get started:</p>

    <div class="steps">
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-body">
          <strong>Add your properties</strong>
          <p>Go to Properties and add each property you manage — name, address, price and unit details.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-body">
          <strong>Add your tenants</strong>
          <p>Create a tenant profile for each of your tenants. They'll receive an invite email to set their password and access their dashboard.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-body">
          <strong>Assign tenants to properties</strong>
          <p>Link each tenant to their rental unit, set the lease dates and monthly rent amount.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-body">
          <strong>Track payments</strong>
          <p>Record payments as they come in. Tenants can also pay directly via mobile money.</p>
        </div>
      </div>
    </div>

    <div class="cta">
      <a href="{{ $appUrl }}">Go to my dashboard</a>
    </div>

    <p>If you have any questions, reply to this email and we'll help you get set up.</p>
    <p>Welcome aboard,<br><strong>The Rentify Team</strong></p>
  </div>
  <div class="footer">
    Rentify Property Management &nbsp;|&nbsp; You're receiving this because you created an account
  </div>
</div>
</body>
</html>
