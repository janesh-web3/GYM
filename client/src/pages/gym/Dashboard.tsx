import { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, TrendingUp, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { gymService } from '../../lib/services';
import { showError } from '../../utils/toast';

interface GymProfile {
  _id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  description: string;
  membersCount?: number;
  trainersCount?: number;
  owner?: string;
  image?: string;
}

interface GymResponse {
  _id: string;
  name: string;
  [key: string]: any;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [gym, setGym] = useState<GymProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const stats = [
    {
      title: 'Total Members',
      value: gym?.membersCount?.toString() || '0',
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

  useEffect(() => {
    const fetchGymProfile = async () => {
      try {
        setLoading(true);
        // In a real app, we'd fetch the gym ID associated with this owner
        // For now, we'll assume the first gym returned is the owner's gym
        const gyms = await gymService.getAllGyms() as GymResponse[];
        if (gyms && gyms.length > 0) {
          const gymData = await gymService.getGymById(gyms[0]._id) as GymProfile;
          setGym(gymData);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        showError('Failed to load gym profile');
        console.error('Error fetching gym profile:', error);
      }
    };

    if (user) {
      fetchGymProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        {gym && (
          <div className="text-lg font-medium text-gray-700">
            {gym.name}
          </div>
        )}
      </div>
      
      {gym && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4">
              <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                {gym.image ? (
                  <img 
                    src={gym.image} 
                    alt={gym.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
            </div>
            <div className="md:w-3/4">
              <h2 className="text-xl font-semibold mb-2">{gym.name}</h2>
              <p className="text-gray-600 mb-4">{gym.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-700">{gym.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="text-gray-700">{gym.phone}</p>
                  <p className="text-gray-700">{gym.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
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