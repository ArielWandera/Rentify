import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-raisin relative overflow-hidden items-end p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary-dark/60 to-raisin" />
        <div className="relative z-10 text-white space-y-4">
          <h1 className="text-5xl font-extrabold leading-tight">Manage your<br/>properties,<br/>effortlessly.</h1>
          <p className="text-white/70 text-lg max-w-sm">
            Rentify gives landlords and tenants one place to handle everything — payments, leases, and more.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary/10" />
        <div className="absolute top-1/3 -right-10 w-64 h-64 rounded-full bg-white/5" />
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-gray-950">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Link to="/" className="text-2xl font-extrabold text-primary">rentify</Link>
            <h2 className="mt-6 text-3xl font-bold text-raisin dark:text-white">Welcome back</h2>
            <p className="mt-1 text-warm-gray dark:text-gray-400">Sign in to your account</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-raisin dark:text-gray-200">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-raisin dark:text-gray-200">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Quick login */}
          <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 space-y-1">
            <p className="text-xs font-semibold text-warm-gray dark:text-gray-400 uppercase tracking-widest mb-3">Quick login (demo)</p>
            {[
              { label: 'Admin', email: 'admin@rentify.com' },
              { label: 'Owner — John Kamau', email: 'john.kamau@rentify.com' },
              { label: 'Owner — Sarah Nakato', email: 'sarah.nakato@rentify.com' },
              { label: 'Tenant — David Ochieng', email: 'david.ochieng@gmail.com' },
              { label: 'Tenant — Grace Atim', email: 'grace.atim@gmail.com' },
            ].map(({ label, email }) => (
              <button
                key={email}
                type="button"
                onClick={() => setForm({ email, password: 'password' })}
                className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-raisin dark:text-gray-300 transition flex justify-between"
              >
                <span className="font-medium">{label}</span>
                <span className="text-warm-gray">{email}</span>
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-warm-gray dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-semibold">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
