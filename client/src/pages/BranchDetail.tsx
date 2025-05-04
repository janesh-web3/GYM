import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Branch } from '../types/Role';
import { getBranchDetails, joinBranch } from '../services/branchService';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCheckCircle, FaSpinner, FaUsers } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import SubscriptionSelector from '../components/SubscriptionSelector';

const BranchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [branch, setBranch] = useState<Branch | null>(null);
  const [gym, setGym] = useState<{ _id: string; gymName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joiningBranch, setJoiningBranch] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [activeMediaType, setActiveMediaType] = useState<'photos' | 'videos'>('photos');
  const [selectedMedia, setSelectedMedia] = useState<number>(0);

  // Fetch branch details
  useEffect(() => {
    const fetchBranchDetails = async () => {
      try {
        setLoading(true);
        if (!id) return;
        
        const branchData = await getBranchDetails(id);
        setBranch(branchData);
        
        // Set gym info from branch.gymId - in a real app, would fetch more details
        if (typeof branchData.gymId === 'object') {
          setGym(branchData.gymId);
        } else {
          // If it's just an ID, we'll need to fetch gym details separately
          // This depends on your API response structure
          setGym({ _id: branchData.gymId, gymName: 'Gym' });
        }
        
        // Check membership status - in a real implementation, would call an API
        // For demo purposes, assuming not a member
        setIsMember(false);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching branch details:', err);
        setError('Failed to load branch details. Please try again later.');
        setLoading(false);
      }
    };

    fetchBranchDetails();
  }, [id]);

  const handleJoinClick = () => {
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
    setShowSubscriptions(true);
  };

  const handleSubscriptionClose = () => {
    setShowSubscriptions(false);
    // Refresh branch data when modal closes - this would update membership status
    fetchBranchDetails();
  };

  const fetchBranchDetails = async () => {
    try {
      if (!id) return;
      
      const branchData = await getBranchDetails(id);
      setBranch(branchData);
      
      // Check membership status again after joining
      // In a real app, this would call an API
      
      // For demo purposes, set isMember to show UI change
      // In a real app, this would be set based on API response
      setIsMember(true);
    } catch (err) {
      console.error('Error refreshing branch details:', err);
    }
  };

  const renderAddress = () => {
    if (!branch) return null;
    return (
      <div className="flex items-start mb-3">
        <FaMapMarkerAlt size={16} className="mt-1 mr-2 text-gray-500 flex-shrink-0" />
        <div>
          {branch.address.street}, {branch.address.city}, {branch.address.state} {branch.address.zipCode}, {branch.address.country}
        </div>
      </div>
    );
  };

  const renderContact = () => {
    if (!branch) return null;
    return (
      <div className="space-y-2 mb-4">
        {branch.phoneNumber && (
          <div className="flex items-center">
            <FaPhone size={14} className="mr-2 text-gray-500" />
            <a href={`tel:${branch.phoneNumber}`} className="text-primary-600 hover:text-primary-800">
              {branch.phoneNumber}
            </a>
          </div>
        )}
        {branch.email && (
          <div className="flex items-center">
            <FaEnvelope size={14} className="mr-2 text-gray-500" />
            <a href={`mailto:${branch.email}`} className="text-primary-600 hover:text-primary-800">
              {branch.email}
            </a>
          </div>
        )}
        {branch.workingHours && (
          <div className="flex items-center">
            <FaClock size={14} className="mr-2 text-gray-500" />
            <span>
              {branch.workingHours.openTime} - {branch.workingHours.closeTime}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderMediaGallery = () => {
    if (!branch) return null;
    
    const media = activeMediaType === 'photos' ? branch.photos : branch.videos;
    
    if (!media || media.length === 0) {
      return (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No {activeMediaType} available</p>
        </div>
      );
    }
    
    return (
      <div>
        <div className="flex justify-center mb-4">
          <button
            className={`px-4 py-2 mr-2 rounded-md ${activeMediaType === 'photos' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveMediaType('photos')}
          >
            Photos ({branch.photos?.length || 0})
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeMediaType === 'videos' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveMediaType('videos')}
          >
            Videos ({branch.videos?.length || 0})
          </button>
        </div>
        
        <div className="mb-4">
          {activeMediaType === 'photos' && (
            <div className="bg-black aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
              <img 
                src={media[selectedMedia]?.url} 
                alt={media[selectedMedia]?.caption || `Branch photo ${selectedMedia + 1}`}
                className="object-contain w-full h-full"
              />
            </div>
          )}
          
          {activeMediaType === 'videos' && (
            <div className="bg-black aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
              <video 
                src={media[selectedMedia]?.url} 
                controls 
                className="w-full h-full"
                poster={branch.photos && branch.photos.length > 0 ? branch.photos[0].url : undefined}
              />
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          {media.map((item, index) => (
            <div
              key={index}
              className={`cursor-pointer rounded-md overflow-hidden h-16 ${
                selectedMedia === index
                  ? 'ring-2 ring-primary-600'
                  : 'hover:opacity-80'
              }`}
              onClick={() => setSelectedMedia(index)}
            >
              {activeMediaType === 'photos' ? (
                <img
                  src={item.url}
                  alt={item.caption || `Thumbnail ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="relative bg-gray-800 w-full h-full flex items-center justify-center">
                  <img
                    src={branch.photos && branch.photos.length > 0 ? branch.photos[0].url : ''}
                    alt={item.caption || `Video thumbnail ${index + 1}`}
                    className="object-cover w-full h-full opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-y-4 border-y-transparent border-l-6 border-l-primary-600 ml-0.5"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 min-h-screen">
        <FaSpinner size={32} className="animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="text-center py-8 min-h-screen flex items-center justify-center">
        <div>
          <p className="text-red-500 mb-4">{error || 'Branch not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {/* Hero image */}
          <div className="h-48 md:h-64 lg:h-72 bg-gray-300 relative">
            {branch.photos && branch.photos.length > 0 ? (
              <img
                src={branch.photos[0].url}
                alt={branch.branchName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary-100 to-primary-200">
                <h1 className="text-2xl font-bold text-primary-800">{branch.branchName}</h1>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              {gym && (
                <div className="mb-2">
                  <a 
                    href={`/gyms/${gym._id}`}
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    {gym.gymName}
                  </a>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{branch.branchName}</h1>
                
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-700 flex items-center">
                    <FaUsers size={14} className="mr-1" />
                    {branch.memberCount} members
                  </span>
                  
                  <span className={`px-2 py-1 rounded-full text-sm flex items-center ${
                    branch.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : branch.status === 'maintenance'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {branch.status === 'active' 
                      ? 'Active' 
                      : branch.status === 'maintenance' 
                        ? 'Maintenance' 
                        : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column - Information */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Branch Details</h2>
                  
                  {renderAddress()}
                  {renderContact()}
                  
                  {user && user.role === 'member' && (
                    <div className="mt-4">
                      {isMember ? (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center">
                          <FaCheckCircle size={16} className="text-green-500 mr-2" />
                          <div>
                            <p className="text-green-800 font-medium">
                              You are a member of this branch
                            </p>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={handleJoinClick}
                          disabled={joiningBranch || branch.status !== 'active'}
                          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                            joiningBranch || branch.status !== 'active'
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-primary-600 hover:bg-primary-700'
                          }`}
                        >
                          {joiningBranch ? (
                            <span className="flex items-center justify-center">
                              <FaSpinner size={16} className="animate-spin mr-2" />
                              Joining...
                            </span>
                          ) : branch.status !== 'active' ? (
                            'Currently Unavailable'
                          ) : (
                            'Join Branch'
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">About</h2>
                  <p className="text-gray-600">{branch.description}</p>
                </div>
              </div>
              
              {/* Right column - Media gallery */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Gallery</h2>
                  {renderMediaGallery()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subscription Selector Modal */}
      {showSubscriptions && gym && (
        <SubscriptionSelector
          isOpen={showSubscriptions}
          onClose={handleSubscriptionClose}
          gymId={gym._id}
          branchId={branch._id}
          branchName={branch.branchName}
        />
      )}
    </div>
  );
};

export default BranchDetail; 