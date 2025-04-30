import { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, Utensils, Target, Users } from 'lucide-react';

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  description: string;
  time: string;
}

interface DietPlan {
  id: string;
  title: string;
  description: string;
  duration: string;
  goal: 'Weight Loss' | 'Muscle Gain' | 'Maintenance';
  targetCalories: number;
  meals: Meal[];
  image: string;
}

const DietPlans = () => {
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([
    {
      id: '1',
      title: 'Weight Loss Plan',
      description: 'A balanced diet plan focused on healthy weight loss.',
      duration: '4 weeks',
      goal: 'Weight Loss',
      targetCalories: 1800,
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
      meals: [
        {
          id: '1',
          name: 'Breakfast',
          calories: 400,
          protein: 25,
          carbs: 45,
          fats: 15,
          description: 'Oatmeal with berries and nuts',
          time: '8:00 AM',
        },
        {
          id: '2',
          name: 'Lunch',
          calories: 500,
          protein: 30,
          carbs: 50,
          fats: 20,
          description: 'Grilled chicken with quinoa and vegetables',
          time: '12:30 PM',
        },
      ],
    },
    {
      id: '2',
      title: 'Muscle Gain Plan',
      description: 'High protein diet plan for muscle building.',
      duration: '8 weeks',
      goal: 'Muscle Gain',
      targetCalories: 2500,
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
      meals: [
        {
          id: '1',
          name: 'Breakfast',
          calories: 600,
          protein: 40,
          carbs: 60,
          fats: 20,
          description: 'Protein pancakes with eggs and avocado',
          time: '8:00 AM',
        },
        {
          id: '2',
          name: 'Lunch',
          calories: 700,
          protein: 50,
          carbs: 70,
          fats: 25,
          description: 'Beef steak with sweet potato and greens',
          time: '12:30 PM',
        },
      ],
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);

  const [newPlan, setNewPlan] = useState<Omit<DietPlan, 'id'>>({
    title: '',
    description: '',
    duration: '',
    goal: 'Weight Loss',
    targetCalories: 0,
    meals: [],
    image: '',
  });

  const [newMeal, setNewMeal] = useState<Omit<Meal, 'id'>>({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    description: '',
    time: '',
  });

  const handleAddMeal = () => {
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
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      description: '',
      time: '',
    });
  };

  const handleAddPlan = () => {
    const plan: DietPlan = {
      ...newPlan,
      id: Date.now().toString(),
    };
    setDietPlans((prev) => [...prev, plan]);
    setIsAddModalOpen(false);
    setNewPlan({
      title: '',
      description: '',
      duration: '',
      goal: 'Weight Loss',
      targetCalories: 0,
      meals: [],
      image: '',
    });
  };

  const handleEditPlan = () => {
    if (!selectedPlan) return;
    setDietPlans((prev) =>
      prev.map((plan) => (plan.id === selectedPlan.id ? selectedPlan : plan))
    );
    setIsEditModalOpen(false);
    setSelectedPlan(null);
  };

  const handleDeletePlan = (id: string) => {
    setDietPlans((prev) => prev.filter((plan) => plan.id !== id));
  };

  const getGoalColor = (goal: DietPlan['goal']) => {
    switch (goal) {
      case 'Weight Loss':
        return 'bg-green-100 text-green-800';
      case 'Muscle Gain':
        return 'bg-blue-100 text-blue-800';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
                  {plan.duration}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="w-4 h-4 mr-2" />
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getGoalColor(
                      plan.goal
                    )}`}
                  >
                    {plan.goal}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Utensils className="w-4 h-4 mr-2" />
                  {plan.targetCalories} calories/day
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
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Target Calories
                </label>
                <input
                  type="number"
                  value={newPlan.targetCalories}
                  onChange={(e) =>
                    setNewPlan({
                      ...newPlan,
                      targetCalories: parseInt(e.target.value),
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
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Target Calories
                </label>
                <input
                  type="number"
                  value={selectedPlan.targetCalories}
                  onChange={(e) =>
                    setSelectedPlan({
                      ...selectedPlan,
                      targetCalories: parseInt(e.target.value),
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