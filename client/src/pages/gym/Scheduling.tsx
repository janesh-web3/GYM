import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Clock, Users, MapPin, Filter, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError, showLoading, updateToast } from '../../utils/toast';
import { gymService } from '../../lib/services';

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
  recurring?: boolean;
  recurringPattern?: string;
}

interface GymResponse {
  _id: string;
  name: string;
  [key: string]: any;
}

const Scheduling = () => {
  const { user } = useAuth();
  const [gymId, setGymId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [filter, setFilter] = useState({
    date: '',
    trainer: '',
    type: '',
    searchQuery: ''
  });

  const [classes, setClasses] = useState<Class[]>([]);
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
    capacity: 1,
    currentBookings: 0,
    location: '',
    type: 'Group',
    price: 0,
    recurring: false,
    recurringPattern: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch gym associated with this owner
        const gyms = await gymService.getAllGyms() as GymResponse[];
        if (gyms && gyms.length > 0) {
          const gymId = gyms[0]._id;
          setGymId(gymId);
          
          // Fetch trainers first
          const trainersResponse = await fetch(`/api/trainers?gymId=${gymId}`);
          if (!trainersResponse.ok) {
            throw new Error('Failed to fetch trainers');
          }
          
          const trainersData = await trainersResponse.json();
          if (trainersData.success && trainersData.data) {
            setTrainers(trainersData.data.map((trainer: any) => ({
              id: trainer._id,
              name: trainer.name,
              specialization: trainer.specialization || 'General Fitness',
              image: trainer.image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'
            })));
          }
          
          // Then fetch classes/sessions
          const classesResponse = await fetch(`/api/sessions/gym/${gymId}`);
          if (!classesResponse.ok) {
            throw new Error('Failed to fetch classes');
          }
          
          const classesData = await classesResponse.json();
          if (classesData.success && classesData.data) {
            const mappedClasses = classesData.data.map((sessionData: any) => {
              // Find the trainer in our trainers array
              const trainerData = trainers.find(t => t.id === sessionData.trainerId?._id) || {
                id: sessionData.trainerId?._id || 'unknown',
                name: sessionData.trainerId?.name || 'Unknown Trainer',
                specialization: 'General Fitness',
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'
              };
              
              return {
                id: sessionData._id,
                title: sessionData.title,
                description: sessionData.description || '',
                trainer: trainerData,
                date: new Date(sessionData.date).toISOString().split('T')[0],
                startTime: sessionData.startTime,
                endTime: sessionData.endTime,
                capacity: sessionData.capacity || 10,
                currentBookings: sessionData.memberIds?.length || 0,
                location: sessionData.location || 'Main Gym Area',
                type: mapSessionType(sessionData.sessionType),
                price: sessionData.price || 0,
                recurring: sessionData.recurring || false,
                recurringPattern: sessionData.recurringPattern || ''
              };
            });
            
            setClasses(mappedClasses);
            setFilteredClasses(mappedClasses);
          }
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        showError('Failed to load class schedule');
        console.error('Error fetching class schedule:', error);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user]);

  // Helper function to map API session type to UI type
  const mapSessionType = (type: string): 'Group' | 'Personal' | 'Workshop' => {
    switch (type) {
      case 'individual':
        return 'Personal';
      case 'workshop':
        return 'Workshop';
      case 'group':
      default:
        return 'Group';
    }
  };

  // Helper function to map UI type to API session type
  const mapTypeToSessionType = (type: 'Group' | 'Personal' | 'Workshop'): string => {
    switch (type) {
      case 'Personal':
        return 'individual';
      case 'Workshop':
        return 'workshop';
      case 'Group':
      default:
        return 'group';
    }
  };

  // Apply filters to classes
  useEffect(() => {
    let result = [...classes];
    
    // Filter by date
    if (filter.date) {
      result = result.filter(c => c.date === filter.date);
    }
    
    // Filter by trainer
    if (filter.trainer) {
      result = result.filter(c => c.trainer.id === filter.trainer);
    }
    
    // Filter by type
    if (filter.type) {
      result = result.filter(c => c.type === filter.type);
    }
    
    // Filter by search query
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.description.toLowerCase().includes(query) ||
        c.location.toLowerCase().includes(query)
      );
    }
    
    setFilteredClasses(result);
  }, [classes, filter]);

  const handleAddClass = async () => {
    if (!gymId) {
      showError('No gym associated with this account');
      return;
    }
    
    if (!newClass.title || !newClass.date || !newClass.startTime || !newClass.endTime || !newClass.trainer.id) {
      showError('Please fill all required fields');
      return;
    }
    
    const toastId = showLoading('Creating new class...');
    setSaving(true);
    
    try {
      // Format data for API
      const classData = {
        title: newClass.title,
        description: newClass.description,
        gymId: gymId,
        trainerId: newClass.trainer.id,
        date: new Date(newClass.date).toISOString(),
        startTime: newClass.startTime,
        endTime: newClass.endTime,
        capacity: newClass.capacity,
        sessionType: mapTypeToSessionType(newClass.type),
        location: newClass.location,
        price: newClass.price,
        recurring: newClass.recurring || false,
        recurringPattern: newClass.recurringPattern || ''
      };
      
      // Call API to create class
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create class');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Format the returned data to match our Class interface
        const createdClass: Class = {
          id: data.data._id,
          title: data.data.title,
          description: data.data.description || '',
          trainer: {
            id: data.data.trainerId,
            name: trainers.find(t => t.id === data.data.trainerId)?.name || 'Unknown',
            specialization: trainers.find(t => t.id === data.data.trainerId)?.specialization || '',
            image: trainers.find(t => t.id === data.data.trainerId)?.image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'
          },
          date: new Date(data.data.date).toISOString().split('T')[0],
          startTime: data.data.startTime,
          endTime: data.data.endTime,
          capacity: data.data.capacity || 10,
          currentBookings: 0,
          location: data.data.location || 'Main Gym Area',
          type: mapSessionType(data.data.sessionType),
          price: data.data.price || 0,
          recurring: data.data.recurring || false,
          recurringPattern: data.data.recurringPattern || ''
        };
        
        setClasses(prev => [...prev, createdClass]);
    setIsAddModalOpen(false);
        
        // Reset form
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
          capacity: 1,
      currentBookings: 0,
      location: '',
      type: 'Group',
      price: 0,
          recurring: false,
          recurringPattern: ''
        });
        
        updateToast(toastId, 'Class created successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to create class');
      }
      
      setSaving(false);
    } catch (error) {
      setSaving(false);
      updateToast(toastId, 'Failed to create class', 'error');
      console.error('Error creating class:', error);
    }
  };

  const handleEditClass = async () => {
    if (!selectedClass || !gymId) {
      showError('No class selected or gym associated with this account');
      return;
    }
    
    const toastId = showLoading('Updating class...');
    setSaving(true);
    
    try {
      // Format data for API
      const classData = {
        title: selectedClass.title,
        description: selectedClass.description,
        gymId: gymId,
        trainerId: selectedClass.trainer.id,
        date: new Date(selectedClass.date).toISOString(),
        startTime: selectedClass.startTime,
        endTime: selectedClass.endTime,
        capacity: selectedClass.capacity,
        sessionType: mapTypeToSessionType(selectedClass.type),
        location: selectedClass.location,
        price: selectedClass.price,
        recurring: selectedClass.recurring || false,
        recurringPattern: selectedClass.recurringPattern || ''
      };
      
      // Call API to update class
      const response = await fetch(`/api/sessions/${selectedClass.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update class');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setClasses(prev =>
          prev.map(cls => (cls.id === selectedClass.id ? selectedClass : cls))
        );
        
    setIsEditModalOpen(false);
    setSelectedClass(null);
        
        updateToast(toastId, 'Class updated successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to update class');
      }
      
      setSaving(false);
    } catch (error) {
      setSaving(false);
      updateToast(toastId, 'Failed to update class', 'error');
      console.error('Error updating class:', error);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!gymId) {
      showError('No gym associated with this account');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this class?')) {
      return;
    }
    
    const toastId = showLoading('Deleting class...');
    
    try {
      // Call API to delete class
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete class');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setClasses(prev => prev.filter(cls => cls.id !== id));
        
        updateToast(toastId, 'Class deleted successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to delete class');
      }
    } catch (error) {
      updateToast(toastId, 'Failed to delete class', 'error');
      console.error('Error deleting class:', error);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Class
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={filter.date}
                onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trainer
            </label>
            <select
              value={filter.trainer}
              onChange={(e) => setFilter({ ...filter, trainer: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">All Trainers</option>
              {trainers.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class Type
            </label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value as any })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">All Types</option>
              <option value="Group">Group</option>
              <option value="Personal">Personal</option>
              <option value="Workshop">Workshop</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search classes..."
                value={filter.searchQuery}
                onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No classes found. Try adjusting your filters or add a new class.</p>
          </div>
        ) : (
          filteredClasses.map((classItem) => (
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
                    {classItem.recurring && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {classItem.recurringPattern || 'Recurring'}
                      </span>
                    )}
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
                  {classItem.price > 0 && (
                <div className="ml-auto text-sm font-medium text-gray-900">
                  ${classItem.price}
                </div>
                  )}
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Add Class Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Add New Class</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title *
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
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Trainer *
                </label>
                <select
                  value={newClass.trainer.id}
                  onChange={(e) => {
                    const selectedTrainer = trainers.find(t => t.id === e.target.value);
                    setNewClass({
                      ...newClass,
                      trainer: selectedTrainer
                        ? {
                            id: selectedTrainer.id,
                            name: selectedTrainer.name,
                            specialization: selectedTrainer.specialization,
                            image: selectedTrainer.image
                          }
                        : { id: '', name: '', specialization: '', image: '' }
                    });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Select a trainer</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name} - {trainer.specialization}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date *
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
                    Start Time *
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
                    End Time *
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
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={newClass.capacity}
                    onChange={(e) =>
                      setNewClass({
                        ...newClass,
                        capacity: parseInt(e.target.value) || 1,
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
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="flex items-center">
                <input
                      type="checkbox"
                      checked={newClass.recurring || false}
                  onChange={(e) =>
                        setNewClass({
                          ...newClass,
                          recurring: e.target.checked,
                        })
                  }
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                    <span className="ml-2 text-sm text-gray-700">Recurring Class</span>
                </label>
                  {newClass.recurring && (
                <select
                      value={newClass.recurringPattern || ''}
                  onChange={(e) =>
                    setNewClass({
                      ...newClass,
                          recurringPattern: e.target.value,
                        })
                      }
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="">Select pattern</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                </select>
                  )}
                </div>
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
                disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add Class'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {isEditModalOpen && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
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
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Trainer
                </label>
                <select
                  value={selectedClass.trainer.id}
                  onChange={(e) => {
                    const selectedTrainer = trainers.find(t => t.id === e.target.value);
                    setSelectedClass({
                      ...selectedClass,
                      trainer: selectedTrainer
                        ? {
                            id: selectedTrainer.id,
                            name: selectedTrainer.name,
                            specialization: selectedTrainer.specialization,
                            image: selectedTrainer.image
                          }
                        : selectedClass.trainer
                    });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name} - {trainer.specialization}
                    </option>
                  ))}
                </select>
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
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={selectedClass.capacity}
                    onChange={(e) =>
                      setSelectedClass({
                        ...selectedClass,
                        capacity: parseInt(e.target.value) || 1,
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
                        price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
                <div className="flex flex-col">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedClass.recurring || false}
                      onChange={(e) =>
                        setSelectedClass({
                          ...selectedClass,
                          recurring: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Recurring Class</span>
                </label>
                  {selectedClass.recurring && (
                <select
                      value={selectedClass.recurringPattern || ''}
                  onChange={(e) =>
                    setSelectedClass({
                      ...selectedClass,
                          recurringPattern: e.target.value,
                        })
                      }
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="">Select pattern</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                </select>
                  )}
                </div>
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
                disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduling; 