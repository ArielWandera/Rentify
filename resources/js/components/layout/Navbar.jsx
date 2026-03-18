import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../hooks/useDarkMode';
import { MoonIcon, SunIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const navLinks = user.role === 'tenant'
    ? [{ to: '/my-rental', label: 'My Rental' }]
    : [
        { to: '/', label: 'Dashboard' },
        { to: '/properties', label: 'Properties' },
        ...(user.role === 'admin' ? [
          { to: '/users', label: 'Users' },
          { to: '/tenants', label: 'Tenants' },
          { to: '/payments', label: 'Payments' },
        ] : []),
        ...(user.role === 'owner' ? [
          { to: '/tenants', label: 'Tenants' },
          { to: '/payments', label: 'Payments' },
        ] : []),
      ];

  const linkClass = (to) =>
    `transition font-medium ${isActive(to) ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-gray-700 dark:text-gray-300 hover:text-primary'}`;

  return (
    <nav className="glass fixed top-0 z-50 w-full shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">Rentify Pro</Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className={linkClass(to)}>{label}</Link>
          ))}
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            {darkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">{user.name}</span>
          <button onClick={() => { logout(); navigate('/login'); }} className="btn-primary px-4 py-2 text-sm">Logout</button>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            {darkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            {menuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-4 space-y-3">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`block py-2 font-medium ${isActive(to) ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{user.name}</p>
            <button
              onClick={() => { logout(); navigate('/login'); setMenuOpen(false); }}
              className="btn-primary px-4 py-2 text-sm w-full"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
