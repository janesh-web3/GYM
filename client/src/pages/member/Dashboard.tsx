import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Dumbbell, 
  Utensils, 
  Calendar, 
  User, 
  TrendingUp, 
  ShoppingCart,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface QuickCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  stats?: string;
}

const Dashboard = () => {
  const [quickCards] = useState<QuickCard[]>([
    {
      id: '1',
      title: "Today's Workout",
      description: "Push Day - Chest & Triceps",
      icon: <Dumbbell className="w-6 h-6" />,
      link: "/member/workout-plan",
      stats: "6 exercises • 45 mins"
    },
    {
      id: '2',
      title: "Today's Meals",
      description: "High Protein Diet Plan",
      icon: <Utensils className="w-6 h-6" />,
      link: "/member/diet-plan",
      stats: "2,200 calories"
    },
    {
      id: '3',
      title: "Last Attendance",
      description: "Checked in yesterday",
      icon: <Calendar className="w-6 h-6" />,
      link: "/member/attendance",
      stats: "2 hours • 4:30 PM"
    }
  ]);

  const [shortcuts] = useState<QuickCard[]>([
    {
      id: '1',
      title: "My Progress",
      description: "Track your fitness journey",
      icon: <TrendingUp className="w-6 h-6" />,
      link: "/member/progress"
    },
    {
      id: '2',
      title: "Gym Shop",
      description: "Browse fitness products",
      icon: <ShoppingCart className="w-6 h-6" />,
      link: "/member/shop"
    },
    {
      id: '3',
      title: "My Profile",
      description: "View and edit your profile",
      icon: <User className="w-6 h-6" />,
      link: "/member/profile"
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back! Here's your overview for today.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickCards.map((card) => (
          <Link
            key={card.id}
            to={card.link}
            className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="p-2 bg-primary-100 rounded-lg text-primary-600 mr-3">
                    {card.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{card.title}</h2>
                </div>
                <p className="text-gray-600 mb-1">{card.description}</p>
                {card.stats && (
                  <p className="text-sm text-gray-500">{card.stats}</p>
                )}
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shortcuts.map((shortcut) => (
            <Link
              key={shortcut.id}
              to={shortcut.link}
              className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg text-primary-600 mr-3">
                  {shortcut.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{shortcut.title}</h3>
                  <p className="text-sm text-gray-500">{shortcut.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg text-green-600 mr-3">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Completed Workout</p>
                <p className="text-sm text-gray-500">Push Day - Chest & Triceps</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mr-3">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Checked In</p>
                <p className="text-sm text-gray-500">Gym Session</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">Yesterday</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600 mr-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Progress Update</p>
                <p className="text-sm text-gray-500">Weight: -2kg this month</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">3 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 