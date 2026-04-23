import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import PasswordStrength from '../ui/PasswordStrength';

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
            <PasswordStrength password={form.password} />
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
