import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ResponsiveSidebarLayout, { useSidebar } from '../components/DynamicSidebar';
import {
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';

const AdminHeader = () => {
  const { user } = useAuth();
  const { toggleMobile, isSearchOpen, setIsSearchOpen, isNotificationsOpen, setIsNotificationsOpen } = useSidebar();

  // Toggle notifications dropdown
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isSearchOpen) setIsSearchOpen(false);
  };

  // Toggle search bar
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            className="lg:hidden p-2 mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150"
            onClick={toggleMobile}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Search Bar - Shows on larger screens or when toggled on mobile */}
          <div className={`${isSearchOpen ? 'flex' : 'hidden md:flex'} items-center w-full md:w-64 lg:w-96 relative`}>
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Mobile search toggle */}
          <button 
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150"
            onClick={toggleSearch}
          >
            <Search className="w-5 h-5" />
          </button>
          
          {/* Notifications */}
          <div className="relative">
            <button 
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150"
              onClick={toggleNotifications}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-10 transition transform origin-top-right">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-gray-50 transition-colors duration-150">
                    <p className="text-sm font-medium text-gray-900">New gym registration</p>
                    <p className="text-xs text-gray-500 mt-1">A new gym has requested approval</p>
                    <p className="text-xs text-gray-400 mt-2">5 minutes ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 transition-colors duration-150">
                    <p className="text-sm font-medium text-gray-900">Payment received</p>
                    <p className="text-xs text-gray-500 mt-1">Monthly subscription payment processed</p>
                    <p className="text-xs text-gray-400 mt-2">2 hours ago</p>
                  </div>
                </div>
                <div className="px-4 py-2 border-t border-gray-200">
                  <a href="#" className="text-xs font-medium text-primary-600 hover:text-primary-500">View all notifications</a>
                </div>
              </div>
            )}
          </div>
          
          {/* User Profile */}
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-semibold">
                {user?.name?.charAt(0) || (user?.role === 'superadmin' ? 'S' : 'A')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const AdminLayout = () => {
  return (
    <ResponsiveSidebarLayout>
      <div className="flex flex-col min-h-screen w-full">
        <AdminHeader />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </ResponsiveSidebarLayout>
  );
};

export default AdminLayout;