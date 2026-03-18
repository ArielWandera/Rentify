import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import TenantForm from './TenantForm';
import { PencilIcon, TrashIcon, UserPlusIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function Tenants() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);

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
      setTenants(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Failed to load tenants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tenantId) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return;

    try {
      const response = await fetch(`/api/tenants/${tenantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        setTenants(tenants.filter(t => t.id !== tenantId));
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTenant(null);
    fetchTenants();
  };

  if (user?.role !== 'admin' && user?.role !== 'owner') {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center">Loading tenants...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tenant Management</h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlusIcon className="h-5 w-5" />
            Add Tenant
          </button>
        )}
      </div>

      <div className="glass rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Outstanding Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tenants.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tenants yet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add a tenant to get started.</p>
                </td>
              </tr>
            ) : tenants.map((tenant) => (
              <tr key={tenant.id}>
                <td className="px-6 py-4 whitespace-nowrap">{tenant.user?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{tenant.user?.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{tenant.phone || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                    tenant.outstanding_balance > 0
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    <CurrencyDollarIcon className="h-3 w-3" />
                    {tenant.outstanding_balance || 0}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    {user?.role === 'admin' && (
                      <>
                        <button
                          onClick={() => {
                            setEditingTenant(tenant);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tenant.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {showForm && (
        <TenantForm
          tenant={editingTenant}
          onClose={() => {
            setShowForm(false);
            setEditingTenant(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
