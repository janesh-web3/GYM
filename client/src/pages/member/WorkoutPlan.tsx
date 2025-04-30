import { useState } from 'react';
import { 
  Dumbbell, 
  Clock, 
  Repeat, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2,
  PlayCircle
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  rest: number;
  completed: boolean;
  notes?: string;
}

const WorkoutPlan = () => {
  const [exercises] = useState<Exercise[]>([
    {
      id: '1',
      name: 'Bench Press',
      sets: 4,
      reps: 12,
      rest: 60,
      completed: true,
      notes: 'Focus on form, keep elbows at 45 degrees'
    },
    {
      id: '2',
      name: 'Incline Dumbbell Press',
      sets: 3,
      reps: 10,
      rest: 45,
      completed: false
    },
    {
      id: '3',
      name: 'Tricep Pushdown',
      sets: 3,
      reps: 15,
      rest: 30,
      completed: false
    },
    {
      id: '4',
      name: 'Chest Fly',
      sets: 3,
      reps: 12,
      rest: 45,
      completed: false
    }
  ]);

  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const toggleExercise = (id: string) => {
    setExpandedExercise(expandedExercise === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today's Workout</h1>
          <p className="text-gray-500">Push Day - Chest & Triceps</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>45 mins</span>
          </div>
          <div className="flex items-center text-gray-500">
            <Dumbbell className="w-4 h-4 mr-1" />
            <span>4 exercises</span>
          </div>
        </div>
      </div>

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
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(exercise.sets)].map((_, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-900">Set {index + 1}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-500">{exercise.reps} reps</span>
                        <button className="text-primary-600 hover:text-primary-700">
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

      <div className="flex justify-end">
        <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Repeat className="w-4 h-4 mr-2" />
          Start Next Exercise
        </button>
      </div>
    </div>
  );
};

export default WorkoutPlan; 