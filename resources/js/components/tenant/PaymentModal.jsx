import { useState } from 'react';
import { XMarkIcon, CreditCardIcon } from '@heroicons/react/24/outline';

export default function PaymentModal({ rental, outstandingBalance, onClose }) {
  const [amount, setAmount] = useState(outstandingBalance || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePay = async () => {
    if (!amount || parseFloat(amount) < 500) {
      setError('Minimum payment is UGX 500');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payments/pesapal/initiate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ rental_id: rental.id, amount: parseFloat(amount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate payment');
      // Store tracking id so we can check status on return
      localStorage.setItem('pesapal_tracking_id', data.order_tracking_id);
      // Redirect to Pesapal hosted payment page
      window.location.href = data.redirect_url;
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCardIcon className="h-6 w-6 text-primary" />
            Pay Rent
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount (UGX)
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min={500}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter amount"
            />
            {outstandingBalance > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Outstanding balance: UGX {parseFloat(outstandingBalance).toLocaleString()}
              </p>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-400">
            You'll be redirected to Pesapal's secure payment page where you can pay via MTN MoMo, Airtel Money, or card.
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handlePay}
              disabled={loading}
              className="flex-1 btn-primary py-2 disabled:opacity-50"
            >
              {loading ? 'Redirecting...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
