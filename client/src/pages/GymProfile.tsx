import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Gym } from '../types/Role';
import { getGymDetails, joinGym, checkMembershipStatus } from '../services/gymService';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaClock, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import BranchList from '../components/BranchList';

interface MembershipStatus {
  isMember: boolean;
  status?: string;
  joinedDate?: string;
}

const GymProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joiningGym, setJoiningGym] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus>({ isMember: false });
  const [activeMediaType, setActiveMediaType] = useState<'photos' | 'videos'>('photos');
  const [selectedMedia, setSelectedMedia] = useState<number>(0);

  const fetchGymDetails = async () => {
    try {
      setLoading(true);
      if (!id) return;
      
      const gymData = await getGymDetails(id) as Gym;
      setGym(gymData);
      
      // Check membership status if user is logged in
      if (isAuthenticated) {
        try {
          const memberStatus = await checkMembershipStatus(id) as MembershipStatus;
          setMembershipStatus(memberStatus);
        } catch (err) {
          console.error('Error checking membership:', err);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching gym details:', err);
      setError('Failed to load gym details. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGymDetails();
  }, [id, isAuthenticated]);

  const handleJoinGym = async () => {
    if (!isAuthenticated) {
      // Redirect to login page
      toast.error('Please log in to join this gym');
      navigate('/login');
      return;
    }
    
    if (!user || user.role !== 'member') {
      toast.error('Only members can join gyms');
      return;
    }
    
    try {
      setJoiningGym(true);
      const response = await joinGym(id!);
      setMembershipStatus({ isMember: true, status: 'active', joinedDate: new Date().toISOString() });
      toast.success('Successfully joined the gym!');
      setJoiningGym(false);
    } catch (err: any) {
      console.error('Error joining gym:', err);
      toast.error(err.response?.data?.message || 'Failed to join gym. Please try again.');
      setJoiningGym(false);
    }
  };

  const renderAddress = () => {
    if (!gym) return null;
    return (
      <div className="flex items-start">
        <span className="mt-1 mr-2 text-gray-500 flex-shrink-0">
          <FaMapMarkerAlt size={16} />
        </span>
        <div>
          {gym.address.street}, {gym.address.city}, {gym.address.state} {gym.address.zipCode}, {gym.address.country}
        </div>
      </div>
    );
  };

  const renderContact = () => {
    if (!gym) return null;
    return (
      <div className="mt-4 space-y-2">
        {gym.phoneNumber && (
          <div className="flex items-center">
            <span className="mr-2 text-gray-500">
              <FaPhone size={16} />
            </span>
            <a href={`tel:${gym.phoneNumber}`} className="text-primary-600 hover:text-primary-800">
              {gym.phoneNumber}
            </a>
          </div>
        )}
        {gym.email && (
          <div className="flex items-center">
            <span className="mr-2 text-gray-500">
              <FaEnvelope size={16} />
            </span>
            <a href={`mailto:${gym.email}`} className="text-primary-600 hover:text-primary-800">
              {gym.email}
            </a>
          </div>
        )}
        {gym.website && (
          <div className="flex items-center">
            <span className="mr-2 text-gray-500">
              <FaGlobe size={16} />
            </span>
            <a 
              href={gym.website.startsWith('http') ? gym.website : `https://${gym.website}`} 
              className="text-primary-600 hover:text-primary-800"
              target="_blank" 
              rel="noopener noreferrer"
            >
              {gym.website}
            </a>
          </div>
        )}
        {gym.workingHours && (
          <div className="flex items-center">
            <span className="mr-2 text-gray-500">
              <FaClock size={16} />
            </span>
            <span>
              {gym.workingHours.openTime} - {gym.workingHours.closeTime}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderMediaGallery = () => {
    if (!gym) return null;
    
    const media = activeMediaType === 'photos' ? gym.photos : gym.videos;
    
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
            Photos ({gym.photos?.length || 0})
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeMediaType === 'videos' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveMediaType('videos')}
          >
            Videos ({gym.videos?.length || 0})
          </button>
        </div>
        
        <div className="mb-4">
          {activeMediaType === 'photos' && (
            <div className="bg-black aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
              <img 
                src={media[selectedMedia]?.url} 
                alt={media[selectedMedia]?.caption || `Gym photo ${selectedMedia + 1}`}
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
                poster={gym.photos && gym.photos.length > 0 ? gym.photos[0].url : undefined}
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
                    src={gym.photos && gym.photos.length > 0 ? gym.photos[0].url : ''}
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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <FaSpinner size={32} className="animate-spin text-primary-600" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-primary-600 hover:text-primary-800"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!gym) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Gym not found.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Basic info */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{gym.gymName}</h2>
            
            {renderAddress()}
            {renderContact()}
            
            <div className="mt-6">
              {user && user.role === 'member' && (
                <div className="mb-4">
                  {membershipStatus.isMember ? (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center">
                      <FaCheckCircle size={18} className="text-green-500 mr-2" />
                      <div>
                        <p className="text-green-800 font-medium">
                          You are a member of this gym
                        </p>
                        {membershipStatus.joinedDate && (
                          <p className="text-green-600 text-sm">
                            Joined on{' '}
                            {new Date(membershipStatus.joinedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleJoinGym}
                      disabled={joiningGym}
                      className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                        joiningGym
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700'
                      }`}
                    >
                      {joiningGym ? (
                        <span className="flex items-center justify-center">
                          <FaSpinner size={16} className="animate-spin mr-2" />
                          Joining...
                        </span>
                      ) : (
                        'Join Gym'
                      )}
                    </button>
                  )}
                </div>
              )}
              
              {gym.isApproved && gym.status === 'active' ? (
                <div className="flex items-center text-green-600">
                  <FaCheckCircle size={16} className="mr-2" />
                  <span>Active Gym</span>
                </div>
              ) : (
                <div className="flex items-center text-yellow-600">
                  <FaSpinner size={16} className="mr-2" />
                  <span>{gym.status === 'pending' ? 'Pending Approval' : 'Inactive'}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Description */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">About</h3>
            <p className="text-gray-600">{gym.description}</p>
          </div>
        </div>
        
        {/* Right column - Media and branches */}
        <div className="lg:col-span-2">
          {/* Media gallery */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Gallery</h3>
            {renderMediaGallery()}
          </div>
          
          {/* Services */}
          {gym.services && gym.services.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gym.services.map((service, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <h4 className="font-medium text-gray-800">{service.name}</h4>
                    {service.description && <p className="text-gray-600 text-sm mt-1">{service.description}</p>}
                    {service.price && (
                      <div className="mt-2 text-primary-600 font-semibold">${service.price.toFixed(2)}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Branches */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            {gym.branches && gym.branches.length > 0 ? (
              <BranchList 
                branches={gym.branches} 
                gymId={gym._id} 
                refreshGymData={fetchGymDetails}
              />
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Branches</h3>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-500">This gym doesn't have any branches yet.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {gym && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            {/* Hero image */}
            <div className="h-48 md:h-64 lg:h-80 bg-gray-300 relative">
              {gym.photos && gym.photos.length > 0 ? (
                <img
                  src={gym.photos[0].url}
                  alt={gym.gymName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary-100 to-primary-200">
                  <h1 className="text-2xl font-bold text-primary-800">{gym.gymName}</h1>
                </div>
              )}
              
              {/* Logo overlay */}
              {gym.logo && (
                <div className="absolute bottom-0 left-0 transform translate-y-1/2 ml-6 md:ml-8">
                  <div className="h-16 w-16 md:h-24 md:w-24 rounded-full overflow-hidden border-4 border-white bg-white shadow-md">
                    <img
                      src={gym.logo.url}
                      alt={`${gym.gymName} logo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GymProfile; 