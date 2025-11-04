import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import PropertyList from './components/properties/PropertyList';
import PropertyForm from './components/properties/PropertyForm';
import PropertyDetail from './components/properties/PropertyDetail.jsx';
import Users from './components/users/Users';
import Tenants from './components/tenants/Tenants';
import Payments from './components/payments/Payments';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>;
  return user ? children : <Navigate to="/login" />;
}

export default function MainApp() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/properties" element={<ProtectedRoute><PropertyList /></ProtectedRoute>} />
          <Route path="/properties/new" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
          <Route path="/properties/:id" element={<ProtectedRoute><PropertyDetail /></ProtectedRoute>} />
          <Route path="/properties/:id/edit" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/tenants" element={<ProtectedRoute><Tenants /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
        </Routes>
      </div>
    </>
  );
}
