import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import mongoose from 'mongoose';

// @desc    Create a new order from cart
// @route   POST /api/orders
// @access  Private (Member)
export const createOrder = async (req, res) => {
  try {
    const { 
      shippingAddress, 
      paymentMethod = 'credit_card', 
      notes = ''
    } = req.body;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.postalCode) {
      return errorResponse(res, 400, 'Complete shipping address is required');
    }

    // Find user's cart
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return errorResponse(res, 400, 'Cart is empty');
    }

    // Prepare order items and check stock availability
    const orderItems = [];
    for (const item of cart.items) {
      // Make sure product exists and has enough stock
      const product = await Product.findById(item.productId);
      if (!product) {
        return errorResponse(res, 400, `Product ${item.productId} not found`);
      }
      
      if (product.stock < item.quantity) {
        return errorResponse(res, 400, `Not enough stock available for ${product.name}`);
      }

      // Add to order items
      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create the order
    const order = new Order({
      userId: req.user.id,
      items: orderItems,
      totalAmount: cart.total,
      shippingAddress,
      paymentMethod,
      orderStatus: 'pending',
      paymentStatus: 'pending',
      notes
    });

    // Save the order
    await order.save();

    // Clear the cart
    await cart.clearCart();

    return successResponse(res, 201, 'Order created successfully', order);
  } catch (error) {
    console.error('Create order error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Get all orders for current user
// @route   GET /api/orders
// @access  Private (Member)
export const getUserOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { userId: req.user.id };
    
    if (status && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      query.orderStatus = status;
    }
    
    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Order.countDocuments(query);

    return successResponse(res, 200, 'Orders retrieved successfully', {
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (Member, SuperAdmin)
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid order ID');
    }

    const order = await Order.findById(id);
    
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    // Check authorization
    if (req.user.role !== 'SuperAdmin' && order.userId.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to access this order');
    }

    return successResponse(res, 200, 'Order retrieved successfully', order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (SuperAdmin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus, trackingNumber } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid order ID');
    }

    // Find order
    const order = await Order.findById(id);
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    // Update fields if provided
    if (orderStatus && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(orderStatus)) {
      order.orderStatus = orderStatus;
    }

    if (paymentStatus && ['pending', 'completed', 'failed', 'refunded'].includes(paymentStatus)) {
      order.paymentStatus = paymentStatus;
    }

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    // Save changes
    await order.save();

    return successResponse(res, 200, 'Order status updated successfully', order);
  } catch (error) {
    console.error('Update order status error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Member, SuperAdmin)
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid order ID');
    }

    // Find order
    const order = await Order.findById(id);
    
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    // Check authorization
    if (req.user.role !== 'SuperAdmin' && order.userId.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to cancel this order');
    }

    // Check if order is already delivered
    if (order.orderStatus === 'delivered') {
      return errorResponse(res, 400, 'Cannot cancel an order that has been delivered');
    }

    // If order is already cancelled
    if (order.orderStatus === 'cancelled') {
      return errorResponse(res, 400, 'Order is already cancelled');
    }

    // Update stock for each item
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // Update order status
    order.orderStatus = 'cancelled';
    await order.save();

    return successResponse(res, 200, 'Order cancelled successfully', order);
  } catch (error) {
    console.error('Cancel order error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin
// @access  Private (SuperAdmin)
export const getAllOrders = async (req, res) => {
  try {
    const { 
      status, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10
    } = req.query;
    
    // Build query
    const query = {};
    
    if (status && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      query.orderStatus = status;
    }
    
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
    
    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Order.countDocuments(query);

    return successResponse(res, 200, 'All orders retrieved successfully', {
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return errorResponse(res, 500, 'Server error');
  }
}; 