import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Dumbbell, 
  Utensils, 
  Calendar, 
  User, 
  TrendingUp, 
  ShoppingCart,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showError } from '../../utils/toast';

interface QuickCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  stats?: string;
}

interface WorkoutData {
  title: string;
  description: string;
  exerciseCount: number;
  duration: number;
}

interface DietData {
  title: string;
  description: string;
  calories: number;
}

interface AttendanceData {
  lastCheckIn: string;
  status: string;
  duration: number;
}

interface DashboardData {
  workout: WorkoutData | null;
  diet: DietData | null;
  attendance: AttendanceData | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    workout: null,
    diet: null,
    attendance: null
  });
  const [quickCards, setQuickCards] = useState<QuickCard[]>([]);
  const [shortcuts] = useState<QuickCard[]>([
    {
      id: '1',
      title: "My Progress",
      description: "Track your fitness journey",
      icon: <TrendingUp className="w-6 h-6" />,
      link: "/member/progress"
    },
    {
      id: '2',
      title: "Gym Shop",
      description: "Browse fitness products",
      icon: <ShoppingCart className="w-6 h-6" />,
      link: "/member/shop"
    },
    {
      id: '3',
      title: "My Profile",
      description: "View and edit your profile",
      icon: <User className="w-6 h-6" />,
      link: "/member/profile"
    }
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch workout plans
        const workoutResponse = await fetch(`/api/workout-plans/member/${user.id}`);
        
        // Fetch diet plans
        const dietResponse = await fetch(`/api/diet-plans/member/${user.id}`);
        
        // Fetch attendance history
        const attendanceResponse = await fetch(`/api/attendance/history?limit=1`);
        
        const newData: DashboardData = {
          workout: null,
          diet: null,
          attendance: null
        };
        
        // Process workout data
        if (workoutResponse.ok) {
          const workoutData = await workoutResponse.json();
          if (workoutData.success && workoutData.data && workoutData.data.length > 0) {
            const plan = workoutData.data[0];
            newData.workout = {
              title: plan.title || 'Workout Plan',
              description: plan.goal || (plan.description ? plan.description.substring(0, 30) + '...' : 'No description'),
              exerciseCount: plan.exercises ? plan.exercises.length : 0,
              duration: plan.duration || 0
            };
          }
        }
        
        // Process diet data
        if (dietResponse.ok) {
          const dietData = await dietResponse.json();
          if (dietData.success && dietData.data && dietData.data.length > 0) {
            const plan = dietData.data[0];
            newData.diet = {
              title: plan.title || 'Diet Plan',
              description: plan.goal || (plan.description ? plan.description.substring(0, 30) + '...' : 'No description'),
              calories: plan.calories || 0
            };
          }
        }
        
        // Process attendance data
        if (attendanceResponse.ok) {
          const attendanceData = await attendanceResponse.json();
          if (attendanceData.success && attendanceData.data && attendanceData.data.length > 0) {
            const record = attendanceData.data[0];
            newData.attendance = {
              lastCheckIn: record.date || new Date().toISOString(),
              status: record.status || 'present',
              duration: record.duration || 0
            };
          }
        }
        
        setDashboardData(newData);
        
        // Create quick cards based on fetched data
        const cards: QuickCard[] = [];
        
        // Workout card
        cards.push({
          id: '1',
          title: "Today's Workout",
          description: newData.workout ? newData.workout.title : "No workout plan assigned",
          icon: <Dumbbell className="w-6 h-6" />,
          link: "/member/workout-plan",
          stats: newData.workout ? 
            `${newData.workout.exerciseCount} exercises • ${newData.workout.duration} mins` : 
            "Contact your trainer"
        });
        
        // Diet card
        cards.push({
          id: '2',
          title: "Today's Meals",
          description: newData.diet ? newData.diet.title : "No diet plan assigned",
          icon: <Utensils className="w-6 h-6" />,
          link: "/member/diet-plan",
          stats: newData.diet ? 
            `${newData.diet.calories} calories` : 
            "Contact your trainer"
        });
        
        // Attendance card
        cards.push({
          id: '3',
          title: "Last Attendance",
          description: newData.attendance ? 
            formatDate(newData.attendance.lastCheckIn) : 
            "No recent check-ins",
          icon: <Calendar className="w-6 h-6" />,
          link: "/member/attendance",
          stats: newData.attendance ? 
            `${newData.attendance.duration} mins • ${formatTime(newData.attendance.lastCheckIn)}` : 
            "Check in at the gym"
        });
        
        setQuickCards(cards);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Checked in today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Checked in yesterday';
    } else {
      return `Checked in on ${date.toLocaleDateString()}`;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back! Here's your overview for today.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickCards.map((card) => (
          <Link
            key={card.id}
            to={card.link}
            className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="p-2 bg-primary-100 rounded-lg text-primary-600 mr-3">
                    {card.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{card.title}</h2>
                </div>
                <p className="text-gray-600 mb-1">{card.description}</p>
                {card.stats && (
                  <p className="text-sm text-gray-500">{card.stats}</p>
                )}
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shortcuts.map((shortcut) => (
            <Link
              key={shortcut.id}
              to={shortcut.link}
              className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg text-primary-600 mr-3">
                  {shortcut.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{shortcut.title}</h3>
                  <p className="text-sm text-gray-500">{shortcut.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg text-green-600 mr-3">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Completed Workout</p>
                <p className="text-sm text-gray-500">Push Day - Chest & Triceps</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mr-3">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Checked In</p>
                <p className="text-sm text-gray-500">Gym Session</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">Yesterday</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600 mr-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Progress Update</p>
                <p className="text-sm text-gray-500">Weight: -2kg this month</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">3 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 