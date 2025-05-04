import { useState, useEffect, useRef } from 'react';
import { Plus, MapPin, Phone, Mail, Trash2, Edit, Loader, Building2, Image, Video, ArrowUpRight } from 'lucide-react';
import { gymService } from '../../lib/services';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError, showLoading, updateToast } from '../../utils/toast';
import { Link, useNavigate } from 'react-router-dom';
import { uploadToCloudinary } from '../../utils/cloudinary';

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
  phoneNumber: string;
  email: string;
  workingHours: {
    openTime: string;
    closeTime: string;
  };
  description: string;
  logo?: {
    url: string;
    public_id: string;
  };
  photos: Array<{
    _id: string;
    url: string;
    public_id: string;
    caption?: string;
  }>;
  videos: Array<{
    _id: string;
    url: string;
    public_id: string;
    caption?: string;
  }>;
}

interface Gym {
  _id: string;
  gymName: string;
}

interface CreateBranchData {
  branchName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phoneNumber: string;
  email: string;
  description: string;
  workingHours: {
    openTime: string;
    closeTime: string;
  };
  logo?: {
    url: string;
    public_id: string;
  };
}

const ManageBranches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [gym, setGym] = useState<Gym | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    branchName: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    phoneNumber: '',
    email: '',
    description: '',
    workingHours: {
      openTime: '09:00',
      closeTime: '21:00'
    }
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [savingBranch, setSavingBranch] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        
        // Fetch the gym first to display gym name
        const gyms = await gymService.getAllGyms() as Gym[];
        if (gyms && gyms.length > 0) {
          setGym(gyms[0]);
        }
        
        // Fetch branches (no need to specify gymId anymore)
        const response = await fetch('/api/branches');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch branches. Status: ${response.status}`);
        }
        
        const result = await response.json();
        setBranches(result.data);
        
        setLoading(false);
      } catch (error) {
        setLoading(false);
        showError('Failed to load branches');
        console.error('Error fetching branches:', error);
      }
    };
    
    if (user) {
      fetchBranches();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Handle nested address fields
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
    // Handle nested working hours fields
    else if (name === 'openTime' || name === 'closeTime') {
      setFormData(prev => ({
        ...prev,
        workingHours: {
          ...prev.workingHours,
          [name]: value
        }
      }));
    }
    // Handle regular fields
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLogoClick = () => {
    logoInputRef.current?.click();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.branchName.trim()) {
      errors.branchName = 'Branch name is required';
    }
    
    if (!formData.address.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!formData.address.country.trim()) {
      errors.country = 'Country is required';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (formData.phoneNumber && !/^\+?[0-9()-\s]{10,15}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Invalid phone number format';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSavingBranch(true);
    const toastId = showLoading('Creating branch...');
    
    try {
      // Prepare branch data matching the model structure
      const branchData: CreateBranchData = {
        branchName: formData.branchName,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        description: formData.description,
        workingHours: formData.workingHours
      };
      
      // If we have a logo, upload it first
      let logoData = null;
      if (logoFile) {
        // Upload logo to Cloudinary
        try {
          logoData = await uploadToCloudinary(logoFile, 'logo', gym?._id || '', 'gym');
        } catch (error) {
          console.error('Error uploading logo:', error);
          updateToast(toastId, 'Failed to upload logo', 'error');
          setSavingBranch(false);
          return;
        }
      }
      
      // If logo was uploaded, add it to branch data
      if (logoData) {
        branchData.logo = logoData;
      }
      
      // Create the branch
      const response = await fetch('/api/branches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(branchData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create branch. Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Add the new branch to the state
      setBranches([...branches, result.data]);
      
      // Reset form and close modal
      setFormData({
        branchName: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        phoneNumber: '',
        email: '',
        description: '',
        workingHours: {
          openTime: '09:00',
          closeTime: '21:00'
        }
      });
      setLogoFile(null);
      setLogoPreview(null);
      setShowAddModal(false);
      
      updateToast(toastId, 'Branch created successfully!', 'success');
    } catch (error) {
      console.error('Error creating branch:', error);
      updateToast(toastId, 'Failed to create branch', 'error');
    } finally {
      setSavingBranch(false);
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      return;
    }
    
    const toastId = showLoading('Deleting branch...');
    
    try {
      const response = await fetch(`/api/branches/${branchId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete branch. Status: ${response.status}`);
      }
      
      // Remove the branch from state
      setBranches(prev => prev.filter(branch => branch._id !== branchId));
      
      updateToast(toastId, 'Branch deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting branch:', error);
      updateToast(toastId, `Failed to delete branch: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const navigateToBranchMedia = (branchId: string) => {
    navigate(`/branch/${branchId}/media`);
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Management</h1>
          <p className="text-gray-600 mt-1">Manage all your gym branches in one place</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Branch
        </button>
      </div>

      {branches.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">No Branches Yet</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Start managing multiple locations by adding your first branch.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Branch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <div key={branch._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-100 h-32 relative">
                {branch.logo ? (
                  <img src={branch.logo.url} alt={branch.branchName} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Building2 className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => handleDeleteBranch(branch._id)}
                    className="p-2 bg-white rounded-full shadow hover:bg-gray-50"
                    title="Delete Branch"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                  <Link
                    to={`/branch/edit/${branch._id}`}
                    className="p-2 bg-white rounded-full shadow hover:bg-gray-50"
                    title="Edit Branch"
                  >
                    <Edit className="w-4 h-4 text-primary-600" />
                  </Link>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{branch.branchName}</h3>
                
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                    <span className="text-gray-700">
                      {branch.address.street && `${branch.address.street}, `}
                      {branch.address.city}, {branch.address.state} {branch.address.zipCode}, {branch.address.country}
                    </span>
                  </div>
                  
                  {branch.phoneNumber && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-700">{branch.phoneNumber}</span>
                    </div>
                  )}
                  
                  {branch.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-700">{branch.email}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <Image className="w-4 h-4 mr-1" />
                      <span>{branch.photos.length}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Video className="w-4 h-4 mr-1" />
                      <span>{branch.videos.length}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => navigateToBranchMedia(branch._id)}
                    className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800"
                  >
                    Manage Media
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Branch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Branch</h2>
            </div>
            
            <form onSubmit={handleAddBranch} className="p-6 space-y-6">
              {/* Branch Logo */}
              <div className="flex items-center space-x-6">
                <div
                  onClick={handleLogoClick}
                  className="relative w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary-500"
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Branch Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-10 h-10 text-gray-400" />
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Branch Logo</h3>
                  <p className="text-xs text-gray-500 mt-1">Optional. Click to upload an image.</p>
                </div>
              </div>
              
              {/* Basic Information */}
              <div>
                <label htmlFor="branchName" className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Name*
                </label>
                <input
                  type="text"
                  id="branchName"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.branchName ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                  required
                />
                {formErrors.branchName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.branchName}</p>
                )}
              </div>
              
              {/* Address */}
              <div className="mb-3">
                <label htmlFor="street" className="block text-sm font-medium mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  id="street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="123 Main St"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-1">
                    City*
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.city ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                    placeholder="New York"
                    required
                  />
                  {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="NY"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="10001"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium mb-1">
                    Country*
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.country ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                    placeholder="USA"
                    required
                  />
                  {formErrors.country && <p className="text-red-500 text-xs mt-1">{formErrors.country}</p>}
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.phoneNumber ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                  />
                  {formErrors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.email ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>
              </div>
              
              {/* Working Hours */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label htmlFor="openTime" className="block text-sm font-medium mb-1">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    id="openTime"
                    name="workingHours.openTime"
                    value={formData.workingHours.openTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="closeTime" className="block text-sm font-medium mb-1">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    id="closeTime"
                    name="workingHours.closeTime"
                    value={formData.workingHours.closeTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                ></textarea>
              </div>
              
              <div className="flex items-center justify-end pt-4 border-t border-gray-200 space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBranch}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {savingBranch && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  {savingBranch ? 'Creating...' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBranches; 