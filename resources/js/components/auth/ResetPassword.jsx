import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import PasswordStrength from '../ui/PasswordStrength';

export default function ResetPassword() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const token           = searchParams.get('token') || '';
  const email           = searchParams.get('email') || '';

  const [form, setForm]     = useState({ password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await axios.post('/api/reset-password', { email, token, ...form });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const data = err.response?.data;
      setErrors(data?.errors || { token: [data?.message || 'This reset link is invalid or has expired.'] });
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl text-center space-y-4">
          <p className="text-gray-500">Invalid reset link. Please request a new one.</p>
          <Link to="/forgot-password" className="text-primary hover:underline text-sm">Request new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-6 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
        {done ? (
          <div className="text-center space-y-4">
            <div className="text-4xl">✓</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Password reset!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting you to sign in...</p>
          </div>
        ) : (
          <>
            <div>
              <Link to="/" className="text-2xl font-extrabold text-primary">rentify</Link>
              <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Choose a new password</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">For {email}</p>
            </div>

            {errors.token && (
              <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-sm space-y-1">
                <p>{errors.token[0]}</p>
                <Link to="/forgot-password" className="underline font-medium">Request a new link</Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="New password"
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
                  placeholder="Confirm new password"
                  required
                  value={form.password_confirmation}
                  onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
                  className="input"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary py-2.5 disabled:opacity-50">
                {loading ? 'Resetting...' : 'Reset password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
