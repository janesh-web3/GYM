import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter,
  Eye,
  Edit,
  TrendingUp,
  Loader
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showError } from '../../utils/toast';

interface Member {
  id: string;
  name: string;
  age: number;
  goals: string[];
  bmi: number;
  lastWorkout: string;
  progress: number;
  email?: string;
  phone?: string;
  joinDate?: string;
  membershipType?: string;
  image?: string;
}

const Members = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        if (!user) return;

        const response = await fetch(`/api/trainers/${user.id}/members`);
        if (!response.ok) {
          throw new Error('Failed to fetch assigned members');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Map API response to our Member interface
          const formattedMembers = data.data.map((member: any) => ({
            id: member._id,
            name: member.name,
            age: calculateAge(member.dateOfBirth) || 30,
            goals: member.fitnessGoals || ['Not specified'],
            email: member.email,
            phone: member.phone,
            bmi: member.healthMetrics?.bmi || 22.5,
            lastWorkout: member.lastWorkout || new Date().toISOString(),
            progress: member.progress || Math.floor(Math.random() * 100),
            joinDate: member.joinDate,
            membershipType: member.membershipType,
            image: member.image
          }));
          
          setMembers(formattedMembers);
          setFilteredMembers(formattedMembers);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching members:', error);
        showError('Failed to load assigned members');
        setLoading(false);
      }
    };
    
    if (user) {
      fetchMembers();
    }
  }, [user]);

  // Calculate age from birth date
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Filter members based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        member.goals.some(goal => goal.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredMembers(filtered);
    }
  }, [searchTerm, members]);

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const handleViewMember = (memberId: string) => {
    // Navigate to member details or open modal
    console.log(`View member ${memberId}`);
  };

  const handleEditWorkout = (memberId: string) => {
    // Navigate to workout planner for this member
    console.log(`Edit workout for member ${memberId}`);
    window.location.href = `/trainer/workout-planner?memberId=${memberId}`;
  };

  const handleViewProgress = (memberId: string) => {
    // Navigate to progress tracking for this member
    console.log(`View progress for member ${memberId}`);
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assigned Members</h1>
          <p className="text-gray-500">Manage your assigned members and their progress</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
        {filteredMembers.length > 0 ? (
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
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {member.image ? (
                          <img 
                            src={member.image} 
                            alt={member.name} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 font-semibold">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.age} years</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        {member.goals.map((goal, index) => (
                          <span
                            key={`${member.id}-goal-${index}`}
                            className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-600 rounded-full"
                          >
                            {goal}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.bmi.toFixed(1)}</div>
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
                        <button 
                          onClick={() => handleViewMember(member.id)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Member Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleEditWorkout(member.id)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit Workout Plan"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleViewProgress(member.id)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Progress"
                        >
                          <TrendingUp className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Members Found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'No members match your search criteria.' : 'You don\'t have any assigned members yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Members; 