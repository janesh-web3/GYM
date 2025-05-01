import { useState, useEffect } from 'react';
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
  Download,
  Users,
  Loader
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError, showLoading, updateToast } from '../../utils/toast';
import { gymService } from '../../lib/services';

interface Member {
  id: string;
  name: string;
  email: string;
  membershipType: string;
  image?: string;
  joinDate: string;
}

interface ProgressData {
  date: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  chestMeasurement?: number;
  waistMeasurement?: number;
  armMeasurement?: number;
  legMeasurement?: number;
  workoutsCompleted?: number;
}

interface MetricEntry {
  value: number;
  unit?: string;
  date: string;
}

interface ProgressMetrics {
  weight: MetricEntry[];
  height: MetricEntry[];
  bodyFat: MetricEntry[];
  muscleMass: MetricEntry[];
  chestMeasurement: MetricEntry[];
  waistMeasurement: MetricEntry[];
  armMeasurement: MetricEntry[];
  legMeasurement: MetricEntry[];
}

interface MemberProgress {
  BMI?: number;
  progressMetrics: ProgressMetrics;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  icon: string;
}

interface GymResponse {
  _id: string;
  name: string;
  [key: string]: any;
}

const MemberProgress = () => {
  const { user } = useAuth();
  const [gymId, setGymId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('3m'); // 1m, 3m, 6m, 1y

  const [members, setMembers] = useState<Member[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [rawProgress, setRawProgress] = useState<MemberProgress | null>(null);
  
  const [newMetric, setNewMetric] = useState({
    metricType: 'weight',
    value: '',
    unit: 'kg',
    date: new Date().toISOString().split('T')[0]
  });

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

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // In a real app, we'd fetch the gym ID associated with this owner
        const gyms = await gymService.getAllGyms() as GymResponse[];
        if (gyms && gyms.length > 0) {
          const gymId = gyms[0]._id;
          setGymId(gymId);
          
          // Fetch members
          const membersResponse = await fetch(`/api/members?gymId=${gymId}`);
          if (!membersResponse.ok) {
            throw new Error('Failed to fetch members');
          }
          
          const membersData = await membersResponse.json();
          if (membersData.success && membersData.data) {
            const fetchedMembers = membersData.data.map((member: any) => ({
              id: member._id,
              name: member.name,
              email: member.email,
              membershipType: member.membershipType || 'Standard',
              image: member.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
              joinDate: member.joinedDate || new Date().toISOString().split('T')[0]
            }));
            
            setMembers(fetchedMembers);
            
            // If members exist, select the first one
            if (fetchedMembers.length > 0) {
              setSelectedMember(fetchedMembers[0].id);
              await fetchMemberProgress(fetchedMembers[0].id);
            }
          }
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        showError('Failed to load members');
        console.error('Error fetching data:', error);
      }
    };
    
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  const fetchMemberProgress = async (memberId: string) => {
    if (!memberId) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/members/${memberId}/progress`);
      if (!response.ok) {
        throw new Error('Failed to fetch progress data');
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        setRawProgress(data.data);
        
        // Transform raw progress data into time series
        const progressMetrics = data.data.progressMetrics;
        const timeSeriesData: ProgressData[] = [];
        
        // Get all unique dates from all metrics
        const allDates = new Set<string>();
        Object.values(progressMetrics).forEach((metricEntries: any) => {
          metricEntries.forEach((entry: any) => {
            allDates.add(new Date(entry.date).toISOString().split('T')[0]);
          });
        });
        
        // Sort dates
        const sortedDates = Array.from(allDates).sort();
        
        // Create a progress data point for each date
        sortedDates.forEach(date => {
          const dataPoint: ProgressData = { date };
          
          // Find the closest value for each metric on or before this date
          if (progressMetrics.weight) {
            const weightEntry = findClosestEntry(progressMetrics.weight, date);
            if (weightEntry) dataPoint.weight = weightEntry.value;
          }
          
          if (progressMetrics.bodyFat) {
            const bodyFatEntry = findClosestEntry(progressMetrics.bodyFat, date);
            if (bodyFatEntry) dataPoint.bodyFat = bodyFatEntry.value;
          }
          
          if (progressMetrics.muscleMass) {
            const muscleMassEntry = findClosestEntry(progressMetrics.muscleMass, date);
            if (muscleMassEntry) dataPoint.muscleMass = muscleMassEntry.value;
          }
          
          if (progressMetrics.chestMeasurement) {
            const chestEntry = findClosestEntry(progressMetrics.chestMeasurement, date);
            if (chestEntry) dataPoint.chestMeasurement = chestEntry.value;
          }
          
          if (progressMetrics.waistMeasurement) {
            const waistEntry = findClosestEntry(progressMetrics.waistMeasurement, date);
            if (waistEntry) dataPoint.waistMeasurement = waistEntry.value;
          }
          
          if (progressMetrics.armMeasurement) {
            const armEntry = findClosestEntry(progressMetrics.armMeasurement, date);
            if (armEntry) dataPoint.armMeasurement = armEntry.value;
          }
          
          if (progressMetrics.legMeasurement) {
            const legEntry = findClosestEntry(progressMetrics.legMeasurement, date);
            if (legEntry) dataPoint.legMeasurement = legEntry.value;
          }
          
          timeSeriesData.push(dataPoint);
        });
        
        setProgressData(timeSeriesData);
      }
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      showError('Failed to fetch progress data');
      console.error('Error fetching progress data:', error);
    }
  };

  const findClosestEntry = (entries: MetricEntry[], targetDate: string) => {
    const target = new Date(targetDate).getTime();
    
    // Filter entries that are on or before the target date
    const previousEntries = entries.filter(entry => 
      new Date(entry.date).getTime() <= target
    );
    
    if (previousEntries.length === 0) return null;
    
    // Sort by date (newest first)
    previousEntries.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Return the most recent entry
    return previousEntries[0];
  };

  const handleMemberChange = async (memberId: string) => {
    setSelectedMember(memberId);
    await fetchMemberProgress(memberId);
  };

  const handleRecordProgress = async () => {
    if (!selectedMember) {
      showError('Please select a member');
      return;
    }
    
    if (!newMetric.value || isNaN(parseFloat(newMetric.value))) {
      showError('Please enter a valid value');
      return;
    }
    
    const toastId = showLoading('Recording progress...');
    setSaving(true);
    
    try {
      // Prepare metric data
      const metricData = {
        value: parseFloat(newMetric.value),
        unit: newMetric.unit,
        date: newMetric.date
      };
      
      // Call API to record progress
      const response = await fetch(`/api/members/${selectedMember}/progress/${newMetric.metricType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metricData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to record progress');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh progress data
        await fetchMemberProgress(selectedMember);
        
        // Reset form
        setNewMetric({
          metricType: 'weight',
          value: '',
          unit: 'kg',
          date: new Date().toISOString().split('T')[0]
        });
        
        updateToast(toastId, 'Progress recorded successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to record progress');
      }
      
      setSaving(false);
    } catch (error) {
      setSaving(false);
      updateToast(toastId, 'Failed to record progress', 'error');
      console.error('Error recording progress:', error);
    }
  };

  const getTimeRangeData = () => {
    if (progressData.length === 0) {
      return [];
    }
    
    const months = {
      '1m': 1,
      '3m': 3,
      '6m': 6,
      '1y': 12,
    };
    
    const monthsToShow = months[timeRange as keyof typeof months];
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsToShow);
    
    return progressData.filter(data => new Date(data.date) >= cutoffDate);
  };

  const getProgressStats = () => {
    const data = getTimeRangeData();
    
    if (data.length < 2) {
      return {
        weightChange: 0,
        bodyFatChange: 0,
        muscleMassChange: 0,
        workoutsCompleted: 0,
      };
    }
    
    const first = data[0];
    const last = data[data.length - 1];
    
    return {
      weightChange: calculateChange(last.weight, first.weight),
      bodyFatChange: calculateChange(last.bodyFat, first.bodyFat),
      muscleMassChange: calculateChange(last.muscleMass, first.muscleMass),
      workoutsCompleted: 24, // This would ideally come from the attendance data
    };
  };

  const calculateChange = (current?: number, previous?: number) => {
    if (current === undefined || previous === undefined) {
      return 0;
    }
    return current - previous;
  };

  const stats = getProgressStats();

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
        <h1 className="text-2xl font-bold text-gray-900">Member Progress</h1>
        <div className="flex items-center space-x-4">
          <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Member
          </label>
          <select
            value={selectedMember}
              onChange={(e) => handleMemberChange(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Select Member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                  {member.name} ({member.email})
              </option>
            ))}
          </select>
        </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTimeRange('1m')}
              className={`px-3 py-1 rounded-md ${
                timeRange === '1m'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              1 Month
            </button>
            <button
              onClick={() => setTimeRange('3m')}
              className={`px-3 py-1 rounded-md ${
                timeRange === '3m'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              3 Months
            </button>
            <button
              onClick={() => setTimeRange('6m')}
              className={`px-3 py-1 rounded-md ${
                timeRange === '6m'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setTimeRange('1y')}
              className={`px-3 py-1 rounded-md ${
                timeRange === '1y'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              1 Year
            </button>
          </div>
        </div>

        {!selectedMember ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Select a member to view progress</p>
      </div>
        ) : (
          <>
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

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Record New Progress</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Metric Type
                  </label>
                  <select
                    value={newMetric.metricType}
                    onChange={(e) => setNewMetric({ ...newMetric, metricType: e.target.value })}
                    className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="weight">Weight</option>
                    <option value="bodyFat">Body Fat</option>
                    <option value="muscleMass">Muscle Mass</option>
                    <option value="chestMeasurement">Chest Measurement</option>
                    <option value="waistMeasurement">Waist Measurement</option>
                    <option value="armMeasurement">Arm Measurement</option>
                    <option value="legMeasurement">Leg Measurement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value
                  </label>
                  <input
                    type="number"
                    value={newMetric.value}
                    onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
                    className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={newMetric.unit}
                    onChange={(e) => setNewMetric({ ...newMetric, unit: e.target.value })}
                    className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    {newMetric.metricType === 'weight' || newMetric.metricType === 'muscleMass' ? (
                      <>
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                      </>
                    ) : newMetric.metricType === 'bodyFat' ? (
                      <option value="%">%</option>
                    ) : (
                      <>
                        <option value="cm">cm</option>
                        <option value="in">in</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newMetric.date}
                    onChange={(e) => setNewMetric({ ...newMetric, date: e.target.value })}
                    className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
          </div>
                <div className="flex items-end">
                  <button
                    onClick={handleRecordProgress}
                    disabled={saving}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
                  >
                    {saving ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Record Progress'
                    )}
                  </button>
          </div>
        </div>
      </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Weight
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Body Fat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Muscle Mass
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Waist
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getTimeRangeData().map((data, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(data.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {data.weight !== undefined ? `${data.weight} kg` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {data.bodyFat !== undefined ? `${data.bodyFat}%` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {data.muscleMass !== undefined ? `${data.muscleMass} kg` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {data.chestMeasurement !== undefined ? `${data.chestMeasurement} cm` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {data.waistMeasurement !== undefined ? `${data.waistMeasurement} cm` : '-'}
                        </td>
                      </tr>
                    ))}
                    {getTimeRangeData().length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          No progress data available for this time range
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Member Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="bg-white rounded-lg shadow p-4 border-l-4 border-primary-500"
                  >
                    <div className="flex items-start">
                      <div className="text-2xl mr-3">{achievement.icon}</div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {achievement.description}
                        </p>
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                {new Date(achievement.date).toLocaleDateString()}
              </div>
                      </div>
                    </div>
            </div>
          ))}
        </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MemberProgress; 