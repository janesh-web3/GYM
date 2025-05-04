import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Gym } from '../types/Role';
import { getGymDetails, joinGym, checkMembershipStatus } from '../services/gymService';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaClock, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

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

  useEffect(() => {
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
          <FaMapMarkerAlt />
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
              <FaPhone />
            </span>
            <a href={`tel:${gym.phoneNumber}`} className="text-primary-600 hover:text-primary-800">
              {gym.phoneNumber}
            </a>
          </div>
        )}
        {gym.email && (
          <div className="flex items-center">
            <span className="mr-2 text-gray-500">
              <FaEnvelope />
            </span>
            <a href={`mailto:${gym.email}`} className="text-primary-600 hover:text-primary-800">
              {gym.email}
            </a>
          </div>
        )}
        {gym.website && (
          <div className="flex items-center">
            <span className="mr-2 text-gray-500">
              <FaGlobe />
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
              <FaClock />
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
          
          {media[selectedMedia]?.caption && (
            <p className="mt-2 text-sm text-gray-500 italic">
              {media[selectedMedia].caption}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {media.map((item, idx) => (
            <div 
              key={idx}
              className={`aspect-w-1 aspect-h-1 rounded-md overflow-hidden cursor-pointer ${selectedMedia === idx ? 'ring-2 ring-primary-500' : ''}`}
              onClick={() => setSelectedMedia(idx)}
            >
              {activeMediaType === 'photos' ? (
                <img 
                  src={item.url} 
                  alt={item.caption || `Thumbnail ${idx + 1}`}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="bg-gray-100 w-full h-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm4 3a1 1 0 100 2h8a1 1 0 100-2H6z" />
                  </svg>
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
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <span className="h-10 w-10 text-primary-600 animate-spin">
          <FaSpinner />
        </span>
      </div>
    );
  }

  if (error || !gym) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-red-500">{error || 'Gym not found'}</p>
          <button
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            onClick={() => navigate('/explore-gyms')}
          >
            Back to Gyms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header with gym logo/image */}
          <div className="relative h-64 bg-gray-200">
            {gym.logo?.url ? (
              <img
                src={gym.logo.url}
                alt={gym.gymName}
                className="w-full h-full object-cover"
              />
            ) : gym.photos && gym.photos.length > 0 ? (
              <img
                src={gym.photos[0].url}
                alt={gym.gymName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                <span className="text-2xl text-gray-600">No image available</span>
              </div>
            )}
            
            {/* Overlay with gym name */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white p-6">
              <h1 className="text-3xl font-bold">{gym.gymName}</h1>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-wrap md:flex-nowrap">
              {/* Left column: Gym info */}
              <div className="w-full md:w-1/3 md:pr-8 mb-6 md:mb-0">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Location</h2>
                  {renderAddress()}
                  {renderContact()}
                </div>
                
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">About</h2>
                  <p className="text-gray-700">{gym.description}</p>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Services</h2>
                  <div className="flex flex-wrap gap-2">
                    {gym.services.map((service, idx) => (
                      <div 
                        key={idx}
                        className="bg-gray-100 rounded-full px-3 py-1 text-sm"
                      >
                        {service.name}
                        {service.price && <span className="ml-1 font-medium">${service.price}</span>}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Join Gym Button */}
                <div>
                  {membershipStatus.isMember ? (
                    <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-md">
                      <span className="mr-2">
                        <FaCheckCircle />
                      </span>
                      <span>You are a member of this gym</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleJoinGym}
                      disabled={Boolean(joiningGym || !isAuthenticated || (user && user.role !== 'member'))}
                      className={`w-full flex justify-center items-center px-4 py-2 rounded-md shadow-sm text-white
                        ${joiningGym ? 'bg-gray-400 cursor-wait' : 'bg-primary-600 hover:bg-primary-700'}
                        ${(!isAuthenticated || (user && user.role !== 'member')) ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {joiningGym ? (
                        <>
                          <span className="animate-spin mr-2 h-4 w-4">
                            <FaSpinner />
                          </span>
                          Joining...
                        </>
                      ) : (
                        'Join Gym'
                      )}
                    </button>
                  )}
                  
                  {!isAuthenticated && (
                    <p className="mt-2 text-sm text-gray-500">
                      Please log in as a member to join this gym
                    </p>
                  )}
                  
                  {isAuthenticated && user && user.role !== 'member' && (
                    <p className="mt-2 text-sm text-gray-500">
                      Only members can join gyms
                    </p>
                  )}
                </div>
              </div>
              
              {/* Right column: Media gallery */}
              <div className="w-full md:w-2/3 md:pl-8 border-t pt-6 md:pt-0 md:border-t-0 md:border-l border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Media Gallery</h2>
                {renderMediaGallery()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymProfile; 