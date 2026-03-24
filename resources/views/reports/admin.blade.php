<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1f2937; margin: 0; padding: 20px; }
  .header { background: #1e40af; color: white; padding: 20px; margin-bottom: 24px; }
  .header h1 { margin: 0; font-size: 22px; }
  .header p { margin: 4px 0 0; font-size: 11px; opacity: 0.85; }
  .meta { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 11px; color: #6b7280; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 14px; font-weight: bold; color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 4px; margin-bottom: 12px; }
  .stats-grid { display: flex; gap: 12px; margin-bottom: 24px; }
  .stat-box { flex: 1; background: #f3f4f6; border-left: 4px solid #1e40af; padding: 12px; }
  .stat-box .value { font-size: 20px; font-weight: bold; color: #1e40af; }
  .stat-box .label { font-size: 10px; color: #6b7280; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { background: #1e40af; color: white; padding: 8px 10px; text-align: left; }
  td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; }
  tr:nth-child(even) td { background: #f9fafb; }
  .badge { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: bold; }
  .badge-green { background: #d1fae5; color: #065f46; }
  .badge-red { background: #fee2e2; color: #991b1b; }
  .badge-blue { background: #dbeafe; color: #1e40af; }
  .footer { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 10px; font-size: 10px; color: #9ca3af; text-align: center; }
  .text-right { text-align: right; }
  .summary-row td { font-weight: bold; background: #eff6ff; }
</style>
</head>
<body>

<div class="header">
  <h1>Rentify — System Report</h1>
  <p>Generated on {{ $generatedAt }} &nbsp;|&nbsp; Administrator: {{ $admin->name }}</p>
</div>

<!-- Summary Stats -->
<div class="stats-grid">
  <div class="stat-box">
    <div class="value">{{ $totalProperties }}</div>
    <div class="label">Total Properties</div>
  </div>
  <div class="stat-box">
    <div class="value">{{ $availableProperties }}</div>
    <div class="label">Available</div>
  </div>
  <div class="stat-box">
    <div class="value">{{ $totalTenants }}</div>
    <div class="label">Active Tenants</div>
  </div>
  <div class="stat-box">
    <div class="value">UGX {{ number_format($totalRevenue) }}</div>
    <div class="label">Total Revenue</div>
  </div>
  <div class="stat-box">
    <div class="value">UGX {{ number_format($totalOutstanding) }}</div>
    <div class="label">Outstanding</div>
  </div>
</div>

<!-- Properties -->
<div class="section">
  <div class="section-title">Properties ({{ $properties->count() }})</div>
  <table>
    <thead>
      <tr>
        <th>Property</th>
        <th>Owner</th>
        <th>Address</th>
        <th>Rent/Month</th>
        <th>Bedrooms</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      @foreach($properties as $property)
      <tr>
        <td>{{ $property->name }}</td>
        <td>{{ $property->owner->name ?? 'N/A' }}</td>
        <td>{{ $property->address }}</td>
        <td class="text-right">UGX {{ number_format($property->price_per_month) }}</td>
        <td>{{ $property->bedrooms }} bed / {{ $property->bathrooms }} bath</td>
        <td>
          <span class="badge {{ $property->isAvailable() ? 'badge-green' : 'badge-red' }}">
            {{ $property->isAvailable() ? 'Available' : 'Occupied' }}
          </span>
        </td>
      </tr>
      @endforeach
    </tbody>
  </table>
</div>

<!-- Tenants -->
<div class="section">
  <div class="section-title">Tenants ({{ $tenants->count() }})</div>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Property</th>
        <th class="text-right">Outstanding Balance</th>
      </tr>
    </thead>
    <tbody>
      @foreach($tenants as $tenant)
      <tr>
        <td>{{ $tenant->user->name ?? 'N/A' }}</td>
        <td>{{ $tenant->user->email ?? 'N/A' }}</td>
        <td>{{ $tenant->phone ?? 'N/A' }}</td>
        <td>{{ $tenant->rentals->where('status','active')->first()?->property?->name ?? 'Unassigned' }}</td>
        <td class="text-right">
          <span class="badge {{ $tenant->outstanding_balance > 0 ? 'badge-red' : 'badge-green' }}">
            UGX {{ number_format($tenant->outstanding_balance) }}
          </span>
        </td>
      </tr>
      @endforeach
    </tbody>
  </table>
</div>

<!-- Payments -->
<div class="section">
  <div class="section-title">Payment History ({{ $payments->count() }} transactions)</div>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Tenant</th>
        <th>Property</th>
        <th>Type</th>
        <th>Status</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      @foreach($payments as $payment)
      <tr>
        <td>{{ \Carbon\Carbon::parse($payment->payment_date)->format('d M Y') }}</td>
        <td>{{ $payment->rental->tenant->user->name ?? 'N/A' }}</td>
        <td>{{ $payment->rental->property->name ?? 'N/A' }}</td>
        <td><span class="badge badge-blue">{{ ucfirst($payment->type) }}</span></td>
        <td>
          <span class="badge {{ $payment->status === 'completed' ? 'badge-green' : 'badge-red' }}">
            {{ ucfirst($payment->status) }}
          </span>
        </td>
        <td class="text-right">UGX {{ number_format($payment->amount_paid) }}</td>
      </tr>
      @endforeach
      <tr class="summary-row">
        <td colspan="5">Total Revenue</td>
        <td class="text-right">UGX {{ number_format($totalRevenue) }}</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="footer">
  Rentify Property Management System &nbsp;|&nbsp; Confidential &nbsp;|&nbsp; {{ $generatedAt }}
</div>

</body>
</html>
