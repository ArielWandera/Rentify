<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1f2937; margin: 0; padding: 20px; }
  .header { background: #7c3aed; color: white; padding: 20px; margin-bottom: 24px; }
  .header h1 { margin: 0; font-size: 22px; }
  .header p { margin: 4px 0 0; font-size: 11px; opacity: 0.85; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 14px; font-weight: bold; color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 4px; margin-bottom: 12px; }
  .info-grid { display: flex; gap: 16px; margin-bottom: 24px; }
  .info-box { flex: 1; border: 1px solid #e5e7eb; padding: 12px; border-radius: 4px; }
  .info-box .label { font-size: 10px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
  .info-box .value { font-size: 13px; font-weight: bold; color: #1f2937; }
  .balance-box { background: #7c3aed; color: white; padding: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
  .balance-box.clear { background: #065f46; }
  .balance-box .amount { font-size: 26px; font-weight: bold; }
  .balance-box .label { font-size: 11px; opacity: 0.85; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { background: #7c3aed; color: white; padding: 8px 10px; text-align: left; }
  td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; }
  tr:nth-child(even) td { background: #f9fafb; }
  .badge { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: bold; }
  .badge-green { background: #d1fae5; color: #065f46; }
  .badge-red { background: #fee2e2; color: #991b1b; }
  .badge-blue { background: #dbeafe; color: #1e40af; }
  .text-right { text-align: right; }
  .summary-row td { font-weight: bold; background: #f5f3ff; }
  .footer { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 10px; font-size: 10px; color: #9ca3af; text-align: center; }
</style>
</head>
<body>

<div class="header">
  <h1>Rentify — Rental Statement</h1>
  <p>{{ $tenant->user->name }} &nbsp;|&nbsp; {{ $tenant->user->email }} &nbsp;|&nbsp; Generated: {{ $generatedAt }}</p>
</div>

<!-- Balance -->
<div class="balance-box {{ $tenant->outstanding_balance <= 0 ? 'clear' : '' }}">
  <div>
    <div class="label">Outstanding Balance</div>
    <div class="amount">UGX {{ number_format($tenant->outstanding_balance) }}</div>
  </div>
  <div style="text-align:right;">
    <div class="label">{{ $tenant->outstanding_balance > 0 ? 'Payment Required' : 'All Paid Up' }}</div>
    @if($tenant->outstanding_balance > 0)
      <div style="font-size:11px; margin-top:4px;">Please contact your landlord to arrange payment</div>
    @endif
  </div>
</div>

<!-- Rental Details -->
@if($activeRental)
<div class="section">
  <div class="section-title">Current Rental</div>
  <div class="info-grid">
    <div class="info-box">
      <div class="label">Property</div>
      <div class="value">{{ $activeRental->property->name }}</div>
    </div>
    <div class="info-box">
      <div class="label">Address</div>
      <div class="value">{{ $activeRental->property->address }}</div>
    </div>
    <div class="info-box">
      <div class="label">Monthly Rent</div>
      <div class="value">UGX {{ number_format($activeRental->monthly_rent) }}</div>
    </div>
    <div class="info-box">
      <div class="label">Deposit</div>
      <div class="value">UGX {{ number_format($activeRental->deposit) }}</div>
    </div>
  </div>
  <div class="info-grid">
    <div class="info-box">
      <div class="label">Lease Start</div>
      <div class="value">{{ \Carbon\Carbon::parse($activeRental->start_date)->format('d M Y') }}</div>
    </div>
    <div class="info-box">
      <div class="label">Lease End</div>
      <div class="value">{{ $activeRental->end_date ? \Carbon\Carbon::parse($activeRental->end_date)->format('d M Y') : 'Open-ended' }}</div>
    </div>
    <div class="info-box">
      <div class="label">Landlord</div>
      <div class="value">{{ $activeRental->property->owner->name ?? 'N/A' }}</div>
    </div>
    <div class="info-box">
      <div class="label">Status</div>
      <div class="value">{{ ucfirst($activeRental->status) }}</div>
    </div>
  </div>
</div>
@endif

<!-- Payment History -->
<div class="section">
  <div class="section-title">Payment History</div>
  @if($payments->count() > 0)
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Notes</th>
        <th>Status</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      @foreach($payments as $payment)
      <tr>
        <td>{{ \Carbon\Carbon::parse($payment->payment_date)->format('d M Y') }}</td>
        <td><span class="badge badge-blue">{{ ucfirst($payment->type) }}</span></td>
        <td>{{ $payment->notes ?? '—' }}</td>
        <td>
          <span class="badge {{ $payment->status === 'completed' ? 'badge-green' : 'badge-red' }}">
            {{ ucfirst($payment->status) }}
          </span>
        </td>
        <td class="text-right">UGX {{ number_format($payment->amount_paid) }}</td>
      </tr>
      @endforeach
      <tr class="summary-row">
        <td colspan="4">Total Paid</td>
        <td class="text-right">UGX {{ number_format($payments->sum('amount_paid')) }}</td>
      </tr>
    </tbody>
  </table>
  @else
  <p style="color:#6b7280; font-style:italic;">No payments recorded yet.</p>
  @endif
</div>

<div class="footer">
  Rentify Property Management System &nbsp;|&nbsp; Rental Statement &nbsp;|&nbsp; {{ $generatedAt }}
</div>

</body>
</html>
