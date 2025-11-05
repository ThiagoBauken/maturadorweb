
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  return isAuthenticated && isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
