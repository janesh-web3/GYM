import Attendance from '../models/Attendance.js';
import { errorResponse, successResponse } from '../utils/responseHandler.js';
import mongoose from 'mongoose';

// @desc    Check in a user (member or trainer)
// @route   POST /api/attendance/check-in
// @access  Private (Member, Trainer)
export const checkIn = async (req, res) => {
  try {
    const { gymId } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    // Validate that the user is either a Member or Trainer
    if (role !== 'Member' && role !== 'Trainer') {
      return errorResponse(res, 403, 'Only members and trainers can check in');
    }

    // Check if user already has an incomplete attendance record for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await Attendance.findOne({
      userId,
      date: {
        $gte: today,
        $lt: tomorrow
      },
      status: { $in: ['present', 'late', 'incomplete'] }
    });

    if (existingAttendance) {
      return errorResponse(res, 400, 'You have already checked in today. Please check out first.');
    }

    // Create new attendance record
    const attendance = new Attendance({
      userId,
      role,
      gymId,
      date: new Date(),
      checkIn: new Date(),
      status: 'incomplete'
    });

    await attendance.save();

    return successResponse(res, 201, 'Check-in successful', attendance);
  } catch (error) {
    console.error('Check-in error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Check out a user (member or trainer)
// @route   POST /api/attendance/check-out
// @access  Private (Member, Trainer)
export const checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the most recent incomplete attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.findOne({
      userId,
      date: {
        $gte: today,
        $lt: tomorrow
      },
      status: 'incomplete'
    });

    if (!attendance) {
      return errorResponse(res, 404, 'No active check-in found. Please check in first.');
    }

    // Update checkout time and status
    attendance.checkOut = new Date();
    attendance.calculateDuration();
    
    if (attendance.duration < 30) {
      attendance.status = 'incomplete';
    } else {
      attendance.status = 'present';
    }

    await attendance.save();

    return successResponse(res, 200, 'Check-out successful', attendance);
  } catch (error) {
    console.error('Check-out error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Get attendance history for a user
// @route   GET /api/attendance/history
// @access  Private (Member, Trainer)
export const getMyAttendanceHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    const query = { userId };
    
    // Add date filtering if provided
    if (startDate || endDate) {
      query.date = {};
      
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1); // Include the end date fully
        query.date.$lt = endDateObj;
      }
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('gymId', 'name location');
      
    return successResponse(res, 200, 'Attendance history retrieved', attendance);
  } catch (error) {
    console.error('Get attendance history error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Get attendance by ID
// @route   GET /api/attendance/:id
// @access  Private (GymOwner, Admin, Own record for Member/Trainer)
export const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid attendance ID');
    }

    const attendance = await Attendance.findById(id)
      .populate('userId', 'name email')
      .populate('gymId', 'name location');
      
    if (!attendance) {
      return errorResponse(res, 404, 'Attendance record not found');
    }

    // Authorization check - only allow GymOwner, Admin or the user themselves
    if (req.user.role !== 'GymOwner' && req.user.role !== 'Admin' && 
        attendance.userId._id.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to access this record');
    }

    return successResponse(res, 200, 'Attendance record retrieved', attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Get gym's attendance records (for GymOwner)
// @route   GET /api/attendance/gym/:gymId
// @access  Private (GymOwner)
export const getGymAttendance = async (req, res) => {
  try {
    const { gymId } = req.params;
    const { startDate, endDate, role } = req.query;
    
    // Check if user is authorized to access this gym's data
    if (req.user.role !== 'GymOwner' && req.user.role !== 'Admin') {
      return errorResponse(res, 403, 'Not authorized to access gym attendance records');
    }

    // If GymOwner, ensure they own this gym
    if (req.user.role === 'GymOwner') {
      // Here we would check if this gym belongs to the owner
      // Implementation depends on how gym ownership is tracked
      // This is a placeholder for the actual authorization check
    }

    const query = { gymId };
    
    // Add filters if provided
    if (startDate || endDate) {
      query.date = {};
      
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        query.date.$lt = endDateObj;
      }
    }
    
    if (role && ['Member', 'Trainer'].includes(role)) {
      query.role = role;
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('userId', 'name email')
      .limit(100); // Limit results for performance
      
    return successResponse(res, 200, 'Gym attendance records retrieved', attendance);
  } catch (error) {
    console.error('Get gym attendance error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Get attendance analytics (for GymOwner)
// @route   GET /api/attendance/analytics/gym/:gymId
// @access  Private (GymOwner)
export const getAttendanceAnalytics = async (req, res) => {
  try {
    const { gymId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Check if user is authorized
    if (req.user.role !== 'GymOwner' && req.user.role !== 'Admin') {
      return errorResponse(res, 403, 'Not authorized to access attendance analytics');
    }

    // Set date range for query
    const query = { gymId };
    if (startDate || endDate) {
      query.date = {};
      
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        query.date.$lt = endDateObj;
      }
    }

    // Get attendance count by role
    const attendanceByRole = await Attendance.aggregate([
      { $match: query },
      { $group: {
          _id: '$role',
          count: { $sum: 1 },
          averageDuration: { $avg: '$duration' }
        }
      }
    ]);

    // Get attendance count by day
    const attendanceByDay = await Attendance.aggregate([
      { $match: query },
      { $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          count: { $sum: 1 },
          members: { 
            $sum: { 
              $cond: [{ $eq: ['$role', 'Member'] }, 1, 0]
            }
          },
          trainers: { 
            $sum: { 
              $cond: [{ $eq: ['$role', 'Trainer'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get peak hours
    const peakHours = await Attendance.aggregate([
      { $match: query },
      { $project: {
          hour: { $hour: '$checkIn' }
        }
      },
      { $group: {
          _id: '$hour',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const analytics = {
      attendanceByRole,
      attendanceByDay,
      peakHours
    };

    return successResponse(res, 200, 'Attendance analytics retrieved', analytics);
  } catch (error) {
    console.error('Get attendance analytics error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Update attendance record (for GymOwner to correct data)
// @route   PUT /api/attendance/:id
// @access  Private (GymOwner, Admin)
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, status, notes } = req.body;
    
    // Only GymOwner and Admin can update attendance records
    if (req.user.role !== 'GymOwner' && req.user.role !== 'Admin') {
      return errorResponse(res, 403, 'Not authorized to update attendance records');
    }

    const attendance = await Attendance.findById(id);
    
    if (!attendance) {
      return errorResponse(res, 404, 'Attendance record not found');
    }

    // Update fields if provided
    if (checkIn) attendance.checkIn = new Date(checkIn);
    if (checkOut) attendance.checkOut = new Date(checkOut);
    if (status && ['present', 'absent', 'late', 'incomplete'].includes(status)) {
      attendance.status = status;
    }
    if (notes !== undefined) attendance.notes = notes;

    // Recalculate duration if both checkIn and checkOut are present
    if (attendance.checkIn && attendance.checkOut) {
      attendance.calculateDuration();
    }

    await attendance.save();

    return successResponse(res, 200, 'Attendance record updated', attendance);
  } catch (error) {
    console.error('Update attendance error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (GymOwner, Admin)
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only GymOwner and Admin can delete attendance records
    if (req.user.role !== 'GymOwner' && req.user.role !== 'Admin') {
      return errorResponse(res, 403, 'Not authorized to delete attendance records');
    }

    const attendance = await Attendance.findById(id);
    
    if (!attendance) {
      return errorResponse(res, 404, 'Attendance record not found');
    }

    await attendance.deleteOne();

    return successResponse(res, 200, 'Attendance record deleted successfully');
  } catch (error) {
    console.error('Delete attendance error:', error);
    return errorResponse(res, 500, 'Server error');
  }
}; 