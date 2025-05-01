import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Loader, 
  MapPin, 
  Phone, 
  Clock, 
  Users, 
  User, 
  Image, 
  CalendarDays, 
  FileText, 
  ChevronLeft, 
  Edit2, 
  Plus, 
  ArrowUpDown,
  Search,
  Trash2
} from 'lucide-react';
import { branchService } from '../../lib/services';
import { showSuccess, showError } from '../../utils/toast';

interface Branch {
  _id: string;
  branchName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactNumber: string;
  openingHours: Record<string, { open: string; close: string }>;
  services: Array<{ name: string; description?: string; price?: number }>;
  photos: Array<{ _id: string; url: string; caption?: string }>;
  members: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  trainers: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  status: string;
}

const BranchProfile = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [targetBranchId, setTargetBranchId] = useState('');
  const [branches, setBranches] = useState<{ _id: string, branchName: string }[]>([]);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);

  useEffect(() => {
    fetchBranchDetails();
    fetchAllBranches();
  }, [branchId]);

  const fetchBranchDetails = async () => {
    if (!branchId) return;
    
    try {
      setLoading(true);
      const data = await branchService.getBranchById(branchId);
      setBranch(data as Branch);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching branch details:', error);
      showError('Failed to load branch details');
      setLoading(false);
    }
  };

  const fetchAllBranches = async () => {
    try {
      const data = await branchService.getAllBranches();
      // Filter out current branch
      const otherBranches = data.filter((b: any) => b._id !== branchId);
      setBranches(otherBranches);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const getAddressString = (address: Branch['address']) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };

  const formatOpeningHours = (hours: Record<string, { open: string; close: string }>) => {
    return Object.entries(hours).map(([day, time]) => (
      <div key={day} className="flex items-center justify-between py-1">
        <span className="capitalize font-medium w-24">{day}:</span>
        <span>{time.open} - {time.close}</span>
      </div>
    ));
  };

  const handleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleSelectAllMembers = () => {
    if (!branch) return;
    
    if (selectedMembers.length === branch.members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(branch.members.map(member => member._id));
    }
  };

  const openReassignModal = () => {
    if (selectedMembers.length === 0) {
      showError('Please select members to reassign');
      return;
    }
    
    if (branches.length === 0) {
      showError('No other branches available for reassignment');
      return;
    }
    
    setTargetBranchId(branches[0]._id);
    setReassignModalOpen(true);
  };

  const handleReassignMembers = async () => {
    if (!branchId || !targetBranchId || selectedMembers.length === 0) return;
    
    try {
      setLoading(true);
      
      // Process each member reassignment
      const promises = selectedMembers.map(memberId => 
        branchService.reassignMember(branchId, memberId, targetBranchId)
      );
      
      await Promise.all(promises);
      
      showSuccess(`Successfully reassigned ${selectedMembers.length} members`);
      setReassignModalOpen(false);
      setSelectedMembers([]);
      fetchBranchDetails();
    } catch (error) {
      console.error('Error reassigning members:', error);
      showError('Failed to reassign members');
      setLoading(false);
    }
  };

  const filteredMembers = branch?.members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Branch not found</p>
        <button 
          onClick={() => navigate('/gym/branches')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Back to Branches
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/gym/branches')}
          className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold flex-grow">{branch.branchName}</h1>
        <button
          onClick={() => navigate(`/gym/branches/${branchId}/edit`)}
          className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-md text-sm"
        >
          <Edit2 size={16} />
          Edit Branch
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tabs */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-6">
            <div 
              className={`flex items-center gap-2 px-4 py-3 cursor-pointer transition-colors ${activeTab === 'overview' ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : 'hover:bg-gray-50'}`}
              onClick={() => handleTabChange('overview')}
            >
              <FileText size={18} />
              <span>Overview</span>
            </div>
            <div 
              className={`flex items-center gap-2 px-4 py-3 cursor-pointer transition-colors ${activeTab === 'members' ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : 'hover:bg-gray-50'}`}
              onClick={() => handleTabChange('members')}
            >
              <Users size={18} />
              <span>Members</span>
            </div>
            <div 
              className={`flex items-center gap-2 px-4 py-3 cursor-pointer transition-colors ${activeTab === 'trainers' ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : 'hover:bg-gray-50'}`}
              onClick={() => handleTabChange('trainers')}
            >
              <User size={18} />
              <span>Trainers</span>
            </div>
            <div 
              className={`flex items-center gap-2 px-4 py-3 cursor-pointer transition-colors ${activeTab === 'media' ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : 'hover:bg-gray-50'}`}
              onClick={() => handleTabChange('media')}
            >
              <Image size={18} />
              <span>Media Gallery</span>
            </div>
            <div 
              className={`flex items-center gap-2 px-4 py-3 cursor-pointer transition-colors ${activeTab === 'attendance' ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : 'hover:bg-gray-50'}`}
              onClick={() => handleTabChange('attendance')}
            >
              <CalendarDays size={18} />
              <span>Attendance</span>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="md:w-3/4">
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Branch Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Branch Information */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-md font-medium text-gray-700 mb-2">Address</h3>
                      <div className="flex items-start gap-2">
                        <MapPin size={18} className="mt-1 flex-shrink-0 text-gray-500" />
                        <span className="text-gray-600">{getAddressString(branch.address)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium text-gray-700 mb-2">Contact</h3>
                      <div className="flex items-center gap-2">
                        <Phone size={18} className="flex-shrink-0 text-gray-500" />
                        <span className="text-gray-600">{branch.contactNumber}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium text-gray-700 mb-2">Opening Hours</h3>
                      <div className="flex items-start gap-2">
                        <Clock size={18} className="mt-1 flex-shrink-0 text-gray-500" />
                        <div className="text-gray-600">
                          {formatOpeningHours(branch.openingHours)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Services */}
                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-2">Services & Amenities</h3>
                    {branch.services && branch.services.length > 0 ? (
                      <div className="space-y-3">
                        {branch.services.map((service, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-md">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">{service.name}</h4>
                              {service.price !== undefined && (
                                <span className="text-primary-600 font-medium">
                                  ${service.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                            {service.description && (
                              <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No services listed for this branch.</p>
                    )}
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Total Members</p>
                        <p className="text-2xl font-semibold text-blue-800">{branch.members.length}</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Users size={24} className="text-blue-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Total Trainers</p>
                        <p className="text-2xl font-semibold text-green-800">{branch.trainers.length}</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full">
                        <User size={24} className="text-green-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Services</p>
                        <p className="text-2xl font-semibold text-purple-800">{branch.services.length}</p>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-full">
                        <FileText size={24} className="text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Members</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={openReassignModal}
                      disabled={selectedMembers.length === 0}
                      className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm ${
                        selectedMembers.length > 0 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUpDown size={16} />
                      Reassign Selected
                    </button>
                    <button
                      onClick={() => {}}
                      className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-md text-sm"
                    >
                      <Plus size={16} />
                      Add Member
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  <div className="flex items-center border bg-white rounded-md overflow-hidden">
                    <div className="pl-3">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search members by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-grow px-3 py-2 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="bg-white border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-12 px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedMembers.length > 0 && selectedMembers.length === branch.members.length}
                            onChange={handleSelectAllMembers}
                            className="rounded"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredMembers && filteredMembers.length > 0 ? (
                        filteredMembers.map((member) => (
                          <tr key={member._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedMembers.includes(member._id)}
                                onChange={() => handleMemberSelection(member._id)}
                                className="rounded"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-primary-600 hover:text-primary-900">
                                View
                              </button>
                              <button className="text-red-600 hover:text-red-900 ml-4">
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                            {searchTerm ? "No members match your search" : "No members in this branch"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'trainers' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Trainers</h2>
                  <button
                    onClick={() => {}}
                    className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-md text-sm"
                  >
                    <Plus size={16} />
                    Add Trainer
                  </button>
                </div>
                
                {branch.trainers && branch.trainers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {branch.trainers.map((trainer) => (
                      <div key={trainer._id} className="border rounded-md overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-4">
                          <h3 className="font-medium">{trainer.name}</h3>
                          <p className="text-sm text-gray-600">{trainer.email}</p>
                        </div>
                        <div className="bg-gray-50 px-4 py-2 border-t flex justify-end">
                          <button className="text-red-600 hover:text-red-900 text-sm">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No trainers assigned to this branch.</p>
                )}
              </div>
            )}

            {activeTab === 'media' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Media Gallery</h2>
                  <button
                    onClick={() => {}}
                    className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-md text-sm"
                  >
                    <Plus size={16} />
                    Upload Photos
                  </button>
                </div>
                
                {branch.photos && branch.photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {branch.photos.map((photo) => (
                      <div key={photo._id} className="group relative aspect-square rounded-md overflow-hidden">
                        <img 
                          src={photo.url} 
                          alt={photo.caption || "Branch photo"} 
                          className="w-full h-full object-cover"
                        />
                        {photo.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                            {photo.caption}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <button
                            onClick={() => {}}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border-2 border-dashed rounded-md">
                    <Image size={48} className="mx-auto text-gray-300" />
                    <p className="text-gray-500 mt-2">No photos uploaded yet.</p>
                    <button
                      onClick={() => {}}
                      className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
                    >
                      Upload First Photo
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'attendance' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Attendance Records</h2>
                
                <div className="bg-yellow-50 p-4 rounded-md mb-6">
                  <p className="text-yellow-700">
                    This section will display attendance records for members at this branch.
                    The detailed implementation requires integration with the attendance system.
                  </p>
                </div>
                
                <div className="text-center py-10 border-2 border-dashed rounded-md">
                  <CalendarDays size={48} className="mx-auto text-gray-300" />
                  <p className="text-gray-500 mt-2">No attendance records available yet.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reassign Members Modal */}
      {reassignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Reassign Members
              </h2>
              
              <p className="text-gray-600 mb-4">
                You are about to reassign {selectedMembers.length} member(s) to another branch.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Branch
                </label>
                <select
                  value={targetBranchId}
                  onChange={(e) => setTargetBranchId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setReassignModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReassignMembers}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-70"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Loader size={18} className="animate-spin mr-2" />
                      Processing...
                    </span>
                  ) : (
                    'Confirm Reassignment'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchProfile; 