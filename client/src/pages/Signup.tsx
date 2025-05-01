import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Role } from '../types/Role';
import { useAuth } from '../context/AuthContext';
import { showError } from '../utils/toast';
import { Mail, Lock, UserPlus, User, AlertCircle, CheckCircle } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Signup = () => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [formSuccess, setFormSuccess] = useState(false);
  
  const { register, isAuthenticated, loading, user } = useAuth();

  // If already authenticated, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    const dashboardPath = `/${user.role === 'gymOwner' ? 'gym' : user.role}/dashboard`;
    return <Navigate to={dashboardPath} replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess(false);
    
    if (!validateForm()) return;
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    
    // Validate role selection
    if (!selectedRole) {
      showError('Please select a role');
      return;
    }
    
    try {
      // Call register function from auth context
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: selectedRole
      });
      setFormSuccess(true);
    } catch (err) {
      // Error handling is done in auth context with toast
      console.error('Registration failed:', err);
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
            <h1 className="text-4xl font-bold mt-12">Join GymHub Today</h1>
            <p className="mt-6 text-lg text-white/80">
              Sign up to start your fitness journey, connect with trainers, and access premium workout plans designed just for you.
            </p>
            <div className="mt-10">
              <div className="bg-slate-700/50 p-4 rounded-xl">
                <p className="text-white font-medium">
                  "GymHub transformed how I manage my fitness routine. Highly recommended!"
                </p>
                <p className="text-white/70 text-sm mt-2">— Sarah J., Member since 2022</p>
              </div>
            </div>
          </div>
          
          <div className="relative z-10">
            <p className="text-white/70 text-sm">
              &copy; {new Date().getFullYear()} GymHub. All rights reserved.
            </p>
          </div>
        </div>
        
        {/* Right column - Signup form */}
        <div className="w-full lg:w-1/2 bg-white/90 backdrop-blur-sm p-8 sm:p-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                Sign in instead
              </Link>
            </p>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {formSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center text-emerald-800">
                <CheckCircle className="w-5 h-5 text-emerald-500 mr-3" />
                <span>Account created successfully! Redirecting...</span>
              </div>
            )}
            
            <div>
              <Input
                label="Full Name"
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                startIcon={<User className="w-5 h-5" />}
                error={errors.name}
                fullWidth
              />
            </div>

            <div>
              <Input
                label="Email address"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                startIcon={<Mail className="w-5 h-5" />}
                error={errors.email}
                fullWidth
              />
            </div>

            <div>
              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                startIcon={<Lock className="w-5 h-5" />}
                showPasswordToggle
                error={errors.password}
                helperText="Password must be at least 6 characters"
                fullWidth
              />
            </div>

            <div>
              <Input
                label="Confirm Password"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                startIcon={<Lock className="w-5 h-5" />}
                showPasswordToggle
                error={errors.confirmPassword}
                fullWidth
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Select your role
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
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
              {!selectedRole && Object.keys(errors).length > 0 && (
                <p className="mt-2 text-sm text-red-600">Please select a role</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                disabled={!selectedRole || formData.password !== formData.confirmPassword || loading}
                icon={<UserPlus className="w-5 h-5" />}
                className="mt-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all duration-200 text-white py-3 rounded-lg"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </div>

            <p className="text-xs text-slate-500 text-center mt-4">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-indigo-600 hover:text-indigo-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500">
                Privacy Policy
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup; 