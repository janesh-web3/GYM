import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/Role';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // If still loading, show nothing or a spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no role restriction or user role is allowed, render the route
  if (!allowedRoles || (user && allowedRoles.includes(user.role))) {
    return <Outlet />;
  }

  // If user doesn't have the required role, redirect to their dashboard
  if (user) {
    const redirectPath = (() => {
      switch(user.role) {
        case 'superadmin':
          return '/superadmin';
        case 'admin':
          return '/admin';
        case 'gymOwner':
          return '/gym';
        case 'trainer':
          return '/trainer';
        case 'member':
          return '/member';
        default:
          return '/';
      }
    })();
    
    return <Navigate to={redirectPath} replace />;
  }

  // Fallback redirect to login
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute; 