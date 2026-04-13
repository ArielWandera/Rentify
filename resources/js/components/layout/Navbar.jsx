import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../hooks/useDarkMode';
import { MoonIcon, SunIcon, Bars3Icon, XMarkIcon, UserCircleIcon, KeyIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
import ChangePassword from '../auth/ChangePassword';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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
          { to: '/landlord-payouts', label: 'Payouts' },
          { to: '/audit-log', label: 'Audit Log' },
        ] : []),
        ...(user.role === 'owner' ? [
          { to: '/tenants', label: 'Tenants' },
          { to: '/payments', label: 'Payments' },
        ] : []),
      ];

  const handleLogout = () => {
    setDropdownOpen(false);
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
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

            {/* User pill dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 border border-gray-200 dark:border-dark-border rounded-full px-3 py-1.5 hover:shadow-md transition cursor-pointer"
              >
                <UserCircleIcon className="h-6 w-6 text-warm-gray" />
                <span className="text-sm font-semibold text-raisin dark:text-white truncate max-w-[120px]">{user.name}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={() => { setDropdownOpen(false); setShowChangePassword(true); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <KeyIcon className="h-4 w-4" />
                    Change password
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              )}
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
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-1 space-y-1">
              <p className="text-xs text-warm-gray dark:text-gray-500 px-4">{user.name}</p>
              <button
                onClick={() => { setMenuOpen(false); setShowChangePassword(true); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition"
              >
                <KeyIcon className="h-4 w-4" />
                Change password
              </button>
              <button
                onClick={handleLogout}
                className="w-full btn-primary text-sm py-2.5"
              >
                Log out
              </button>
            </div>
          </div>
        )}
      </nav>

      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}
    </>
  );
}
