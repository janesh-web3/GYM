import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, Utensils, Target, Users, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError, showLoading, updateToast } from '../../utils/toast';
import { gymService } from '../../lib/services';

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
  description: string;
  foods: Food[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface DietPlan {
  id: string;
  title: string;
  description: string;
  duration: number;
  goal: string;
  calories: number;
  meals: Meal[];
  restrictions: string[];
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  image?: string;
  gymId?: string;
  createdBy?: string;
}

interface GymResponse {
  _id: string;
  name: string;
  [key: string]: any;
}

const DietPlans = () => {
  const { user } = useAuth();
  const [gymId, setGymId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);

  const [newPlan, setNewPlan] = useState<Omit<DietPlan, 'id'>>({
    title: '',
    description: '',
    duration: 4,
    goal: 'weight_loss',
    calories: 2000,
    meals: [],
    restrictions: [],
    macros: {
      protein: 30,
      carbs: 40,
      fats: 30
    },
    image: '',
  });

  const [newMeal, setNewMeal] = useState<Omit<Meal, 'id'>>({
    name: '',
    time: '',
    description: '',
    foods: [],
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });

  useEffect(() => {
    const fetchDietPlans = async () => {
      try {
        setLoading(true);
        // In a real app, we'd fetch the gym ID associated with this owner
        const gyms = await gymService.getAllGyms() as GymResponse[];
        if (gyms && gyms.length > 0) {
          const gymId = gyms[0]._id;
          setGymId(gymId);
          
          // Fetch diet plans from API
          const response = await fetch(`/api/diet-plans?gymId=${gymId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch diet plans');
          }
          
          const data = await response.json();
          if (data.success && data.data) {
            setDietPlans(data.data.map((plan: any) => ({
              id: plan._id,
              title: plan.title,
              description: plan.description,
              duration: plan.duration,
              goal: plan.goal,
              calories: plan.calories,
              restrictions: plan.restrictions || [],
              macros: plan.macros,
              meals: plan.meals.map((meal: any) => ({
                id: meal._id,
                name: meal.name,
                time: meal.time,
                description: meal.description,
                foods: meal.foods,
                calories: meal.totalCalories,
                protein: meal.foods.reduce((total: number, food: any) => total + food.protein, 0),
                carbs: meal.foods.reduce((total: number, food: any) => total + food.carbs, 0),
                fats: meal.foods.reduce((total: number, food: any) => total + food.fats, 0)
              })),
              image: plan.image || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
              gymId: plan.gymId,
              createdBy: plan.createdBy
            })));
          }
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        showError('Failed to load diet plans');
        console.error('Error fetching diet plans:', error);
      }
    };
    
    if (user) {
      fetchDietPlans();
    }
  }, [user]);

  const handleAddMeal = () => {
    if (!newMeal.name) {
      showError('Please provide a meal name');
      return;
    }
    
    const meal: Meal = {
      ...newMeal,
      id: Date.now().toString(),
    };
    
    setNewPlan((prev) => ({
      ...prev,
      meals: [...prev.meals, meal],
    }));
    
    setNewMeal({
      name: '',
      time: '',
      description: '',
      foods: [],
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0
    });
  };

  const handleAddPlan = async () => {
    if (!gymId) {
      showError('No gym associated with this account');
      return;
    }
    
    if (!newPlan.title || newPlan.calories <= 0 || newPlan.meals.length === 0) {
      showError('Please fill all required fields and add at least one meal');
      return;
    }
    
    const toastId = showLoading('Creating diet plan...');
    setSaving(true);
    
    try {
      // Prepare diet plan for API
      const planData = {
        title: newPlan.title,
        description: newPlan.description,
        duration: newPlan.duration,
        goal: newPlan.goal,
        calories: newPlan.calories,
        meals: newPlan.meals.map(meal => ({
          name: meal.name,
          time: meal.time,
          description: meal.description,
          foods: meal.foods,
          totalCalories: meal.calories
        })),
        restrictions: newPlan.restrictions,
        macros: newPlan.macros,
        gymId: gymId,
        isTemplate: true
      };
      
      // Call API to create diet plan
      const response = await fetch('/api/diet-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create diet plan');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const createdPlan: DietPlan = {
          id: data.data._id,
          title: data.data.title,
          description: data.data.description,
          duration: data.data.duration,
          goal: data.data.goal,
          calories: data.data.calories,
          restrictions: data.data.restrictions || [],
          macros: data.data.macros,
          meals: data.data.meals.map((meal: any) => ({
            id: meal._id,
            name: meal.name,
            time: meal.time,
            description: meal.description,
            foods: meal.foods,
            calories: meal.totalCalories,
            protein: meal.foods.reduce((total: number, food: any) => total + food.protein, 0),
            carbs: meal.foods.reduce((total: number, food: any) => total + food.carbs, 0),
            fats: meal.foods.reduce((total: number, food: any) => total + food.fats, 0)
          })),
          image: newPlan.image || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
          gymId: data.data.gymId,
          createdBy: data.data.createdBy
        };
        
        setDietPlans((prev) => [...prev, createdPlan]);
        setIsAddModalOpen(false);
        setNewPlan({
          title: '',
          description: '',
          duration: 4,
          goal: 'weight_loss',
          calories: 2000,
          meals: [],
          restrictions: [],
          macros: {
            protein: 30,
            carbs: 40,
            fats: 30
          },
          image: '',
        });
        
        updateToast(toastId, 'Diet plan created successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to create diet plan');
      }
      
      setSaving(false);
    } catch (error) {
      setSaving(false);
      updateToast(toastId, 'Failed to create diet plan', 'error');
      console.error('Error creating diet plan:', error);
    }
  };

  const handleEditPlan = async () => {
    if (!selectedPlan || !gymId) {
      showError('No diet plan selected or gym associated with this account');
      return;
    }
    
    const toastId = showLoading('Updating diet plan...');
    setSaving(true);
    
    try {
      // Prepare diet plan for API
      const planData = {
        title: selectedPlan.title,
        description: selectedPlan.description,
        duration: selectedPlan.duration,
        goal: selectedPlan.goal,
        calories: selectedPlan.calories,
        meals: selectedPlan.meals.map(meal => ({
          name: meal.name,
          time: meal.time,
          description: meal.description,
          foods: meal.foods,
          totalCalories: meal.calories
        })),
        restrictions: selectedPlan.restrictions,
        macros: selectedPlan.macros,
        gymId: gymId,
        isTemplate: true
      };
      
      // Call API to update diet plan
      const response = await fetch(`/api/diet-plans/${selectedPlan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update diet plan');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setDietPlans((prev) =>
          prev.map((plan) => (plan.id === selectedPlan.id ? selectedPlan : plan))
        );
        
        setIsEditModalOpen(false);
        setSelectedPlan(null);
        
        updateToast(toastId, 'Diet plan updated successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to update diet plan');
      }
      
      setSaving(false);
    } catch (error) {
      setSaving(false);
      updateToast(toastId, 'Failed to update diet plan', 'error');
      console.error('Error updating diet plan:', error);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!gymId) {
      showError('No gym associated with this account');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this diet plan?')) {
      return;
    }
    
    const toastId = showLoading('Deleting diet plan...');
    
    try {
      // Call API to delete diet plan
      const response = await fetch(`/api/diet-plans/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete diet plan');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setDietPlans((prev) => prev.filter((plan) => plan.id !== id));
        
        updateToast(toastId, 'Diet plan deleted successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to delete diet plan');
      }
    } catch (error) {
      updateToast(toastId, 'Failed to delete diet plan', 'error');
      console.error('Error deleting diet plan:', error);
    }
  };

  const getGoalColor = (goal: string) => {
    switch (goal) {
      case 'weight_loss':
        return 'bg-green-100 text-green-800';
      case 'muscle_gain':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormattedGoal = (goal: string) => {
    return goal.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
        <h1 className="text-2xl font-bold text-gray-900">Diet Plans</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dietPlans.map((plan) => (
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
                  {plan.duration} weeks
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="w-4 h-4 mr-2" />
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getGoalColor(
                      plan.goal
                    )}`}
                  >
                    {getFormattedGoal(plan.goal)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Utensils className="w-4 h-4 mr-2" />
                  {plan.calories} calories/day
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {plan.meals.length} Meals
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Meals:
                </h4>
                <ul className="space-y-2">
                  {plan.meals.map((meal) => (
                    <li
                      key={meal.id}
                      className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                    >
                      <div className="font-medium">{meal.name} ({meal.time})</div>
                      <div className="text-xs text-gray-500">
                        {meal.calories} cal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fats}g
                      </div>
                      <div className="text-xs text-gray-500">
                        {meal.description}
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
            <h2 className="text-xl font-semibold mb-4">Add New Diet Plan</h2>
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
                  type="number"
                  value={newPlan.duration}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, duration: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Goal
                </label>
                <select
                  value={newPlan.goal}
                  onChange={(e) =>
                    setNewPlan({
                      ...newPlan,
                      goal: e.target.value as DietPlan['goal'],
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Target Calories
                </label>
                <input
                  type="number"
                  value={newPlan.calories}
                  onChange={(e) =>
                    setNewPlan({
                      ...newPlan,
                      calories: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Add Meal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Meal Name
                    </label>
                    <input
                      type="text"
                      value={newMeal.name}
                      onChange={(e) =>
                        setNewMeal({ ...newMeal, name: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Time
                    </label>
                    <input
                      type="text"
                      value={newMeal.time}
                      onChange={(e) =>
                        setNewMeal({ ...newMeal, time: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Calories
                    </label>
                    <input
                      type="number"
                      value={newMeal.calories}
                      onChange={(e) =>
                        setNewMeal({
                          ...newMeal,
                          calories: parseInt(e.target.value),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      value={newMeal.protein}
                      onChange={(e) =>
                        setNewMeal({
                          ...newMeal,
                          protein: parseInt(e.target.value),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      value={newMeal.carbs}
                      onChange={(e) =>
                        setNewMeal({
                          ...newMeal,
                          carbs: parseInt(e.target.value),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fats (g)
                    </label>
                    <input
                      type="number"
                      value={newMeal.fats}
                      onChange={(e) =>
                        setNewMeal({
                          ...newMeal,
                          fats: parseInt(e.target.value),
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
                    value={newMeal.description}
                    onChange={(e) =>
                      setNewMeal({
                        ...newMeal,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <button
                  onClick={handleAddMeal}
                  className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Add Meal
                </button>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Added Meals</h3>
                <ul className="space-y-2">
                  {newPlan.meals.map((meal) => (
                    <li
                      key={meal.id}
                      className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                    >
                      <div className="font-medium">{meal.name} ({meal.time})</div>
                      <div className="text-xs text-gray-500">
                        {meal.calories} cal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fats}g
                      </div>
                      <div className="text-xs text-gray-500">
                        {meal.description}
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
            <h2 className="text-xl font-semibold mb-4">Edit Diet Plan</h2>
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
                  type="number"
                  value={selectedPlan.duration}
                  onChange={(e) =>
                    setSelectedPlan({
                      ...selectedPlan,
                      duration: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Goal
                </label>
                <select
                  value={selectedPlan.goal}
                  onChange={(e) =>
                    setSelectedPlan({
                      ...selectedPlan,
                      goal: e.target.value as DietPlan['goal'],
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Target Calories
                </label>
                <input
                  type="number"
                  value={selectedPlan.calories}
                  onChange={(e) =>
                    setSelectedPlan({
                      ...selectedPlan,
                      calories: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Meals</h3>
                <ul className="space-y-2">
                  {selectedPlan.meals.map((meal) => (
                    <li
                      key={meal.id}
                      className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                    >
                      <div className="font-medium">{meal.name} ({meal.time})</div>
                      <div className="text-xs text-gray-500">
                        {meal.calories} cal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fats}g
                      </div>
                      <div className="text-xs text-gray-500">
                        {meal.description}
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

export default DietPlans; 