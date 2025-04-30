import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  status: 'present' | 'absent';
}

const Attendance = () => {
  const [attendance] = useState<AttendanceRecord[]>([
    {
      id: '1',
      date: '2024-04-30',
      checkIn: '09:30 AM',
      checkOut: '11:45 AM',
      duration: '2h 15m',
      status: 'present'
    },
    {
      id: '2',
      date: '2024-04-29',
      checkIn: '10:00 AM',
      checkOut: '12:30 PM',
      duration: '2h 30m',
      status: 'present'
    },
    {
      id: '3',
      date: '2024-04-28',
      checkIn: '-',
      checkOut: '-',
      duration: '-',
      status: 'absent'
    },
    {
      id: '4',
      date: '2024-04-27',
      checkIn: '09:15 AM',
      checkOut: '11:00 AM',
      duration: '1h 45m',
      status: 'present'
    }
  ]);

  const [stats] = useState({
    totalSessions: 12,
    averageDuration: '2h 10m',
    attendanceRate: '85%',
    streak: 3
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>
          <p className="text-gray-500">Track your gym sessions and progress</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Last 30 days</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Sessions</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalSessions}</div>
          <div className="text-sm text-green-500 flex items-center">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            <span>+2 from last month</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Average Duration</div>
          <div className="text-2xl font-bold text-gray-900">{stats.averageDuration}</div>
          <div className="text-sm text-green-500 flex items-center">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            <span>+15m from last month</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Attendance Rate</div>
          <div className="text-2xl font-bold text-gray-900">{stats.attendanceRate}</div>
          <div className="text-sm text-red-500 flex items-center">
            <ArrowDownRight className="w-4 h-4 mr-1" />
            <span>-5% from last month</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Current Streak</div>
          <div className="text-2xl font-bold text-gray-900">{stats.streak} days</div>
          <div className="text-sm text-green-500">Keep it up!</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendance.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.checkIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.checkOut}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.status === 'present' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Present
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Absent
                      </span>
                    )}
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