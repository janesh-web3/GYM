import { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  ArrowRight,
  TrendingUp,
  Dumbbell,
  Clock,
  Loader
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showError } from '../../utils/toast';

interface QuickCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

interface Shortcut {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  type: 'workout' | 'attendance' | 'message' | 'member';
}

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalMembers: 0,
    attendanceToday: 0,
    newMessages: 0,
    recentActivities: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (!user) return;

        // Fetch trainer's assigned members
        const membersResponse = await fetch(`/api/trainers/${user.id}/members`);
        if (!membersResponse.ok) {
          throw new Error('Failed to fetch assigned members');
        }
        
        const membersData = await membersResponse.json();
        const totalMembers = membersData.data ? membersData.data.length : 0;
        
        // Fetch today's attendance
        const today = new Date().toISOString().split('T')[0];
        const attendanceResponse = await fetch(`/api/attendance?trainerId=${user.id}&date=${today}`);
        if (!attendanceResponse.ok) {
          throw new Error('Failed to fetch attendance data');
        }
        
        const attendanceData = await attendanceResponse.json();
        const attendanceToday = attendanceData.data ? attendanceData.data.filter((a: { status: string; }) => a.status === 'present').length : 0;
        
        // Fetch unread messages count
        const messagesResponse = await fetch(`/api/messages?trainerId=${user.id}&unread=true`);
        if (!messagesResponse.ok) {
          throw new Error('Failed to fetch messages');
        }
        
        const messagesData = await messagesResponse.json();
        const newMessages = messagesData.data ? messagesData.data.length : 0;
        
        // Fetch recent activities
        const activitiesResponse = await fetch(`/api/trainers/${user.id}/activities`);
        if (!activitiesResponse.ok) {
          throw new Error('Failed to fetch recent activities');
        }
        
        const activitiesData = await activitiesResponse.json();
        
        setDashboardData({
          totalMembers,
          attendanceToday,
          newMessages,
          recentActivities: activitiesData.data || []
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const quickCards: QuickCard[] = [
    {
      title: 'Total Assigned Members',
      value: loading ? '-' : dashboardData.totalMembers.toString(),
      icon: <Users className="w-6 h-6" />,
      description: 'Active members'
    },
    {
      title: "Today's Attendance",
      value: loading ? '-' : `${dashboardData.attendanceToday}/${dashboardData.totalMembers}`,
      icon: <Calendar className="w-6 h-6" />,
      description: 'Members checked in'
    },
    {
      title: 'New Messages',
      value: loading ? '-' : dashboardData.newMessages.toString(),
      icon: <MessageSquare className="w-6 h-6" />,
      description: 'Unread messages'
    }
  ];

  const shortcuts: Shortcut[] = [
    {
      title: 'Member Progress',
      description: 'View member progress reports',
      icon: <TrendingUp className="w-5 h-5" />,
      link: '/trainer/members'
    },
    {
      title: 'Create Workout Plan',
      description: 'Design new workout plans',
      icon: <Dumbbell className="w-5 h-5" />,
      link: '/trainer/workout-planner'
    },
    {
      title: 'Check Attendance',
      description: 'Mark member attendance',
      icon: <Clock className="w-5 h-5" />,
      link: '/trainer/attendance'
    }
  ];
  
  // Format recent activities from API data
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'workout':
        return <Dumbbell className="w-5 h-5" />;
      case 'attendance':
        return <Calendar className="w-5 h-5" />;
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
      case 'member':
        return <Users className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };
  
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'workout':
        return 'bg-green-100 text-green-600';
      case 'attendance':
        return 'bg-blue-100 text-blue-600';
      case 'message':
        return 'bg-yellow-100 text-yellow-600';
      case 'member':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  
  // Format time ago for activities
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
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
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name || 'Trainer'}!</h1>
        <p className="text-gray-500">Here's what's happening today</p>
      </div>

      {/* Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickCards.map((card) => (
          <div key={card.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.description}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg text-primary-600">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Shortcuts */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shortcuts.map((shortcut) => (
            <a
              key={shortcut.title}
              href={shortcut.link}
              className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <div className="p-2 bg-primary-100 rounded-lg text-primary-600 mr-3">
                      {shortcut.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{shortcut.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{shortcut.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {dashboardData.recentActivities.length > 0 ? (
            dashboardData.recentActivities.map((activity: any) => (
              <div key={activity._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-3 ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{getTimeAgo(activity.timestamp)}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              No recent activities found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 