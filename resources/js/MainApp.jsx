import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/layout/Navbar';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import PropertyList from './components/properties/PropertyList';
import PropertyForm from './components/properties/PropertyForm';
import PropertyDetail from './components/properties/PropertyDetail.jsx';
import Users from './components/users/Users';
import Tenants from './components/tenants/Tenants';
import Payments from './components/payments/Payments';
import TenantPortal from './components/tenant/TenantPortal';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function HomeRedirect() {
  const { user } = useAuth();
  return user?.role === 'tenant' ? <TenantPortal /> : <Dashboard />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>;
  return user ? <Navigate to="/" /> : children;
}

export default function MainApp() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/" element={<ProtectedRoute><HomeRedirect /></ProtectedRoute>} />
          <Route path="/my-rental" element={<ProtectedRoute roles={['tenant']}><TenantPortal /></ProtectedRoute>} />
          <Route path="/properties" element={<ProtectedRoute roles={['admin', 'owner']}><PropertyList /></ProtectedRoute>} />
          <Route path="/properties/new" element={<ProtectedRoute roles={['admin', 'owner']}><PropertyForm /></ProtectedRoute>} />
          <Route path="/properties/:id" element={<ProtectedRoute roles={['admin', 'owner']}><PropertyDetail /></ProtectedRoute>} />
          <Route path="/properties/:id/edit" element={<ProtectedRoute roles={['admin', 'owner']}><PropertyForm /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
          <Route path="/tenants" element={<ProtectedRoute roles={['admin', 'owner']}><Tenants /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute roles={['admin', 'owner']}><Payments /></ProtectedRoute>} />
        </Routes>
        </ErrorBoundary>
      </div>
    </>
  );
}
