import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, Dumbbell, Target, Users, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError, showLoading, updateToast } from '../../utils/toast';
import { gymService } from '../../lib/services';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restTime: string;
  duration?: number;
  instructions?: string;
  targetMuscleGroup?: string;
}

interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  goal: string;
  frequency: number;
  exercises: Exercise[];
  image?: string;
  gymId?: string;
  createdBy?: string;
}

interface GymResponse {
  _id: string;
  name: string;
  [key: string]: any;
}

const WorkoutPlans = () => {
  const { user } = useAuth();
  const [gymId, setGymId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);

  const [newPlan, setNewPlan] = useState<Omit<WorkoutPlan, 'id'>>({
    title: '',
    description: '',
    duration: '4',
    level: 'beginner',
    goal: 'general_fitness',
    frequency: 3,
    exercises: [],
    image: '',
  });

  const [newExercise, setNewExercise] = useState<Omit<Exercise, 'id'>>({
    name: '',
    sets: 3,
    reps: 10,
    restTime: '60',
    instructions: '',
    targetMuscleGroup: '',
  });

  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      try {
        setLoading(true);
        // In a real app, we'd fetch the gym ID associated with this owner
        const gyms = await gymService.getAllGyms() as GymResponse[];
        if (gyms && gyms.length > 0) {
          const gymId = gyms[0]._id;
          setGymId(gymId);
          
          // Fetch workout plans from API
          const response = await fetch(`/api/workout-plans?gymId=${gymId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch workout plans');
          }
          
          const data = await response.json();
          if (data.success && data.data) {
            setWorkoutPlans(data.data.map((plan: any) => ({
              id: plan._id,
              title: plan.title,
              description: plan.description,
              duration: plan.duration.toString(),
              level: plan.level,
              goal: plan.goal,
              frequency: plan.frequency,
              exercises: plan.exercises.map((ex: any) => ({
                id: ex._id,
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                restTime: ex.restTime.toString(),
                duration: ex.duration,
                instructions: ex.instructions,
                targetMuscleGroup: ex.targetMuscleGroup
              })),
              image: plan.image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
              gymId: plan.gymId,
              createdBy: plan.createdBy
            })));
          }
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        showError('Failed to load workout plans');
        console.error('Error fetching workout plans:', error);
      }
    };
    
    if (user) {
      fetchWorkoutPlans();
    }
  }, [user]);

  const handleAddExercise = () => {
    if (!newExercise.name || newExercise.sets <= 0 || newExercise.reps <= 0) {
      showError('Please fill all required exercise fields');
      return;
    }
    
    const exercise: Exercise = {
      ...newExercise,
      id: Date.now().toString(),
    };
    
    setNewPlan((prev) => ({
      ...prev,
      exercises: [...prev.exercises, exercise],
    }));
    
    setNewExercise({
      name: '',
      sets: 3,
      reps: 10,
      restTime: '60',
      instructions: '',
      targetMuscleGroup: '',
    });
  };

  const handleAddPlan = async () => {
    if (!gymId) {
      showError('No gym associated with this account');
      return;
    }
    
    if (!newPlan.title || !newPlan.duration || newPlan.exercises.length === 0) {
      showError('Please fill all required fields and add at least one exercise');
      return;
    }
    
    const toastId = showLoading('Creating workout plan...');
    setSaving(true);
    
    try {
      // Prepare workout plan for API
      const planData = {
        title: newPlan.title,
        description: newPlan.description,
        exercises: newPlan.exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          restTime: parseInt(ex.restTime),
          duration: ex.duration || 0,
          instructions: ex.instructions || '',
          targetMuscleGroup: ex.targetMuscleGroup || ''
        })),
        duration: parseInt(newPlan.duration),
        level: newPlan.level,
        goal: newPlan.goal,
        frequency: newPlan.frequency,
        gymId: gymId,
        isTemplate: true
      };
      
      // Call API to create workout plan
      const response = await fetch('/api/workout-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create workout plan');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const createdPlan: WorkoutPlan = {
          id: data.data._id,
          title: data.data.title,
          description: data.data.description,
          duration: data.data.duration.toString(),
          level: data.data.level,
          goal: data.data.goal,
          frequency: data.data.frequency,
          exercises: data.data.exercises.map((ex: any) => ({
            id: ex._id,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            restTime: ex.restTime.toString(),
            duration: ex.duration,
            instructions: ex.instructions,
            targetMuscleGroup: ex.targetMuscleGroup
          })),
          image: newPlan.image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
          gymId: data.data.gymId,
          createdBy: data.data.createdBy
        };
        
        setWorkoutPlans((prev) => [...prev, createdPlan]);
        setIsAddModalOpen(false);
        setNewPlan({
          title: '',
          description: '',
          duration: '4',
          level: 'beginner',
          goal: 'general_fitness',
          frequency: 3,
          exercises: [],
          image: '',
        });
        
        updateToast(toastId, 'Workout plan created successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to create workout plan');
      }
      
      setSaving(false);
    } catch (error) {
      setSaving(false);
      updateToast(toastId, 'Failed to create workout plan', 'error');
      console.error('Error creating workout plan:', error);
    }
  };

  const handleEditPlan = async () => {
    if (!selectedPlan || !gymId) {
      showError('No workout plan selected or gym associated with this account');
      return;
    }
    
    const toastId = showLoading('Updating workout plan...');
    setSaving(true);
    
    try {
      // Prepare workout plan for API
      const planData = {
        title: selectedPlan.title,
        description: selectedPlan.description,
        exercises: selectedPlan.exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          restTime: parseInt(ex.restTime),
          duration: ex.duration || 0,
          instructions: ex.instructions || '',
          targetMuscleGroup: ex.targetMuscleGroup || ''
        })),
        duration: parseInt(selectedPlan.duration),
        level: selectedPlan.level,
        goal: selectedPlan.goal,
        frequency: selectedPlan.frequency,
        gymId: gymId,
        isTemplate: true
      };
      
      // Call API to update workout plan
      const response = await fetch(`/api/workout-plans/${selectedPlan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update workout plan');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setWorkoutPlans((prev) =>
          prev.map((plan) => (plan.id === selectedPlan.id ? selectedPlan : plan))
        );
        
        setIsEditModalOpen(false);
        setSelectedPlan(null);
        
        updateToast(toastId, 'Workout plan updated successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to update workout plan');
      }
      
      setSaving(false);
    } catch (error) {
      setSaving(false);
      updateToast(toastId, 'Failed to update workout plan', 'error');
      console.error('Error updating workout plan:', error);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!gymId) {
      showError('No gym associated with this account');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this workout plan?')) {
      return;
    }
    
    const toastId = showLoading('Deleting workout plan...');
    
    try {
      // Call API to delete workout plan
      const response = await fetch(`/api/workout-plans/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete workout plan');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setWorkoutPlans((prev) => prev.filter((plan) => plan.id !== id));
        
        updateToast(toastId, 'Workout plan deleted successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to delete workout plan');
      }
    } catch (error) {
      updateToast(toastId, 'Failed to delete workout plan', 'error');
      console.error('Error deleting workout plan:', error);
    }
  };

  const getLevelColor = (level: WorkoutPlan['level']) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormattedLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
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
        <h1 className="text-2xl font-bold text-gray-900">Workout Plans</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workoutPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="relative">
              <img
                src={plan.image}
                alt={plan.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setIsEditModalOpen(true);
                  }}
                  className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {plan.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {plan.duration}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="w-4 h-4 mr-2" />
                  {plan.goal}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Dumbbell className="w-4 h-4 mr-2" />
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(
                      plan.level
                    )}`}
                  >
                    {getFormattedLevel(plan.level)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {plan.exercises.length} Exercises
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Exercises:
                </h4>
                <ul className="space-y-2">
                  {plan.exercises.map((exercise) => (
                    <li
                      key={exercise.id}
                      className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                    >
                      <div className="font-medium">{exercise.name}</div>
                      <div>
                        {exercise.sets} sets × {exercise.reps} reps
                      </div>
                      <div className="text-xs text-gray-500">
                        Rest: {exercise.restTime}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Plan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Workout Plan</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={newPlan.title}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newPlan.description}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duration
                </label>
                <input
                  type="text"
                  value={newPlan.duration}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, duration: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Level
                </label>
                <select
                  value={newPlan.level}
                  onChange={(e) =>
                    setNewPlan({
                      ...newPlan,
                      level: e.target.value as WorkoutPlan['level'],
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Goal
                </label>
                <input
                  type="text"
                  value={newPlan.goal}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, goal: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Frequency
                </label>
                <input
                  type="number"
                  value={newPlan.frequency}
                  onChange={(e) =>
                    setNewPlan({
                      ...newPlan,
                      frequency: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Add Exercise</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Exercise Name
                    </label>
                    <input
                      type="text"
                      value={newExercise.name}
                      onChange={(e) =>
                        setNewExercise({ ...newExercise, name: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Sets
                    </label>
                    <input
                      type="number"
                      value={newExercise.sets}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          sets: parseInt(e.target.value),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Reps
                    </label>
                    <input
                      type="number"
                      value={newExercise.reps}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          reps: parseInt(e.target.value),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Rest Time
                    </label>
                    <input
                      type="text"
                      value={newExercise.restTime}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          restTime: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={newExercise.instructions}
                    onChange={(e) =>
                      setNewExercise({
                        ...newExercise,
                        instructions: e.target.value,
                      })
                    }
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <button
                  onClick={handleAddExercise}
                  className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Add Exercise
                </button>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Added Exercises</h3>
                <ul className="space-y-2">
                  {newPlan.exercises.map((exercise) => (
                    <li
                      key={exercise.id}
                      className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                    >
                      <div className="font-medium">{exercise.name}</div>
                      <div>
                        {exercise.sets} sets × {exercise.reps} reps
                      </div>
                      <div className="text-xs text-gray-500">
                        Rest: {exercise.restTime}
                      </div>
                    </li>
                  ))}
                </ul>
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
                onClick={handleAddPlan}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Add Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {isEditModalOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Workout Plan</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={selectedPlan.title}
                  onChange={(e) =>
                    setSelectedPlan({
                      ...selectedPlan,
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
                  value={selectedPlan.description}
                  onChange={(e) =>
                    setSelectedPlan({
                      ...selectedPlan,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duration
                </label>
                <input
                  type="text"
                  value={selectedPlan.duration}
                  onChange={(e) =>
                    setSelectedPlan({
                      ...selectedPlan,
                      duration: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Level
                </label>
                <select
                  value={selectedPlan.level}
                  onChange={(e) =>
                    setSelectedPlan({
                      ...selectedPlan,
                      level: e.target.value as WorkoutPlan['level'],
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Goal
                </label>
                <input
                  type="text"
                  value={selectedPlan.goal}
                  onChange={(e) =>
                    setSelectedPlan({
                      ...selectedPlan,
                      goal: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Exercises</h3>
                <ul className="space-y-2">
                  {selectedPlan.exercises.map((exercise) => (
                    <li
                      key={exercise.id}
                      className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                    >
                      <div className="font-medium">{exercise.name}</div>
                      <div>
                        {exercise.sets} sets × {exercise.reps} reps
                      </div>
                      <div className="text-xs text-gray-500">
                        Rest: {exercise.restTime}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedPlan(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditPlan}
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

export default WorkoutPlans; 