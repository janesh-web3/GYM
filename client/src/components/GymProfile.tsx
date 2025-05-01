import { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Dumbbell, 
  Users, 
  Calendar,
  ChevronDown,
  Plus,
  X,
  Edit,
  CheckCircle,
  Film,
  Save
} from 'lucide-react';

// Define types for the component
interface GymProfileProps {
  gym?: {
    id: string;
    gymName: string;
    description: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    phone: string;
    email: string;
    website?: string;
    workingHours?: string;
    logo?: string;
    coverImage?: string;
    services?: string[];
    gallery?: {
      id: string;
      type: 'image' | 'video';
      url: string;
      thumbnail?: string;
    }[];
    trainers?: {
      id: string;
      name: string;
      position: string;
      photo?: string;
      bio?: string;
    }[];
    classes?: {
      id: string;
      name: string;
      description: string;
      schedule: string;
      trainer: string;
      capacity: number;
    }[];
  };
  editable?: boolean;
  onSave?: (data: any) => void;
}

const GymProfile = ({ gym, editable = false, onSave }: GymProfileProps) => {
  // State for tabs
  const [activeTab, setActiveTab] = useState<'info' | 'services' | 'gallery' | 'trainers' | 'classes'>('info');
  
  // State for accordions
  const [expandedAccordions, setExpandedAccordions] = useState<{
    services: boolean;
    trainers: boolean;
    classes: boolean;
  }>({
    services: true,
    trainers: true,
    classes: true
  });

  // Toggle accordion state
  const toggleAccordion = (section: 'services' | 'trainers' | 'classes') => {
    setExpandedAccordions(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Dummy data for preview (if no gym data is provided)
  const dummyGym = {
    id: '1',
    gymName: 'Fitness Central',
    description: 'A state-of-the-art fitness facility offering a wide range of equipment and classes for all fitness levels. Our mission is to provide a welcoming environment where members can achieve their health and fitness goals.',
    address: {
      street: '123 Fitness Street',
      city: 'Exercise City',
      state: 'EC',
      zipCode: '12345',
      country: 'USA'
    },
    phone: '(555) 123-4567',
    email: 'info@fitnesscentral.com',
    website: 'www.fitnesscentral.com',
    workingHours: 'Mon-Fri: 5:00 AM - 11:00 PM, Sat-Sun: 7:00 AM - 9:00 PM',
    logo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    services: [
      'Weight Training',
      'Cardio Equipment',
      'Group Classes',
      'Personal Training',
      'Yoga Studio',
      'Swimming Pool',
      'Sauna & Steam Room',
      'Nutrition Counseling'
    ],
    gallery: [
      {
        id: '1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
      },
      {
        id: '2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
      },
      {
        id: '3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
      },
      {
        id: '4',
        type: 'video',
        url: 'https://example.com/video.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
      }
    ],
    trainers: [
      {
        id: '1',
        name: 'John Fitness',
        position: 'Head Trainer',
        photo: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        bio: 'Certified personal trainer with 10+ years of experience in strength training and functional fitness.'
      },
      {
        id: '2',
        name: 'Sarah Wellness',
        position: 'Yoga Instructor',
        photo: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        bio: 'Registered yoga teacher with specializations in Vinyasa and restorative practices.'
      }
    ],
    classes: [
      {
        id: '1',
        name: 'HIIT Blast',
        description: 'High-intensity interval training for maximum calorie burn and cardiovascular fitness.',
        schedule: 'Mon, Wed, Fri at 6:00 AM',
        trainer: 'John Fitness',
        capacity: 20
      },
      {
        id: '2',
        name: 'Morning Flow Yoga',
        description: 'Start your day with mindful movement and breathwork to energize your body and calm your mind.',
        schedule: 'Tue, Thu at 7:00 AM',
        trainer: 'Sarah Wellness',
        capacity: 15
      }
    ]
  };

  // Use provided gym data or dummy data
  const gymData = gym || dummyGym;

  // Handle file uploads
  const handleFileUpload = (type: 'logo' | 'cover' | 'gallery' | 'video') => {
    switch (type) {
      case 'logo':
        logoInputRef.current?.click();
        break;
      case 'cover':
        coverInputRef.current?.click();
        break;
      case 'gallery':
        galleryInputRef.current?.click();
        break;
      case 'video':
        videoInputRef.current?.click();
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Cover Image Section */}
      <div className="relative h-64 md:h-80 w-full bg-slate-100">
        {gymData.coverImage ? (
          <img 
            src={gymData.coverImage} 
            alt={`${gymData.gymName} cover`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <Camera size={48} className="text-slate-400" />
          </div>
        )}
        
        {editable && (
          <button 
            onClick={() => handleFileUpload('cover')}
            className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-slate-700 p-2 rounded-full shadow-md hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
          >
            <Upload size={20} />
            <input 
              ref={coverInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
            />
          </button>
        )}
      </div>

      {/* Gym Info Header */}
      <div className="relative px-6 pt-20 pb-6 md:flex md:items-end md:justify-between border-b border-slate-100">
        {/* Logo */}
        <div className="absolute -top-12 left-6 w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-4 border-white shadow-md bg-white">
          {gymData.logo ? (
            <img 
              src={gymData.logo} 
              alt={`${gymData.gymName} logo`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100">
              <Dumbbell size={32} className="text-slate-400" />
            </div>
          )}
          
          {editable && (
            <button 
              onClick={() => handleFileUpload('logo')}
              className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-sm text-slate-700 p-1 rounded-full shadow-sm hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
            >
              <Camera size={14} />
              <input 
                ref={logoInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
              />
            </button>
          )}
        </div>

        {/* Gym Name and Quick Info */}
        <div className="md:flex-1">
          <h1 className="text-2xl font-bold text-slate-800">{gymData.gymName}</h1>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
            <div className="flex items-center">
              <MapPin size={16} className="mr-1" />
              <span>{gymData.address.street}, {gymData.address.city}, {gymData.address.state} {gymData.address.zipCode}, {gymData.address.country}</span>
            </div>
            <div className="flex items-center">
              <Phone size={16} className="mr-1" />
              <span>{gymData.phone}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {editable && (
          <div className="mt-4 md:mt-0">
            <button 
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm flex items-center"
              onClick={() => onSave && onSave(gymData)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="px-6 py-4 border-b border-slate-100">
        <nav className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {['info', 'services', 'gallery', 'trainers', 'classes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-2">About Our Gym</h2>
              <p className="text-slate-600">{gymData.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="text-md font-medium text-slate-800 mb-3">Contact Information</h3>
                <ul className="space-y-3">
                  <li className="flex">
                    <Mail size={18} className="text-emerald-600 mr-3 flex-shrink-0" />
                    <span className="text-slate-600">{gymData.email}</span>
                  </li>
                  <li className="flex">
                    <Phone size={18} className="text-emerald-600 mr-3 flex-shrink-0" />
                    <span className="text-slate-600">{gymData.phone}</span>
                  </li>
                  {gymData.website && (
                    <li className="flex">
                      <Globe size={18} className="text-emerald-600 mr-3 flex-shrink-0" />
                      <span className="text-slate-600">{gymData.website}</span>
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="text-md font-medium text-slate-800 mb-3">Hours & Location</h3>
                <ul className="space-y-3">
                  <li className="flex">
                    <Clock size={18} className="text-emerald-600 mr-3 flex-shrink-0" />
                    <span className="text-slate-600">{gymData.workingHours}</span>
                  </li>
                  <li className="flex">
                    <MapPin size={18} className="text-emerald-600 mr-3 flex-shrink-0" />
                    <span className="text-slate-600">{gymData.address.street}, {gymData.address.city}, {gymData.address.state} {gymData.address.zipCode}, {gymData.address.country}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Our Services & Amenities</h2>
              <button 
                onClick={() => toggleAccordion('services')}
                className="p-2 text-slate-600 hover:text-slate-900"
              >
                <ChevronDown 
                  size={20} 
                  className={`transform transition-transform ${expandedAccordions.services ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
            
            {expandedAccordions.services && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {gymData.services?.map((service, index) => (
                  <div 
                    key={index}
                    className="flex items-center p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="p-2 rounded-md bg-emerald-100 text-emerald-600 mr-3">
                      <Dumbbell size={16} />
                    </div>
                    <span className="text-slate-700">{service}</span>
                    
                    {editable && (
                      <button className="ml-auto text-slate-400 hover:text-slate-700">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                
                {editable && (
                  <button className="flex items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                    <Plus size={20} className="mr-2" />
                    Add Service
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Media Gallery</h2>
              
              {editable && (
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleFileUpload('gallery')}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center"
                  >
                    <Camera size={16} className="mr-2 text-emerald-600" />
                    Add Photo
                    <input 
                      ref={galleryInputRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </button>
                  
                  <button 
                    onClick={() => handleFileUpload('video')}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center"
                  >
                    <Film size={16} className="mr-2 text-emerald-600" />
                    Add Video
                    <input 
                      ref={videoInputRef}
                      type="file" 
                      accept="video/*" 
                      className="hidden" 
                    />
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gymData.gallery?.map((item) => (
                <div key={item.id} className="group relative rounded-lg overflow-hidden bg-slate-100 aspect-square">
                  {item.type === 'image' ? (
                    <img 
                      src={item.url} 
                      alt="Gallery image" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <img 
                        src={item.thumbnail} 
                        alt="Video thumbnail" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-slate-800/70 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {editable && (
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button className="p-2 bg-white/90 rounded-full text-slate-700 hover:text-emerald-600">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 bg-white/90 rounded-full text-slate-700 hover:text-red-600">
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {editable && (
                <button className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg aspect-square text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                  <Plus size={24} className="mb-2" />
                  <span className="text-sm">Add Media</span>
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Trainers Tab */}
        {activeTab === 'trainers' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Our Trainers</h2>
              <button 
                onClick={() => toggleAccordion('trainers')}
                className="p-2 text-slate-600 hover:text-slate-900"
              >
                <ChevronDown 
                  size={20} 
                  className={`transform transition-transform ${expandedAccordions.trainers ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
            
            {expandedAccordions.trainers && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {gymData.trainers?.map((trainer) => (
                  <div key={trainer.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="md:flex">
                      <div className="md:w-1/3 h-48 md:h-auto bg-slate-100">
                        {trainer.photo ? (
                          <img 
                            src={trainer.photo} 
                            alt={trainer.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users size={32} className="text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 md:w-2/3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-slate-800">{trainer.name}</h3>
                            <p className="text-emerald-600 text-sm">{trainer.position}</p>
                          </div>
                          {editable && (
                            <div className="flex space-x-1">
                              <button className="p-1 text-slate-400 hover:text-emerald-600">
                                <Edit size={16} />
                              </button>
                              <button className="p-1 text-slate-400 hover:text-red-600">
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="mt-3 text-slate-600 text-sm">{trainer.bio}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {editable && (
                  <button className="flex items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-colors h-48 md:h-auto">
                    <Plus size={24} className="mr-2" />
                    Add Trainer
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Class Schedule</h2>
              <button 
                onClick={() => toggleAccordion('classes')}
                className="p-2 text-slate-600 hover:text-slate-900"
              >
                <ChevronDown 
                  size={20} 
                  className={`transform transition-transform ${expandedAccordions.classes ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
            
            {expandedAccordions.classes && (
              <div className="mt-4 space-y-4">
                {gymData.classes?.map((cls) => (
                  <div 
                    key={cls.id}
                    className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-slate-800">{cls.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">{cls.description}</p>
                      </div>
                      {editable && (
                        <div className="flex space-x-1">
                          <button className="p-1 text-slate-400 hover:text-emerald-600">
                            <Edit size={16} />
                          </button>
                          <button className="p-1 text-slate-400 hover:text-red-600">
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center text-slate-600">
                        <Calendar size={16} className="mr-2 text-emerald-600" />
                        {cls.schedule}
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Users size={16} className="mr-2 text-emerald-600" />
                        Trainer: {cls.trainer}
                      </div>
                      <div className="flex items-center text-slate-600">
                        <CheckCircle size={16} className="mr-2 text-emerald-600" />
                        Capacity: {cls.capacity} people
                      </div>
                    </div>
                  </div>
                ))}
                
                {editable && (
                  <button className="flex items-center justify-center p-4 w-full border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                    <Plus size={20} className="mr-2" />
                    Add Class
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GymProfile; 