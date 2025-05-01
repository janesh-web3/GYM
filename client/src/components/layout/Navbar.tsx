import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../DynamicSidebar';
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { 
    toggleMobile, 
    isProfileOpen, 
    setIsProfileOpen, 
    isNotificationsOpen, 
    setIsNotificationsOpen
  } = useSidebar();
  
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsProfileOpen, setIsNotificationsOpen]);

  // Toggle profile dropdown
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    if (isNotificationsOpen) {
      setIsNotificationsOpen(false);
    }
  };

  // Toggle notifications dropdown
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isProfileOpen) {
      setIsProfileOpen(false);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Implement search logic here
  };

  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-20">
      <div className="max-w-full px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Mobile menu button and logo */}
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={toggleMobile}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Logo and title for larger screens */}
            <div className="hidden lg:flex lg:items-center">
              <div className="flex items-center flex-shrink-0 text-indigo-600">
                <span className="ml-2 text-xl font-bold">GymHub</span>
              </div>
            </div>
          </div>

          {/* Middle - Search bar */}
          <div className="flex-1 max-w-2xl mx-auto px-4">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-zinc-300 rounded-lg bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>

          {/* Right side - Notifications and profile */}
          <div className="flex items-center">
            {/* Notifications */}
            <div className="relative ml-3" ref={notificationsRef}>
              <button
                className="p-1 rounded-full text-slate-500 hover:text-slate-600 hover:bg-slate-100 relative focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onClick={toggleNotifications}
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </button>
              
              {/* Notifications dropdown */}
              {isNotificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-zinc-100">
                  <div className="px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">Notifications</p>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-slate-50 transition duration-150 ease-in-out">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                            <User className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="ml-3 w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900">New member joined</p>
                          <p className="text-xs text-slate-500 mt-1">John Doe joined as a member</p>
                          <p className="text-xs text-slate-400 mt-1">5 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 hover:bg-slate-50 transition duration-150 ease-in-out">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">
                            <Bell className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="ml-3 w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900">Payment received</p>
                          <p className="text-xs text-slate-500 mt-1">$199.00 payment was successful</p>
                          <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-2">
                    <Link to="/notifications" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative ml-3" ref={profileRef}>
              <div>
                <button
                  type="button"
                  className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={toggleProfile}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-2 mr-1 hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium text-slate-800 truncate max-w-[100px]">
                        {user?.name || 'User'}
                      </span>
                      <span className="text-xs text-slate-500 truncate max-w-[100px]">
                        {user?.role}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-500 hidden md:block" />
                  </div>
                </button>
              </div>
              
              {/* Profile dropdown menu */}
              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                    <User className="mr-3 h-4 w-4 text-slate-500" />
                    Your Profile
                  </Link>
                  <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                    <Settings className="mr-3 h-4 w-4 text-slate-500" />
                    Settings
                  </Link>
                  <Link to="/help" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                    <HelpCircle className="mr-3 h-4 w-4 text-slate-500" />
                    Help
                  </Link>
                  <button
                    onClick={logout}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="mr-3 h-4 w-4 text-red-500" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 