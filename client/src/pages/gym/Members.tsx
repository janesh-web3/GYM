import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, Mail, Phone, Calendar, CreditCard, Loader, Check, XCircle, AlertCircle, Building2, MapPin, Filter, ChevronLeft, ChevronRight, Search, RefreshCw } from 'lucide-react';
import { gymService } from '../../lib/services';
import { branchService } from '../../lib/services';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError, showLoading, updateToast } from '../../utils/toast';

interface Member {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  joinDate: string;
  type: 'gym' | 'branch';
  branch?: {
    _id: string;
    branchName: string;
    address: {
      city: string;
      state: string;
    };
  } | null;
  subscriptionId?: {
    _id: string;
    planId: {
      name: string;
      price: number;
    }
  }
}

interface Branch {
  _id: string;
  branchName: string;
  address: {
    city: string;
    state: string;
  };
  memberCount: number;
}

interface Gym {
  _id: string;
  gymName: string;
  branches?: Branch[];
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const Members = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'gym' | 'branch'>('gym');
  
  const [gym, setGym] = useState<Gym | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  
  const [members, setMembers] = useState<Member[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });

  useEffect(() => {
    const fetchGymAndBranches = async () => {
      try {
        setLoading(true);
        
        // Get the owner's gym
        const gyms = await gymService.getAllGyms();
        
        if (gyms.length > 0) {
          const gymData = gyms[0];
          setGym(gymData);
          
          // Get branches for this gym
          const branchesData = await gymService.getGymBranches(gymData._id);
          setBranches(branchesData);
          
          // Get gym members
          await fetchMembers(gymData._id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching gym data:", error);
        setLoading(false);
        showError("Failed to load gym data. Please try again.");
      }
    };
    
    if (user && user.role === 'gymOwner') {
      fetchGymAndBranches();
    }
  }, [user]);

  const fetchMembers = async (gymId: string) => {
    try {
      setRefreshing(true);
      
      // Build filter options
      const options: any = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (activeFilter !== 'all') {
        options.status = activeFilter;
      }
      
      if (selectedBranch && activeTab === 'branch') {
        options.branchId = selectedBranch;
      }
      
      if (searchQuery) {
        options.search = searchQuery;
      }
      
      // Fetch members with filters
      const response = await gymService.getGymMembers(gymId, options);
      
      setMembers(response.memberships || []);
      setPagination(response.pagination || {
        total: response.memberships?.length || 0,
        page: 1,
        limit: 10,
        pages: 1
      });
      
      // If we received branches from the API, update our state
      if (response.branches) {
        setBranches(response.branches);
      }
      
      setRefreshing(false);
    } catch (error) {
      console.error("Error fetching members:", error);
      setRefreshing(false);
      showError("Failed to load members");
    }
  };

  const handleActivateMember = async (memberId: string, memberType: 'gym' | 'branch') => {
    try {
      setProcessing(true);
      const toastId = showLoading("Activating member...");
      
      // Call appropriate API to activate member based on type
      let response;
      if (memberType === 'branch') {
        response = await branchService.activateMember(memberId);
      } else {
        // Implement gym member activation if needed
        response = await gymService.activateMember(memberId);
      }
      
      // Update local state - replace member with activated one
      setMembers(prev => 
        prev.map(member => 
          member._id === memberId ? 
            {...member, status: 'active'} : 
            member
        )
      );
      
      updateToast(toastId, "Member activated successfully", "success");
      setProcessing(false);
    } catch (error) {
      console.error("Error activating member:", error);
      showError("Failed to activate member");
      setProcessing(false);
    }
  };

  const handleStatusChange = async (memberId: string, memberType: 'gym' | 'branch', newStatus: string) => {
    try {
      setProcessing(true);
      const toastId = showLoading(`Updating member status to ${newStatus}...`);
      
      // Call appropriate API to update member status based on type
      let response;
      if (memberType === 'branch') {
        response = await branchService.updateMemberStatus(memberId, newStatus);
      } else {
        response = await gymService.updateMemberStatus(memberId, newStatus);
      }
      
      // Update local state
      setMembers(prev => 
        prev.map(member => 
          member._id === memberId ? 
            {...member, status: newStatus as 'active' | 'inactive' | 'pending' | 'suspended'} : 
            member
        )
      );
      
      updateToast(toastId, `Member status updated to ${newStatus}`, "success");
      setProcessing(false);
    } catch (error) {
      console.error("Error updating member status:", error);
      showError("Failed to update member status");
      setProcessing(false);
    }
  };

  const handleBranchChange = (branchId: string | null) => {
    setSelectedBranch(branchId);
    setActiveTab('branch');
    
    // Reset pagination to page 1 when changing filters
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Fetch data with updated filters
    if (gym) {
      fetchMembers(gym._id);
    }
  };

  const handleTabChange = (tab: 'gym' | 'branch') => {
    setActiveTab(tab);
    
    // Reset pagination to page 1 when changing tabs
    setPagination(prev => ({ ...prev, page: 1 }));
    
    if (tab === 'gym') {
      setSelectedBranch(null);
    } else if (tab === 'branch' && branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0]._id);
    }
    
    // Fetch data with updated filters
    if (gym) {
      fetchMembers(gym._id);
    }
  };

  const handleFilterChange = (filter: 'all' | 'active' | 'pending') => {
    setActiveFilter(filter);
    
    // Reset pagination to page 1 when changing filters
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Fetch data with updated filters
    if (gym) {
      fetchMembers(gym._id);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  const handleSearch = () => {
    // Reset pagination to page 1 when searching
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Fetch data with updated search query
    if (gym) {
      fetchMembers(gym._id);
    }
  };
  
  const handleSearchKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      
      // Fetch data for the new page
      if (gym) {
        fetchMembers(gym._id);
      }
    }
  };
  
  const handleRefresh = () => {
    if (gym) {
      fetchMembers(gym._id);
    }
  };

  const renderMemberStatus = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
            <Check size={12} className="mr-1" />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
            <AlertCircle size={12} className="mr-1" />
            Pending
          </span>
        );
      case 'suspended':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
            <XCircle size={12} className="mr-1" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full flex items-center">
            <XCircle size={12} className="mr-1" />
            Inactive
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <Loader size={32} className="animate-spin text-primary-600" />
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="text-center py-8">
        <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Gym Found</h3>
        <p className="text-gray-600">You don't have any gyms registered yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">Member Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search members..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
            />
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <button 
              onClick={handleSearch}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <Filter size={16} />
            </button>
          </div>
          
          {/* Status Filter */}
          <select 
            className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={activeFilter}
            onChange={(e) => handleFilterChange(e.target.value as 'all' | 'active' | 'pending')}
          >
            <option value="all">All Members</option>
            <option value="active">Active Only</option>
            <option value="pending">Pending Only</option>
          </select>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm flex items-center justify-center hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <RefreshCw size={16} className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      
      {/* Tabs: Gym Members / Branch Members */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => handleTabChange('gym')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'gym'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 size={16} className="mr-2" />
              Gym Members
            </button>
            
            <button
              onClick={() => handleTabChange('branch')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'branch'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MapPin size={16} className="mr-2" />
              Branch Members
            </button>
          </nav>
        </div>
      </div>
      
      {/* Branch Selector (only visible when on Branch tab) */}
      {activeTab === 'branch' && (
        <div className="mb-6">
          <label htmlFor="branch-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Branch
          </label>
          <select
            id="branch-select"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={selectedBranch || ''}
            onChange={(e) => handleBranchChange(e.target.value || null)}
          >
            <option value="">Select a branch</option>
            {branches.map(branch => (
              <option key={branch._id} value={branch._id}>
                {branch.branchName} ({branch.address.city}, {branch.address.state})
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Members List */}
      <div className="overflow-x-auto">
        {members.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <User size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Members Found</h3>
            <p className="text-gray-600">
              {activeFilter !== 'all' 
                ? `There are no ${activeFilter} members.` 
                : activeTab === 'branch' && !selectedBranch
                  ? 'Please select a branch to view its members.'
                  : searchQuery
                    ? 'No members match your search query.'
                    : 'No members have joined yet.'}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {member.userId.profileImage ? (
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={member.userId.profileImage} 
                            alt={member.userId.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                            <User size={20} />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.userId.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 mb-1 flex items-center">
                      <Mail size={14} className="mr-1 text-gray-500" />
                      {member.userId.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Calendar size={14} className="mr-1 text-gray-500" />
                      {new Date(member.joinDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderMemberStatus(member.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.branch ? (
                      <div className="text-sm text-gray-900 flex items-center">
                        <MapPin size={14} className="mr-1 text-gray-500" />
                        {member.branch.branchName}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">Main Gym</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.subscriptionId ? (
                      <div className="text-sm text-gray-900 flex items-center">
                        <CreditCard size={14} className="mr-1 text-gray-500" />
                        {member.subscriptionId.planId.name}
                        <span className="ml-1 text-primary-600 font-medium">
                          (${member.subscriptionId.planId.price})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">No subscription</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      {member.status === 'pending' ? (
                        <button
                          onClick={() => handleActivateMember(member._id, member.type)}
                          disabled={processing}
                          className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                        >
                          <Check size={16} /> 
                          <span>Activate</span>
                        </button>
                      ) : (
                        <div className="relative inline-block text-left">
                          <select
                            onChange={(e) => handleStatusChange(member._id, member.type, e.target.value)}
                            disabled={processing}
                            value={member.status}
                            className="border border-gray-300 rounded-md text-sm py-1 pl-2 pr-7 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                            <option value="pending">Pending</option>
                          </select>
                        </div>
                      )}
                      <button className="text-primary-600 hover:text-primary-900">
                        <Edit2 size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Pagination */}
      {members.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                pagination.page <= 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                pagination.page >= pagination.pages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{members.length}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> members
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    pagination.page <= 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft size={18} />
                </button>
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === pagination.pages ||
                      (page >= pagination.page - 1 && page <= pagination.page + 1)
                    );
                  })
                  .map((page, i, filteredPages) => {
                    // Add ellipsis if there are gaps in the sequence
                    const showEllipsisBefore = i > 0 && filteredPages[i - 1] !== page - 1;
                    const showEllipsisAfter = i < filteredPages.length - 1 && filteredPages[i + 1] !== page + 1;
                    
                    return (
                      <div key={page}>
                        {showEllipsisBefore && (
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        )}
                        
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                            page === pagination.page
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                        
                        {showEllipsisAfter && (
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        )}
                      </div>
                    );
                  })}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                    pagination.page >= pagination.pages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight size={18} />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members; 