import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from './DynamicSidebar';
import { 
  Bell,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Search,
  LayoutDashboard,
  Home,
  ChevronDown,
  Menu
} from 'lucide-react';

const DynamicHeader = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isCollapsed, setIsMobileOpen } = useSidebar();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  // Close dropdowns when location changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsNotificationsOpen(false);
    setIsMobileSearchOpen(false);
  }, [location]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container') && isMenuOpen) {
        setIsMenuOpen(false);
      }
      if (!target.closest('.notifications-container') && isNotificationsOpen) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isNotificationsOpen]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Searching for: ${searchTerm}`);
    setIsMobileSearchOpen(false);
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

  // Get page title from path
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop() || 'dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
  };

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 right-0 left-0 z-20 shadow-sm transition-all duration-300">
      <div className={`h-16 transition-all duration-300 ${isAuthenticated && user ? (isCollapsed ? 'lg:ml-16' : 'lg:ml-64') : ''}`}>
        <div className="h-full px-4 sm:px-6 flex items-center justify-between max-w-[2000px] mx-auto">
          {/* Left section - Logo, Mobile Menu & Breadcrumbs */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user && (
              <button 
                onClick={() => setIsMobileOpen(true)}
                className="p-2 text-gray-600 rounded-full hover:bg-gray-100 lg:hidden"
                aria-label="Open sidebar menu"
              >
                <Menu size={20} />
              </button>
            )}
            
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold mr-2">
                  G
                </div>
                <span className="font-bold text-xl text-primary-600 hidden xs:block">GymHub</span>
              </Link>
            </div>
            
            {/* Breadcrumbs - show only on larger screens and when authenticated */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center">
                <div className="h-5 w-px bg-gray-300 mx-3"></div>
                <div className="flex items-center text-sm">
                  <Link to={getDashboardPath()} className="flex items-center text-gray-500 hover:text-primary-600">
                    <Home size={16} className="mr-1" />
                    <span>
                      {user?.role === 'superadmin' ? 'SuperAdmin' : 
                        user?.role === 'admin' ? 'Admin' : 
                        user?.role === 'gymOwner' ? 'Gym' :
                        user?.role === 'trainer' ? 'Trainer' : 'Member'}
                    </span>
                  </Link>
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-800 font-medium">{getPageTitle()}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Right section - Search, notifications, cart, profile */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Search - Toggle on mobile, always show on desktop */}
            {isAuthenticated && ['member', 'trainer'].includes(user?.role || '') && (
              <>
                <button
                  onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                  className="p-2 rounded-full hover:bg-gray-100 md:hidden"
                  aria-label="Toggle search"
                >
                  <Search size={20} className="text-gray-500" />
                </button>
                
                {/* Desktop search */}
                <form onSubmit={handleSearch} className="hidden md:block relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-100 py-2 pl-10 pr-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white w-32 lg:w-48 transition-all"
                  />
                </form>
                
                {/* Mobile search overlay */}
                <div className={`fixed inset-0 bg-white z-30 p-4 flex flex-col transition-transform duration-200 ${isMobileSearchOpen ? 'translate-y-0' : '-translate-y-full'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Search</h3>
                    <button
                      onClick={() => setIsMobileSearchOpen(false)}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      ×
                    </button>
                  </div>
                  <form onSubmit={handleSearch} className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search anything..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-gray-100 p-3 pl-10 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white w-full"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 text-white p-2 rounded-lg"
                    >
                      Search
                    </button>
                  </form>
                </div>
              </>
            )}
            
            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative notifications-container">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 rounded-full hover:bg-gray-100 relative"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 text-gray-500" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                <div className={`dropdown-menu w-80 ${isNotificationsOpen ? 'open' : 'closed'}`}>
                  <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                    <span className="text-xs text-primary-600 hover:text-primary-800 cursor-pointer">
                      Mark all as read
                    </span>
                  </div>
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 transition cursor-pointer ${notification.isRead ? '' : 'bg-blue-50'}`}
                        >
                          <p className="text-sm text-gray-800">{notification.content}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <div className="flex justify-center mb-3">
                          <Bell className="h-8 w-8 text-gray-300" />
                        </div>
                        <p>No notifications</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-200 text-center">
                    <button className="text-xs text-primary-600 hover:text-primary-800 font-medium">
                      View all notifications
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
              <div className="relative user-menu-container">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Open user menu"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-semibold shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left pr-1">
                    <p className="text-sm font-medium text-gray-700 line-clamp-1">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown size={16} className="hidden sm:block text-gray-500" />
                </button>
                
                <div className={`dropdown-menu w-52 ${isMenuOpen ? 'open' : 'closed'}`}>
                  <div className="border-b border-gray-200 px-4 py-3 sm:hidden">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="py-1">
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
                  </div>
                  <div className="border-t border-gray-200 py-1">
                    <button
                      onClick={logout}
                      className="dropdown-item danger"
                    >
                      <LogOut className="icon" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-primary-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700 shadow-sm flex items-center transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DynamicHeader; 