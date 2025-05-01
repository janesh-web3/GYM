import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronDown,
  Loader,
  AlertCircle
} from 'lucide-react';
import { showError, showSuccess } from '../../utils/toast';

interface Gym {
  _id: string;
  name: string;
  ownerId: {
    name: string;
    email: string;
  };
  location: string;
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  memberCount?: number;
  createdAt: string;
  phoneNumber?: string;
  facilities?: string[];
  description?: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const GymManagement = () => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusChangeReason, setStatusChangeReason] = useState('');
  const [statusAction, setStatusAction] = useState<'active' | 'suspended' | null>(null);

  useEffect(() => {
    fetchGyms();
  }, [selectedStatus, pagination.page]);

  const fetchGyms = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await fetch(`/api/admin/gyms?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch gyms');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setGyms(data.data.gyms);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.message || 'Failed to fetch gyms');
      }
    } catch (error) {
      console.error('Error fetching gyms:', error);
      showError('Failed to load gyms: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchGyms();
  };

  const handleStatusChange = async (gymId: string, newStatus: 'active' | 'pending' | 'suspended' | 'inactive', reason?: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/gyms/${gymId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          reason
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update gym status');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update the gym in the list
        setGyms(prevGyms => 
          prevGyms.map(gym => 
            gym._id === gymId ? { ...gym, status: newStatus } : gym
          )
        );
        
        showSuccess(`Gym status updated to ${newStatus} successfully`);
      } else {
        throw new Error(data.message || 'Failed to update gym status');
      }
    } catch (error) {
      console.error('Error updating gym status:', error);
      showError('Failed to update gym status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
      setShowModal(false);
      setSelectedGym(null);
      setStatusAction(null);
      setStatusChangeReason('');
    }
  };

  const openStatusModal = (gym: Gym, action: 'active' | 'suspended') => {
    setSelectedGym(gym);
    setStatusAction(action);
    setShowModal(true);
  };

  const getStatusColor = (status: Gym['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Gym['status']) => {
    switch (status) {
      case 'active':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'suspended':
        return 'Suspended';
      case 'inactive':
        return 'Inactive';
      default:
        return status;
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

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
        <form onSubmit={handleSearch} className="relative flex-1">
          <input
            type="text"
            placeholder="Search gyms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          <button type="submit" className="sr-only">Search</button>
        </form>
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Approved</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>
        <button 
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          onClick={() => fetchGyms()}
        >
          <Filter className="w-4 h-4 mr-2" />
          Apply Filters
        </button>
      </div>

      {/* Gyms Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : gyms.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-gray-500">No gyms found</p>
          </div>
        ) : (
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
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gyms.map((gym) => (
                  <tr key={gym._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{gym.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{gym.ownerId?.name}</div>
                      <div className="text-xs text-gray-500">{gym.ownerId?.email}</div>
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
                      <div className="text-sm text-gray-900">{gym.phoneNumber || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(gym.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        
                        {gym.status === 'pending' && (
                          <button 
                            className="text-green-600 hover:text-green-900"
                            title="Approve Gym"
                            onClick={() => handleStatusChange(gym._id, 'active')}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        )}
                        
                        {gym.status !== 'suspended' && gym.status !== 'inactive' && (
                          <button 
                            className="text-red-600 hover:text-red-900"
                            title="Suspend Gym"
                            onClick={() => openStatusModal(gym, 'suspended')}
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                        
                        {gym.status === 'suspended' && (
                          <button 
                            className="text-green-600 hover:text-green-900"
                            title="Reactivate Gym"
                            onClick={() => openStatusModal(gym, 'active')}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
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
        )}
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-between items-center px-6 py-3 border-t">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} gyms
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-3 py-1 rounded ${
                  pagination.page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Previous
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === pagination.pages || 
                  (page >= pagination.page - 1 && page <= pagination.page + 1)
                )
                .map((page, i, arr) => (
                  <React.Fragment key={page}>
                    {i > 0 && arr[i - 1] !== page - 1 && (
                      <span className="px-2 py-1">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded ${
                        pagination.page === page
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={`px-3 py-1 rounded ${
                  pagination.page === pagination.pages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Status Change Modal */}
      {showModal && selectedGym && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {statusAction === 'active' ? 'Reactivate Gym' : 'Suspend Gym'}
            </h2>
            <p className="text-gray-600 mb-4">
              {statusAction === 'active' 
                ? `Are you sure you want to reactivate ${selectedGym.name}?` 
                : `Are you sure you want to suspend ${selectedGym.name}?`}
            </p>
            
            {statusAction === 'suspended' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for suspension
                </label>
                <textarea
                  value={statusChangeReason}
                  onChange={(e) => setStatusChangeReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Please provide a reason for suspension"
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedGym(null);
                  setStatusAction(null);
                  setStatusChangeReason('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange(
                  selectedGym._id, 
                  statusAction!, 
                  statusAction === 'suspended' ? statusChangeReason : undefined
                )}
                className={`px-4 py-2 rounded-md ${
                  statusAction === 'active'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
                disabled={statusAction === 'suspended' && !statusChangeReason.trim()}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymManagement; 