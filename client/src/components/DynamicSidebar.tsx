import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
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

// Define types for navigation items
interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

// Define sidebar context type
interface SidebarContextType {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  isSearchOpen: boolean;
  isNotificationsOpen: boolean;
  isProfileOpen: boolean;
  toggleCollapse: () => void;
  toggleMobile: () => void;
  setIsSearchOpen: (isOpen: boolean) => void;
  setIsNotificationsOpen: (isOpen: boolean) => void;
  setIsProfileOpen: (isOpen: boolean) => void;
}

// Create sidebar context
const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  isMobileOpen: false,
  isSearchOpen: false,
  isNotificationsOpen: false,
  isProfileOpen: false,
  toggleCollapse: () => {},
  toggleMobile: () => {},
  setIsSearchOpen: () => {},
  setIsNotificationsOpen: () => {},
  setIsProfileOpen: () => {}
});

// Custom hook to use sidebar context
export const useSidebar = () => useContext(SidebarContext);

// Props for SidebarProvider
interface SidebarProviderProps {
  children: ReactNode;
}

// Sidebar Provider component
export const SidebarProvider = ({ children }: SidebarProviderProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Set initial collapse state based on screen size
  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 1024);
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle functions
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  return (
    <SidebarContext.Provider 
      value={{ 
        isCollapsed, 
        isMobileOpen, 
        isSearchOpen,
        isNotificationsOpen,
        isProfileOpen,
        toggleCollapse, 
        toggleMobile,
        setIsSearchOpen,
        setIsNotificationsOpen,
        setIsProfileOpen
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

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

// Sidebar component (without layout control)
export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isCollapsed, isMobileOpen, toggleCollapse, toggleMobile } = useSidebar();
  const location = useLocation();

  // If no user, don't render the sidebar
  if (!user) return null;

  const menuItems = getMenuItems(user.role);
  
  // Base sidebar content
  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-zinc-700/20">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">G</div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-slate-800">GymHub</h1>
              <p className="text-xs text-slate-500 capitalize">{user.role} Portal</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold mx-auto">
            G
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-150 lg:block hidden"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
        <button
          onClick={toggleMobile}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-150 lg:hidden block"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pt-2 pb-4">
        <nav className="px-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                {!isCollapsed && <span className="ml-3 truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-zinc-200 p-4">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="flex items-center min-w-0">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold flex-shrink-0">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="ml-3 truncate">
                <p className="font-medium text-sm text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={`p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors duration-150 ${isCollapsed ? '' : 'ml-2 flex-shrink-0'}`}
            aria-label="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`bg-white h-screen border-r border-zinc-200 shadow-sm fixed top-0 left-0 z-30 hidden lg:block transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
      
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ease-in-out"
          onClick={toggleMobile}
        />
      )}
      
      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

// Main layout component that handles content area
const DynamicSidebar = ({ children }: { children?: ReactNode }) => {
  const { isCollapsed, isMobileOpen, toggleMobile } = useSidebar();
  
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      
      {/* Main Content Area - adjusts based on sidebar state */}
      <div 
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        {children}
      </div>
      
      {/* Mobile Menu Trigger Button */}
      <button
        onClick={toggleMobile}
        className="fixed bottom-6 right-6 z-20 lg:hidden bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>
    </div>
  );
};

// Default export with context provider
const ResponsiveSidebarLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider>
      <DynamicSidebar>
        {children}
      </DynamicSidebar>
    </SidebarProvider>
  );
};

export default ResponsiveSidebarLayout;