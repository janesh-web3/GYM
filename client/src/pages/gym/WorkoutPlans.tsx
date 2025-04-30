import { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, Dumbbell, Target, Users } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restTime: string;
  description: string;
}

interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  targetMuscle: string;
  exercises: Exercise[];
  image: string;
}

const WorkoutPlans = () => {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([
    {
      id: '1',
      title: 'Full Body Strength',
      description: 'A comprehensive full-body workout focusing on strength and muscle building.',
      duration: '60 minutes',
      difficulty: 'Intermediate',
      targetMuscle: 'Full Body',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
      exercises: [
        {
          id: '1',
          name: 'Squats',
          sets: 4,
          reps: 12,
          restTime: '60 seconds',
          description: 'Stand with feet shoulder-width apart, lower body by bending knees and hips.',
        },
        {
          id: '2',
          name: 'Bench Press',
          sets: 4,
          reps: 10,
          restTime: '90 seconds',
          description: 'Lie on bench, lower barbell to chest, press back up.',
        },
      ],
    },
    {
      id: '2',
      title: 'Upper Body Focus',
      description: 'Targeted workout for upper body strength and definition.',
      duration: '45 minutes',
      difficulty: 'Advanced',
      targetMuscle: 'Upper Body',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
      exercises: [
        {
          id: '1',
          name: 'Pull-ups',
          sets: 4,
          reps: 8,
          restTime: '90 seconds',
          description: 'Hang from bar, pull body up until chin clears bar.',
        },
        {
          id: '2',
          name: 'Shoulder Press',
          sets: 4,
          reps: 10,
          restTime: '60 seconds',
          description: 'Press dumbbells overhead from shoulder height.',
        },
      ],
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);

  const [newPlan, setNewPlan] = useState<Omit<WorkoutPlan, 'id'>>({
    title: '',
    description: '',
    duration: '',
    difficulty: 'Beginner',
    targetMuscle: '',
    exercises: [],
    image: '',
  });

  const [newExercise, setNewExercise] = useState<Omit<Exercise, 'id'>>({
    name: '',
    sets: 0,
    reps: 0,
    restTime: '',
    description: '',
  });

  const handleAddExercise = () => {
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
      sets: 0,
      reps: 0,
      restTime: '',
      description: '',
    });
  };

  const handleAddPlan = () => {
    const plan: WorkoutPlan = {
      ...newPlan,
      id: Date.now().toString(),
    };
    setWorkoutPlans((prev) => [...prev, plan]);
    setIsAddModalOpen(false);
    setNewPlan({
      title: '',
      description: '',
      duration: '',
      difficulty: 'Beginner',
      targetMuscle: '',
      exercises: [],
      image: '',
    });
  };

  const handleEditPlan = () => {
    if (!selectedPlan) return;
    setWorkoutPlans((prev) =>
      prev.map((plan) => (plan.id === selectedPlan.id ? selectedPlan : plan))
    );
    setIsEditModalOpen(false);
    setSelectedPlan(null);
  };

  const handleDeletePlan = (id: string) => {
    setWorkoutPlans((prev) => prev.filter((plan) => plan.id !== id));
  };

  const getDifficultyColor = (difficulty: WorkoutPlan['difficulty']) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
                  {plan.targetMuscle}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Dumbbell className="w-4 h-4 mr-2" />
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                      plan.difficulty
                    )}`}
                  >
                    {plan.difficulty}
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
                  Difficulty
                </label>
                <select
                  value={newPlan.difficulty}
                  onChange={(e) =>
                    setNewPlan({
                      ...newPlan,
                      difficulty: e.target.value as WorkoutPlan['difficulty'],
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Target Muscle
                </label>
                <input
                  type="text"
                  value={newPlan.targetMuscle}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, targetMuscle: e.target.value })
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
                    value={newExercise.description}
                    onChange={(e) =>
                      setNewExercise({
                        ...newExercise,
                        description: e.target.value,
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
                  Difficulty
                </label>
                <select
                  value={selectedPlan.difficulty}
                  onChange={(e) =>
                    setSelectedPlan({
                      ...selectedPlan,
                      difficulty: e.target.value as WorkoutPlan['difficulty'],
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Target Muscle
                </label>
                <input
                  type="text"
                  value={selectedPlan.targetMuscle}
                  onChange={(e) =>
                    setSelectedPlan({
                      ...selectedPlan,
                      targetMuscle: e.target.value,
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