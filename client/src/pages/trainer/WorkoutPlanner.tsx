import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Clock,
  Repeat,
  PlusCircle,
  X,
  Loader
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError, showLoading, updateToast } from '../../utils/toast';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  restTime: number;
  notes: string;
}

interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  exercises: Exercise[];
  targetMuscles: string[];
  createdAt: string;
}

const WorkoutPlanner = () => {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assignedMemberId, setAssignedMemberId] = useState<string | null>(null);
  const [members, setMembers] = useState<{id: string, name: string}[]>([]);
  const { user } = useAuth();

  const [newExercise, setNewExercise] = useState<Exercise>({
    id: '',
    name: '',
    sets: 3,
    reps: 10,
    weight: 0,
    restTime: 60,
    notes: ''
  });

  const [newPlan, setNewPlan] = useState<WorkoutPlan>({
    id: '',
    title: '',
    description: '',
    duration: '60 minutes',
    difficulty: 'Intermediate',
    exercises: [],
    targetMuscles: [],
    createdAt: new Date().toISOString()
  });

  // Check URL for member ID (for direct assignment)
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const memberId = queryParams.get('memberId');
    if (memberId) {
      setAssignedMemberId(memberId);
    }
  }, []);

  // Fetch workout plans and members
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!user) return;

        // Fetch workout plans
        const plansResponse = await fetch(`/api/workout-plans?trainerId=${user.id}`);
        if (!plansResponse.ok) {
          throw new Error('Failed to fetch workout plans');
        }
        
        const plansData = await plansResponse.json();
        
        if (plansData.success && plansData.data) {
          // Map API response to our WorkoutPlan interface
          const formattedPlans = plansData.data.map((plan: any) => ({
            id: plan._id,
            title: plan.title,
            description: plan.description || '',
            duration: plan.duration || '60 minutes',
            difficulty: plan.difficulty || 'Intermediate',
            exercises: plan.exercises ? plan.exercises.map((ex: any) => ({
              id: ex._id,
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight,
              restTime: ex.restTime,
              notes: ex.notes || ''
            })) : [],
            targetMuscles: plan.targetMuscles || [],
            createdAt: plan.createdAt || new Date().toISOString()
          }));
          
          setWorkoutPlans(formattedPlans);
        }
        
        // Fetch members (for assignment)
        const membersResponse = await fetch(`/api/trainers/${user.id}/members`);
        if (!membersResponse.ok) {
          throw new Error('Failed to fetch members');
        }
        
        const membersData = await membersResponse.json();
        
        if (membersData.success && membersData.data) {
          setMembers(membersData.data.map((member: any) => ({
            id: member._id,
            name: member.name
          })));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching workout plans:', error);
        showError('Failed to load workout plans');
        setLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleAddExercise = () => {
    if (selectedPlan) {
      const updatedPlan = {
        ...selectedPlan,
        exercises: [...selectedPlan.exercises, { ...newExercise, id: Date.now().toString() }]
      };
      setWorkoutPlans(workoutPlans.map(plan => 
        plan.id === selectedPlan.id ? updatedPlan : plan
      ));
      setSelectedPlan(updatedPlan);
      setNewExercise({
        id: '',
        name: '',
        sets: 3,
        reps: 10,
        weight: 0,
        restTime: 60,
        notes: ''
      });
    }
  };

  const handleSavePlan = async () => {
    try {
      setSaving(true);
      if (!user) {
        showError('You must be logged in to save workout plans');
        return;
      }
      
      // Format data for API
      const planData = selectedPlan ? {
        title: selectedPlan.title,
        description: selectedPlan.description,
        duration: selectedPlan.duration,
        difficulty: selectedPlan.difficulty,
        exercises: selectedPlan.exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          restTime: ex.restTime,
          notes: ex.notes
        })),
        targetMuscles: selectedPlan.targetMuscles,
        trainerId: user.id,
        ...(assignedMemberId ? { memberId: assignedMemberId } : {})
      } : {
        title: newPlan.title,
        description: newPlan.description,
        duration: newPlan.duration,
        difficulty: newPlan.difficulty,
        exercises: newPlan.exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          restTime: ex.restTime,
          notes: ex.notes
        })),
        targetMuscles: newPlan.targetMuscles,
        trainerId: user.id,
        ...(assignedMemberId ? { memberId: assignedMemberId } : {})
      };
      
      const toastId = showLoading(selectedPlan ? 'Updating workout plan...' : 'Creating workout plan...');
      
      // Call API to create or update plan
      const response = await fetch(
        selectedPlan ? `/api/workout-plans/${selectedPlan.id}` : '/api/workout-plans', 
        {
          method: selectedPlan ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(planData),
        }
      );
      
      if (!response.ok) {
        throw new Error(selectedPlan ? 'Failed to update workout plan' : 'Failed to create workout plan');
      }
      
      const data = await response.json();
      
      if (data.success) {
        if (selectedPlan) {
          // Update existing plan in state
          setWorkoutPlans(workoutPlans.map(plan => 
            plan.id === selectedPlan.id ? {
              ...selectedPlan,
              ...data.data,
              id: data.data._id || selectedPlan.id,
              exercises: data.data.exercises.map((ex: any) => ({
                id: ex._id || Date.now().toString(),
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                weight: ex.weight,
                restTime: ex.restTime,
                notes: ex.notes || ''
              }))
            } : plan
          ));
        } else {
          // Add new plan to state
          const newPlanFromApi = {
            id: data.data._id,
            title: data.data.title,
            description: data.data.description || '',
            duration: data.data.duration || '60 minutes',
            difficulty: data.data.difficulty || 'Intermediate',
            exercises: data.data.exercises ? data.data.exercises.map((ex: any) => ({
              id: ex._id || Date.now().toString(),
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight,
              restTime: ex.restTime,
              notes: ex.notes || ''
            })) : [],
            targetMuscles: data.data.targetMuscles || [],
            createdAt: data.data.createdAt || new Date().toISOString()
          };
          
          setWorkoutPlans([...workoutPlans, newPlanFromApi]);
        }
        
        setIsModalOpen(false);
        setSelectedPlan(null);
        
        // Reset assigned member ID if it was from URL
        if (assignedMemberId) {
          updateToast(toastId, `Workout plan ${selectedPlan ? 'updated' : 'created'} and assigned successfully!`, 'success');
          // Redirect to members page after assigning
          window.location.href = '/trainer/members';
        } else {
          updateToast(toastId, `Workout plan ${selectedPlan ? 'updated' : 'created'} successfully!`, 'success');
        }
      } else {
        throw new Error(data.message || `Failed to ${selectedPlan ? 'update' : 'create'} workout plan`);
      }
    } catch (error) {
      console.error(`Error ${selectedPlan ? 'updating' : 'creating'} workout plan:`, error);
      showError(`Failed to ${selectedPlan ? 'update' : 'create'} workout plan`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout plan?')) {
      return;
    }
    
    const toastId = showLoading('Deleting workout plan...');
    
    try {
      // Call API to delete plan
      const response = await fetch(`/api/workout-plans/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete workout plan');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Remove from local state
        setWorkoutPlans(workoutPlans.filter(plan => plan.id !== id));
        updateToast(toastId, 'Workout plan deleted successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to delete workout plan');
      }
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      updateToast(toastId, 'Failed to delete workout plan', 'error');
    }
  };

  const handleDeleteExercise = (planId: string, exerciseId: string) => {
    setWorkoutPlans(workoutPlans.map(plan => {
      if (plan.id === planId) {
        return {
          ...plan,
          exercises: plan.exercises.filter(ex => ex.id !== exerciseId)
        };
      }
      return plan;
    }));
    
    if (selectedPlan?.id === planId) {
      setSelectedPlan({
        ...selectedPlan,
        exercises: selectedPlan.exercises.filter(ex => ex.id !== exerciseId)
      });
    }
  };

  const handleAssignPlan = async (planId: string, memberId: string) => {
    if (!user) {
      showError('You must be logged in to assign workout plans');
      return;
    }
    
    const toastId = showLoading('Assigning workout plan...');
    
    try {
      // Call API to assign plan to member
      const response = await fetch(`/api/workout-plans/${planId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign workout plan');
      }
      
      const data = await response.json();
      
      if (data.success) {
        updateToast(toastId, 'Workout plan assigned successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to assign workout plan');
      }
    } catch (error) {
      console.error('Error assigning workout plan:', error);
      updateToast(toastId, 'Failed to assign workout plan', 'error');
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workout Plans</h1>
          <p className="text-gray-500">Create and manage workout plans for your members</p>
        </div>
        <button
          onClick={() => {
            setSelectedPlan(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Workout Plan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {workoutPlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                  <p className="text-gray-500 mt-1">{plan.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setIsModalOpen(true);
                    }}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedPlan === plan.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-4">
                <span className="px-3 py-1 text-sm font-medium bg-primary-100 text-primary-600 rounded-full">
                  {plan.difficulty}
                </span>
                <span className="text-sm text-gray-500">
                  <Clock className="w-4 h-4 inline-block mr-1" />
                  {plan.duration}
                </span>
                <span className="text-sm text-gray-500">
                  <Dumbbell className="w-4 h-4 inline-block mr-1" />
                  {plan.targetMuscles.join(', ')}
                </span>
              </div>
            </div>

            {expandedPlan === plan.id && (
              <div className="border-t border-gray-200">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Exercises</h4>
                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        setIsModalOpen(true);
                      }}
                      className="flex items-center text-primary-600 hover:text-primary-900"
                    >
                      <PlusCircle className="w-5 h-5 mr-1" />
                      Add Exercise
                    </button>
                  </div>
                  <div className="space-y-4">
                    {plan.exercises.map((exercise) => (
                      <div key={exercise.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-gray-900">{exercise.name}</h5>
                            <div className="mt-2 flex items-center space-x-4">
                              <span className="text-sm text-gray-500">
                                <Repeat className="w-4 h-4 inline-block mr-1" />
                                {exercise.sets} sets × {exercise.reps} reps
                              </span>
                              <span className="text-sm text-gray-500">
                                <Dumbbell className="w-4 h-4 inline-block mr-1" />
                                {exercise.weight} lbs
                              </span>
                              <span className="text-sm text-gray-500">
                                <Clock className="w-4 h-4 inline-block mr-1" />
                                {exercise.restTime}s rest
                              </span>
                            </div>
                            {exercise.notes && (
                              <p className="mt-2 text-sm text-gray-500">{exercise.notes}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteExercise(plan.id, exercise.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Workout Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {selectedPlan ? 'Edit Workout Plan' : 'New Workout Plan'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={selectedPlan?.title || newPlan.title}
                    onChange={(e) => {
                      if (selectedPlan) {
                        setSelectedPlan({ ...selectedPlan, title: e.target.value });
                      } else {
                        setNewPlan({ ...newPlan, title: e.target.value });
                      }
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={selectedPlan?.description || newPlan.description}
                    onChange={(e) => {
                      if (selectedPlan) {
                        setSelectedPlan({ ...selectedPlan, description: e.target.value });
                      } else {
                        setNewPlan({ ...newPlan, description: e.target.value });
                      }
                    }}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <input
                      type="text"
                      value={selectedPlan?.duration || newPlan.duration}
                      onChange={(e) => {
                        if (selectedPlan) {
                          setSelectedPlan({ ...selectedPlan, duration: e.target.value });
                        } else {
                          setNewPlan({ ...newPlan, duration: e.target.value });
                        }
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                    <select
                      value={selectedPlan?.difficulty || newPlan.difficulty}
                      onChange={(e) => {
                        if (selectedPlan) {
                          setSelectedPlan({ ...selectedPlan, difficulty: e.target.value as any });
                        } else {
                          setNewPlan({ ...newPlan, difficulty: e.target.value as any });
                        }
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Muscles</label>
                  <input
                    type="text"
                    value={selectedPlan?.targetMuscles.join(', ') || newPlan.targetMuscles.join(', ')}
                    onChange={(e) => {
                      const muscles = e.target.value.split(',').map(m => m.trim());
                      if (selectedPlan) {
                        setSelectedPlan({ ...selectedPlan, targetMuscles: muscles });
                      } else {
                        setNewPlan({ ...newPlan, targetMuscles: muscles });
                      }
                    }}
                    placeholder="Legs, Chest, Back, etc."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                {selectedPlan && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add Exercise</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Exercise Name</label>
                        <input
                          type="text"
                          value={newExercise.name}
                          onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Weight (lbs)</label>
                        <input
                          type="number"
                          value={newExercise.weight}
                          onChange={(e) => setNewExercise({ ...newExercise, weight: Number(e.target.value) })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Sets</label>
                        <input
                          type="number"
                          value={newExercise.sets}
                          onChange={(e) => setNewExercise({ ...newExercise, sets: Number(e.target.value) })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Reps</label>
                        <input
                          type="number"
                          value={newExercise.reps}
                          onChange={(e) => setNewExercise({ ...newExercise, reps: Number(e.target.value) })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Rest Time (seconds)</label>
                        <input
                          type="number"
                          value={newExercise.restTime}
                          onChange={(e) => setNewExercise({ ...newExercise, restTime: Number(e.target.value) })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <input
                          type="text"
                          value={newExercise.notes}
                          onChange={(e) => setNewExercise({ ...newExercise, notes: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAddExercise}
                      className="mt-4 flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Exercise
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedPlan(null);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlan}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Save Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutPlanner; 