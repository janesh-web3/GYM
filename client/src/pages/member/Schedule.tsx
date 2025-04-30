import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface Class {
  id: string;
  title: string;
  trainer: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  location: string;
  type: 'group' | 'personal';
  status: 'upcoming' | 'completed' | 'cancelled';
}

const Schedule = () => {
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [classes] = useState<Class[]>([
    {
      id: '1',
      title: 'Morning Yoga',
      trainer: 'Sarah Johnson',
      date: '2024-05-01',
      startTime: '08:00',
      endTime: '09:00',
      capacity: 20,
      booked: 15,
      location: 'Studio A',
      type: 'group',
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'Personal Training',
      trainer: 'Mike Smith',
      date: '2024-05-02',
      startTime: '10:00',
      endTime: '11:00',
      capacity: 1,
      booked: 1,
      location: 'Training Room 1',
      type: 'personal',
      status: 'upcoming'
    },
    {
      id: '3',
      title: 'HIIT Class',
      trainer: 'Emma Wilson',
      date: '2024-04-30',
      startTime: '18:00',
      endTime: '19:00',
      capacity: 15,
      booked: 12,
      location: 'Studio B',
      type: 'group',
      status: 'completed'
    }
  ]);

  const toggleClass = (id: string) => {
    setExpandedClass(expandedClass === id ? null : id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-gray-500">View and manage your class bookings</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            <span>May 2024</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {classes.map((classItem) => (
          <div key={classItem.id} className="border-b last:border-b-0">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => toggleClass(classItem.id)}
            >
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg text-primary-600 mr-3">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{classItem.title}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{classItem.trainer}</span>
                    <span className="mx-2">•</span>
                    <span>{classItem.date}</span>
                    <span className="mx-2">•</span>
                    <span>{classItem.startTime} - {classItem.endTime}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(classItem.status)}`}>
                  {classItem.status.charAt(0).toUpperCase() + classItem.status.slice(1)}
                </span>
                {expandedClass === classItem.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
            
            {expandedClass === classItem.id && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>Location</span>
                    </div>
                    <p className="text-gray-900">{classItem.location}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Users className="w-4 h-4 mr-1" />
                      <span>Capacity</span>
                    </div>
                    <p className="text-gray-900">{classItem.booked}/{classItem.capacity}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  {classItem.status === 'upcoming' && (
                    <>
                      <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                        <XCircle className="w-4 h-4 mr-2 inline" />
                        Cancel Booking
                      </button>
                      <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                        <CheckCircle2 className="w-4 h-4 mr-2 inline" />
                        Check In
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule; 