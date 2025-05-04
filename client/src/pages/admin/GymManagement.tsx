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
  AlertCircle,
  Ban,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { showError, showSuccess } from '../../utils/toast';
import { adminService } from '../../services';

interface Gym {
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
  status: 'active' | 'pending' | 'banned';
  isFeatured: boolean;
  createdAt: string;
  photos?: Array<{url: string}>;
  description?: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface GymResponseData {
  gyms?: Gym[];
  pagination?: PaginationData;
}

interface AdminResponse {
  success: boolean;
  data: GymResponseData | Gym[] | Gym | null;
  message?: string;
}

const GymManagement = () => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusChangeReason, setStatusChangeReason] = useState('');
  const [statusAction, setStatusAction] = useState<'active' | 'banned' | 'pending' | null>(null);
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [featureAction, setFeatureAction] = useState<boolean | null>(null);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    fetchGyms();
  }, [selectedStatus, pagination.page, selectedCity]);

  const fetchGyms = async () => {
    try {
      setLoading(true);
      
      // Use admin service with options
      const options = {
        status: selectedStatus !== 'all' ? selectedStatus : '',
        city: selectedCity,
        search: searchTerm,
        page: pagination.page,
        limit: pagination.limit
      };
      
      const response = await adminService.getAllGyms(options) as AdminResponse;
      
      if (response && response.success && response.data) {
        // Handle different possible response structures
        let gymsData: Gym[] = [];
        let paginationData: PaginationData | undefined;
        
        if (Array.isArray(response.data)) {
          // If data is directly an array of gyms
          gymsData = response.data;
        } else if ('gyms' in response.data && response.data.gyms) {
          // If data has gyms and pagination properties
          gymsData = response.data.gyms;
          paginationData = response.data.pagination;
        } else if ('_id' in response.data) {
          // If data is a single gym object
          gymsData = [response.data];
        }
        
        setGyms(gymsData);
        
        // Update pagination if available
        if (paginationData) {
          setPagination(paginationData);
        }
        
        // Extract unique cities only if we have gyms data
        if (gymsData.length > 0 && cities.length === 0) {
          const uniqueCities = [...new Set(gymsData
            .map(gym => gym.address?.city)
            .filter(city => city !== undefined && city !== null)
          )] as string[];
          
          setCities(uniqueCities);
        }
      } else {
        // Just log the error but don't throw to prevent component from crashing
        console.error('Failed to fetch gyms:', response?.message || 'Unknown error');
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

  const handleStatusChange = async (gymId: string, newStatus: 'active' | 'pending' | 'banned', reason?: string) => {
    try {
      setLoading(true);
      
      // Use admin service to update gym status
      const response = await adminService.updateGymStatus(gymId, newStatus, reason);
      
      if (response && response.success) {
        // Update the gym in the list
        setGyms(prevGyms => 
          prevGyms.map(gym => 
            gym._id === gymId ? { ...gym, status: newStatus } : gym
          )
        );
        
        showSuccess(`Gym status updated to ${newStatus} successfully`);
      } else {
        throw new Error(response?.message || 'Failed to update gym status');
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

  const handleToggleFeatured = async (gymId: string, isFeatured: boolean) => {
    try {
      setLoading(true);
      
      // Use admin service to toggle featured status
      const response = await adminService.toggleFeaturedStatus(gymId, isFeatured);
      
      if (response && response.success) {
        // Update the gym in the list
        setGyms(prevGyms => 
          prevGyms.map(gym => 
            gym._id === gymId ? { ...gym, isFeatured } : gym
          )
        );
        
        showSuccess(`Gym ${isFeatured ? 'marked as featured' : 'removed from featured'} successfully`);
      } else {
        // Show error message from response or default message
        const errorMessage = response?.message || 'Failed to update featured status';
        showError(errorMessage);
        console.error('Error response:', response);
        
        // If unauthorized message, you might want to redirect to login
        if (errorMessage.includes('session has expired') || 
            errorMessage.includes('not authorized') ||
            errorMessage.includes('Authentication token is missing')) {
          // Optionally navigate to login page after a delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error updating featured status:', error);
      showError('Failed to update featured status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
      setShowFeaturedModal(false);
      setSelectedGym(null);
      setFeatureAction(null);
    }
  };

  const openStatusModal = (gym: Gym, action: 'active' | 'banned' | 'pending') => {
    setSelectedGym(gym);
    setStatusAction(action);
    setShowModal(true);
  };

  const openFeaturedModal = (gym: Gym, featured: boolean) => {
    setSelectedGym(gym);
    setFeatureAction(featured);
    setShowFeaturedModal(true);
  };

  const getStatusColor = (status: Gym['status']) => {
    switch (status) {
      case 'active':
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
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending';
      case 'banned':
        return 'Banned';
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
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="banned">Banned</option>
          </select>
          <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gym
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gyms.map((gym) => (
                  <tr key={gym._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {gym.photos && gym.photos.length > 0 ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={gym.photos[0].url}
                              alt={gym.gymName}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-600 font-medium text-sm">
                                {gym.gymName.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{gym.gymName}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{gym.description || 'No description available'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{gym.ownerId.name}</div>
                      <div className="text-sm text-gray-500">{gym.ownerId.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{gym.address.city}, {gym.address.state}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(gym.status)}`}>
                        {getStatusText(gym.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {gym.isFeatured ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Not featured</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(gym.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link to={`/explore/${gym._id}`} className="text-primary-600 hover:text-primary-900">
                          <Eye className="w-5 h-5" />
                        </Link>
                        <div className="relative group">
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          <div className="absolute right-0 z-40 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
                            {/* Status change options */}
                            {gym.status !== 'active' && (
                              <button
                                onClick={() => openStatusModal(gym, 'active')}
                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <CheckCircle2 className="mr-3 h-4 w-4 text-green-500" />
                                Activate
                              </button>
                            )}
                            {gym.status !== 'pending' && (
                              <button
                                onClick={() => openStatusModal(gym, 'pending')}
                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <AlertCircle className="mr-3 h-4 w-4 text-yellow-500" />
                                Set as Pending
                              </button>
                            )}
                            {gym.status !== 'banned' && (
                              <button
                                onClick={() => openStatusModal(gym, 'banned')}
                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Ban className="mr-3 h-4 w-4 text-red-500" />
                                Ban Gym
                              </button>
                            )}
                            
                            {/* Featured gym toggle options */}
                            <div className="border-t border-gray-100 my-1"></div>
                            {!gym.isFeatured && gym.status === 'active' && (
                              <button
                                onClick={() => openFeaturedModal(gym, true)}
                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Star className="mr-3 h-4 w-4 text-amber-500" />
                                Mark as Featured
                              </button>
                            )}
                            {gym.isFeatured && (
                              <button
                                onClick={() => openFeaturedModal(gym, false)}
                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <XCircle className="mr-3 h-4 w-4 text-gray-500" />
                                Remove from Featured
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {gyms.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                      pagination.page === 1
                        ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const pageNum = pagination.page <= 3
                      ? i + 1
                      : pagination.page + i - 2;
                    
                    if (pageNum <= 0 || pageNum > pagination.pages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          pageNum === pagination.page
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                      pagination.page === pagination.pages
                        ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Change Modal */}
      {showModal && selectedGym && statusAction && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
                    statusAction === 'active' ? 'bg-green-100' : 
                    statusAction === 'banned' ? 'bg-red-100' : 'bg-yellow-100'
                  } sm:mx-0 sm:h-10 sm:w-10`}>
                    {statusAction === 'active' ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : statusAction === 'banned' ? (
                      <Ban className="h-6 w-6 text-red-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-yellow-600" />
                    )}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      {statusAction === 'active' 
                        ? 'Activate Gym' 
                        : statusAction === 'banned'
                        ? 'Ban Gym'
                        : 'Set as Pending'}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {statusAction === 'active' 
                          ? `Are you sure you want to activate "${selectedGym.gymName}"? This will make the gym visible to all users.` 
                          : statusAction === 'banned'
                          ? `Are you sure you want to ban "${selectedGym.gymName}"? This will remove the gym from public view.`
                          : `Are you sure you want to set "${selectedGym.gymName}" as pending? This will remove the gym from public view until reviewed again.`}
                      </p>
                      
                      {(statusAction === 'banned' || statusAction === 'pending') && (
                        <div className="mt-3">
                          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason (optional)</label>
                          <textarea
                            id="reason"
                            name="reason"
                            rows={3}
                            className="mt-1 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border border-gray-300 rounded-md"
                            placeholder="Explain why you're changing the status..."
                            value={statusChangeReason}
                            onChange={(e) => setStatusChangeReason(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                    statusAction === 'active' 
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                      : statusAction === 'banned'
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                  }`}
                  onClick={() => handleStatusChange(selectedGym._id, statusAction, statusChangeReason)}
                >
                  Confirm
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedGym(null);
                    setStatusAction(null);
                    setStatusChangeReason('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Status Modal */}
      {showFeaturedModal && selectedGym && featureAction !== null && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
                    featureAction ? 'bg-amber-100' : 'bg-gray-100'
                  } sm:mx-0 sm:h-10 sm:w-10`}>
                    {featureAction ? (
                      <Star className="h-6 w-6 text-amber-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-gray-600" />
                    )}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      {featureAction ? 'Feature Gym' : 'Remove from Featured'}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {featureAction
                          ? `Are you sure you want to feature "${selectedGym.gymName}"? Featured gyms will be displayed prominently on the landing page.`
                          : `Are you sure you want to remove "${selectedGym.gymName}" from featured? It will no longer appear in the featured section.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                    featureAction
                      ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
                      : 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
                  }`}
                  onClick={() => handleToggleFeatured(selectedGym._id, featureAction)}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowFeaturedModal(false);
                    setSelectedGym(null);
                    setFeatureAction(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymManagement; 