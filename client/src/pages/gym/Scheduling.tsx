import { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, Clock, Users, MapPin } from 'lucide-react';

interface Trainer {
  id: string;
  name: string;
  specialization: string;
  image: string;
}

interface Class {
  id: string;
  title: string;
  description: string;
  trainer: Trainer;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  currentBookings: number;
  location: string;
  type: 'Group' | 'Personal' | 'Workshop';
  price: number;
}

const Scheduling = () => {
  const [classes, setClasses] = useState<Class[]>([
    {
      id: '1',
      title: 'Morning Yoga',
      description: 'Start your day with a peaceful yoga session',
      trainer: {
        id: '1',
        name: 'Sarah Johnson',
        specialization: 'Yoga & Meditation',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
      },
      date: '2024-05-01',
      startTime: '07:00',
      endTime: '08:00',
      capacity: 20,
      currentBookings: 15,
      location: 'Studio A',
      type: 'Group',
      price: 15,
    },
    {
      id: '2',
      title: 'Personal Training',
      description: 'One-on-one training session',
      trainer: {
        id: '2',
        name: 'Mike Smith',
        specialization: 'Strength Training',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
      },
      date: '2024-05-01',
      startTime: '10:00',
      endTime: '11:00',
      capacity: 1,
      currentBookings: 1,
      location: 'Private Room',
      type: 'Personal',
      price: 50,
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const [newClass, setNewClass] = useState<Omit<Class, 'id'>>({
    title: '',
    description: '',
    trainer: {
      id: '',
      name: '',
      specialization: '',
      image: '',
    },
    date: '',
    startTime: '',
    endTime: '',
    capacity: 0,
    currentBookings: 0,
    location: '',
    type: 'Group',
    price: 0,
  });

  const handleAddClass = () => {
    const classItem: Class = {
      ...newClass,
      id: Date.now().toString(),
    };
    setClasses((prev) => [...prev, classItem]);
    setIsAddModalOpen(false);
    setNewClass({
      title: '',
      description: '',
      trainer: {
        id: '',
        name: '',
        specialization: '',
        image: '',
      },
      date: '',
      startTime: '',
      endTime: '',
      capacity: 0,
      currentBookings: 0,
      location: '',
      type: 'Group',
      price: 0,
    });
  };

  const handleEditClass = () => {
    if (!selectedClass) return;
    setClasses((prev) =>
      prev.map((classItem) => (classItem.id === selectedClass.id ? selectedClass : classItem))
    );
    setIsEditModalOpen(false);
    setSelectedClass(null);
  };

  const handleDeleteClass = (id: string) => {
    setClasses((prev) => prev.filter((classItem) => classItem.id !== id));
  };

  const getTypeColor = (type: Class['type']) => {
    switch (type) {
      case 'Group':
        return 'bg-blue-100 text-blue-800';
      case 'Personal':
        return 'bg-purple-100 text-purple-800';
      case 'Workshop':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <div
            key={classItem.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {classItem.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(
                      classItem.type
                    )}`}
                  >
                    {classItem.type}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedClass(classItem);
                      setIsEditModalOpen(true);
                    }}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteClass(classItem.id)}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{classItem.description}</p>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(classItem.date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {classItem.startTime} - {classItem.endTime}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {classItem.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {classItem.currentBookings}/{classItem.capacity} spots filled
                </div>
              </div>

              <div className="mt-4 flex items-center">
                <img
                  src={classItem.trainer.image}
                  alt={classItem.trainer.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {classItem.trainer.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {classItem.trainer.specialization}
                  </div>
                </div>
                <div className="ml-auto text-sm font-medium text-gray-900">
                  ${classItem.price}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Class Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Class</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={newClass.title}
                  onChange={(e) =>
                    setNewClass({ ...newClass, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newClass.description}
                  onChange={(e) =>
                    setNewClass({ ...newClass, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newClass.date}
                    onChange={(e) =>
                      setNewClass({ ...newClass, date: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={newClass.type}
                    onChange={(e) =>
                      setNewClass({
                        ...newClass,
                        type: e.target.value as Class['type'],
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="Group">Group</option>
                    <option value="Personal">Personal</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newClass.startTime}
                    onChange={(e) =>
                      setNewClass({ ...newClass, startTime: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newClass.endTime}
                    onChange={(e) =>
                      setNewClass({ ...newClass, endTime: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={newClass.capacity}
                    onChange={(e) =>
                      setNewClass({
                        ...newClass,
                        capacity: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={newClass.price}
                    onChange={(e) =>
                      setNewClass({
                        ...newClass,
                        price: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  value={newClass.location}
                  onChange={(e) =>
                    setNewClass({ ...newClass, location: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Trainer
                </label>
                <select
                  value={newClass.trainer.id}
                  onChange={(e) =>
                    setNewClass({
                      ...newClass,
                      trainer: {
                        id: e.target.value,
                        name: e.target.options[e.target.selectedIndex].text,
                        specialization: '',
                        image: '',
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Select Trainer</option>
                  <option value="1">Sarah Johnson (Yoga & Meditation)</option>
                  <option value="2">Mike Smith (Strength Training)</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClass}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Add Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {isEditModalOpen && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Class</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={selectedClass.title}
                  onChange={(e) =>
                    setSelectedClass({
                      ...selectedClass,
                      title: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={selectedClass.description}
                  onChange={(e) =>
                    setSelectedClass({
                      ...selectedClass,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedClass.date}
                    onChange={(e) =>
                      setSelectedClass({
                        ...selectedClass,
                        date: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={selectedClass.type}
                    onChange={(e) =>
                      setSelectedClass({
                        ...selectedClass,
                        type: e.target.value as Class['type'],
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="Group">Group</option>
                    <option value="Personal">Personal</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={selectedClass.startTime}
                    onChange={(e) =>
                      setSelectedClass({
                        ...selectedClass,
                        startTime: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={selectedClass.endTime}
                    onChange={(e) =>
                      setSelectedClass({
                        ...selectedClass,
                        endTime: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={selectedClass.capacity}
                    onChange={(e) =>
                      setSelectedClass({
                        ...selectedClass,
                        capacity: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={selectedClass.price}
                    onChange={(e) =>
                      setSelectedClass({
                        ...selectedClass,
                        price: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  value={selectedClass.location}
                  onChange={(e) =>
                    setSelectedClass({
                      ...selectedClass,
                      location: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Trainer
                </label>
                <select
                  value={selectedClass.trainer.id}
                  onChange={(e) =>
                    setSelectedClass({
                      ...selectedClass,
                      trainer: {
                        ...selectedClass.trainer,
                        id: e.target.value,
                        name: e.target.options[e.target.selectedIndex].text,
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="1">Sarah Johnson (Yoga & Meditation)</option>
                  <option value="2">Mike Smith (Strength Training)</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedClass(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditClass}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduling; 