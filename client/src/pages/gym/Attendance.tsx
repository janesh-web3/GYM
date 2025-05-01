import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle2, XCircle, Filter, Download, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError, showLoading, updateToast } from '../../utils/toast';
import { gymService } from '../../lib/services';

interface Member {
  id: string;
  name: string;
  email: string;
  membershipType: string;
  image?: string;
}

interface Class {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  trainer: string;
  location: string;
}

interface AttendanceRecord {
  id: string;
  userId: string;
  memberId?: string;
  gymId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'incomplete';
  duration?: number;
  notes?: string;
  member?: Member;
  class?: Class;
}

interface GymResponse {
  _id: string;
  name: string;
  [key: string]: any;
}

const Attendance = () => {
  const { user } = useAuth();
  const [gymId, setGymId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const fetchData = async () => {
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
            setMembers(membersData.data.map((member: any) => ({
              id: member._id,
              name: member.name,
              email: member.email,
              membershipType: member.membershipType,
              image: member.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'
            })));
          }
          
          // Fetch classes
          const classesResponse = await fetch(`/api/sessions?gymId=${gymId}`);
          if (!classesResponse.ok) {
            throw new Error('Failed to fetch classes');
          }
          
          const classesData = await classesResponse.json();
          if (classesData.success && classesData.data) {
            setClasses(classesData.data.map((classItem: any) => ({
              id: classItem._id,
              title: classItem.title,
              date: new Date(classItem.startTime).toISOString().split('T')[0],
              startTime: new Date(classItem.startTime).toTimeString().slice(0, 5),
              endTime: new Date(classItem.endTime).toTimeString().slice(0, 5),
              trainer: classItem.trainerId?.name || 'Not assigned',
              location: classItem.location || 'Main gym area'
            })));
          }
          
          // Fetch attendance records for selected date
          await fetchAttendanceRecords(gymId, selectedDate);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        showError('Failed to load data');
        console.error('Error fetching data:', error);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchAttendanceRecords = async (gymId: string, date: string) => {
    try {
      const response = await fetch(`/api/attendance?gymId=${gymId}&date=${date}`);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance records');
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        const records = data.data.map((record: any) => {
          // Find the member data
          const memberData = members.find(m => m.id === record.userId) || {
            id: record.userId,
            name: 'Unknown Member',
            email: '',
            membershipType: ''
          };
          
          return {
            id: record._id,
            userId: record.userId,
            gymId: record.gymId,
            date: new Date(record.date).toISOString().split('T')[0],
            checkIn: new Date(record.checkIn).toTimeString().slice(0, 5),
            checkOut: record.checkOut ? new Date(record.checkOut).toTimeString().slice(0, 5) : undefined,
            status: record.status,
            duration: record.duration,
            notes: record.notes,
            member: memberData
          };
        });
        
        setAttendanceRecords(records);
      }
    } catch (error) {
      showError('Failed to fetch attendance records');
      console.error('Error fetching attendance records:', error);
    }
  };

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    if (gymId) {
      await fetchAttendanceRecords(gymId, date);
    }
  };

  const handleMarkAttendance = async (memberId: string, status: 'present' | 'absent' | 'late') => {
    if (!gymId) {
      showError('No gym associated with this account');
      return;
    }
    
    const currentTime = new Date().toTimeString().slice(0, 5);
    const toastId = showLoading(`Marking attendance as ${status}...`);
    setSaving(true);
    
    try {
      // Prepare attendance data
      const attendanceData = {
        userId: memberId,
        gymId: gymId,
        date: selectedDate,
        checkIn: status === 'absent' ? null : new Date().toISOString(),
        status: status
      };
      
      // Call API to create attendance record
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
        const member = members.find(m => m.id === memberId);
    const newRecord: AttendanceRecord = {
          id: data.data._id,
          userId: memberId,
          gymId: gymId,
          date: selectedDate,
          checkIn: currentTime,
          status: status,
      notes: '',
          member: member,
    };
        
    setAttendanceRecords(prev => [...prev, newRecord]);
        
        updateToast(toastId, 'Attendance marked successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to mark attendance');
      }
      
      setSaving(false);
    } catch (error) {
      setSaving(false);
      updateToast(toastId, 'Failed to mark attendance', 'error');
      console.error('Error marking attendance:', error);
    }
  };

  const handleUpdateAttendance = async (id: string, notes: string) => {
    if (!gymId) {
      showError('No gym associated with this account');
      return;
    }
    
    const toastId = showLoading('Updating attendance record...');
    setSaving(true);
    
    try {
      // Call API to update attendance record
      const response = await fetch(`/api/attendance/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update attendance record');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setAttendanceRecords(prev =>
          prev.map(record => (record.id === id ? { ...record, notes } : record))
        );
        
        updateToast(toastId, 'Attendance record updated successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to update attendance record');
      }
      
      setSaving(false);
    } catch (error) {
      setSaving(false);
      updateToast(toastId, 'Failed to update attendance record', 'error');
      console.error('Error updating attendance record:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'incomplete':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormattedStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredMembers = searchQuery 
    ? members.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : members;

  const filteredAttendance = selectedClass 
    ? attendanceRecords.filter(record => record.class?.id === selectedClass)
    : attendanceRecords;

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
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <div className="flex items-center space-x-4">
          <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">All Classes</option>
              {classes.filter(c => c.date === selectedDate).map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.title} ({classItem.startTime} - {classItem.endTime})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendance.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={record.member?.image || 'https://via.placeholder.com/40'}
                        alt={record.member?.name}
                        className="h-8 w-8 rounded-full"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.member?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.member?.membershipType}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.class?.title || 'General Check-in'}</div>
                    {record.class && (
                      <div className="text-xs text-gray-500">{record.class.location}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {record.checkIn} 
                      {record.checkOut && ` - ${record.checkOut}`}
                    </div>
                    {record.duration && (
                      <div className="text-xs text-gray-500">{record.duration} min</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        record.status
                      )}`}
                    >
                      {getFormattedStatus(record.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={record.notes || ''}
                      onChange={(e) => {
                        setAttendanceRecords(prev =>
                          prev.map(r => r.id === record.id ? { ...r, notes: e.target.value } : r)
                        );
                      }}
                      onBlur={() => handleUpdateAttendance(record.id, record.notes || '')}
                      className="text-sm w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Add notes..."
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                    <button
                        onClick={() => 
                          handleMarkAttendance(record.userId, 
                            record.status === 'present' ? 'absent' : 'present'
                          )
                        }
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {record.status === 'present' ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Members who don't have attendance records yet */}
              {filteredMembers
                .filter(
                  member => !attendanceRecords.some(record => record.userId === member.id)
                )
                .map(member => (
                  <tr key={`unrecorded-${member.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={member.image || 'https://via.placeholder.com/40'}
                          alt={member.name}
                          className="h-8 w-8 rounded-full"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.membershipType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">Not checked in</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">-</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
                      >
                        Not recorded
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">-</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleMarkAttendance(member.id, 'present')}
                          className="text-gray-600 hover:text-gray-900"
                          title="Mark as Present"
                        >
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </button>
                        <button
                          onClick={() => handleMarkAttendance(member.id, 'absent')}
                          className="text-gray-600 hover:text-gray-900"
                          title="Mark as Absent"
                        >
                          <XCircle className="w-5 h-5 text-red-500" />
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

export default Attendance; 