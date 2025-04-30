import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Edit,
  Upload,
  Users,
  UserCog,
  Dumbbell,
  Utensils,
  Calendar,
  ClipboardCheck,
  TrendingUp,
  Menu,
  X
} from 'lucide-react';

const menuItems = [
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

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={`bg-white h-screen transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} border-r`}>
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && <h1 className="text-xl font-bold text-primary-600">GymHub</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      <nav className="mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center p-4 ${
                isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar; 