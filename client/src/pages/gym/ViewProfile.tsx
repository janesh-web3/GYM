import { useState } from 'react';
import GymProfile from '../../components/GymProfile';

const ViewProfile = () => {
  const [isEditable, setIsEditable] = useState(false);
  
  const handleSave = (gymData: any) => {
    console.log('Saving gym data:', gymData);
    // In a real application, you would save the data to your backend
    // and then disable edit mode
    setIsEditable(false);
  };
  
  return (
    <div className="pb-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Gym Profile</h1>
        <button
          onClick={() => setIsEditable(!isEditable)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isEditable
              ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {isEditable ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </div>
      
      <GymProfile 
        editable={isEditable}
        onSave={handleSave}
      />
    </div>
  );
};

export default ViewProfile; 