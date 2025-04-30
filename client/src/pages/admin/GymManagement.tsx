import { useState } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronDown
} from 'lucide-react';

interface Gym {
  id: string;
  name: string;
  owner: string;
  location: string;
  status: 'approved' | 'pending' | 'banned';
  members: number;
  joinDate: string;
}

const gyms: Gym[] = [
  {
    id: '1',
    name: 'FitLife Gym',
    owner: 'John Smith',
    location: 'New York, NY',
    status: 'approved',
    members: 1200,
    joinDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Power Fitness',
    owner: 'Sarah Johnson',
    location: 'Los Angeles, CA',
    status: 'pending',
    members: 0,
    joinDate: '2024-04-29'
  },
  {
    id: '3',
    name: 'Elite Training',
    owner: 'Michael Brown',
    location: 'Chicago, IL',
    status: 'banned',
    members: 0,
    joinDate: '2024-03-10'
  },
  {
    id: '4',
    name: 'Iron Temple',
    owner: 'David Wilson',
    location: 'Miami, FL',
    status: 'approved',
    members: 850,
    joinDate: '2024-02-20'
  }
];

const GymManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const getStatusColor = (status: Gym['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'banned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Gym['status']) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'banned':
        return 'Banned';
      default:
        return status;
    }
  };

  const filteredGyms = gyms.filter((gym) => {
    const matchesSearch = gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gym.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gym.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || gym.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Gym Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and monitor all registered gyms on the platform
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search gyms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="banned">Banned</option>
          </select>
          <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>
        <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </button>
      </div>

      {/* Gyms Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGyms.map((gym) => (
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
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        gym.status
                      )}`}
                    >
                      {getStatusText(gym.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{gym.members}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(gym.joinDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-gray-500 hover:text-gray-700">
                        <Eye className="w-5 h-5" />
                      </button>
                      {gym.status === 'pending' && (
                        <>
                          <button className="text-green-600 hover:text-green-900">
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button className="text-gray-500 hover:text-gray-700">
                        <MoreVertical className="w-5 h-5" />
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

export default GymManagement; 