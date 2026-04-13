import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    try {
      await register(form.name, form.email, form.password, form.password_confirmation);
      navigate('/properties');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setFieldErrors(data.errors);
      } else {
        setError(data?.message || 'Registration failed. Please try again.');
      }
    }
  };

  const inputClass = (name) =>
    `input ${fieldErrors[name] ? 'border-red-500 focus:ring-red-500' : ''}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-6 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl">

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
            <BuildingOffice2Icon className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create a landlord account</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your properties, tenants and payments in one place
          </p>
        </div>

        {error && (
          <p className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-sm">{error}</p>
        )}

        <a
          href="/auth/google"
          className="flex items-center justify-center gap-3 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </a>

        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
          <span className="text-xs text-gray-400">or register with email</span>
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Full name"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className={inputClass('name')}
            />
            {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name[0]}</p>}
          </div>
          <div>
            <input
              type="email"
              placeholder="Email address"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className={inputClass('email')}
            />
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email[0]}</p>}
          </div>
          <div>
            <input
              type="password"
              placeholder="Password (min 8 characters)"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className={inputClass('password')}
            />
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password[0]}</p>}
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm password"
              required
              value={form.password_confirmation}
              onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
              className={inputClass('password_confirmation')}
            />
          </div>

          <button type="submit" className="w-full btn-primary py-2.5">
            Create landlord account
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Are you a tenant?{' '}
          <span className="font-medium text-gray-600 dark:text-gray-300">Ask your landlord to add you — tenants are invited directly.</span>
        </p>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
