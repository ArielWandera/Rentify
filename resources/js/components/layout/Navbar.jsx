import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../hooks/useDarkMode';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode } = useDarkMode();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <nav className="glass fixed top-0 z-50 w-full shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">Rentify Pro</Link>
        <div className="flex items-center space-x-6">
          <Link to="/properties" className="text-gray-700 dark:text-gray-300 hover:text-primary transition">Properties</Link>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            {darkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
          </button>
          <button onClick={() => { logout(); navigate('/login'); }} className="btn-primary px-4 py-2 text-sm">Logout</button>
        </div>
      </div>
    </nav>
  );
}