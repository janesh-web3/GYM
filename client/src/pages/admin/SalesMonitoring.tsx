import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download
} from 'lucide-react';

interface RevenueData {
  date: string;
  amount: number;
}

interface Payment {
  id: string;
  gymName: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  type: 'subscription' | 'product' | 'service';
}

const revenueData: RevenueData[] = [
  { date: '2024-04-01', amount: 12000 },
  { date: '2024-04-02', amount: 15000 },
  { date: '2024-04-03', amount: 18000 },
  { date: '2024-04-04', amount: 14000 },
  { date: '2024-04-05', amount: 16000 },
  { date: '2024-04-06', amount: 19000 },
  { date: '2024-04-07', amount: 22000 }
];

const payments: Payment[] = [
  {
    id: '1',
    gymName: 'FitLife Gym',
    amount: 1200,
    date: '2024-04-30',
    status: 'completed',
    type: 'subscription'
  },
  {
    id: '2',
    gymName: 'Power Fitness',
    amount: 850,
    date: '2024-04-29',
    status: 'pending',
    type: 'product'
  },
  {
    id: '3',
    gymName: 'Elite Training',
    amount: 1500,
    date: '2024-04-28',
    status: 'completed',
    type: 'service'
  },
  {
    id: '4',
    gymName: 'Iron Temple',
    amount: 950,
    date: '2024-04-27',
    status: 'failed',
    type: 'subscription'
  }
];

const SalesMonitoring = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedType, setSelectedType] = useState('all');

  const totalRevenue = revenueData.reduce((sum, data) => sum + data.amount, 0);
  const averageRevenue = totalRevenue / revenueData.length;
  const revenueChange = ((revenueData[revenueData.length - 1].amount - revenueData[0].amount) / revenueData[0].amount) * 100;

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: Payment['type']) => {
    switch (type) {
      case 'subscription':
        return 'bg-blue-100 text-blue-800';
      case 'product':
        return 'bg-purple-100 text-purple-800';
      case 'service':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPayments = payments.filter(
    (payment) => selectedType === 'all' || payment.type === selectedType
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Sales & Payments</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor platform revenue and payment transactions
        </p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span
              className={`flex items-center text-sm font-medium ${
                revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {revenueChange >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(revenueChange).toFixed(1)}%
            </span>
            <span className="ml-2 text-sm text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Daily Revenue</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                ${averageRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Based on last 7 days</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Transactions</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {payments.length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Across all gyms</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
          </select>
          <Calendar className="w-5 h-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Types</option>
            <option value="subscription">Subscriptions</option>
            <option value="product">Products</option>
            <option value="service">Services</option>
          </select>
          <Filter className="w-5 h-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>
        <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </button>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gym
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.gymName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${payment.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(payment.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(
                        payment.type
                      )}`}
                    >
                      {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
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

export default SalesMonitoring; 