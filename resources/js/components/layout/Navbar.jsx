import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../hooks/useDarkMode';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const navLink = (to, label) => {
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
    return (
      <Link
        to={to}
        className={`transition font-medium ${
          isActive
            ? 'text-primary border-b-2 border-primary pb-0.5'
            : 'text-gray-700 dark:text-gray-300 hover:text-primary'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="glass fixed top-0 z-50 w-full shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">Rentify Pro</Link>
        <div className="flex items-center space-x-6">
          {navLink('/', 'Dashboard')}
          {navLink('/properties', 'Properties')}
          {user.role === 'admin' && (
            <>
              {navLink('/users', 'Users')}
              {navLink('/tenants', 'Tenants')}
              {navLink('/payments', 'Payments')}
            </>
          )}
          {user.role === 'owner' && (
            <>
              {navLink('/tenants', 'Tenants')}
              {navLink('/payments', 'Payments')}
            </>
          )}
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            {darkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">{user.name}</span>
          <button onClick={() => { logout(); navigate('/login'); }} className="btn-primary px-4 py-2 text-sm">Logout</button>
        </div>
      </div>
    </nav>
  );
}
