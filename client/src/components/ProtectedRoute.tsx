import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/Role';
import { isAuthenticated as checkAuth, isTokenExpired, forceLogout } from '../utils/auth';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Additional token validation
  const performTokenCheck = () => {
    // Get the token from localStorage
    const token = localStorage.getItem('accessToken');
    
    // If we have a token but it's expired, force logout
    if (token && isTokenExpired(token)) {
      forceLogout('Your session has expired. Please log in again.');
      return false;
    }
    
    // If we say we're authenticated but there's no token, something's wrong
    if (isAuthenticated && !token) {
      forceLogout('Authentication error. Please log in again.');
      return false;
    }
    
    // Otherwise, use the auth context value
    return isAuthenticated;
  };

  // If still loading, show nothing or a spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Perform additional token validation
  const userIsAuthenticated = performTokenCheck();

  // If not authenticated, redirect to login
  if (!userIsAuthenticated) {
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