import Notification from '../models/Notification.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import mongoose from 'mongoose';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private (All authenticated users)
export const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, read } = req.query;
    
    // Set up query
    const query = { recipientId: req.user.id };
    
    // Filter by read status if provided
    if (read !== undefined) {
      query.read = read === 'true';
    }
    
    // Pagination params
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
      
    // Get total count
    const total = await Notification.countDocuments(query);
    
    // Get unread count
    const unreadCount = await Notification.countDocuments({
      recipientId: req.user.id,
      read: false
    });
    
    return successResponse(res, 200, 'Notifications retrieved successfully', {
      notifications,
      unreadCount,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (Owner of notification)
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid notification ID');
    }
    
    // Find notification
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return errorResponse(res, 404, 'Notification not found');
    }
    
    // Verify ownership
    if (notification.recipientId.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to update this notification');
    }
    
    // Update read status
    notification.read = true;
    await notification.save();
    
    return successResponse(res, 200, 'Notification marked as read', notification);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private (All authenticated users)
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    // Update all unread notifications for the user
    const result = await Notification.updateMany(
      { recipientId: req.user.id, read: false },
      { $set: { read: true } }
    );
    
    return successResponse(res, 200, 'All notifications marked as read', {
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private (Owner of notification)
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid notification ID');
    }
    
    // Find notification
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return errorResponse(res, 404, 'Notification not found');
    }
    
    // Verify ownership
    if (notification.recipientId.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to delete this notification');
    }
    
    // Delete notification
    await notification.deleteOne();
    
    return successResponse(res, 200, 'Notification deleted successfully');
  } catch (error) {
    console.error('Delete notification error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/read
// @access  Private (All authenticated users)
export const deleteAllReadNotifications = async (req, res) => {
  try {
    // Delete all read notifications for the user
    const result = await Notification.deleteMany({
      recipientId: req.user.id,
      read: true
    });
    
    return successResponse(res, 200, 'All read notifications deleted', {
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete all read notifications error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// Admin function to create notifications
export const createNotification = async (recipientId, message, type = 'info', relatedTo = null, link = '') => {
  try {
    const notification = await Notification.create({
      recipientId,
      message,
      type,
      relatedTo,
      link
    });
    
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
}; 