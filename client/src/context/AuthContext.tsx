import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Role } from '../types/Role';
import { setTokens, removeTokens, getTokens } from '../lib/api';
import { authService } from '../lib/services';
import { showSuccess, showError, showLoading, updateToast } from '../utils/toast';

// Define the shape of the user data from API
interface UserData {
  _id: string;
  name: string;
  email: string;
  role: Role;
  token?: string;
  status?: string;
}

// Define the shape of our auth state
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Define the shape of a user
interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

// Define the shape of registration data
interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: Role;
}

// Define the shape of login data
interface LoginData {
  email: string;
  password: string;
  role: Role;
}

// Define the shape of our auth context
interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null
  });
  
  const navigate = useNavigate();

  // Check if user is already logged in on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const tokens = getTokens();
        if (!tokens) {
          setAuthState(prev => ({ ...prev, loading: false }));
          return;
        }
        
        const userData = await authService.getCurrentUser() as UserData;
        console.log('Current user data:', userData);
        
        // Format the user data to match our User interface
        const user = {
          id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role
        };
        
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
          error: null
        });
        
        // Show welcome back toast
        showSuccess(`Welcome back, ${user.name}!`);
      } catch (error) {
        console.error('Authentication error:', error);
        // Token might be invalid or expired
        removeTokens();
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to authenticate'
        });
      }
    };
    
    loadUser();
  }, []);

  // Register a new user
  const register = async (data: RegisterData) => {
    // Show loading toast
    const toastId = showLoading('Creating your account...');
    
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authService.register(data) as UserData;
      setTokens({
        accessToken: response.token || '',
        refreshToken: response.token || '' // Using the same token for both since backend doesn't provide a refreshToken
      });
      
      setAuthState({
        isAuthenticated: true,
        user: {
          id: response._id,
          name: response.name,
          email: response.email,
          role: response.role
        },
        loading: false,
        error: null
      });
      
      // Update loading toast to success
      updateToast(toastId, 'Account created successfully!', 'success');
      
      // Redirect based on role
      redirectToRoleDashboard(response.role);
    } catch (error) {
      // Update loading toast to error
      updateToast(
        toastId, 
        error instanceof Error ? error.message : 'Registration failed', 
        'error'
      );
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      }));
    }
  };

  // Login an existing user
  const login = async (data: LoginData) => {
    // Show loading toast
    const toastId = showLoading('Signing you in...');
    
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('Login request data:', data);
      const response = await authService.login(data.email, data.password) as UserData;
      console.log('Login response data:', response);
      
      setTokens({
        accessToken: response.token || '',
        refreshToken: response.token || '' // Using the same token for both since backend doesn't provide a refreshToken
      });
      
      const user = {
        id: response._id,
        name: response.name,
        email: response.email,
        role: response.role
      };
      
      console.log('User object created:', user);
      
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null
      });
      
      // Update loading toast to success
      updateToast(toastId, 'Logged in successfully!', 'success');
      
      // Debug the role before redirect
      console.log('Redirecting to dashboard for role:', response.role);
      redirectToRoleDashboard(response.role);
      console.log('Navigation completed');
    } catch (error) {
      console.error('Login error details:', error);
      // Update loading toast to error
      updateToast(
        toastId, 
        error instanceof Error ? error.message : 'Login failed', 
        'error'
      );
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }));
    }
  };

  // Redirect user based on role
  const redirectToRoleDashboard = (role: Role) => {
    switch (role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'gymOwner':
        navigate('/gym/dashboard');
        break;
      case 'trainer':
        navigate('/trainer/dashboard');
        break;
      case 'member':
        navigate('/member/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  // Logout the user
  const logout = () => {
    removeTokens();
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
    });
    showSuccess('You have been logged out');
    navigate('/login');
  };

  // Clear any auth errors
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  // Combine auth state with auth actions
  const value = {
    ...authState,
    login,
    register,
    logout,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 