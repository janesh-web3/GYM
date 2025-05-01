import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/Role';
import {
  // Common icons
  LayoutDashboard,
  UserCircle,
  LogOut,
  Menu,
  X,
  
  // Admin/SuperAdmin icons
  Building2,
  DollarSign,
  Package,
  Settings,
  
  // Gym Owner icons
  Edit,
  Upload,
  Users,
  UserCog,
  Dumbbell,
  Utensils,
  Calendar,
  ClipboardCheck,
  TrendingUp,
  
  // Member icons
  Activity,
  Heart,
  ShoppingBag,
  Clock,
  
  // Trainer icons
  Clipboard,
  BarChart,
  MessageCircle
} from 'lucide-react';

// Create Sidebar Context
interface SidebarContextProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider = ({ children }: SidebarProviderProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Define types for navigation items
interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

// Generate menu items based on user role
const getMenuItems = (role: Role): NavItem[] => {
  switch (role) {
    case 'superadmin':
    case 'admin':
      const basePath = role === 'superadmin' ? '/superadmin' : '/admin';
      return [
        { path: `${basePath}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
        { path: `${basePath}/gym-management`, label: 'Gym Management', icon: Building2 },
        { path: `${basePath}/sales`, label: 'Sales & Revenue', icon: DollarSign },
        { path: `${basePath}/products`, label: 'Products', icon: Package },
        { path: `${basePath}/settings`, label: 'Settings', icon: Settings },
      ];
    
    case 'gymOwner':
      return [
        { path: '/gym/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/gym/edit-profile', label: 'Edit Profile', icon: Edit },
        { path: '/gym/upload-media', label: 'Upload Media', icon: Upload },
        { path: '/gym/trainers', label: 'Trainers', icon: UserCog },
        { path: '/gym/members', label: 'Members', icon: Users },
        { path: '/gym/workout-plans', label: 'Workout Plans', icon: Dumbbell },
        { path: '/gym/diet-plans', label: 'Diet Plans', icon: Utensils },
        { path: '/gym/scheduling', label: 'Classes & Scheduling', icon: Calendar },
        { path: '/gym/attendance', label: 'Attendance', icon: ClipboardCheck },
        { path: '/gym/member-progress', label: 'Member Progress', icon: TrendingUp },
      ];
    
    case 'trainer':
      return [
        { path: '/trainer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/trainer/members', label: 'My Members', icon: Users },
        { path: '/trainer/workout-planner', label: 'Workout Planner', icon: Clipboard },
        { path: '/trainer/attendance', label: 'Attendance', icon: ClipboardCheck },
        { path: '/trainer/chat', label: 'Messages', icon: MessageCircle },
      ];
    
    case 'member':
      return [
        { path: '/member/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/member/workout-plans', label: 'My Workouts', icon: Dumbbell },
        { path: '/member/diet-plans', label: 'Diet Plans', icon: Utensils },
        { path: '/member/schedule', label: 'Class Schedule', icon: Calendar },
        { path: '/member/progress', label: 'Progress Tracking', icon: BarChart },
        { path: '/member/shop', label: 'Shop', icon: ShoppingBag },
      ];
    
    default:
      return [];
  }
};

const DynamicSidebar = () => {
  const { user, logout } = useAuth();
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const location = useLocation();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // If no user, don't render the sidebar
  if (!user) return null;

  const menuItems = getMenuItems(user.role);
  
  // Handle mobile toggle
  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Base sidebar content
  const sidebarContent = (
    <>
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold text-primary-600">GymHub</h1>
            <p className="text-xs text-gray-500 capitalize">{user.role} Portal</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 lg:block hidden"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
        <button
          onClick={toggleMobile}
          className="p-2 rounded-lg hover:bg-gray-100 lg:hidden block"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        <nav className="mt-4 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 my-1 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-4 mt-auto">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div>
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          )}
          <button
            onClick={logout}
            className={`text-gray-500 hover:text-red-500 p-2 rounded-lg ${isCollapsed ? '' : 'ml-2'}`}
            aria-label="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </>
  );

  // Mobile sidebar trigger button (shown when sidebar is closed)
  const mobileMenuTrigger = (
    <button
      onClick={toggleMobile}
      className="fixed bottom-4 right-4 lg:hidden z-20 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700"
      aria-label="Open menu"
    >
      <Menu size={24} />
    </button>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`bg-white h-screen transition-all duration-300 border-r fixed top-0 left-0 z-30 hidden lg:flex flex-col ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
      
      {/* Mobile Sidebar - Slide in from left */}
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileOpen(false)}
      ></div>
      
      <aside
        className={`bg-white h-screen w-64 fixed top-0 left-0 z-50 transform transition-transform duration-300 lg:hidden flex flex-col ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
      
      {/* Mobile menu trigger */}
      {!isMobileOpen && mobileMenuTrigger}
    </>
  );
};

export default DynamicSidebar;