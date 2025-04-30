import { useState } from 'react';
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
  X
} from 'lucide-react';

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
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([
    {
      id: '1',
      title: 'Full Body Strength',
      description: 'A comprehensive full body workout focusing on strength and muscle growth',
      duration: '60 minutes',
      difficulty: 'Intermediate',
      exercises: [
        {
          id: '1',
          name: 'Barbell Squat',
          sets: 4,
          reps: 8,
          weight: 135,
          restTime: 90,
          notes: 'Keep back straight, chest up'
        },
        {
          id: '2',
          name: 'Bench Press',
          sets: 4,
          reps: 10,
          weight: 155,
          restTime: 90,
          notes: 'Full range of motion'
        }
      ],
      targetMuscles: ['Legs', 'Chest', 'Back', 'Shoulders', 'Arms'],
      createdAt: '2024-04-30'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

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

  const handleSavePlan = () => {
    if (selectedPlan) {
      setWorkoutPlans(workoutPlans.map(plan => 
        plan.id === selectedPlan.id ? selectedPlan : plan
      ));
    } else {
      setWorkoutPlans([...workoutPlans, { ...newPlan, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handleDeletePlan = (id: string) => {
    setWorkoutPlans(workoutPlans.filter(plan => plan.id !== id));
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
  };

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