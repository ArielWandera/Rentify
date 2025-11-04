import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function PaymentForm({ rentals, onClose, onSuccess }) {
  const [selectedRental, setSelectedRental] = useState('');
  const [formData, setFormData] = useState({
    amount_paid: '',
    type: 'rent',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!selectedRental) {
      setErrors({ general: 'Please select a rental' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/rentals/${selectedRental}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setErrors(data.errors || { general: 'An error occurred' });
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      setErrors({ general: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="glass rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Add Payment
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Rental</label>
            <select
              value={selectedRental}
              onChange={(e) => setSelectedRental(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              required
            >
              <option value="">Choose a rental...</option>
              {rentals && rentals.map((rental) => (
                <option key={rental.id} value={rental.id}>
                  {rental.tenant?.user?.name} - {rental.property?.name} ({rental.property?.address})
                </option>
              ))}
            </select>
            {errors.selectedRental && <p className="text-red-500 text-sm mt-1">{errors.selectedRental[0]}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount Paid</label>
            <input
              type="number"
              name="amount_paid"
              value={formData.amount_paid}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              required
            />
            {errors.amount_paid && <p className="text-red-500 text-sm mt-1">{errors.amount_paid[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Payment Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option value="rent">Rent</option>
              <option value="deposit">Deposit</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Payment Date</label>
            <input
              type="date"
              name="payment_date"
              value={formData.payment_date}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              required
            />
            {errors.payment_date && <p className="text-red-500 text-sm mt-1">{errors.payment_date[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              placeholder="Optional notes about this payment"
            />
            {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes[0]}</p>}
          </div>

          {errors.general && (
            <p className="text-red-500 text-sm">{errors.general}</p>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Add Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
