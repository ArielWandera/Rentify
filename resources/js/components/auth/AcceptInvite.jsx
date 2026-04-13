import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import PasswordStrength from '../ui/PasswordStrength';

export default function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setUserFromToken } = useAuth();

  const [status, setStatus] = useState('loading'); // loading | valid | invalid | submitting | done
  const [tenantInfo, setTenantInfo] = useState(null);
  const [form, setForm] = useState({ password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios.get(`/api/invite/${token}`)
      .then(res => {
        setTenantInfo(res.data);
        setStatus('valid');
      })
      .catch(() => setStatus('invalid'));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setStatus('submitting');

    try {
      const res = await axios.post(`/api/invite/${token}`, form);
      await setUserFromToken(res.data.token);
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setErrors(data.errors);
      } else {
        setErrors({ general: data?.message || 'Something went wrong.' });
      }
      setStatus('valid');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500">Verifying your invite link...</p>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl text-center">
          <div className="text-5xl mb-4">🔗</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Link expired or invalid</h2>
          <p className="text-gray-500 text-sm">This invite link has already been used or has expired. Ask your landlord to resend your invitation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-6 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
        <div className="text-center">
          <div className="text-4xl mb-3">🏠</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to Rentify</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Hi <strong>{tenantInfo?.name}</strong>, set your password to access your tenant dashboard.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
          Signing in as <strong>{tenantInfo?.email}</strong>
        </div>

        {errors.general && (
          <p className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-sm">{errors.general}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Choose a password (min 8 characters)"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="input"
            />
            <PasswordStrength password={form.password} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm password"
              required
              value={form.password_confirmation}
              onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full btn-primary py-2.5 disabled:opacity-50"
          >
            {status === 'submitting' ? 'Setting up your account...' : 'Set password & get started'}
          </button>
        </form>
      </div>
    </div>
  );
}
