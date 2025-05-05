import React, { useState } from 'react';
import { FaMapMarkerAlt, FaUsers, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import SubscriptionSelector from './SubscriptionSelector';

// Types
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
  description: string;
  photos: Array<{url: string; caption?: string}>;
  status: string;
  memberCount: number;
}

interface BranchListProps {
  branches: Branch[];
  gymId: string;
  refreshGymData?: () => Promise<void>;
}

const BranchList: React.FC<BranchListProps> = ({ branches, gymId, refreshGymData }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [showSubscriptions, setShowSubscriptions] = useState(false);

  const handleJoinClick = (branch: Branch) => {
    if (!isAuthenticated) {
      toast.error('Please log in to join this branch');
      navigate('/login');
      return;
    }

    if (user?.role !== 'member') {
      toast.error('Only members can join branches');
      return;
    }

    // Show subscription selection modal
    setSelectedBranch(branch);
    setShowSubscriptions(true);
  };

  const handleSubscriptionClose = () => {
    setShowSubscriptions(false);
    setSelectedBranch(null);
    
    // Refresh gym data when modal closes to show updated membership status
    if (refreshGymData) {
      refreshGymData();
    }
  };

  if (!branches || branches.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <FaInfoCircle size={24} className="mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500">This gym doesn't have any branches yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Branches</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((branch) => (
          <div 
            key={branch._id} 
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative h-40 bg-gray-200">
              {branch.photos && branch.photos.length > 0 ? (
                <img 
                  src={branch.photos[0].url} 
                  alt={branch.branchName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary-100 to-primary-200">
                  <span className="text-primary-700 font-bold text-lg">{branch.branchName}</span>
                </div>
              )}
              
              {branch.status !== 'active' && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                  {branch.status === 'maintenance' ? 'Under Maintenance' : 'Inactive'}
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-gray-900">{branch.branchName}</h4>
                <div className="flex items-center text-gray-600 text-sm">
                  <FaUsers size={14} className="mr-1" />
                  <span>{branch.memberCount} members</span>
                </div>
              </div>
              
              <div className="mb-3 flex items-start text-gray-600 text-sm">
                <FaMapMarkerAlt size={14} className="mt-1 mr-2 flex-shrink-0" />
                <span>{branch.address.city}, {branch.address.state}</span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {branch.description}
              </p>
              
              <div className="flex justify-between items-center">
                <button
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  onClick={() => navigate(`/gyms/branches/${branch._id}`)}
                >
                  View Details
                </button>
                
                {branch.status === 'active' && (
                  <button
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                    onClick={() => handleJoinClick(branch)}
                    disabled={!isAuthenticated || user?.role !== 'member'}
                  >
                    Join Branch
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Subscription Selector Modal */}
      {showSubscriptions && selectedBranch && (
        <SubscriptionSelector
          isOpen={showSubscriptions}
          onClose={handleSubscriptionClose}
          gymId={gymId}
          branchId={selectedBranch._id}
          branchName={selectedBranch.branchName}
        />
      )}
    </div>
  );
};

export default BranchList; 