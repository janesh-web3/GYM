import { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  Clock4
} from 'lucide-react';

interface Session {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'Completed' | 'Missed' | 'Scheduled';
  type: 'Personal Training' | 'Group Class' | 'Consultation';
  notes: string;
}

const Attendance = () => {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      memberId: '1',
      memberName: 'Sarah Johnson',
      date: '2024-04-30',
      startTime: '09:00',
      endTime: '10:00',
      status: 'Completed',
      type: 'Personal Training',
      notes: 'Focused on strength training'
    },
    {
      id: '2',
      memberId: '2',
      memberName: 'Michael Brown',
      date: '2024-04-30',
      startTime: '10:30',
      endTime: '11:30',
      status: 'Scheduled',
      type: 'Group Class',
      notes: 'HIIT session'
    },
    {
      id: '3',
      memberId: '3',
      memberName: 'Emily Davis',
      date: '2024-04-30',
      startTime: '14:00',
      endTime: '15:00',
      status: 'Missed',
      type: 'Personal Training',
      notes: 'No show'
    }
  ]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Missed':
        return 'bg-red-100 text-red-800';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: Session['type']) => {
    switch (type) {
      case 'Personal Training':
        return 'bg-purple-100 text-purple-800';
      case 'Group Class':
        return 'bg-orange-100 text-orange-800';
      case 'Consultation':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesDate = session.date === selectedDate;
    const matchesSearch = session.memberName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDate && matchesSearch;
  });

  const handleMarkAttendance = (sessionId: string, status: 'Completed' | 'Missed') => {
    setSessions(sessions.map(session => {
      if (session.id === sessionId) {
        return { ...session, status };
      }
      return session;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500">Track member attendance and sessions</p>
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
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {session.memberName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{session.memberName}</div>
                        <div className="text-sm text-gray-500">
                          <Calendar className="w-4 h-4 inline-block mr-1" />
                          {new Date(session.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <Clock4 className="w-4 h-4 inline-block mr-1" />
                      {session.startTime} - {session.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(session.type)}`}>
                      {session.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      {session.status === 'Scheduled' && (
                        <>
                          <button
                            onClick={() => handleMarkAttendance(session.id, 'Completed')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(session.id, 'Missed')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {expandedSession === session.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Details */}
      {expandedSession && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Session Details</h3>
          {sessions
            .filter(session => session.id === expandedSession)
            .map(session => (
              <div key={session.id} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Member</p>
                    <p className="font-medium">{session.memberName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium">
                      {new Date(session.date).toLocaleDateString()} {session.startTime} - {session.endTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">{session.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">{session.status}</p>
                  </div>
                </div>
                {session.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="font-medium">{session.notes}</p>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Attendance; 