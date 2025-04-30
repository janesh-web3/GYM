import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface StatCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: string;
  trend: 'up' | 'down';
}

interface PendingGym {
  id: string;
  name: string;
  owner: string;
  location: string;
  submittedDate: string;
}

const statCards: StatCard[] = [
  {
    title: 'Total Gyms',
    value: '1,234',
    icon: <Building2 className="w-6 h-6" />,
    change: '+12%',
    trend: 'up'
  },
  {
    title: 'Active Members',
    value: '45,678',
    icon: <Users className="w-6 h-6" />,
    change: '+8%',
    trend: 'up'
  },
  {
    title: 'Total Revenue',
    value: '$1.2M',
    icon: <DollarSign className="w-6 h-6" />,
    change: '+15%',
    trend: 'up'
  }
];

const pendingGyms: PendingGym[] = [
  {
    id: '1',
    name: 'FitLife Gym',
    owner: 'John Smith',
    location: 'New York, NY',
    submittedDate: '2024-04-30'
  },
  {
    id: '2',
    name: 'Power Fitness',
    owner: 'Sarah Johnson',
    location: 'Los Angeles, CA',
    submittedDate: '2024-04-29'
  },
  {
    id: '3',
    name: 'Elite Training',
    owner: 'Michael Brown',
    location: 'Chicago, IL',
    submittedDate: '2024-04-28'
  }
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to your admin dashboard. Here's an overview of your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{card.value}</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">{card.icon}</div>
            </div>
            <div className="mt-4 flex items-center">
              <span
                className={`flex items-center text-sm font-medium ${
                  card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                {card.change}
              </span>
              <span className="ml-2 text-sm text-gray-500">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Gyms */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pending Gym Approvals</h2>
          <p className="mt-1 text-sm text-gray-500">
            Review and approve new gym registrations
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gym Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingGyms.map((gym) => (
                <tr key={gym.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{gym.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{gym.owner}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{gym.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(gym.submittedDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-green-600 hover:text-green-900">
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 