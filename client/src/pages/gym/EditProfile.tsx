import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Camera, MapPin, Phone, Mail, Globe, Clock, Loader, Save, Image as ImageIcon } from 'lucide-react';
import { gymService } from '../../lib/services';
import { showSuccess, showError, showLoading, updateToast } from '../../utils/toast';
import { useAuth } from '../../context/AuthContext';
import { uploadToCloudinary } from '../../utils/cloudinary';

interface GymProfile {
  _id: string;
  gymName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  email: string;
  phone: string;
  website?: string;
  workingHours?: {
    openTime: string;
    closeTime: string;
  };
  description: string;
  logo?: string;
  photos?: Array<{url: string, public_id: string}>;
  videos?: Array<{url: string, public_id: string}>;
  status: string;
}

interface GymResponse {
  _id: string;
  gymName: string;
  [key: string]: any;
}

const EditProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gymId, setGymId] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    gymName: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    phone: '',
    email: '',
    website: '',
    workingHours: {
      openTime: '09:00',
      closeTime: '21:00'
    },
    description: '',
  });

  useEffect(() => {
    const fetchGymProfile = async () => {
      try {
        setLoading(true);
        // In a real app, we'd fetch the gym ID associated with this owner
        // For now, we'll assume the first gym returned is the owner's gym
        const gyms = await gymService.getAllGyms() as GymResponse[];
        if (gyms && gyms.length > 0) {
          const gymData = await gymService.getGymById(gyms[0]._id) as GymProfile;
          setGymId(gymData._id);
          setFormData({
            gymName: gymData.gymName || '',
            address: gymData.address || {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: ''
            },
            phone: gymData.phone || '',
            email: gymData.email || '',
            website: gymData.website || '',
            workingHours: gymData.workingHours || {
              openTime: '09:00',
              closeTime: '21:00'
            },
            description: gymData.description || '',
          });
          if (gymData.logo) {
            setLogoPreview(gymData.logo);
          }
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        showError('Failed to load gym profile');
        console.error('Error fetching gym profile:', error);
      }
    };

    if (user) {
      fetchGymProfile();
    }
  }, [user]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate gym name
    if (!formData.gymName.trim()) {
      errors.gymName = 'Gym name is required';
    }

    // Validate email
    if (formData.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // Validate phone number
    if (formData.phone) {
      const phonePattern = /^\+?[0-9()-\s]{10,15}$/;
      if (!phonePattern.test(formData.phone)) {
        errors.phone = 'Please enter a valid phone number';
      }
    }

    // Validate website URL
    if (formData.website) {
      try {
        new URL(formData.website.startsWith('http') ? formData.website : `https://${formData.website}`);
      } catch (e) {
        errors.website = 'Please enter a valid website URL';
      }
    }

    // Required fields in address
    if (!formData.address.city.trim()) {
      errors['address.city'] = 'City is required';
    }

    if (!formData.address.country.trim()) {
      errors['address.country'] = 'Country is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Handle address fields separately
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } 
    // Handle working hours fields
    else if (name.startsWith('workingHours.')) {
      const hoursField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        workingHours: {
          ...prev.workingHours,
          [hoursField]: value
        }
      }));
    } 
    // Handle other fields
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        showError('Logo image must be less than 2MB');
        return;
      }
      
      // Check file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
        showError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }
      
      setLogoFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(formErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    if (!gymId) {
      showError('No gym found to update');
      return;
    }
    
    const toastId = showLoading('Saving changes...');
    
    try {
      setSaving(true);
      
      // Upload logo if changed
      let logoUrl = logoPreview;
      if (logoFile) {
        try {
          // Upload to Cloudinary via our backend
          const uploadResult = await uploadToCloudinary(logoFile, 'logo', gymId);
          logoUrl = uploadResult.url;
        } catch (error) {
          console.error('Error uploading logo:', error);
          updateToast(toastId, 'Failed to upload logo image.', 'error');
          setSaving(false);
          return;
        }
      }
      
      // Prepare the update data including logo URL if changed
      const updateData = {
        gymName: formData.gymName,
        address: formData.address,
        phoneNumber: formData.phone, // Make sure this matches the model field
        email: formData.email,
        website: formData.website,
        workingHours: formData.workingHours,
        description: formData.description,
        logo: logoUrl
      };
      
      // Update the gym
      await gymService.updateGym(gymId, updateData);
      
      setSaving(false);
      updateToast(toastId, 'Gym profile updated successfully!', 'success');
    } catch (error) {
      setSaving(false);
      updateToast(toastId, 'Failed to update gym profile.', 'error');
      console.error('Error updating gym profile:', error);
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
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Gym Profile</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div className="flex items-center space-x-6">
            <div className="relative w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden group">
              {logoPreview ? (
                <img src={logoPreview} alt="Gym Logo" className="w-full h-full object-cover" />
              ) : (
                <Camera size={32} className="text-gray-400" />
              )}
              
              <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-white text-sm font-medium">Change Logo</span>
                <input 
                  type="file" 
                  className="sr-only" 
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleLogoChange} 
                />
              </label>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Gym Logo</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload a logo for your gym. Recommended size: 512x512px.
              </p>
              <label className="mt-2 inline-flex items-center text-sm text-primary-600 cursor-pointer hover:text-primary-800">
                <Camera size={16} className="mr-1" />
                <span>Upload New Logo</span>
                <input 
                  type="file" 
                  className="sr-only" 
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleLogoChange} 
                />
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
            <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="gymName" className="block text-sm font-medium text-gray-700">
                  Gym Name*
                </label>
                <input
                  type="text"
                  id="gymName"
                  name="gymName"
                  value={formData.gymName}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    formErrors.gymName ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500`}
                />
                {formErrors.gymName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.gymName}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`block w-full pl-10 rounded-md border ${
                      formErrors.phone ? 'border-red-300' : 'border-gray-300'
                    } px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 rounded-md border ${
                      formErrors.email ? 'border-red-300' : 'border-gray-300'
                    } px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500`}
                    placeholder="gym@example.com"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className={`block w-full pl-10 rounded-md border ${
                      formErrors.website ? 'border-red-300' : 'border-gray-300'
                    } px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500`}
                    placeholder="www.example.com"
                  />
                </div>
                {formErrors.website && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.website}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="workingHours" className="block text-sm font-medium text-gray-700">
                  Working Hours
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  <div className="relative rounded-md shadow-sm flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="time"
                      id="openTime"
                      name="workingHours.openTime"
                      value={formData.workingHours.openTime}
                      onChange={handleChange}
                      className="block w-full pl-10 rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                    />
                  </div>
                  <span className="text-gray-500">to</span>
                  <div className="relative rounded-md shadow-sm flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="time"
                      id="closeTime"
                      name="workingHours.closeTime"
                      value={formData.workingHours.closeTime}
                      onChange={handleChange}
                      className="block w-full pl-10 rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h2 className="text-lg font-medium text-gray-900">Address</h2>
            <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="block w-full pl-10 rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City*
                </label>
                <input
                  type="text"
                  id="city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    formErrors['address.city'] ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500`}
                />
                {formErrors['address.city'] && (
                  <p className="mt-1 text-sm text-red-600">{formErrors['address.city']}</p>
                )}
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State / Province
                </label>
                <input
                  type="text"
                  id="state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                  ZIP / Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country*
                </label>
                <input
                  type="text"
                  id="country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    formErrors['address.country'] ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500`}
                />
                {formErrors['address.country'] && (
                  <p className="mt-1 text-sm text-red-600">{formErrors['address.country']}</p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Gym Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              placeholder="Tell potential members about your gym..."
            ></textarea>
          </div>

          {/* Media Upload Link */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-primary-50 p-4 rounded-lg">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="bg-primary-100 p-2 rounded-full">
                <ImageIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">Showcase Your Gym</h3>
                <p className="text-sm text-gray-500">Upload photos and videos of your facilities</p>
              </div>
            </div>
            <a 
              href="/gym/upload-media" 
              className="inline-flex items-center px-4 py-2 border border-primary-500 text-primary-600 rounded-md hover:bg-primary-50 font-medium text-sm"
            >
              Manage Media
            </a>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile; 