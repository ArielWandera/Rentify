import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../hooks/useDarkMode';
import { MoonIcon, SunIcon, Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';

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

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/95 dark:bg-dark-base/95 backdrop-blur-sm border-b border-gray-100 dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-xl font-extrabold tracking-tight">
          <span className="text-primary">rentify</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive(to)
                  ? 'bg-gray-100 dark:bg-dark-elevated text-raisin dark:text-white'
                  : 'text-warm-gray dark:text-gray-400 hover:text-raisin dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-elevated/60'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition text-warm-gray dark:text-gray-400"
          >
            {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2 border border-gray-200 dark:border-dark-border rounded-full px-3 py-1.5 hover:shadow-md transition cursor-pointer"
            onClick={() => { logout(); navigate('/login'); }}
          >
            <UserCircleIcon className="h-6 w-6 text-warm-gray" />
            <span className="text-sm font-semibold text-raisin dark:text-white truncate max-w-[120px]">{user.name}</span>
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            {menuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-dark-border bg-white dark:bg-dark-base px-4 py-3 space-y-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive(to)
                  ? 'bg-gray-100 dark:bg-dark-elevated text-raisin dark:text-white'
                  : 'text-warm-gray dark:text-gray-400'
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-1">
            <p className="text-xs text-warm-gray dark:text-gray-500 px-4 mb-2">{user.name}</p>
            <button
              onClick={() => { logout(); navigate('/login'); setMenuOpen(false); }}
              className="w-full btn-primary text-sm py-2.5"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
