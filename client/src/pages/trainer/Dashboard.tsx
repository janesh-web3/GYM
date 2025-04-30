import { 
  Users, 
  Calendar, 
  MessageSquare, 
  ArrowRight,
  TrendingUp,
  Dumbbell,
  Clock
} from 'lucide-react';

interface QuickCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

interface Shortcut {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const Dashboard = () => {
  const quickCards: QuickCard[] = [
    {
      title: 'Total Assigned Members',
      value: '12',
      icon: <Users className="w-6 h-6" />,
      description: 'Active members'
    },
    {
      title: "Today's Attendance",
      value: '8/12',
      icon: <Calendar className="w-6 h-6" />,
      description: 'Members checked in'
    },
    {
      title: 'New Messages',
      value: '3',
      icon: <MessageSquare className="w-6 h-6" />,
      description: 'Unread messages'
    }
  ];

  const shortcuts: Shortcut[] = [
    {
      title: 'Member Progress',
      description: 'View member progress reports',
      icon: <TrendingUp className="w-5 h-5" />,
      link: '/trainer/members'
    },
    {
      title: 'Create Workout Plan',
      description: 'Design new workout plans',
      icon: <Dumbbell className="w-5 h-5" />,
      link: '/trainer/workout-planner'
    },
    {
      title: 'Check Attendance',
      description: 'Mark member attendance',
      icon: <Clock className="w-5 h-5" />,
      link: '/trainer/attendance'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, John!</h1>
        <p className="text-gray-500">Here's what's happening today</p>
      </div>

      {/* Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickCards.map((card) => (
          <div key={card.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.description}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg text-primary-600">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Shortcuts */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shortcuts.map((shortcut) => (
            <a
              key={shortcut.title}
              href={shortcut.link}
              className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <div className="p-2 bg-primary-100 rounded-lg text-primary-600 mr-3">
                      {shortcut.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{shortcut.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{shortcut.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg text-green-600 mr-3">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Workout Plan Updated</p>
                <p className="text-sm text-gray-500">For Sarah Johnson</p>
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
                <p className="font-medium">New Member Assigned</p>
                <p className="text-sm text-gray-500">Michael Brown</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">Yesterday</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 