import { useEffect, useState } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const ACTION_COLORS = {
  login:           'bg-green-100 text-green-700',
  logout:          'bg-gray-100 text-gray-600',
  created:         'bg-blue-100 text-blue-700',
  updated:         'bg-yellow-100 text-yellow-700',
  deleted:         'bg-red-100 text-red-700',
  terminated:      'bg-orange-100 text-orange-700',
  lease_uploaded:  'bg-purple-100 text-purple-700',
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const fetchLogs = (p = 1) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(`/api/audit-logs?page=${p}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then(r => r.json())
      .then(data => {
        setLogs(data.data || []);
        setMeta(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(page); }, [page]);

  const formatTime = (ts) =>
    new Date(ts).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheckIcon className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold text-raisin dark:text-white">Audit Log</h1>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <ul className="divide-y divide-gray-100 dark:divide-dark-border sm:hidden">
              {logs.length === 0 && (
                <li className="px-4 py-12 text-center text-warm-gray">No activity yet.</li>
              )}
              {logs.map(log => (
                <li key={log.id} className="px-4 py-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                      {log.action}
                    </span>
                    <span className="text-xs text-warm-gray dark:text-gray-400">{formatTime(log.created_at)}</span>
                  </div>
                  <p className="text-sm font-medium text-raisin dark:text-white">
                    {log.user?.name ?? <span className="italic text-warm-gray">deleted</span>}
                    {log.user?.role && <span className="ml-1 text-xs text-warm-gray">({log.user.role})</span>}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{log.description}</p>
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-dark-elevated border-b border-gray-100 dark:border-dark-border">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold text-warm-gray">Time</th>
                    <th className="px-5 py-3 text-left font-semibold text-warm-gray">User</th>
                    <th className="px-5 py-3 text-left font-semibold text-warm-gray">Action</th>
                    <th className="px-5 py-3 text-left font-semibold text-warm-gray">Description</th>
                    <th className="px-5 py-3 text-left font-semibold text-warm-gray">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-dark-elevated/50 transition">
                      <td className="px-5 py-3 text-warm-gray dark:text-gray-400 whitespace-nowrap">{formatTime(log.created_at)}</td>
                      <td className="px-5 py-3 font-medium text-raisin dark:text-white">
                        {log.user?.name ?? <span className="text-warm-gray italic">deleted</span>}
                        {log.user?.role && <span className="ml-1 text-xs text-warm-gray">({log.user.role})</span>}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-raisin dark:text-gray-200">{log.description}</td>
                      <td className="px-5 py-3 text-warm-gray dark:text-gray-400 font-mono text-xs">{log.ip_address}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-warm-gray">No activity yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex justify-between items-center px-4 sm:px-5 py-4 border-t border-gray-100 dark:border-dark-border">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-outline text-sm py-1.5 px-4 disabled:opacity-40"
            >Previous</button>
            <span className="text-sm text-warm-gray">Page {page} of {meta.last_page}</span>
            <button
              onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
              disabled={page === meta.last_page}
              className="btn-outline text-sm py-1.5 px-4 disabled:opacity-40"
            >Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
