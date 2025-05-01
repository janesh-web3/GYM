import { useState, useEffect } from 'react';
import { User, Edit2, Save, X, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showError, showSuccess } from '../../utils/toast';

interface ProfileData {
  name: string;
  email: string;
  age: number;
  weight: number;
  height: number;
  membershipType: string;
  joinDate: string;
  image: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    age: 0,
    weight: 0,
    height: 0,
    membershipType: '',
    joinDate: '',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/members/${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setProfile({
            name: data.data.name || '',
            email: data.data.email || '',
            age: data.data.age || 0,
            weight: data.data.progressMetrics?.weight?.[0]?.value || 0,
            height: data.data.progressMetrics?.height?.[0]?.value || 0,
            membershipType: data.data.membershipType || 'Standard',
            joinDate: data.data.joinedDate || new Date().toISOString(),
            image: data.data.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        showError('Failed to load profile data');
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);

  const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height) return '0.0';
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const bmi = calculateBMI(profile.weight, profile.height);
  const bmiCategory = getBMICategory(parseFloat(bmi));

  const handleSave = async () => {
    try {
      setIsEditing(false);
      
      // Make API call to update profile
      const response = await fetch(`/api/members/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          age: profile.age
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      // If weight or height changed, add a new progress metric
      if (profile.weight > 0 || profile.height > 0) {
        if (profile.weight > 0) {
          await fetch(`/api/members/${user?.id}/progress/weight`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              value: profile.weight,
              unit: 'kg',
            }),
          });
        }
        
        if (profile.height > 0) {
          await fetch(`/api/members/${user?.id}/progress/height`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              value: profile.height,
              unit: 'cm',
            }),
          });
        }
      }
      
      showSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile');
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
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col items-center">
              <img
                src={profile.image}
                alt={profile.name}
                className="w-32 h-32 rounded-full mb-4"
              />
              <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
              <p className="text-gray-500">{profile.email}</p>
              <div className="mt-4 w-full">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Membership</span>
                  <span className="text-sm font-medium">{profile.membershipType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Member Since</span>
                  <span className="text-sm font-medium">
                    {new Date(profile.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.age} years</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.weight} kg</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: parseFloat(e.target.value) })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.height} cm</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">BMI Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">BMI</p>
                <p className="text-2xl font-bold text-gray-900">{bmi}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-2xl font-bold text-gray-900">{bmiCategory}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Healthy Range</p>
                <p className="text-2xl font-bold text-gray-900">18.5 - 24.9</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 