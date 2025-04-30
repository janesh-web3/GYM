import { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  Trophy, 
  Target, 
  Scale, 
  Dumbbell, 
  TrendingUp, 
  Calendar, 
  Filter, 
  Download 
} from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  membershipType: string;
  image: string;
  joinDate: string;
}

interface ProgressData {
  date: string;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  workoutsCompleted: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'Weight Loss' | 'Strength' | 'Endurance' | 'Consistency';
  icon: string;
}

const MemberProgress = () => {
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('3m'); // 1m, 3m, 6m, 1y

  const [members] = useState<Member[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      membershipType: 'Premium',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
      joinDate: '2024-01-01',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      membershipType: 'Standard',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      joinDate: '2024-02-15',
    },
  ]);

  const [progressData] = useState<ProgressData[]>([
    { date: '2024-01-01', weight: 80, bodyFat: 25, muscleMass: 35, workoutsCompleted: 0 },
    { date: '2024-02-01', weight: 78, bodyFat: 23, muscleMass: 36, workoutsCompleted: 12 },
    { date: '2024-03-01', weight: 76, bodyFat: 21, muscleMass: 37, workoutsCompleted: 24 },
    { date: '2024-04-01', weight: 74, bodyFat: 20, muscleMass: 38, workoutsCompleted: 36 },
  ]);

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First 5kg Lost',
      description: 'Achieved first weight loss milestone',
      date: '2024-02-15',
      type: 'Weight Loss',
      icon: '🏆',
    },
    {
      id: '2',
      title: 'Consistent Attendance',
      description: 'Attended 20 workouts in a month',
      date: '2024-03-20',
      type: 'Consistency',
      icon: '🎯',
    },
    {
      id: '3',
      title: 'Strength Milestone',
      description: 'Increased bench press by 20kg',
      date: '2024-04-01',
      type: 'Strength',
      icon: '💪',
    },
  ]);

  const getTimeRangeData = () => {
    const months = {
      '1m': 1,
      '3m': 3,
      '6m': 6,
      '1y': 12,
    };
    const monthsToShow = months[timeRange as keyof typeof months];
    return progressData.slice(-monthsToShow);
  };

  const getProgressStats = () => {
    const data = getTimeRangeData();
    const first = data[0];
    const last = data[data.length - 1];
    
    return {
      weightChange: last.weight - first.weight,
      bodyFatChange: last.bodyFat - first.bodyFat,
      muscleMassChange: last.muscleMass - first.muscleMass,
      workoutsCompleted: last.workoutsCompleted - first.workoutsCompleted,
    };
  };

  const stats = getProgressStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Member Progress</h1>
        <div className="flex items-center space-x-4">
          <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Member
          </label>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Select Member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time Range
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Scale className="w-6 h-6 text-gray-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-500">Weight Change</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {stats.weightChange < 0 ? '-' : '+'}{Math.abs(stats.weightChange)} kg
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Target className="w-6 h-6 text-gray-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-500">Body Fat Change</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {stats.bodyFatChange < 0 ? '-' : '+'}{Math.abs(stats.bodyFatChange)}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Dumbbell className="w-6 h-6 text-gray-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-500">Muscle Mass Change</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {stats.muscleMassChange > 0 ? '+' : '-'}{Math.abs(stats.muscleMassChange)} kg
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 text-gray-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-500">Workouts Completed</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.workoutsCompleted}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Progress Chart</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={getTimeRangeData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#8884d8"
                  name="Weight (kg)"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="bodyFat"
                  stroke="#82ca9d"
                  name="Body Fat (%)"
                />
                <Line
                  type="monotone"
                  dataKey="muscleMass"
                  stroke="#ffc658"
                  name="Muscle Mass (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Workout Frequency</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getTimeRangeData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="workoutsCompleted"
                  fill="#8884d8"
                  name="Workouts"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{achievement.icon}</span>
                <h3 className="text-lg font-medium">{achievement.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(achievement.date).toLocaleDateString()}
              </div>
              <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                achievement.type === 'Weight Loss' ? 'bg-blue-100 text-blue-800' :
                achievement.type === 'Strength' ? 'bg-green-100 text-green-800' :
                achievement.type === 'Endurance' ? 'bg-purple-100 text-purple-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {achievement.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberProgress; 