import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import TenantForm from './TenantForm';
import ConfirmModal from '../ui/ConfirmModal';
import { PencilIcon, TrashIcon, UserPlusIcon, BellIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function Tenants() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [reminderStatus, setReminderStatus] = useState(null);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [sendingReminderTo, setSendingReminderTo] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmTerminate, setConfirmTerminate] = useState(null);

  useEffect(() => { fetchTenants(); }, []);

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/tenants', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Accept': 'application/json' },
      });
      const data = await response.json();
      setTenants(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load tenants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tenantId) => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Accept': 'application/json' },
      });
      if (response.ok) setTenants(tenants.filter(t => t.id !== tenantId));
    } catch (err) {
      console.error('Error deleting tenant:', err);
    }
  };

  const handleTerminate = async (tenant) => {
    const activeRental = tenant.rentals?.find(r => r.status === 'active');
    if (!activeRental) return;
    try {
      const res = await fetch(`/api/rentals/${activeRental.id}/terminate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Accept': 'application/json' },
      });
      if (res.ok) fetchTenants();
    } catch (err) {
      console.error('Error terminating tenant:', err);
    }
  };

  const handleFormSuccess = () => { setShowForm(false); setEditingTenant(null); fetchTenants(); };

  const handleSendReminder = async (tenantId) => {
    setSendingReminderTo(tenantId);
    try {
      const res = await fetch(`/api/reminders/tenant/${tenantId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, Accept: 'application/json', 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setReminderStatus({ type: 'success', message: data.message || 'Reminder sent.' });
    } catch {
      setReminderStatus({ type: 'error', message: 'Failed to send reminder.' });
    } finally {
      setSendingReminderTo(null);
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'owner') {
    return <div className="max-w-7xl mx-auto px-6 py-8 text-center"><h1 className="text-2xl font-bold text-red-600">Access Denied</h1></div>;
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-6 py-8 text-center">Loading tenants...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-raisin dark:text-white">Tenant Management</h1>
        <div className="flex gap-3">
          <button
            onClick={async () => {
              setSendingReminders(true);
              setReminderStatus(null);
              try {
                const res = await fetch('/api/reminders/send-all', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
                });
                const data = await res.json();
                setReminderStatus({ type: 'success', message: data.message });
              } catch {
                setReminderStatus({ type: 'error', message: 'Failed to send reminders.' });
              } finally {
                setSendingReminders(false);
              }
            }}
            disabled={sendingReminders}
            className="flex items-center gap-2 border border-yellow-400 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            <BellIcon className="h-5 w-5" />
            {sendingReminders ? 'Sending...' : 'Send Reminders'}
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <UserPlusIcon className="h-5 w-5" />
            Add Tenant
          </button>
        </div>
      </div>

      {reminderStatus && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${reminderStatus.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {reminderStatus.message}
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-dark-elevated border-b border-gray-100 dark:border-dark-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-warm-gray uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-warm-gray uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-warm-gray uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-warm-gray uppercase tracking-wider">Balance</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-warm-gray uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-warm-gray uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
            {tenants.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <UserPlusIcon className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-sm text-warm-gray">No tenants yet. Add one to get started.</p>
                </td>
              </tr>
            ) : tenants.map((tenant) => {
              const activeRental = tenant.rentals?.find(r => r.status === 'active');
              return (
                <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-dark-elevated/50 transition">
                  <td className="px-6 py-4 font-medium text-raisin dark:text-white">{tenant.user?.name}</td>
                  <td className="px-6 py-4 text-warm-gray dark:text-gray-400">{tenant.user?.email}</td>
                  <td className="px-6 py-4 text-warm-gray dark:text-gray-400">{tenant.phone || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-semibold ${tenant.outstanding_balance > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      UGX {(tenant.outstanding_balance || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-warm-gray dark:text-gray-400">
                    {activeRental?.property?.name ?? <span className="italic">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingTenant(tenant); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-elevated text-blue-500 transition" title="Edit">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {activeRental && (
                        <button onClick={() => setConfirmTerminate(tenant)} className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500 transition" title="Terminate tenancy">
                          <XCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      {tenant.outstanding_balance > 0 && (
                        <button onClick={() => handleSendReminder(tenant.id)} disabled={sendingReminderTo === tenant.id} title="Send reminder" className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-500 transition disabled:opacity-50">
                          <BellIcon className="h-4 w-4" />
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <button onClick={() => setConfirmDelete(tenant)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition" title="Delete tenant">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <TenantForm tenant={editingTenant} onClose={() => { setShowForm(false); setEditingTenant(null); }} onSuccess={handleFormSuccess} />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete tenant"
          message={`Remove ${confirmDelete.user?.name} from the system? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => { handleDelete(confirmDelete.id); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {confirmTerminate && (
        <ConfirmModal
          title="Terminate tenancy"
          message={`End ${confirmTerminate.user?.name}'s lease at ${confirmTerminate.rentals?.find(r => r.status === 'active')?.property?.name}? The property will be marked as available.`}
          confirmLabel="Terminate"
          danger
          onConfirm={() => { handleTerminate(confirmTerminate); setConfirmTerminate(null); }}
          onCancel={() => setConfirmTerminate(null)}
        />
      )}
    </div>
  );
}
