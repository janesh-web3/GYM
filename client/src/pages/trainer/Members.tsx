import { 
  Users, 
  Search, 
  Filter,
  Eye,
  Edit,
  TrendingUp
} from 'lucide-react';

interface Member {
  id: string;
  name: string;
  age: number;
  goals: string[];
  bmi: number;
  lastWorkout: string;
  progress: number;
}

const Members = () => {
  const members: Member[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      age: 28,
      goals: ['Weight Loss', 'Strength Training'],
      bmi: 24.5,
      lastWorkout: '2024-04-30',
      progress: 75
    },
    {
      id: '2',
      name: 'Michael Brown',
      age: 35,
      goals: ['Muscle Gain', 'Endurance'],
      bmi: 22.8,
      lastWorkout: '2024-04-29',
      progress: 60
    },
    {
      id: '3',
      name: 'Emily Davis',
      age: 32,
      goals: ['Flexibility', 'Core Strength'],
      bmi: 23.2,
      lastWorkout: '2024-04-28',
      progress: 85
    }
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Assigned Members</h1>
          <p className="text-gray-500">Manage your assigned members and their progress</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search members..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goals</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BMI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Workout</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.age} years</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {member.goals.map((goal) => (
                        <span
                          key={goal}
                          className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-600 rounded-full"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.bmi}</div>
                    <div className="text-xs text-gray-500">{getBMICategory(member.bmi)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.lastWorkout).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-primary-600 rounded-full"
                          style={{ width: `${member.progress}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm text-gray-500">{member.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button className="text-primary-600 hover:text-primary-900">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="text-primary-600 hover:text-primary-900">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="text-primary-600 hover:text-primary-900">
                        <TrendingUp className="w-5 h-5" />
                      </button>
                    </div>
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

export default Members; 