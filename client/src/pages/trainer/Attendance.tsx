import { useState, useEffect } from 'react';
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
  Clock4,
  Loader
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError, showLoading, updateToast } from '../../utils/toast';

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
  memberImage?: string;
}

const Attendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  // Fetch sessions for the selected date
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        if (!user) return;

        // Fetch trainer's sessions for selected date
        const response = await fetch(`/api/sessions?trainerId=${user.id}&date=${selectedDate}`);
        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Map API response to our Session interface
          const formattedSessions = data.data.map((session: any) => {
            const memberData = session.memberIds && session.memberIds.length > 0 
              ? session.memberIds[0] 
              : { _id: 'unknown', name: 'Unassigned' };

            return {
              id: session._id,
              memberId: memberData._id,
              memberName: memberData.name,
              memberImage: memberData.image,
              date: new Date(session.date).toISOString().split('T')[0],
              startTime: session.startTime,
              endTime: session.endTime,
              status: session.status === 'completed' ? 'Completed' : 
                     session.status === 'missed' ? 'Missed' : 'Scheduled',
              type: session.sessionType === 'individual' ? 'Personal Training' :
                   session.sessionType === 'group' ? 'Group Class' : 'Consultation',
              notes: session.notes || ''
            };
          });
          
          setSessions(formattedSessions);
          
          // Initialize notes state with existing notes
          const initialNotes: Record<string, string> = {};
          formattedSessions.forEach((session: { id: string | number; notes: string; }) => {
            initialNotes[session.id] = session.notes;
          });
          setNotes(initialNotes);
          
          // Apply any current filters
          filterSessions(formattedSessions, searchTerm);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        showError('Failed to load sessions');
        setLoading(false);
      }
    };
    
    if (user) {
      fetchSessions();
    }
  }, [user, selectedDate]);

  // Filter sessions based on search term
  const filterSessions = (sessionsData: Session[], search: string) => {
    if (search.trim() === '') {
      setFilteredSessions(sessionsData);
    } else {
      const filtered = sessionsData.filter(session => 
        session.memberName.toLowerCase().includes(search.toLowerCase()) ||
        session.type.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredSessions(filtered);
    }
  };

  useEffect(() => {
    filterSessions(sessions, searchTerm);
  }, [searchTerm, sessions]);

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

  const handleMarkAttendance = async (sessionId: string, status: 'Completed' | 'Missed') => {
    if (!user) return;
    
    // Set saving indicator for this session
    setSaving(prev => ({ ...prev, [sessionId]: true }));
    const toastId = showLoading(`Marking attendance as ${status.toLowerCase()}...`);
    
    try {
      // Find the session to get member ID
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      // Prepare attendance data
      const attendanceData = {
        sessionId: sessionId,
        trainerId: user.id,
        memberId: session.memberId,
        date: selectedDate,
        status: status === 'Completed' ? 'present' : 'absent',
        notes: notes[sessionId] || ''
      };
      
      // Call API to mark attendance
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark attendance');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update session status in UI
        setSessions(sessions.map(session => {
          if (session.id === sessionId) {
            return { ...session, status };
          }
          return session;
        }));
        
        updateToast(toastId, `Attendance marked as ${status.toLowerCase()}`, 'success');
      } else {
        throw new Error(data.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      updateToast(toastId, 'Failed to mark attendance', 'error');
    } finally {
      // Clear saving indicator for this session
      setSaving(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const handleNotesChange = (sessionId: string, value: string) => {
    setNotes(prev => ({ ...prev, [sessionId]: value }));
  };

  const handleSaveNotes = async (sessionId: string) => {
    if (!user) return;
    
    // Set saving indicator for this session
    setSaving(prev => ({ ...prev, [sessionId]: true }));
    const toastId = showLoading('Saving notes...');
    
    try {
      // Call API to update session notes
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: notes[sessionId] }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save notes');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update session in UI
        setSessions(sessions.map(session => {
          if (session.id === sessionId) {
            return { ...session, notes: notes[sessionId] || '' };
          }
          return session;
        }));
        
        updateToast(toastId, 'Notes saved successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to save notes');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      updateToast(toastId, 'Failed to save notes', 'error');
    } finally {
      // Clear saving indicator for this session
      setSaving(prev => ({ ...prev, [sessionId]: false }));
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

      {filteredSessions.length > 0 ? (
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
                  <>
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {session.memberImage ? (
                            <img 
                              src={session.memberImage} 
                              alt={session.memberName} 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-600 font-semibold">
                                {session.memberName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          )}
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
                          {session.status === 'Scheduled' ? (
                            <>
                              <button
                                onClick={() => handleMarkAttendance(session.id, 'Completed')}
                                disabled={saving[session.id]}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleMarkAttendance(session.id, 'Missed')}
                                disabled={saving[session.id]}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">Marked</span>
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
                    {expandedSession === session.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Session Notes</h4>
                              <div className="mt-2 flex items-start space-x-2">
                                <textarea
                                  value={notes[session.id] || ''}
                                  onChange={(e) => handleNotesChange(session.id, e.target.value)}
                                  rows={3}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                                  placeholder="Add notes about this session..."
                                />
                                <button
                                  onClick={() => handleSaveNotes(session.id)}
                                  disabled={saving[session.id]}
                                  className="px-3 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Found</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'No sessions match your search criteria.' 
              : `No sessions scheduled for ${new Date(selectedDate).toLocaleDateString()}.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Attendance; 