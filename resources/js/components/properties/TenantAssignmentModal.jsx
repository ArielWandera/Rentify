import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function TenantAssignmentModal({ property, onClose, onSuccess }) {
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    monthly_rent: property?.price_per_month || '',
    deposit: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/tenants', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });
      const data = await response.json();
      console.log('Fetched tenants:', data); // Debug logging
      // Filter tenants that have user data
      const validTenants = Array.isArray(data) ? data.filter(tenant => tenant.user) : [];
      console.log('Valid tenants with user data:', validTenants); // Debug logging
      setTenants(validTenants);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setErrors({ general: 'Failed to load tenants' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`/api/tenants/${selectedTenant}/assign-property`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          property_id: property.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setErrors(data.errors || { general: 'An error occurred' });
      }
    } catch (error) {
      console.error('Error assigning tenant:', error);
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
      <div className="glass rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Assign Tenant to {property?.name}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Tenant</label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              required
            >
              <option value="">Choose a tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.user?.name} ({tenant.user?.email})
                </option>
              ))}
            </select>
            {errors.tenant_id && <p className="text-red-500 text-sm mt-1">{errors.tenant_id[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                required
              />
              {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              />
              {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Monthly Rent</label>
              <input
                type="number"
                name="monthly_rent"
                value={formData.monthly_rent}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                required
              />
              {errors.monthly_rent && <p className="text-red-500 text-sm mt-1">{errors.monthly_rent[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Deposit</label>
              <input
                type="number"
                name="deposit"
                value={formData.deposit}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              />
              {errors.deposit && <p className="text-red-500 text-sm mt-1">{errors.deposit[0]}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="terminated">Terminated</option>
            </select>
            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>}
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
              disabled={loading || !selectedTenant}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Assigning...' : 'Assign Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
