import { useEffect, useState } from 'react';
import { CurrencyDollarIcon, BuildingOfficeIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function LandlordPayouts() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/reports/landlord-payouts', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then(r => r.json())
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);

  const totalCollected   = rows.reduce((s, r) => s + parseFloat(r.total_collected   || 0), 0);
  const totalOutstanding = rows.reduce((s, r) => s + parseFloat(r.total_outstanding || 0), 0);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Landlord Payouts</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Payments collected per landlord and outstanding tenant balances</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card p-6 flex items-start justify-between">
          <div>
            <p className="text-sm text-warm-gray dark:text-gray-400">Total landlords</p>
            <p className="text-3xl font-bold text-raisin dark:text-white mt-1">{rows.length}</p>
          </div>
          <div className="p-3 rounded-2xl bg-primary"><UserGroupIcon className="h-5 w-5 text-white" /></div>
        </div>
        <div className="card p-6 flex items-start justify-between">
          <div>
            <p className="text-sm text-warm-gray dark:text-gray-400">Total collected</p>
            <p className="text-3xl font-bold text-raisin dark:text-white mt-1">UGX {totalCollected.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-2xl bg-green-500"><CurrencyDollarIcon className="h-5 w-5 text-white" /></div>
        </div>
        <div className="card p-6 flex items-start justify-between">
          <div>
            <p className="text-sm text-warm-gray dark:text-gray-400">Total outstanding</p>
            <p className="text-3xl font-bold text-raisin dark:text-white mt-1">UGX {totalOutstanding.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-2xl bg-red-500"><BuildingOfficeIcon className="h-5 w-5 text-white" /></div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Landlord</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Properties</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Collected</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Outstanding</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">No landlords found.</td>
              </tr>
            ) : rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{row.name}</p>
                  <p className="text-xs text-gray-400">{row.email}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{row.properties_count}</td>
                <td className="px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400 text-right">
                  UGX {parseFloat(row.total_collected).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-right"
                  style={{ color: row.total_outstanding > 0 ? '#dc2626' : '#059669' }}>
                  UGX {parseFloat(row.total_outstanding).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    row.total_outstanding > 0
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {row.total_outstanding > 0 ? 'Has arrears' : 'All clear'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
