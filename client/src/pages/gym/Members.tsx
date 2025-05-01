import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, Mail, Phone, Calendar, CreditCard, Loader } from 'lucide-react';
import { gymService } from '../../lib/services';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError, showLoading, updateToast } from '../../utils/toast';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: string;
  joinDate: string;
  expiryDate: string;
  status: 'active' | 'inactive' | 'pending';
  image: string;
}

interface GymResponse {
  _id: string;
  name: string;
  [key: string]: any;
}

const Members = () => {
  const { user } = useAuth();
  const [gymId, setGymId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [members, setMembers] = useState<Member[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [newMember, setNewMember] = useState<Omit<Member, 'id'>>({
    name: '',
    email: '',
    phone: '',
    membershipType: '',
    joinDate: '',
    expiryDate: '',
    status: 'pending',
    image: '',
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        // In a real app, we'd fetch the gym ID associated with this owner
        const gyms = await gymService.getAllGyms() as GymResponse[];
        if (gyms && gyms.length > 0) {
          const gymId = gyms[0]._id;
          setGymId(gymId);
          
          // In a real app, we would fetch members from an API endpoint
          // const membersData = await gymService.getMembers(gymId);
          // setMembers(membersData);
          
          // For now, using sample data
          setMembers([
            {
              id: '1',
              name: 'Michael Brown',
              email: 'michael.b@example.com',
              phone: '+1 (555) 123-4567',
              membershipType: 'Premium',
              joinDate: '2024-01-15',
              expiryDate: '2024-07-15',
              status: 'active',
              image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
            },
            {
              id: '2',
              name: 'Emily Davis',
              email: 'emily.d@example.com',
              phone: '+1 (555) 987-6543',
              membershipType: 'Basic',
              joinDate: '2024-02-01',
              expiryDate: '2024-08-01',
              status: 'active',
              image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
            },
          ]);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        showError('Failed to load members');
        console.error('Error fetching members:', error);
      }
    };
    
    if (user) {
      fetchMembers();
    }
  }, [user]);

  const handleAddMember = async () => {
    if (!gymId) {
      showError('No gym associated with this account');
      return;
    }
    
    const toastId = showLoading('Adding new member...');
    setSaving(true);
    
    try {
      // In a real app, we would call an API endpoint
      // const response = await gymService.addMember(gymId, newMember);
      // const addedMember = response.data;
      
      // For now, create a new member locally
      const member: Member = {
        ...newMember,
        id: Date.now().toString(),
      };
      
      setMembers((prev) => [...prev, member]);
      setIsAddModalOpen(false);
      setNewMember({
        name: '',
        email: '',
        phone: '',
        membershipType: '',
        joinDate: '',
        expiryDate: '',
        status: 'pending',
        image: '',
      });
      
      setSaving(false);
      updateToast(toastId, 'Member added successfully!', 'success');
    } catch (error) {
      setSaving(false);
      updateToast(toastId, 'Failed to add member.', 'error');
      console.error('Error adding member:', error);
    }
  };

  const handleEditMember = async () => {
    if (!selectedMember || !gymId) {
      showError('No member selected or gym associated with this account');
      return;
    }
    
    const toastId = showLoading('Updating member...');
    setSaving(true);
    
    try {
      // In a real app, we would call an API endpoint
      // await gymService.updateMember(gymId, selectedMember.id, selectedMember);
      
      // Update local state
      setMembers((prev) =>
        prev.map((member) =>
          member.id === selectedMember.id ? selectedMember : member
        )
      );
      
      setIsEditModalOpen(false);
      setSelectedMember(null);
      
      setSaving(false);
      updateToast(toastId, 'Member updated successfully!', 'success');
    } catch (error) {
      setSaving(false);
      updateToast(toastId, 'Failed to update member.', 'error');
      console.error('Error updating member:', error);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!gymId) {
      showError('No gym associated with this account');
      return;
    }
    
    const toastId = showLoading('Deleting member...');
    
    try {
      // In a real app, we would call an API endpoint
      // await gymService.deleteMember(gymId, id);
      
      // Update local state
      setMembers((prev) => prev.filter((member) => member.id !== id));
      
      updateToast(toastId, 'Member deleted successfully!', 'success');
    } catch (error) {
      updateToast(toastId, 'Failed to delete member.', 'error');
      console.error('Error deleting member:', error);
    }
  };

  const getStatusColor = (status: Member['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </button>
      </div>

      {members.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <User className="w-16 h-16 mx-auto text-gray-400" />
          <h2 className="mt-4 text-xl font-medium text-gray-900">No Members Yet</h2>
          <p className="mt-2 text-gray-500">Get started by adding your first member</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="relative">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setIsEditModalOpen(true);
                    }}
                    className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {member.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      member.status
                    )}`}
                  >
                    {member.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {member.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {member.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CreditCard className="w-4 h-4 mr-2" />
                    {member.membershipType}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Joined: {new Date(member.joinDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Expires: {new Date(member.expiryDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Add New Member</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) =>
                    setNewMember({ ...newMember, email: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) =>
                    setNewMember({ ...newMember, phone: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Membership Type
                </label>
                <select
                  value={newMember.membershipType}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      membershipType: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Join Date
                </label>
                <input
                  type="date"
                  value={newMember.joinDate}
                  onChange={(e) =>
                    setNewMember({ ...newMember, joinDate: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={newMember.expiryDate}
                  onChange={(e) =>
                    setNewMember({ ...newMember, expiryDate: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={newMember.status}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      status: e.target.value as Member['status'],
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  type="url"
                  value={newMember.image}
                  onChange={(e) =>
                    setNewMember({ ...newMember, image: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Member'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit Member</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={selectedMember.name}
                  onChange={(e) =>
                    setSelectedMember({
                      ...selectedMember,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={selectedMember.email}
                  onChange={(e) =>
                    setSelectedMember({
                      ...selectedMember,
                      email: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={selectedMember.phone}
                  onChange={(e) =>
                    setSelectedMember({
                      ...selectedMember,
                      phone: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Membership Type
                </label>
                <select
                  value={selectedMember.membershipType}
                  onChange={(e) =>
                    setSelectedMember({
                      ...selectedMember,
                      membershipType: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                >
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Join Date
                </label>
                <input
                  type="date"
                  value={selectedMember.joinDate}
                  onChange={(e) =>
                    setSelectedMember({
                      ...selectedMember,
                      joinDate: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={selectedMember.expiryDate}
                  onChange={(e) =>
                    setSelectedMember({
                      ...selectedMember,
                      expiryDate: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={selectedMember.status}
                  onChange={(e) =>
                    setSelectedMember({
                      ...selectedMember,
                      status: e.target.value as Member['status'],
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  type="url"
                  value={selectedMember.image}
                  onChange={(e) =>
                    setSelectedMember({
                      ...selectedMember,
                      image: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedMember(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditMember}
                disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members; 