import { useState } from 'react';
import { 
  TrendingUp, 
  Scale, 
  Ruler, 
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface ProgressData {
  date: string;
  weight: number;
  bmi: number;
}

const Progress = () => {
  const [progress] = useState<ProgressData[]>([
    { date: '2024-04-01', weight: 80, bmi: 24.7 },
    { date: '2024-04-08', weight: 79.5, bmi: 24.5 },
    { date: '2024-04-15', weight: 78.8, bmi: 24.3 },
    { date: '2024-04-22', weight: 78.2, bmi: 24.1 },
    { date: '2024-04-29', weight: 77.5, bmi: 23.9 }
  ]);

  const [stats] = useState({
    startWeight: 80,
    currentWeight: 77.5,
    startBMI: 24.7,
    currentBMI: 23.9,
    goalWeight: 75,
    goalBMI: 23.1
  });

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

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
          <div className="text-sm text-green-500 flex items-center">
            <ArrowDownRight className="w-4 h-4 mr-1" />
            <span>{stats.startWeight - stats.currentWeight} kg lost</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Current BMI</div>
          <div className="text-2xl font-bold text-gray-900">{stats.currentBMI}</div>
          <div className="text-sm text-green-500">
            {getBMICategory(stats.currentBMI)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Goal Weight</div>
          <div className="text-2xl font-bold text-gray-900">{stats.goalWeight} kg</div>
          <div className="text-sm text-gray-500">
            {stats.currentWeight - stats.goalWeight} kg to go
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
          <div className="h-64 bg-gray-50 rounded-lg p-4">
            {/* Placeholder for weight chart */}
            <div className="flex items-end h-full space-x-2">
              {progress.map((data, index) => (
                <div key={index} className="flex-1">
                  <div 
                    className="bg-primary-500 rounded-t"
                    style={{ 
                      height: `${(data.weight - 75) * 10}%`,
                      minHeight: '20px'
                    }}
                  />
                  <div className="text-xs text-gray-500 text-center mt-2">
                    {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">BMI Progress</h2>
          <div className="h-64 bg-gray-50 rounded-lg p-4">
            {/* Placeholder for BMI chart */}
            <div className="flex items-end h-full space-x-2">
              {progress.map((data, index) => (
                <div key={index} className="flex-1">
                  <div 
                    className="bg-primary-500 rounded-t"
                    style={{ 
                      height: `${(data.bmi - 22) * 20}%`,
                      minHeight: '20px'
                    }}
                  />
                  <div className="text-xs text-gray-500 text-center mt-2">
                    {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
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