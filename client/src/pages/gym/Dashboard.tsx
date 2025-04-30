import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';

const stats = [
  {
    title: 'Total Members',
    value: '1,234',
    change: '+12%',
    icon: Users,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Sessions Today',
    value: '89',
    change: '+5%',
    icon: Calendar,
    color: 'bg-green-100 text-green-600',
  },
  {
    title: 'Monthly Revenue',
    value: '$45,678',
    change: '+8%',
    icon: DollarSign,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    title: 'Member Retention',
    value: '92%',
    change: '+3%',
    icon: TrendingUp,
    color: 'bg-orange-100 text-orange-600',
  },
];

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New member joined</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Classes</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Yoga Class</p>
                  <p className="text-xs text-gray-500">Today, 10:00 AM</p>
                </div>
                <div className="text-sm text-gray-500">12/20 spots</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 