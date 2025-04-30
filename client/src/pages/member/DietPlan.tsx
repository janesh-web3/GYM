import { useState } from 'react';
import { 
  Utensils, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Plus,
  CheckCircle2
} from 'lucide-react';

interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  completed: boolean;
  description?: string;
}

const DietPlan = () => {
  const [meals] = useState<Meal[]>([
    {
      id: '1',
      name: 'Breakfast',
      time: '08:00 AM',
      calories: 450,
      protein: 30,
      carbs: 45,
      fats: 15,
      completed: true,
      description: 'Oatmeal with berries and protein powder'
    },
    {
      id: '2',
      name: 'Lunch',
      time: '12:30 PM',
      calories: 650,
      protein: 40,
      carbs: 60,
      fats: 20,
      completed: false,
      description: 'Grilled chicken with brown rice and vegetables'
    },
    {
      id: '3',
      name: 'Snack',
      time: '03:30 PM',
      calories: 250,
      protein: 20,
      carbs: 25,
      fats: 10,
      completed: false,
      description: 'Greek yogurt with almonds'
    },
    {
      id: '4',
      name: 'Dinner',
      time: '07:00 PM',
      calories: 550,
      protein: 35,
      carbs: 50,
      fats: 18,
      completed: false,
      description: 'Salmon with quinoa and steamed vegetables'
    }
  ]);

  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  const toggleMeal = (id: string) => {
    setExpandedMeal(expandedMeal === id ? null : id);
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFats = meals.reduce((sum, meal) => sum + meal.fats, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today's Diet Plan</h1>
          <p className="text-gray-500">High Protein Diet - 1,900 calories</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-500">
            <Utensils className="w-4 h-4 mr-1" />
            <span>4 meals</span>
          </div>
          <div className="flex items-center text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>Next meal in 2 hours</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Calories</div>
          <div className="text-2xl font-bold text-gray-900">{totalCalories}</div>
          <div className="text-sm text-gray-500">/ 1,900</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Protein</div>
          <div className="text-2xl font-bold text-gray-900">{totalProtein}g</div>
          <div className="text-sm text-gray-500">/ 125g</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Carbs</div>
          <div className="text-2xl font-bold text-gray-900">{totalCarbs}g</div>
          <div className="text-sm text-gray-500">/ 180g</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Fats</div>
          <div className="text-2xl font-bold text-gray-900">{totalFats}g</div>
          <div className="text-sm text-gray-500">/ 63g</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {meals.map((meal) => (
          <div key={meal.id} className="border-b last:border-b-0">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => toggleMeal(meal.id)}
            >
              <div className="flex items-center">
                {meal.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                ) : (
                  <div className="w-5 h-5 mr-3" />
                )}
                <div>
                  <h3 className="font-medium text-gray-900">{meal.name}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{meal.time}</span>
                    <span className="mx-2">•</span>
                    <span>{meal.calories} calories</span>
                  </div>
                </div>
              </div>
              {expandedMeal === meal.id ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
            
            {expandedMeal === meal.id && (
              <div className="px-4 pb-4">
                {meal.description && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{meal.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900">Protein</div>
                    <div className="text-sm text-gray-500">{meal.protein}g</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900">Carbs</div>
                    <div className="text-sm text-gray-500">{meal.carbs}g</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900">Fats</div>
                    <div className="text-sm text-gray-500">{meal.fats}g</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Custom Meal
        </button>
      </div>
    </div>
  );
};

export default DietPlan; 