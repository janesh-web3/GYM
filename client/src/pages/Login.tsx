import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Role } from '../types/Role';
import { useAuth } from '../context/AuthContext';
import { showError } from '../utils/toast';
import { Mail, Lock, LogIn, User, AlertCircle, CheckCircle } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [formSuccess, setFormSuccess] = useState(false);
  
  const { login, isAuthenticated, loading, user } = useAuth();

  // If already authenticated, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    const dashboardPath = `/${user.role === 'gymOwner' ? 'gym' : user.role}/dashboard`;
    return <Navigate to={dashboardPath} replace />;
  }

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    let isValid = true;
    
    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess(false);
    
    if (!validateForm()) return;
    
    if (!selectedRole) {
      showError('Please select a role');
      return;
    }
    
    try {
      // Call login function from auth context
      await login({
        email,
        password,
        role: selectedRole
      });
      setFormSuccess(true);
    } catch (err) {
      // Error handling is done in auth context with toast
      console.error('Login failed:', err);
    }
  };

  const roles: Role[] = ['superadmin', 'admin', 'gymOwner', 'member', 'trainer'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-emerald-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row overflow-hidden rounded-2xl shadow-2xl">
        {/* Left column - Image and text (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-slate-800 text-white p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-emerald-500 rotate-12 transform scale-150 translate-x-1/4 translate-y-1/4 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center">
              <div className="text-indigo-600 text-2xl font-bold">G</div>
            </div>
            <h1 className="text-4xl font-bold mt-12">Welcome to GymHub</h1>
            <p className="mt-6 text-lg text-white/80">
              Log in to access your personalized fitness journey, track your progress, and achieve your health goals.
            </p>
          </div>
          
          <div className="relative z-10">
            <p className="text-white/70 text-sm">
              &copy; {new Date().getFullYear()} GymHub. All rights reserved.
            </p>
          </div>
        </div>
        
        {/* Right column - Login form */}
        <div className="w-full lg:w-1/2 bg-white/90 backdrop-blur-sm p-8 sm:p-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-2 text-slate-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {formSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center text-emerald-800">
                <CheckCircle className="w-5 h-5 text-emerald-500 mr-3" />
                <span>Login successful! Redirecting...</span>
              </div>
            )}
            
            <div>
              <Input
                label="Email address"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                startIcon={<Mail className="w-5 h-5" />}
                error={errors.email}
                fullWidth
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Input
                  label="Password"
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  startIcon={<Lock className="w-5 h-5" />}
                  showPasswordToggle
                  error={errors.password}
                  fullWidth
                />
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <input
                    id="remember_me"
                    name="remember_me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all duration-150"
                  />
                  <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select your role
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {roles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`
                      flex flex-col items-center justify-center px-3 py-2.5 border rounded-lg shadow-sm text-sm font-medium
                      transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                      ${
                        selectedRole === role
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-700 shadow-md'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }
                    `}
                  >
                    <User className={`w-5 h-5 mb-1 ${selectedRole === role ? 'text-white' : 'text-slate-500'}`} />
                    <span className="truncate">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                  </button>
                ))}
              </div>
              {!selectedRole && errors.email && (
                <p className="mt-2 text-sm text-red-600">Please select a role</p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                disabled={!selectedRole || loading}
                icon={<LogIn className="w-5 h-5" />}
                className="mt-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all duration-200 text-white py-3 rounded-lg"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 