// resources/js/components/dashboard/Dashboard.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { HomeIcon, CheckCircleIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    properties: 0, 
    available: 0, 
    revenue: 0, 
    tenants: 0 
  });

  useEffect(() => {
    axios.get('/api/properties')
      .then(res => {
        const props = res.data;
        setStats({
          properties: props.length,
          available: props.filter(p => p.available).length,
          revenue: props.reduce((sum, p) => sum + (p.price_per_month || 0), 0),
          tenants: props.filter(p => !p.available).length,  // Count occupied properties as tenants
        });
      })
      .catch(err => console.error("Failed to load properties:", err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's your portfolio overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Properties', value: stats.properties, icon: HomeIcon, color: 'bg-blue-500' },
          { label: 'Available', value: stats.available, icon: CheckCircleIcon, color: 'bg-green-500' },
          { label: 'Monthly Revenue', value: `$${stats.revenue?.toLocaleString()}`, icon: CurrencyDollarIcon, color: 'bg-teal-500' },
          { label: 'Active Tenants', value: stats.tenants, icon: UserGroupIcon, color: 'bg-purple-500' },
        ].map((stat, i) => (
          <div
            key={i}
            className={`${stat.color} text-white p-6 rounded-xl shadow-lg card-hover transform transition-all`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm opacity-90">{stat.label}</p>
              </div>
              <stat.icon className="h-12 w-12 opacity-90" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity / Notifications Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">New property added</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sunny Apartments - $2,500/mo</p>
            </div>
            <span className="text-xs text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Tenant inquiry</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">John Doe interested in Downtown Loft</p>
            </div>
            <span className="text-xs text-gray-500">5 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Maintenance request</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Plumbing issue at River View Condo</p>
            </div>
            <span className="text-xs text-gray-500">1 day ago</span>
          </div>
        </div>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-4 text-sm">
          Notification system will be implemented here
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/properties/new"
          className="btn-primary text-center px-6 py-3 rounded-lg font-medium"
        >
          + Add Property
        </Link>
        <Link
          to="/properties"
          className="border border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-lg font-medium text-center transition"
        >
          View All Properties
        </Link>
      </div>
    </div>
  );
}