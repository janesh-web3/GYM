import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  Loader,
  Search,
  ExternalLink,
  BarChart4
} from 'lucide-react';
import { showError } from '../../utils/toast';

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface Order {
  _id: string;
  userId: {
    name: string;
    email: string;
  };
  gymId?: {
    name: string;
  };
  totalAmount: number;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  createdAt: string;
}

interface TopSellingProduct {
  _id: string;
  totalSold: number;
  revenue: number;
  productDetails?: {
    name: string;
    category: string;
    price: number;
  };
}

interface CategoryBreakdown {
  _id: string;
  count: number;
  totalStock: number;
  avgPrice: number;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: RevenueData[];
  popularProducts: TopSellingProduct[];
  categoryBreakdown: CategoryBreakdown[];
}

const SalesMonitoring = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });

  useEffect(() => {
    fetchDashboardStats();
    fetchOrders();
  }, [selectedPeriod, pagination.page]);

  const fetchDashboardStats = async () => {
    try {
      setReportsLoading(true);
      
      // Fetch revenue reports
      const revenueResponse = await fetch(`/api/admin/reports/products?period=${selectedPeriod}`);
      
      if (!revenueResponse.ok) {
        throw new Error('Failed to fetch revenue data');
      }
      
      const revenueData = await revenueResponse.json();
      
      if (revenueData.success) {
        const dashboardData: DashboardStats = {
          totalRevenue: 0,
          monthlyRevenue: [],
          popularProducts: revenueData.data.topSellingQuery || [],
          categoryBreakdown: revenueData.data.categoryBreakdown || []
        };
        
        // Get total revenue from top selling products
        dashboardData.totalRevenue = dashboardData.popularProducts.reduce((sum, product) => sum + product.revenue, 0);
        
        // Get product details for popular products if needed
        if (dashboardData.popularProducts.length > 0) {
          // This would typically be done on the server, but we're just showing the fetch pattern
          for (const product of dashboardData.popularProducts) {
            try {
              const productResponse = await fetch(`/api/products/${product._id}`);
              if (productResponse.ok) {
                const productData = await productResponse.json();
                if (productData.success) {
                  product.productDetails = {
                    name: productData.data.name,
                    category: productData.data.category,
                    price: productData.data.price
                  };
                }
              }
            } catch (e) {
              console.error(`Error fetching product details for ${product._id}:`, e);
            }
          }
        }
        
        setDashboardStats(dashboardData);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      showError('Failed to load revenue data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setReportsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      
      if (selectedType !== 'all') {
        params.append('status', selectedType);
      }
      
      const response = await fetch(`/api/orders/admin?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showError('Failed to load orders: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchOrders();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const getStatusColor = (status: Order['orderStatus']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const averageOrderValue = orders.length > 0
    ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length
    : 0;
  
  const revenueChange = dashboardStats?.monthlyRevenue && dashboardStats.monthlyRevenue.length > 1
    ? ((dashboardStats.monthlyRevenue[dashboardStats.monthlyRevenue.length - 1].revenue - 
        dashboardStats.monthlyRevenue[0].revenue) / 
       dashboardStats.monthlyRevenue[0].revenue) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Sales & Revenue</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor platform revenue and sales transactions
        </p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                ${reportsLoading ? '...' : (dashboardStats?.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {reportsLoading ? (
              <Loader className="w-4 h-4 text-gray-400 animate-spin" />
            ) : (
              <>
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
                  {Math.abs(revenueChange || 0).toFixed(1)}%
                </span>
                <span className="ml-2 text-sm text-gray-500">vs last period</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Order Value</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                ${loading ? '...' : averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Based on recent orders</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {loading ? '...' : pagination.total}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <BarChart4 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Across all stores</p>
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
        {reportsLoading ? (
          <div className="flex justify-center py-8">
            <Loader className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : dashboardStats?.popularProducts && dashboardStats.popularProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardStats.popularProducts.slice(0, 5).map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.productDetails?.name || product._id}
                      </div>
                      {product.productDetails?.category && (
                        <div className="text-xs text-gray-500">
                          {product.productDetails.category}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.totalSold} units
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${product.revenue.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No product data available
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          <button type="submit" className="sr-only">Search</button>
        </form>
        <div className="relative">
          <select
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(e.target.value);
              fetchDashboardStats();
            }}
            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
          <Calendar className="w-5 h-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Filter className="w-5 h-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>
        <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 p-6 pb-0">Recent Orders</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No orders found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-primary-600">
                        {order._id.substring(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.userId?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.userId?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${order.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.items.length} item(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-between items-center px-6 py-3 border-t">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-3 py-1 rounded ${
                  pagination.page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Previous
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === pagination.pages || 
                  (page >= pagination.page - 1 && page <= pagination.page + 1)
                )
                .map((page, i, arr) => (
                  <React.Fragment key={page}>
                    {i > 0 && arr[i - 1] !== page - 1 && (
                      <span className="px-2 py-1">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded ${
                        pagination.page === page
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={`px-3 py-1 rounded ${
                  pagination.page === pagination.pages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesMonitoring; 