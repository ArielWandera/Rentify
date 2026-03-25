import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, CreditCardIcon } from '@heroicons/react/24/outline';

export default function PaymentModal({ rental, outstandingBalance, onClose, onPaymentComplete }) {
  const [amount, setAmount] = useState(outstandingBalance || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [trackingId, setTrackingId] = useState(null);
  const [polling, setPolling] = useState(false);
  const pollRef = useRef(null);

  // Poll status once iframe is shown
  useEffect(() => {
    if (!trackingId) return;
    setPolling(true);
    const token = localStorage.getItem('token');

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/pesapal/status/${trackingId}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        const result = await res.json();
        if (result.status === 1) {
          clearInterval(pollRef.current);
          onPaymentComplete?.({ type: 'success', amount: result.amount });
          onClose();
        } else if (result.status === 2 || result.status === 3) {
          clearInterval(pollRef.current);
          setIframeUrl(null);
          setError('Payment was unsuccessful. Please try again.');
          setPolling(false);
        }
      } catch {}
    }, 4000);

    return () => clearInterval(pollRef.current);
  }, [trackingId]);

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
      setTrackingId(data.order_tracking_id);
      setIframeUrl(data.redirect_url);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    clearInterval(pollRef.current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full mx-4 ${iframeUrl ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCardIcon className="h-6 w-6 text-primary" />
            {iframeUrl ? 'Complete Payment' : 'Pay Rent'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {iframeUrl ? (
          <div className="relative">
            {polling && (
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white dark:bg-gray-700 rounded-full px-3 py-1 text-xs text-gray-500 dark:text-gray-400 shadow">
                <span className="animate-pulse h-2 w-2 rounded-full bg-primary inline-block"></span>
                Waiting for payment…
              </div>
            )}
            <iframe
              src={iframeUrl}
              className="w-full rounded-b-xl"
              style={{ height: '560px', border: 'none' }}
              title="Pesapal Payment"
            />
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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
              Pay securely via MTN MoMo, Airtel Money, or card. The payment page will appear here.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleClose}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                disabled={loading}
                className="flex-1 btn-primary py-2 disabled:opacity-50"
              >
                {loading ? 'Loading…' : 'Pay Now'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
