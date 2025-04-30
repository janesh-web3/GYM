import { useState } from 'react';
import { Calendar, Clock, Users, CheckCircle2, XCircle, Filter, Download } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  membershipType: string;
  image: string;
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
  member: Member;
  class: Class;
  status: 'Present' | 'Absent' | 'Late';
  checkInTime: string;
  notes: string;
}

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: '1',
      member: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        membershipType: 'Premium',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
      },
      class: {
        id: '1',
        title: 'Morning Yoga',
        date: '2024-05-01',
        startTime: '07:00',
        endTime: '08:00',
        trainer: 'Sarah Johnson',
        location: 'Studio A',
      },
      status: 'Present',
      checkInTime: '06:55',
      notes: 'Early arrival',
    },
    {
      id: '2',
      member: {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        membershipType: 'Standard',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      },
      class: {
        id: '1',
        title: 'Morning Yoga',
        date: '2024-05-01',
        startTime: '07:00',
        endTime: '08:00',
        trainer: 'Sarah Johnson',
        location: 'Studio A',
      },
      status: 'Late',
      checkInTime: '07:10',
      notes: 'Traffic delay',
    },
  ]);

  const [classes] = useState<Class[]>([
    {
      id: '1',
      title: 'Morning Yoga',
      date: '2024-05-01',
      startTime: '07:00',
      endTime: '08:00',
      trainer: 'Sarah Johnson',
      location: 'Studio A',
    },
    {
      id: '2',
      title: 'Personal Training',
      date: '2024-05-01',
      startTime: '10:00',
      endTime: '11:00',
      trainer: 'Mike Smith',
      location: 'Private Room',
    },
  ]);

  const [members] = useState<Member[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      membershipType: 'Premium',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      membershipType: 'Standard',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    },
  ]);

  const handleMarkAttendance = (memberId: string, status: 'Present' | 'Absent' | 'Late') => {
    const currentTime = new Date().toTimeString().slice(0, 5);
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      member: members.find(m => m.id === memberId)!,
      class: classes.find(c => c.id === selectedClass)!,
      status,
      checkInTime: currentTime,
      notes: '',
    };
    setAttendanceRecords(prev => [...prev, newRecord]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
                onChange={(e) => setSelectedDate(e.target.value)}
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
              <option value="">Select Class</option>
              {classes.map((classItem) => (
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
              {attendanceRecords.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={record.member.image}
                        alt={record.member.name}
                        className="h-8 w-8 rounded-full"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.member.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.member.membershipType}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.class.title}</div>
                    <div className="text-sm text-gray-500">{record.class.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Clock className="w-4 h-4 mr-1" />
                      {record.checkInTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        record.status
                      )}`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.notes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleMarkAttendance(record.member.id, 'Present')}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleMarkAttendance(record.member.id, 'Absent')}
                      className="text-red-600 hover:text-red-900"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
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