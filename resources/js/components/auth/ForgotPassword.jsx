import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail]       = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.errors?.email?.[0] || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-6 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
        {submitted ? (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 mb-2">
              <span className="text-2xl">✉️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Check your email</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              If <strong>{email}</strong> is registered, you'll receive a reset link shortly. The link expires in 60 minutes.
            </p>
            <Link to="/login" className="block text-sm text-primary hover:underline font-medium">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div>
              <Link to="/" className="text-2xl font-extrabold text-primary">rentify</Link>
              <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Forgot your password?</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            {error && (
              <p className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-sm">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
              />
              <button type="submit" disabled={loading} className="w-full btn-primary py-2.5 disabled:opacity-50">
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Remembered it?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
