import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader,
  Activity,
  CreditCard,
  ShoppingBag,
  BarChart2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { showSuccess, showError } from '../../utils/toast';
import { adminService } from '../../lib/services';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  trend?: 'up' | 'down';
}

interface PendingGym {
  _id: string;
  gymName: string;
  ownerId: {
    name: string;
    email: string;
  };
  address: {
    city: string;
    state: string;
  };
  createdAt: string;
}

interface AdminStats {
  totalGyms: number;
  activeGyms: number;
  pendingGyms: number;
  bannedGyms: number;
  recentPendingGyms: PendingGym[];
  topGyms: any[];
}

interface AdminStatsResponse {
  success: boolean;
  data: AdminStats;
  message?: string;
}

interface RevenueResponse {
  success: boolean;
  data: {
    summary: {
      totalRevenue: number;
      totalOrders: number;
      avgOrderValue: number;
    };
    data: Array<{
      date: string;
      revenue: number;
      orders: number;
    }>;
  };
  message?: string;
}

interface GymPerformanceResponse {
  success: boolean;
  data: {
    gyms: Array<{
      _id: string;
      name: string;
      location?: string;
      memberCount: number;
    }>;
  };
  message?: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [topGyms, setTopGyms] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        
        // Use admin service to fetch stats
        const response = await adminService.getAdminStats() as AdminStatsResponse;
        
        if (response && response.success && response.data) {
          setStats(response.data);
        } else {
          throw new Error('Failed to fetch admin stats');
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError('Failed to load admin dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchRevenueData = async () => {
      try {
        setRevenueLoading(true);
        // Get last 30 days revenue data
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        const startDate = thirtyDaysAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];
        
        const response = await adminService.getRevenueReports(startDate, endDate, 'day') as RevenueResponse;
        
        if (response && response.success && response.data) {
          setRevenueData(response.data);
        }
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        // Don't set error state, just log to console
      } finally {
        setRevenueLoading(false);
      }
    };
    
    const fetchTopGyms = async () => {
      try {
        const response = await adminService.getGymPerformanceReports() as GymPerformanceResponse;
        
        if (response && response.success && response.data && response.data.gyms) {
          // Sort by member count and get top 5
          const sorted = [...response.data.gyms].sort((a, b) => b.memberCount - a.memberCount).slice(0, 5);
          setTopGyms(sorted);
        }
      } catch (err) {
        console.error('Error fetching top gyms:', err);
      }
    };
    
    fetchAdminStats();
    fetchRevenueData();
    fetchTopGyms();
  }, []);

  const handleApproveGym = async (gymId: string) => {
    try {
      // Use admin service to update gym status
      await adminService.updateGymStatus(gymId, 'active');
      
      showSuccess('Gym approved successfully');
      
      // Refresh stats after approving
      setStats(prev => {
        if (!prev) return null;
        
        const updatedPendingGyms = prev.recentPendingGyms.filter(gym => gym._id !== gymId);
        
        return {
          ...prev,
          activeGyms: prev.activeGyms + 1,
          pendingGyms: prev.pendingGyms - 1,
          recentPendingGyms: updatedPendingGyms,
        };
      });
    } catch (error) {
      showError('Error approving gym: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleRejectGym = async (gymId: string) => {
    try {
      // Use admin service to update gym status
      await adminService.updateGymStatus(gymId, 'banned');
      
      showSuccess('Gym rejected successfully');
      
      // Refresh stats after rejecting
      setStats(prev => {
        if (!prev) return null;
        
        const updatedPendingGyms = prev.recentPendingGyms.filter(gym => gym._id !== gymId);
        
        return {
          ...prev,
          bannedGyms: prev.bannedGyms + 1,
          pendingGyms: prev.pendingGyms - 1,
          recentPendingGyms: updatedPendingGyms,
        };
      });
    } catch (error) {
      showError('Error rejecting gym: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Generate stat cards based on fetched data
  const getStatCards = (): StatCard[] => {
    if (!stats) {
      return [];
    }
    
    return [
      {
        title: 'Total Gyms',
        value: stats.totalGyms,
        icon: <Building2 className="w-6 h-6" />,
      },
      {
        title: 'Active Gyms',
        value: stats.activeGyms,
        icon: <CheckCircle2 className="w-6 h-6" />,
      },
      {
        title: 'Pending Approvals',
        value: stats.pendingGyms,
        icon: <Clock className="w-6 h-6" />,
      },
      {
        title: 'Banned Gyms',
        value: stats.bannedGyms,
        icon: <XCircle className="w-6 h-6" />,
      }
    ];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Error Loading Dashboard</h2>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatCards().map((card) => (
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
            {card.change && (
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
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Overview Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
              <p className="text-sm text-gray-500">Monthly revenue from platform</p>
            </div>
            <Link 
              to="/admin/reports/revenue"
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              View Details
            </Link>
          </div>
          
          {revenueLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          ) : revenueData ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${revenueData.summary?.totalRevenue?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {revenueData.summary?.totalOrders || "0"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg. Order</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${revenueData.summary?.avgOrderValue?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
              
              <div className="h-40 mt-4 border-t pt-4">
                <div className="text-center text-sm text-gray-500">
                  Revenue chart visualization goes here
                </div>
                <div className="flex items-center justify-center h-full">
                  <BarChart2 className="w-16 h-16 text-gray-300" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <Activity className="w-12 h-12 text-gray-300 mb-2" />
              <p>No revenue data available</p>
            </div>
          )}
        </div>

        {/* Top Performing Gyms */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Top Performing Gyms</h2>
              <p className="text-sm text-gray-500">By member count</p>
            </div>
            <Link 
              to="/admin/reports/gyms"
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          {topGyms.length > 0 ? (
            <div className="space-y-4">
              {topGyms.map((gym, index) => (
                <div key={gym._id} className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <span className="text-primary-700 text-sm font-medium">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{gym.name}</p>
                    <p className="text-xs text-gray-500">{gym.location || 'No location data'}</p>
                  </div>
                  <div className="inline-flex items-center text-sm text-gray-900">
                    <Users className="w-4 h-4 mr-1 text-gray-400" />
                    {gym.memberCount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <Building2 className="w-12 h-12 text-gray-300 mb-2" />
              <p>No gym performance data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Pending Gyms */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Pending Gym Approvals</h2>
            <p className="mt-1 text-sm text-gray-500">
              Review and approve new gym registrations
            </p>
          </div>
          <Link 
            to="/admin/gyms"
            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          {stats && stats.recentPendingGyms.length > 0 ? (
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
                {stats.recentPendingGyms.map((gym) => (
                  <tr key={gym._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{gym.gymName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{gym.ownerId.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {gym.address.city}, {gym.address.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(gym.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          className="text-green-600 hover:text-green-900"
                          onClick={() => handleApproveGym(gym._id)}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleRejectGym(gym._id)}
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-green-100 p-3 text-green-600 mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
              <p className="text-gray-500 mt-1">There are no pending gym approvals at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">User Management</h3>
              <p className="text-sm text-gray-500">Manage platform users</p>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/users"
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              View Users →
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Products</h3>
              <p className="text-sm text-gray-500">Manage store products</p>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/products"
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              View Products →
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Orders</h3>
              <p className="text-sm text-gray-500">View and manage orders</p>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/orders"
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              View Orders →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 