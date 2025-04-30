import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Dumbbell,
  Utensils,
  Calendar,
  TrendingUp,
  User,
  ShoppingCart,
  LogOut,
  Users,
  Settings,
  BarChart,
  FileText,
  Package
} from 'lucide-react';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

const memberNavItems: NavItem[] = [
  { title: 'Dashboard', path: '/member/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { title: 'Workout Plans', path: '/member/workout-plans', icon: <Dumbbell className="w-5 h-5" /> },
  { title: 'Diet Plans', path: '/member/diet-plans', icon: <Utensils className="w-5 h-5" /> },
  { title: 'Schedule', path: '/member/schedule', icon: <Calendar className="w-5 h-5" /> },
  { title: 'My Progress', path: '/member/progress', icon: <TrendingUp className="w-5 h-5" /> },
  { title: 'Profile', path: '/member/profile', icon: <User className="w-5 h-5" /> },
  { title: 'Gym Shop', path: '/member/shop', icon: <ShoppingCart className="w-5 h-5" /> },
];

const adminNavItems: NavItem[] = [
  { title: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { title: 'Members', path: '/admin/members', icon: <Users className="w-5 h-5" /> },
  { title: 'Workout Plans', path: '/admin/workout-plans', icon: <Dumbbell className="w-5 h-5" /> },
  { title: 'Diet Plans', path: '/admin/diet-plans', icon: <Utensils className="w-5 h-5" /> },
  { title: 'Schedule', path: '/admin/schedule', icon: <Calendar className="w-5 h-5" /> },
  { title: 'Reports', path: '/admin/reports', icon: <BarChart className="w-5 h-5" /> },
  { title: 'Inventory', path: '/admin/inventory', icon: <Package className="w-5 h-5" /> },
  { title: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

const MemberLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userRole] = useState<'member' | 'admin'>('member');

  const navItems = userRole === 'admin' ? adminNavItems : memberNavItems;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b">
            <h1 className={`text-xl font-bold ${!isSidebarOpen && 'hidden'}`}>
              {userRole === 'admin' ? 'Admin Panel' : 'Gym Portal'}
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-2 rounded-lg ${
                      location.pathname === item.path
                        ? 'bg-primary-100 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    {isSidebarOpen && (
                      <span className="ml-3">{item.title}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button
              className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg w-full"
              onClick={() => {
                // Handle logout
              }}
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MemberLayout; 