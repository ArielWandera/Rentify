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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className={`bg-white rounded-2xl shadow-2xl w-full mx-4 ${iframeUrl ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-raisin flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5 text-primary" />
            {iframeUrl ? 'Complete Payment' : 'Pay Rent'}
          </h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {iframeUrl ? (
          <div className="relative">
            {polling && (
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white rounded-full px-3 py-1 text-xs text-gray-500 shadow">
                <span className="animate-pulse h-2 w-2 rounded-full bg-primary inline-block"></span>
                Waiting for payment…
              </div>
            )}
            <iframe
              src={iframeUrl}
              className="w-full rounded-b-2xl"
              style={{ height: '560px', border: 'none' }}
              title="Pesapal Payment"
            />
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {outstandingBalance > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">Outstanding Balance</p>
                <p className="text-2xl font-bold text-red-600">UGX {parseFloat(outstandingBalance).toLocaleString()}</p>
                <button
                  type="button"
                  onClick={() => setAmount(String(outstandingBalance))}
                  className="mt-2 text-xs font-semibold text-red-500 hover:underline"
                >
                  Pay full balance
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-raisin mb-1.5">
                Amount to pay (UGX)
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min={500}
                className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 text-raisin text-lg font-semibold focus:outline-none transition"
                placeholder="e.g. 500,000"
                autoFocus
              />
              <p className="text-xs text-warm-gray mt-1.5">Minimum payment: UGX 500</p>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-warm-gray">
              Pay securely via MTN MoMo, Airtel Money, or card.
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 border border-gray-200 text-warm-gray py-2.5 rounded-xl hover:bg-gray-50 transition font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                disabled={loading}
                className="flex-1 btn-primary py-2.5 disabled:opacity-50 text-sm"
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
