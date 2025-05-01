import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Scale, 
  Ruler, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Loader
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showError } from '../../utils/toast';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface ProgressData {
  date: string;
  weight: number;
  bmi: number;
}

interface ProgressMetric {
  value: number;
  date: string;
  _id?: string;
}

interface ProgressMetrics {
  weight?: ProgressMetric[];
  height?: ProgressMetric[];
  bodyFat?: ProgressMetric[];
  muscleMass?: ProgressMetric[];
  chestMeasurement?: ProgressMetric[];
  waistMeasurement?: ProgressMetric[];
  armMeasurement?: ProgressMetric[];
  legMeasurement?: ProgressMetric[];
}

const Progress = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetrics>({});
  const [stats, setStats] = useState({
    startWeight: 0,
    currentWeight: 0,
    startBMI: 0,
    currentBMI: 0,
    goalWeight: 0,
    goalBMI: 0
  });

  useEffect(() => {
    const fetchProgressData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/members/${user.id}/progress`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch progress data');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Get progress metrics from API
          const metrics = data.data.progressMetrics || {};
          setProgressMetrics(metrics);
          
          // Format data for charts
          const formattedProgress: ProgressData[] = [];
          
          // Process weight data if available
          if (metrics.weight && metrics.weight.length > 0) {
            const sortedWeights = [...metrics.weight].sort((a, b) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            );
            
            // Get height for BMI calculation
            let height = 170; // Default height in cm
            if (metrics.height && metrics.height.length > 0) {
              height = metrics.height[metrics.height.length - 1].value;
            }
            
            // Calculate BMI for each weight entry
            sortedWeights.forEach(entry => {
              const bmi = calculateBMI(entry.value, height);
              formattedProgress.push({
                date: entry.date,
                weight: entry.value,
                bmi: parseFloat(bmi)
              });
            });
            
            // Set stats
            if (formattedProgress.length > 0) {
              const first = formattedProgress[0];
              const last = formattedProgress[formattedProgress.length - 1];
              
              // Estimate goal weight (5% less than starting weight)
              const goalWeight = Math.round(first.weight * 0.95);
              
              setStats({
                startWeight: first.weight,
                currentWeight: last.weight,
                startBMI: first.bmi,
                currentBMI: last.bmi,
                goalWeight,
                goalBMI: parseFloat(calculateBMI(goalWeight, height))
              });
            }
          }
          
          setProgress(formattedProgress);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching progress data:', error);
        showError('Failed to load progress data');
        setLoading(false);
      }
    };
    
    fetchProgressData();
  }, [user]);

  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (progress.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Scale className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">No Progress Data Available</h2>
        <p className="text-gray-500 mt-2">Start recording your progress to track your fitness journey.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress Tracking</h1>
          <p className="text-gray-500">Monitor your fitness journey</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Current Weight</div>
          <div className="text-2xl font-bold text-gray-900">{stats.currentWeight} kg</div>
          <div className={`text-sm flex items-center ${stats.startWeight > stats.currentWeight ? 'text-green-500' : 'text-red-500'}`}>
            {stats.startWeight > stats.currentWeight ? (
              <>
                <ArrowDownRight className="w-4 h-4 mr-1" />
                <span>{(stats.startWeight - stats.currentWeight).toFixed(1)} kg lost</span>
              </>
            ) : (
              <>
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span>{(stats.currentWeight - stats.startWeight).toFixed(1)} kg gained</span>
              </>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Current BMI</div>
          <div className="text-2xl font-bold text-gray-900">{stats.currentBMI}</div>
          <div className="text-sm text-gray-500">
            {getBMICategory(stats.currentBMI)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Goal Weight</div>
          <div className="text-2xl font-bold text-gray-900">{stats.goalWeight} kg</div>
          <div className="text-sm text-gray-500">
            {Math.max(0, stats.currentWeight - stats.goalWeight).toFixed(1)} kg to go
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Goal BMI</div>
          <div className="text-2xl font-bold text-gray-900">{stats.goalBMI}</div>
          <div className="text-sm text-gray-500">
            {getBMICategory(stats.goalBMI)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weight Progress</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={progress}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  labelFormatter={(value) => `Date: ${formatDate(value.toString())}`}
                  formatter={(value) => [`${value} kg`, 'Weight']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  name="Weight (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">BMI Progress</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={progress}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                />
                <YAxis 
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  label={{ value: 'BMI', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  labelFormatter={(value) => `Date: ${formatDate(value.toString())}`}
                  formatter={(value) => [`${value}`, 'BMI']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bmi"
                  stroke="#82ca9d"
                  activeDot={{ r: 8 }}
                  name="BMI"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BMI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {progress.map((data, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(data.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.weight} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.bmi}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      data.bmi < 18.5 ? 'bg-blue-100 text-blue-800' :
                      data.bmi < 25 ? 'bg-green-100 text-green-800' :
                      data.bmi < 30 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getBMICategory(data.bmi)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Progress; 