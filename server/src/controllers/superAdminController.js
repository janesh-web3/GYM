import Gym from '../models/Gym.js';
import User from '../models/User.js';
import Member from '../models/Member.js';
import Trainer from '../models/Trainer.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import mongoose from 'mongoose';

// @desc    Get all gyms with optional filtering
// @route   GET /api/admin/gyms
// @access  Private (SuperAdmin)
export const getAllGyms = async (req, res) => {
  try {
    const { status, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by status if provided
    if (status && ['active', 'pending', 'suspended', 'inactive'].includes(status)) {
      query.status = status;
    }
    
    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query
    const gyms = await Gym.find(query)
      .populate('ownerId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);
      
    // Get total count
    const total = await Gym.countDocuments(query);
    
    return successResponse(res, 200, 'Gyms retrieved successfully', {
      gyms,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get all gyms error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Update gym status
// @route   PUT /api/admin/gyms/:id/status
// @access  Private (SuperAdmin)
export const updateGymStatusByAdmin = async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!['pending', 'active', 'banned'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value. Must be pending, active, or banned.' 
      });
    }

    const gym = await Gym.findById(req.params.id);

    if (!gym) {
      return res.status(404).json({ 
        success: false, 
        message: 'Gym not found' 
      });
    }

    // Update the gym status
    gym.status = status;
    
    // Auto-update isApproved based on status
    gym.isApproved = status === 'active';
    
    await gym.save();

    // Get owner information for the response
    const owner = await User.findById(gym.ownerId).select('name email');

    // Send notification to gym owner (implementation depends on your notification system)
    // This would typically involve creating a notification record or sending an email
    
    res.json({
      success: true,
      data: {
        gym: {
          ...gym.toObject(),
          ownerId: owner
        },
        message: `Gym status updated to ${status} successfully`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users with filtering
// @route   GET /api/admin/users
// @access  Private (SuperAdmin)
export const getAllUsers = async (req, res) => {
  try {
    const { 
      role, 
      status, 
      search,
      sortBy = 'createdAt', 
      sortOrder = 'desc', 
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by role
    if (role && ['Member', 'Trainer', 'GymOwner', 'SuperAdmin'].includes(role)) {
      query.role = role;
    }
    
    // Filter by status
    if (status && ['active', 'inactive', 'suspended'].includes(status)) {
      query.status = status;
    }
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);
      
    // Get total count
    const total = await User.countDocuments(query);
    
    return successResponse(res, 200, 'Users retrieved successfully', {
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (SuperAdmin)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid user ID');
    }
    
    // Validate status
    if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
      return errorResponse(res, 400, 'Valid status is required (active, inactive, suspended)');
    }
    
    // Find user
    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }
    
    // Prevent updating SuperAdmin if you're not the same SuperAdmin
    if (user.role === 'SuperAdmin' && user._id.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Cannot modify another SuperAdmin account');
    }
    
    // Update status
    user.status = status;
    
    // Add reason if provided
    if ((status === 'suspended' || status === 'inactive') && reason) {
      user.statusReason = reason;
    } else if (status === 'active') {
      user.statusReason = '';
    }
    
    await user.save();
    
    return successResponse(res, 200, `User status updated to ${status}`, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Get dashboard stats and overview
// @route   GET /api/admin/dashboard
// @access  Private (SuperAdmin)
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const userCount = await User.countDocuments();
    const gymCount = await Gym.countDocuments();
    const memberCount = await Member.countDocuments();
    const trainerCount = await Trainer.countDocuments();
    const productCount = await Product.countDocuments();
    
    // Get pending gyms
    const pendingGyms = await Gym.countDocuments({ status: 'pending' });
    
    // Get revenue stats
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    // Get monthly revenue data for charts
    const monthlyRevenue = await Order.aggregate([
      { $match: { 
        paymentStatus: 'completed',
        createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }
      }},
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Get latest orders
    const latestOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email')
      .select('orderStatus totalAmount createdAt');
      
    // Get popular products
    const popularProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);
    
    // Populate product details
    const productIds = popularProducts.map(item => item._id);
    const products = await Product.find({ _id: { $in: productIds } });
    
    const populatedPopularProducts = popularProducts.map(item => {
      const product = products.find(p => p._id.toString() === item._id.toString());
      return {
        _id: item._id,
        name: product ? product.name : 'Unknown Product',
        category: product ? product.category : 'Unknown',
        totalSold: item.totalSold,
        revenue: item.revenue
      };
    });
    
    // Get gym performance metrics
    const gymPerformance = await Member.aggregate([
      { $group: {
          _id: '$gymId',
          memberCount: { $sum: 1 }
        }
      },
      { $sort: { memberCount: -1 } },
      { $limit: 5 }
    ]);
    
    // Populate gym names
    const gymIds = gymPerformance.map(item => item._id);
    const gyms = await Gym.find({ _id: { $in: gymIds } });
    
    const populatedGymPerformance = gymPerformance.map(item => {
      const gym = gyms.find(g => g._id.toString() === item._id.toString());
      return {
        _id: item._id,
        name: gym ? gym.name : 'Unknown Gym',
        location: gym ? gym.location : 'Unknown',
        memberCount: item.memberCount
      };
    });
    
    return successResponse(res, 200, 'Dashboard stats retrieved successfully', {
      counts: {
        users: userCount,
        gyms: gymCount,
        members: memberCount,
        trainers: trainerCount,
        products: productCount,
        pendingGyms
      },
      revenue: {
        total: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        monthly: monthlyRevenue
      },
      latestOrders,
      popularProducts: populatedPopularProducts,
      topPerformingGyms: populatedGymPerformance
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Get revenue reports with filtering
// @route   GET /api/admin/reports/revenue
// @access  Private (SuperAdmin)
export const getRevenueReports = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    // Set up date range
    const query = { paymentStatus: 'completed' };
    
    if (startDate || endDate) {
      query.createdAt = {};
      
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        query.createdAt.$lt = endDateObj;
      }
    }
    
    // Group by configuration
    let groupByConfig = {};
    if (groupBy === 'day') {
      groupByConfig = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
    } else if (groupBy === 'month') {
      groupByConfig = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
    } else if (groupBy === 'year') {
      groupByConfig = {
        year: { $year: '$createdAt' }
      };
    }
    
    // Execute aggregation
    const revenueData = await Order.aggregate([
      { $match: query },
      { $group: {
          _id: groupByConfig,
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Format data for response
    const formattedRevenueData = revenueData.map(item => {
      let date;
      if (groupBy === 'day') {
        date = new Date(item._id.year, item._id.month - 1, item._id.day);
      } else if (groupBy === 'month') {
        date = new Date(item._id.year, item._id.month - 1, 1);
      } else {
        date = new Date(item._id.year, 0, 1);
      }
      
      return {
        date: date.toISOString().split('T')[0],
        revenue: item.revenue,
        orders: item.orders,
        period: groupBy
      };
    });
    
    // Additional summary data
    const summary = await Order.aggregate([
      { $match: query },
      { $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);
    
    const summaryData = summary.length > 0 ? {
      totalRevenue: summary[0].totalRevenue,
      totalOrders: summary[0].totalOrders,
      avgOrderValue: summary[0].avgOrderValue
    } : {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0
    };
    
    return successResponse(res, 200, 'Revenue report generated successfully', {
      summary: summaryData,
      data: formattedRevenueData
    });
  } catch (error) {
    console.error('Get revenue report error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Get gym performance reports
// @route   GET /api/admin/reports/gyms
// @access  Private (SuperAdmin)
export const getGymPerformanceReports = async (req, res) => {
  try {
    const { gymId } = req.query;
    
    // If specific gym is requested
    if (gymId) {
      if (!mongoose.Types.ObjectId.isValid(gymId)) {
        return errorResponse(res, 400, 'Invalid gym ID');
      }
      
      const gym = await Gym.findById(gymId);
      if (!gym) {
        return errorResponse(res, 404, 'Gym not found');
      }
      
      // Get member count
      const memberCount = await Member.countDocuments({ gymId });
      
      // Get trainer count
      const trainerCount = await Trainer.countDocuments({ gymId });
      
      // Get membership growth over time
      const memberGrowth = await Member.aggregate([
        { $match: { gymId: mongoose.Types.ObjectId(gymId) } },
        { $group: {
            _id: {
              year: { $year: '$joinedDate' },
              month: { $month: '$joinedDate' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);
      
      // Format data
      const formattedGrowthData = memberGrowth.map(item => {
        const date = new Date(item._id.year, item._id.month - 1, 1);
        return {
          date: date.toISOString().split('T')[0],
          newMembers: item.count
        };
      });
      
      // Get active vs inactive members
      const statusCounts = await Member.aggregate([
        { $match: { gymId: mongoose.Types.ObjectId(gymId) } },
        { $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      const activeMembers = statusCounts.find(item => item._id === 'active')?.count || 0;
      const inactiveMembers = statusCounts.find(item => item._id === 'inactive')?.count || 0;
      
      return successResponse(res, 200, 'Gym performance report generated successfully', {
        gym: {
          _id: gym._id,
          name: gym.name,
          location: gym.location,
          status: gym.status
        },
        stats: {
          memberCount,
          trainerCount,
          activeMembers,
          inactiveMembers,
          retentionRate: memberCount > 0 ? (activeMembers / memberCount * 100).toFixed(2) : 0
        },
        memberGrowth: formattedGrowthData
      });
      
    } else {
      // Get all gyms performance comparison
      const gymsPerformance = await Gym.aggregate([
        { $lookup: {
            from: 'members',
            localField: '_id',
            foreignField: 'gymId',
            as: 'members'
          }
        },
        { $lookup: {
            from: 'trainers',
            localField: '_id',
            foreignField: 'gymId',
            as: 'trainers'
          }
        },
        { $project: {
            _id: 1,
            name: 1,
            location: 1,
            status: 1,
            memberCount: { $size: '$members' },
            trainerCount: { $size: '$trainers' },
            activeMembers: {
              $size: {
                $filter: {
                  input: '$members',
                  as: 'member',
                  cond: { $eq: ['$$member.status', 'active'] }
                }
              }
            }
          }
        },
        { $sort: { memberCount: -1 } }
      ]);
      
      return successResponse(res, 200, 'All gyms performance report generated successfully', {
        gyms: gymsPerformance
      });
    }
  } catch (error) {
    console.error('Get gym performance report error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Get product performance report
// @route   GET /api/admin/reports/products
// @access  Private (SuperAdmin)
export const getProductReports = async (req, res) => {
  try {
    const { category, period = '30' } = req.query;
    
    // Set up time filter
    const periodNum = parseInt(period, 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodNum);
    
    // Set up category filter
    const matchQuery = {
      createdAt: { $gte: startDate }
    };
    
    if (category && ['Supplements', 'Equipment', 'Clothing', 'Accessories', 'Other'].includes(category)) {
      matchQuery.category = category;
    }
    
    // Get top selling products
    const topSellingQuery = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      { $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);
    
    // Get product inventory status
    const inventory = await Product.find(matchQuery)
      .select('name category stock price')
      .sort({ stock: 1 })
      .limit(10);
    
    // Get category breakdown
    const categoryBreakdown = await Product.aggregate([
      { $match: matchQuery },
      { $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get product ratings data
    const productRatings = await Product.aggregate([
      { $match: { 'ratings.0': { $exists: true } } },
      { $project: {
          name: 1,
          category: 1,
          averageRating: 1,
          totalRatings: { $size: '$ratings' }
        }
      },
      { $sort: { averageRating: -1 } },
      { $limit: 10 }
    ]);
    
    // Enrich top selling products with details
    const productIds = topSellingQuery.map(item => item._id);
    const products = await Product.find({ _id: { $in: productIds } });
    
    const topSellingProducts = topSellingQuery.map(item => {
      const product = products.find(p => p._id.toString() === item._id.toString());
      return {
        _id: item._id,
        name: product ? product.name : 'Unknown Product',
        category: product ? product.category : 'Unknown',
        totalSold: item.totalSold,
        revenue: item.revenue,
        averageRating: product ? product.averageRating : 0
      };
    });
    
    return successResponse(res, 200, 'Product report generated successfully', {
      topSellingProducts,
      lowInventory: inventory,
      categoryBreakdown,
      topRatedProducts: productRatings
    });
  } catch (error) {
    console.error('Get product report error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Get all gyms with advanced filtering
// @route   GET /api/admin/gyms
// @access  Private (SuperAdmin)
export const getGyms = async (req, res) => {
  try {
    const { status, city, search, page = 1, limit = 10 } = req.query;
    const filter = {};

    // Add filters
    if (status && status !== 'all') filter.status = status;
    if (city) filter['address.city'] = city;
    if (search) filter.$text = { $search: search };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch gyms with owner information
    const gyms = await Gym.find(filter)
      .populate('ownerId', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Gym.countDocuments(filter);
    
    const pagination = {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    };

    res.json({
      success: true,
      data: {
        gyms,
        pagination
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get admin dashboard stats 
// @route   GET /api/admin/stats
// @access  Private (SuperAdmin)
export const getAdminStats = async (req, res) => {
  try {
    // Total gyms count
    const totalGyms = await Gym.countDocuments();
    
    // Status-based counts
    const activeGyms = await Gym.countDocuments({ status: 'active' });
    const pendingGyms = await Gym.countDocuments({ status: 'pending' });
    const bannedGyms = await Gym.countDocuments({ status: 'banned' });
    
    // Recent gyms awaiting approval
    const recentPendingGyms = await Gym.find({ status: 'pending' })
      .populate('ownerId', 'name email')
      .sort('-createdAt')
      .limit(5);
    
    // Top gyms by coin balance
    const topGyms = await Gym.find({ status: 'active' })
      .sort('-coinBalance')
      .limit(5)
      .populate('ownerId', 'name email');
    
    res.json({
      success: true,
      data: {
        totalGyms,
        activeGyms,
        pendingGyms,
        bannedGyms,
        recentPendingGyms,
        topGyms
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 