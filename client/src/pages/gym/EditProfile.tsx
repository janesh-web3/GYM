import { useState } from 'react';
import { Camera, MapPin, Phone, Mail, Globe, Clock } from 'lucide-react';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    gymName: 'Fitness First',
    address: '123 Fitness Street, New York, NY 10001',
    phone: '+1 (555) 123-4567',
    email: 'contact@fitnessfirst.com',
    website: 'www.fitnessfirst.com',
    workingHours: '6:00 AM - 10:00 PM',
    description: 'A state-of-the-art fitness center with expert trainers and modern equipment.',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Gym Profile</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div className="flex items-center space-x-6">
            <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center">
              <Camera size={32} className="text-gray-400" />
            </div>
            <div>
              <button
                type="button"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Upload Logo
              </button>
              <p className="mt-2 text-sm text-gray-500">
                Recommended size: 300x300px, JPG or PNG
              </p>
            </div>
          </div>

          {/* Gym Name */}
          <div>
            <label htmlFor="gymName" className="block text-sm font-medium text-gray-700">
              Gym Name
            </label>
            <input
              type="text"
              id="gymName"
              name="gymName"
              value={formData.gymName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
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
                  className="block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Website and Working Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="workingHours" className="block text-sm font-medium text-gray-700">
                Working Hours
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="workingHours"
                  name="workingHours"
                  value={formData.workingHours}
                  onChange={handleChange}
                  className="block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile; 