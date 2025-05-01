import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Bell,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Search,
  LayoutDashboard
} from 'lucide-react';

const DynamicHeader = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  // Close dropdowns when location changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsNotificationsOpen(false);
  }, [location]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to handle search (could redirect to search page with query param)
    console.log(`Searching for: ${searchTerm}`);
  };

  // Get profile path based on user role
  const getProfilePath = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'admin':
      case 'superadmin':
        return `/${user.role}/settings`;
      case 'gymOwner':
        return '/gym/edit-profile';
      case 'trainer':
      case 'member':
        return `/${user.role}/profile`;
      default:
        return '/';
    }
  };

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'superadmin':
        return '/superadmin/dashboard';
      case 'gymOwner':
        return '/gym/dashboard';
      case 'trainer':
        return '/trainer/dashboard';
      case 'member':
        return '/member/dashboard';
      default:
        return '/';
    }
  };

  // Mock notifications for demo
  const notifications = [
    { id: 1, content: 'New member joined your gym', isRead: false, time: '5 min ago' },
    { id: 2, content: 'Your workout plan was approved', isRead: true, time: '2 hours ago' },
    { id: 3, content: 'Schedule updated for tomorrow', isRead: false, time: '1 day ago' },
  ];
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-white border-b border-gray-200 fixed w-full z-20">
      <div className="px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Left section - Title and breadcrumbs */}
        <div className="flex items-center">
          <div className="flex items-center lg:hidden">
            {/* We don't need a toggle here as the sidebar has its own mobile menu button */}
            <Link to="/" className="text-primary-600 font-bold text-xl">GymHub</Link>
          </div>
          
          {/* Breadcrumbs - show only on larger screens and when authenticated */}
          {isAuthenticated && (
            <div className="hidden sm:flex items-center">
              <Link to={getDashboardPath()} className="text-gray-500 hover:text-primary-600">
                {user?.role === 'superadmin' ? 'SuperAdmin' : 
                  user?.role === 'admin' ? 'Admin' : 
                  user?.role === 'gymOwner' ? 'Gym' :
                  user?.role === 'trainer' ? 'Trainer' : 'Member'}
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-800">
                {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          )}
        </div>
        
        {/* Right section - Search, notifications, cart, profile */}
        <div className="flex items-center space-x-4">
          {/* Search - Only shown for specific roles or pages */}
          {isAuthenticated && ['member', 'trainer'].includes(user?.role || '') && (
            <form onSubmit={handleSearch} className="hidden md:block relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-100 py-2 pl-10 pr-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
              />
            </form>
          )}
          
          {/* Notifications */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-full hover:bg-gray-100 relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-gray-500" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <div className={`dropdown-menu w-80 ${isNotificationsOpen ? 'open' : 'closed'}`}>
                <div className="p-3 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                </div>
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition ${notification.isRead ? '' : 'bg-blue-50'}`}
                      >
                        <p className="text-sm text-gray-800">{notification.content}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-gray-200 text-center">
                  <button className="text-xs text-primary-600 hover:text-primary-800">
                    Mark all as read
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Shopping Cart - Only for members */}
          {isAuthenticated && user?.role === 'member' && (
            <Link to="/member/shop/cart" className="p-2 rounded-full hover:bg-gray-100 relative">
              <ShoppingCart className="h-5 w-5 text-gray-500" />
              <span className="absolute top-1 right-1 h-4 w-4 bg-primary-500 rounded-full text-white text-xs flex items-center justify-center">
                2
              </span>
            </Link>
          )}
          
          {/* User Menu */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                aria-label="Open user menu"
              >
                <div className="profile-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </button>
              
              <div className={`dropdown-menu w-48 ${isMenuOpen ? 'open' : 'closed'}`}>
                <div className="border-b border-gray-200 px-4 py-2 md:hidden">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Link
                  to={getDashboardPath()}
                  className="dropdown-item"
                >
                  <LayoutDashboard className="icon" />
                  Dashboard
                </Link>
                <Link
                  to={getProfilePath()}
                  className="dropdown-item"
                >
                  <User className="icon" />
                  Profile
                </Link>
                <Link
                  to={user.role === 'admin' || user.role === 'superadmin' || user.role === 'gymOwner' 
                    ? `/${user.role === 'gymOwner' ? 'gym' : user.role}/settings` 
                    : `/${user.role}/profile`
                  }
                  className="dropdown-item"
                >
                  <Settings className="icon" />
                  Settings
                </Link>
                <button
                  onClick={logout}
                  className="dropdown-item danger"
                >
                  <LogOut className="icon" />
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DynamicHeader; 