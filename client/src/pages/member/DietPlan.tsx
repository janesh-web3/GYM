import { useState, useEffect } from 'react';
import { 
  Utensils, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Plus,
  CheckCircle2,
  Loader
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showError, showSuccess } from '../../utils/toast';

interface Food {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

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
  foods?: Food[];
}

interface DietPlanData {
  id: string;
  title: string;
  description: string;
  calories: number;
  goal: string;
  meals: Meal[];
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

const DietPlan = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dietPlans, setDietPlans] = useState<DietPlanData[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DietPlanData | null>(null);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);

  useEffect(() => {
    const fetchDietPlans = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // Fetch diet plans assigned to the user
        const response = await fetch(`/api/diet-plans/member/${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch diet plans');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Transform API response to match our interface
          const formattedPlans: DietPlanData[] = data.data.map((plan: any) => ({
            id: plan._id,
            title: plan.title,
            description: plan.description,
            calories: plan.calories,
            goal: plan.goal,
            macros: plan.macros || { protein: 0, carbs: 0, fats: 0 },
            meals: plan.meals.map((meal: any) => {
              // Calculate total calories and macros for the meal
              const totalCalories = meal.foods ? 
                meal.foods.reduce((sum: number, food: any) => sum + food.calories, 0) : 
                meal.totalCalories || 0;
              
              const protein = meal.foods ? 
                meal.foods.reduce((sum: number, food: any) => sum + food.protein, 0) : 
                0;
              
              const carbs = meal.foods ? 
                meal.foods.reduce((sum: number, food: any) => sum + food.carbs, 0) : 
                0;
              
              const fats = meal.foods ? 
                meal.foods.reduce((sum: number, food: any) => sum + food.fats, 0) : 
                0;
              
              return {
                id: meal._id,
                name: meal.name,
                time: meal.time,
                calories: totalCalories,
                protein,
                carbs,
                fats,
                completed: meal.completed || false,
                description: meal.description,
                foods: meal.foods
              };
            })
          }));
          
          setDietPlans(formattedPlans);
          
          // If there are diet plans, select the first one by default
          if (formattedPlans.length > 0) {
            setSelectedPlan(formattedPlans[0]);
            setMeals(formattedPlans[0].meals);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching diet plans:', error);
        showError('Failed to load diet plans');
        setLoading(false);
      }
    };
    
    fetchDietPlans();
  }, [user]);

  const toggleMeal = (id: string) => {
    setExpandedMeal(expandedMeal === id ? null : id);
  };

  const handleMarkMealComplete = async (mealId: string) => {
    try {
      // Find the meal and toggle its completion status
      const updatedMeals = meals.map(meal => 
        meal.id === mealId ? { ...meal, completed: !meal.completed } : meal
      );
      
      setMeals(updatedMeals);
      
      // In a real implementation, you would send an API request to update meal completion status
      // This is a placeholder for that functionality
      // await fetch(`/api/diet-plans/${selectedPlan?.id}/meals/${mealId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ completed: !meals.find(meal => meal.id === mealId)?.completed }),
      // });
      
      showSuccess(`Meal ${updatedMeals.find(meal => meal.id === mealId)?.completed ? 'completed' : 'uncompleted'}`);
    } catch (error) {
      console.error('Error updating meal status:', error);
      showError('Failed to update meal status');
    }
  };

  const handleSelectPlan = (plan: DietPlanData) => {
    setSelectedPlan(plan);
    setMeals(plan.meals);
    setExpandedMeal(null);
  };

  // Calculate totals for the selected plan
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFats = meals.reduce((sum, meal) => sum + meal.fats, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (dietPlans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Utensils className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">No Diet Plans Assigned</h2>
        <p className="text-gray-500 mt-2">Contact your trainer to get a diet plan assigned.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Diet Plan</h1>
          <p className="text-gray-500">{selectedPlan?.title} - {selectedPlan?.calories} calories</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-500">
            <Utensils className="w-4 h-4 mr-1" />
            <span>{meals.length} meals</span>
          </div>
          <div className="flex items-center text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>Next meal in {getNextMealTime()}</span>
          </div>
        </div>
      </div>

      {dietPlans.length > 1 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Available Diet Plans</h2>
          <div className="flex flex-wrap gap-2">
            {dietPlans.map((plan) => (
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Calories</div>
          <div className="text-2xl font-bold text-gray-900">{totalCalories}</div>
          <div className="text-sm text-gray-500">/ {selectedPlan?.calories}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Protein</div>
          <div className="text-2xl font-bold text-gray-900">{totalProtein}g</div>
          <div className="text-sm text-gray-500">/ {calculateMacroGoal(selectedPlan?.calories || 0, selectedPlan?.macros.protein || 30)}g</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Carbs</div>
          <div className="text-2xl font-bold text-gray-900">{totalCarbs}g</div>
          <div className="text-sm text-gray-500">/ {calculateMacroGoal(selectedPlan?.calories || 0, selectedPlan?.macros.carbs || 40)}g</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Fats</div>
          <div className="text-2xl font-bold text-gray-900">{totalFats}g</div>
          <div className="text-sm text-gray-500">/ {calculateMacroGoal(selectedPlan?.calories || 0, selectedPlan?.macros.fats || 30)}g</div>
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkMealComplete(meal.id);
                  }}
                  className="mr-3"
                >
                  {meal.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-primary-500" />
                  )}
                </button>
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
                {meal.foods && meal.foods.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Foods</h4>
                    <div className="space-y-2">
                      {meal.foods.map((food, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium text-gray-900">{food.name}</span>
                              <span className="text-sm text-gray-500 ml-2">{food.quantity}</span>
                            </div>
                            <span className="text-sm text-gray-500">{food.calories} cal</span>
                          </div>
                        </div>
                      ))}
                    </div>
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

// Helper function to calculate time until next meal
function getNextMealTime() {
  const now = new Date();
  const hour = now.getHours();
  
  // Simple logic for next meal time (can be improved with actual meal times)
  if (hour < 8) return '2 hours'; // Breakfast around 8am
  if (hour < 12) return '1 hour'; // Lunch around 12pm
  if (hour < 16) return '3 hours'; // Snack around 3-4pm
  if (hour < 19) return '2 hours'; // Dinner around 7pm
  return 'tomorrow'; // After dinner
}

// Helper function to calculate macro goals based on calorie intake and percentages
function calculateMacroGoal(calories: number, percentage: number) {
  if (!calories || !percentage) return 0;
  
  // Calculate based on macronutrient calorie content
  // Protein and carbs: 4 calories per gram
  // Fats: 9 calories per gram
  const ratio = percentage / 100;
  
  if (percentage === 30) {
    // Could be protein (4 cal/g) or fat (9 cal/g)
    // For simplicity, we'll assume protein
    return Math.round((calories * ratio) / 4);
  } else if (percentage === 20) {
    // If it's 20%, probably fat
    return Math.round((calories * ratio) / 9);
  } else {
    // Carbs (40% typically)
    return Math.round((calories * ratio) / 4);
  }
}

export default DietPlan; 