import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HomeIcon, CurrencyDollarIcon, CheckCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import PaymentModal from './PaymentModal';

export default function TenantPortal() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const fetchData = () => {
    const token = localStorage.getItem('token');
    fetch('/api/tenants/me', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then(r => r.json())
      .then(setData)
      .catch(() => setError('Failed to load your rental information.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handlePaymentComplete = ({ amount }) => {
    setPaymentStatus({ type: 'success', message: `Payment of UGX ${parseFloat(amount).toLocaleString()} confirmed!` });
    fetchData();
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (error) return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
        {error}
      </div>
    </div>
  );

  if (!data?.tenant) return (
    <div className="max-w-3xl mx-auto p-6 text-center py-16">
      <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No rental found</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        You haven't been assigned to a property yet. Contact your landlord.
      </p>
    </div>
  );

  const { tenant, active_rental, payments } = data;
  const activeRental = active_rental;

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Rental</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.name}</p>
        </div>
        <button
          onClick={() => {
            const token = localStorage.getItem('token');
            fetch('/api/reports/tenant', { headers: { Authorization: `Bearer ${token}` } })
              .then(r => r.blob())
              .then(blob => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `rental-statement-${new Date().toISOString().slice(0,10)}.pdf`;
                a.click();
              });
          }}
          className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Download Statement
        </button>
      </div>

      {/* Balance Card */}
      <div className={`p-6 rounded-xl text-white ${tenant.outstanding_balance > 0 ? 'bg-red-500' : 'bg-green-500'}`}>
        <p className="text-sm opacity-90">Outstanding Balance</p>
        <p className="text-4xl font-bold mt-1">UGX {parseFloat(tenant.outstanding_balance || 0).toLocaleString()}</p>
        <p className="text-sm opacity-90 mt-1">{tenant.outstanding_balance > 0 ? 'Payment due' : 'All paid up'}</p>
        {tenant.outstanding_balance > 0 && (
          <button
            onClick={() => setShowPayModal(true)}
            className="mt-3 bg-white text-red-500 hover:bg-red-50 font-semibold px-4 py-2 rounded-lg text-sm transition"
          >
            Pay Now
          </button>
        )}
      </div>

      {paymentStatus && (
        <div className={`px-4 py-3 rounded-lg text-sm ${
          paymentStatus.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          {paymentStatus.message}
        </div>
      )}

      {/* Active Rental */}
      {activeRental ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <HomeIcon className="h-5 w-5 text-primary" /> Current Property
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Property</p>
              <p className="font-medium text-gray-900 dark:text-white">{activeRental.property?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium text-gray-900 dark:text-white">{activeRental.property?.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Rent</p>
              <p className="font-medium text-gray-900 dark:text-white">UGX {parseFloat(activeRental.monthly_rent).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lease Start</p>
              <p className="font-medium text-gray-900 dark:text-white">{new Date(activeRental.start_date).toLocaleDateString()}</p>
            </div>
            {activeRental.end_date && (
              <div>
                <p className="text-sm text-gray-500">Lease End</p>
                <p className="font-medium text-gray-900 dark:text-white">{new Date(activeRental.end_date).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Deposit</p>
              <p className="font-medium text-gray-900 dark:text-white">UGX {parseFloat(activeRental.deposit || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center text-gray-500">
          No active rental at the moment.
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CurrencyDollarIcon className="h-5 w-5 text-primary" /> Payment History
          </h2>
        </div>
        {payments?.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {new Date(p.payment_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    UGX {parseFloat(p.amount_paid).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                      {p.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-12 text-center">
            <CheckCircleIcon className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No payments recorded yet.</p>
          </div>
        )}
      </div>
      {showPayModal && activeRental && (
        <PaymentModal
          rental={activeRental}
          outstandingBalance={tenant.outstanding_balance}
          onClose={() => setShowPayModal(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}
