import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Mail, Globe, ArrowLeft, Loader, AlertCircle, Image as ImageIcon, Film, User } from 'lucide-react';
import { apiMethods } from '../lib/api';

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
  contactNumber?: string;
  email?: string;
  website?: string;
  openingHours?: Record<string, { open: string; close: string }>;
  services?: Array<{ name: string; description?: string; price?: number }>;
  photos: Array<{ _id: string; url: string; caption?: string }>;
  videos?: Array<{ _id: string; url: string; caption?: string }>;
  description?: string;
  status: string;
  gymId: {
    _id: string;
    gymName: string;
    logo?: {
      url: string;
    }
  };
}

const BranchDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeMediaType, setActiveMediaType] = useState<'photos' | 'videos'>('photos');
  const [selectedMedia, setSelectedMedia] = useState<number>(0);

  useEffect(() => {
    const fetchBranchDetails = async () => {
      try {
        setLoading(true);
        const data = await apiMethods.get(`/branches/${id}`, {});
        setBranch(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching branch details:', err);
        setError('Failed to load branch details');
        setLoading(false);
      }
    };

    if (id) {
      fetchBranchDetails();
    }
  }, [id]);

  const getAddressString = (address: Branch['address']) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };

  const formatOpeningHours = (hours?: Record<string, { open: string; close: string }>) => {
    if (!hours) return null;
    
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    return (
      <div className="space-y-1">
        {daysOfWeek.map(day => {
          const schedule = hours[day];
          if (!schedule) return null;
          
          return (
            <div key={day} className="flex items-center justify-between text-sm">
              <span className="capitalize font-medium">{day}</span>
              <span>{schedule.open} - {schedule.close}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center py-10 bg-red-50 rounded-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-2">Error Loading Branch</h2>
          <p className="text-red-600 mb-6">{error || 'Branch not found'}</p>
          <Link to="/" className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const media = activeMediaType === 'photos' ? branch.photos : (branch.videos || []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Branch Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/explore-gyms" className="text-primary-600 hover:text-primary-800">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            {branch.gymId.logo && (
              <img 
                src={branch.gymId.logo.url} 
                alt={branch.gymId.gymName} 
                className="w-16 h-16 object-contain rounded-md"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{branch.branchName}</h1>
              <Link to={`/gyms/${branch.gymId._id}`} className="text-primary-600 hover:text-primary-800">
                {branch.gymId.gymName}
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="flex items-start mb-4">
              <MapPin className="w-5 h-5 text-gray-500 mt-1 mr-3 flex-shrink-0" />
              <p className="text-gray-700">{getAddressString(branch.address)}</p>
            </div>
            
            {branch.contactNumber && (
              <div className="flex items-center mb-4">
                <Phone className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                <a href={`tel:${branch.contactNumber}`} className="text-primary-600 hover:text-primary-800">
                  {branch.contactNumber}
                </a>
              </div>
            )}
            
            {branch.email && (
              <div className="flex items-center mb-4">
                <Mail className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                <a href={`mailto:${branch.email}`} className="text-primary-600 hover:text-primary-800">
                  {branch.email}
                </a>
              </div>
            )}
            
            {branch.website && (
              <div className="flex items-center mb-4">
                <Globe className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                <a 
                  href={branch.website.startsWith('http') ? branch.website : `https://${branch.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-800"
                >
                  {branch.website}
                </a>
              </div>
            )}
            
            {branch.openingHours && (
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-gray-500 mt-1 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">Opening Hours</h4>
                  {formatOpeningHours(branch.openingHours)}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Main Photo */}
        {branch.photos && branch.photos.length > 0 && (
          <div className="w-full md:w-1/2 lg:w-2/5 rounded-lg overflow-hidden aspect-video bg-gray-100">
            <img 
              src={branch.photos[0].url} 
              alt={branch.photos[0].caption || branch.branchName} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      
      {/* Branch Description */}
      {branch.description && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About this Branch</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700">{branch.description}</p>
          </div>
        </div>
      )}
      
      {/* Services */}
      {branch.services && branch.services.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Services Offered</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branch.services.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                  {service.description && (
                    <p className="text-gray-600 mb-4">{service.description}</p>
                  )}
                  {service.price !== undefined && (
                    <div className="text-lg font-semibold text-primary-600">
                      ${service.price.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Media Gallery */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Media Gallery</h2>
        
        {/* Media Type Selector */}
        <div className="flex mb-6">
          <button
            className={`flex items-center px-4 py-2 rounded-l-md border ${
              activeMediaType === 'photos'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => {
              setActiveMediaType('photos');
              setSelectedMedia(0);
            }}
          >
            <ImageIcon className="w-5 h-5 mr-2" />
            Photos ({branch.photos?.length || 0})
          </button>
          <button
            className={`flex items-center px-4 py-2 rounded-r-md border ${
              activeMediaType === 'videos'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => {
              setActiveMediaType('videos');
              setSelectedMedia(0);
            }}
          >
            <Film className="w-5 h-5 mr-2" />
            Videos ({branch.videos?.length || 0})
          </button>
        </div>
        
        {/* Media Viewer */}
        {media.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg mb-6">
            <p className="text-gray-500">No {activeMediaType} available</p>
          </div>
        ) : (
          <>
            <div className="mb-6 bg-black rounded-lg overflow-hidden aspect-video">
              {activeMediaType === 'photos' ? (
                <img 
                  src={media[selectedMedia]?.url} 
                  alt={media[selectedMedia]?.caption || `${branch.branchName} photo`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <video 
                  src={media[selectedMedia]?.url} 
                  controls 
                  className="w-full h-full"
                  poster={branch.photos && branch.photos.length > 0 ? branch.photos[0].url : undefined}
                >
                  Your browser does not support the video tag.
                </video>
              )}
              
              {media[selectedMedia]?.caption && (
                <div className="p-3 bg-gray-800 bg-opacity-75 text-white">
                  {media[selectedMedia].caption}
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {media.map((item, index) => (
                <div
                  key={index}
                  className={`cursor-pointer rounded-md overflow-hidden aspect-square ${
                    selectedMedia === index
                      ? 'ring-2 ring-primary-600'
                      : 'hover:opacity-80'
                  }`}
                  onClick={() => setSelectedMedia(index)}
                >
                  {activeMediaType === 'photos' ? (
                    <img
                      src={item.url}
                      alt={item.caption || `${branch.branchName} thumbnail`}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="relative bg-gray-800 w-full h-full flex items-center justify-center">
                      <img
                        src={branch.photos && branch.photos.length > 0 ? branch.photos[0].url : ''}
                        alt={item.caption || `Video thumbnail`}
                        className="object-cover w-full h-full opacity-50"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-y-8 border-y-transparent border-l-12 border-l-primary-600 ml-1"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Join Branch CTA */}
      <div className="mt-12 bg-primary-50 p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-primary-800 mb-4">Want to join this branch?</h2>
        <p className="text-primary-700 mb-6 max-w-2xl mx-auto">
          Become a member today and enjoy all the facilities and services offered by {branch.branchName}.
        </p>
        <Link
          to={`/signup?branchId=${branch._id}`}
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <User className="w-5 h-5 mr-2" />
          Sign Up as a Member
        </Link>
      </div>
    </div>
  );
};

export default BranchDetailsPage; 