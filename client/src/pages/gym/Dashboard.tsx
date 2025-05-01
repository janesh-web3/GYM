import { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, TrendingUp, Loader, Building, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { gymService, branchService } from '../../lib/services';
import { showError, showSuccess, showLoading, updateToast } from '../../utils/toast';
import { Link, useNavigate } from 'react-router-dom';

interface GymProfile {
  _id: string;
  gymName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
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
  gymName: string;
  [key: string]: any;
}

interface Branch {
  _id: string;
  branchName: string;
  address: {
    city: string;
    state: string;
  };
  members: unknown[];
  trainers: unknown[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gym, setGym] = useState<GymProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [gymExists, setGymExists] = useState<boolean>(true);
  const [branchCount, setBranchCount] = useState<number>(0);
  const [recentBranches, setRecentBranches] = useState<Branch[]>([]);

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
      title: 'Gym Branches',
      value: branchCount.toString(),
      change: '+3%',
      icon: Building,
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
          setGymExists(true);
          
          // Fetch branches
          fetchBranches();
        } else {
          // No gym exists yet
          setGymExists(false);
        }
        
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setGymExists(false);
        showError('Failed to load gym profile');
        console.error('Error fetching gym profile:', error);
      }
    };

    if (user) {
      fetchGymProfile();
    }
  }, [user]);
  
  const fetchBranches = async () => {
    try {
      const branches = await branchService.getAllBranches() as Branch[];
      setBranchCount(branches.length);
      
      // Get most recent 3 branches
      const recent = [...branches].sort((a, b) => {
        // Sort by newest first (assuming _id contains timestamp info)
        return b._id.localeCompare(a._id);
      }).slice(0, 3);
      
      setRecentBranches(recent);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const createNewGym = async () => {
    if (!user) return;
    
    const toastId = showLoading('Creating gym profile...');
    setCreating(true);
    
    try {
      // Create a minimal gym profile with default values
      const newGymData = {
        gymName: 'My Gym',
        // The owner ID will be handled by the backend based on the authenticated user
        address: {
          street: 'Add your street address',
          city: 'Add your city',
          state: 'Add your state',
          zipCode: 'Add your ZIP code',
          country: 'Add your country'
        },
        description: 'Add a description about your gym',
        services: []
      };
      
      const response = await gymService.createGym(newGymData);
      updateToast(toastId, 'Gym profile created successfully!', 'success');
      
      // Navigate to the edit profile page
      navigate('/gym/edit-profile');
    } catch (error) {
      console.error('Error creating gym profile:', error);
      updateToast(toastId, 'Failed to create gym profile', 'error');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // If no gym exists, show a message to create one first
  if (!gymExists) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <AlertCircle size={64} className="mx-auto text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Setup Your Gym First</h2>
          <p className="text-gray-600 mb-6">
            Before adding branches, you need to create your main gym profile. This will be the parent organization for all your branches.
          </p>
          <button 
            onClick={createNewGym}
            disabled={creating}
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md text-lg font-medium"
          >
            {creating ? 'Creating Profile...' : 'Setup Gym Profile'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        {gym && (
          <div className="text-lg font-medium text-gray-700">
            {gym.gymName}
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
                    alt={gym.gymName}
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
              <h2 className="text-xl font-semibold mb-2">{gym.gymName}</h2>
              <p className="text-gray-600 mb-4">{gym.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-700">
                    {gym.address.street}, {gym.address.city}, {gym.address.state} {gym.address.zipCode}, {gym.address.country}
                  </p>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      {/* Branch Management Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Gym Centers</h2>
          <Link 
            to="/gym/branches" 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        
        {recentBranches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentBranches.map((branch) => (
              <Link 
                key={branch._id} 
                to={`/gym/branches/${branch._id}`}
                className="block border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <h3 className="font-medium text-gray-900">{branch.branchName}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {branch.address.city}, {branch.address.state}
                  </p>
                  <div className="mt-3 flex justify-between text-xs text-gray-500">
                    <span>{branch.members.length} Members</span>
                    <span>{branch.trainers.length} Trainers</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <Building size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 mb-4">No branches have been added yet</p>
            <Link 
              to="/gym/branches" 
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Add Your First Branch
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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