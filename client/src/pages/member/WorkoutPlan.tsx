import { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Clock, 
  Repeat, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2,
  PlayCircle,
  Loader,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showError, showSuccess } from '../../utils/toast';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  rest: number;
  completed: boolean;
  notes?: string;
  targetMuscleGroup?: string;
}

interface WorkoutPlanData {
  id: string;
  title: string;
  description: string;
  duration: number;
  level: string;
  goal: string;
  exercises: Exercise[];
}

const WorkoutPlan = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlanData[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlanData | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // Fetch workout plans assigned to the user
        const response = await fetch(`/api/workout-plans/member/${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch workout plans');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Transform API response to match our interface
          const formattedPlans: WorkoutPlanData[] = data.data.map((plan: any) => ({
            id: plan._id,
            title: plan.title,
            description: plan.description,
            duration: plan.duration,
            level: plan.level,
            goal: plan.goal,
            exercises: plan.exercises.map((ex: any) => ({
              id: ex._id,
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              rest: ex.restTime,
              completed: ex.completed || false,
              notes: ex.instructions,
              targetMuscleGroup: ex.targetMuscleGroup
            }))
          }));
          
          setWorkoutPlans(formattedPlans);
          
          // If there are workout plans, select the first one by default
          if (formattedPlans.length > 0) {
            setSelectedPlan(formattedPlans[0]);
            setExercises(formattedPlans[0].exercises);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching workout plans:', error);
        showError('Failed to load workout plans');
        setLoading(false);
      }
    };
    
    fetchWorkoutPlans();
  }, [user]);

  const toggleExercise = (id: string) => {
    setExpandedExercise(expandedExercise === id ? null : id);
  };

  const handleMarkExerciseComplete = async (exerciseId: string) => {
    try {
      // Find the exercise and toggle its completion status
      const updatedExercises = exercises.map(ex => 
        ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
      );
      
      setExercises(updatedExercises);
      
      // In a real implementation, you would send an API request to update exercise completion
      // This is a placeholder for that functionality
      // await fetch(`/api/workout-plans/${selectedPlan?.id}/exercises/${exerciseId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ completed: !exercises.find(ex => ex.id === exerciseId)?.completed }),
      // });
      
      showSuccess(`Exercise ${updatedExercises.find(ex => ex.id === exerciseId)?.completed ? 'completed' : 'uncompleted'}`);
    } catch (error) {
      console.error('Error updating exercise status:', error);
      showError('Failed to update exercise status');
    }
  };

  const handleSelectPlan = (plan: WorkoutPlanData) => {
    setSelectedPlan(plan);
    setExercises(plan.exercises);
    setExpandedExercise(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (workoutPlans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Dumbbell className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">No Workout Plans Assigned</h2>
        <p className="text-gray-500 mt-2">Contact your trainer to get a workout plan assigned.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Workout Plan</h1>
          <p className="text-gray-500">{selectedPlan?.title}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>{selectedPlan?.duration} mins</span>
          </div>
          <div className="flex items-center text-gray-500">
            <Dumbbell className="w-4 h-4 mr-1" />
            <span>{exercises.length} exercises</span>
          </div>
        </div>
      </div>

      {workoutPlans.length > 1 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Available Workout Plans</h2>
          <div className="flex flex-wrap gap-2">
            {workoutPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handleSelectPlan(plan)}
                className={`px-4 py-2 rounded-lg ${
                  selectedPlan?.id === plan.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {plan.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="border-b last:border-b-0">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => toggleExercise(exercise.id)}
            >
              <div className="flex items-center">
                {exercise.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                ) : (
                  <PlayCircle className="w-5 h-5 text-primary-500 mr-3" />
                )}
                <div>
                  <h3 className="font-medium text-gray-900">{exercise.name}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{exercise.sets} sets</span>
                    <span className="mx-2">•</span>
                    <span>{exercise.reps} reps</span>
                    <span className="mx-2">•</span>
                    <span>{exercise.rest}s rest</span>
                  </div>
                </div>
              </div>
              {expandedExercise === exercise.id ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
            
            {expandedExercise === exercise.id && (
              <div className="px-4 pb-4">
                {exercise.notes && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{exercise.notes}</p>
                  </div>
                )}
                {exercise.targetMuscleGroup && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Target: <span className="font-normal text-gray-600">{exercise.targetMuscleGroup}</span></p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(exercise.sets)].map((_, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-900">Set {index + 1}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-500">{exercise.reps} reps</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkExerciseComplete(exercise.id);
                          }}
                          className={`${
                            exercise.completed
                              ? 'text-green-600 hover:text-green-700'
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <div className="flex items-center">
          <Calendar className="w-5 h-5 text-gray-500 mr-2" />
          <span className="text-gray-700">
            Goal: <span className="font-medium">{selectedPlan?.goal}</span>
          </span>
        </div>
        <button 
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          onClick={() => {
            const nextIncomplete = exercises.find(ex => !ex.completed);
            if (nextIncomplete) {
              setExpandedExercise(nextIncomplete.id);
              // Scroll to the exercise
              document.getElementById(nextIncomplete.id)?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <Repeat className="w-4 h-4 mr-2" />
          Start Next Exercise
        </button>
      </div>
    </div>
  );
};

export default WorkoutPlan; 