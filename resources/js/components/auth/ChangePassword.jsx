import { useState } from 'react';
import axios from 'axios';
import PasswordStrength from '../ui/PasswordStrength';

export default function ChangePassword({ onClose }) {
  const [form, setForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      await axios.put('/api/user/password', form);
      setSuccess(true);
    } catch (err) {
      const data = err.response?.data;
      setErrors(data?.errors || { current_password: [data?.message || 'Something went wrong.'] });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-8">
        {success ? (
          <div className="text-center space-y-4">
            <div className="text-4xl">✓</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Password updated</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">A confirmation email has been sent to you.</p>
            <button onClick={onClose} className="btn-primary w-full py-2.5">Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Change password</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Current password"
                  required
                  value={form.current_password}
                  onChange={e => setForm({ ...form, current_password: e.target.value })}
                  className="input"
                />
                {errors.current_password && (
                  <p className="text-red-500 text-xs mt-1">{errors.current_password[0]}</p>
                )}
              </div>

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
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>
                )}
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

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-2.5 disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
