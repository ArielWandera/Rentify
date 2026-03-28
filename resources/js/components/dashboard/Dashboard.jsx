import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, CheckCircleIcon, CurrencyDollarIcon, UserGroupIcon, ArrowDownTrayIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="card p-6 flex items-start justify-between card-hover">
      <div className="space-y-1">
        <p className="text-sm font-medium text-warm-gray dark:text-gray-400">{label}</p>
        <p className="text-3xl font-bold text-raisin dark:text-white">{value}</p>
      </div>
      <div className={`p-3 rounded-2xl ${accent}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ properties: 0, available: 0, revenue: 0, tenants: 0 });
  const [recentPayments, setRecentPayments] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

        const [propertiesRes, tenantsRes, paymentsRes] = await Promise.all([
          fetch('/api/properties', { headers }),
          fetch('/api/tenants', { headers }),
          fetch('/api/payments?limit=5', { headers }),
        ]);

        const [properties, tenants, payments] = await Promise.all([
          propertiesRes.json(),
          tenantsRes.json(),
          paymentsRes.json(),
        ]);

        setRecentPayments(Array.isArray(payments) ? payments.slice(0, 5) : []);
        setStats({
          properties: Array.isArray(properties) ? properties.length : 0,
          available: Array.isArray(properties) ? properties.filter(p => p.available).length : 0,
          revenue: Array.isArray(payments) ? payments.reduce((s, p) => s + parseFloat(p.amount_paid || 0), 0) : 0,
          tenants: Array.isArray(tenants) ? tenants.length : 0,
        });
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };
    fetchStats();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-raisin dark:text-white">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-warm-gray dark:text-gray-400">Here's what's happening with your portfolio.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/properties/new" className="btn-primary text-sm py-2.5 px-5">
            + Add property
          </Link>
          <button
            onClick={() => {
              const token = localStorage.getItem('token');
              const url = user?.role === 'admin' ? '/api/reports/admin' : '/api/reports/owner';
              fetch(url, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.blob())
                .then(blob => {
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = `rentify-report-${new Date().toISOString().slice(0, 10)}.pdf`;
                  a.click();
                });
            }}
            className="btn-outline text-sm py-2.5 px-5 flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Properties" value={stats.properties} icon={HomeIcon} accent="bg-primary" />
        <StatCard label="Available" value={stats.available} icon={CheckCircleIcon} accent="bg-green-500" />
        <StatCard label="Total Revenue" value={`UGX ${stats.revenue.toLocaleString()}`} icon={CurrencyDollarIcon} accent="bg-amber-500" />
        <StatCard label="Active Tenants" value={stats.tenants} icon={UserGroupIcon} accent="bg-violet-500" />
      </div>

      {/* Recent Activity */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-dark-border">
          <h2 className="text-lg font-bold text-raisin dark:text-white">Recent payments</h2>
          <Link to="/payments" className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
            View all <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-dark-border">
          {recentPayments.length > 0 ? (
            recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-elevated/50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <CurrencyDollarIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-raisin dark:text-white">
                      {payment.rental?.tenant?.user?.name ?? 'Tenant'}
                    </p>
                    <p className="text-xs text-warm-gray dark:text-gray-400">
                      {payment.rental?.property?.name ?? 'Property'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-raisin dark:text-white">
                    UGX {parseFloat(payment.amount_paid).toLocaleString()}
                  </p>
                  <p className="text-xs text-warm-gray dark:text-gray-400">
                    {new Date(payment.payment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-warm-gray dark:text-gray-400">
              <CurrencyDollarIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No payments recorded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3">
        <Link to="/properties" className="btn-outline text-sm py-2.5 px-5">
          View all properties
        </Link>
        <Link to="/tenants" className="btn-outline text-sm py-2.5 px-5">
          Manage tenants
        </Link>
      </div>
    </div>
  );
}
