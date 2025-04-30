import Member from '../models/Member.js';
import User from '../models/User.js';
import Gym from '../models/Gym.js';
import { handleError } from '../utils/errorHandler.js';
import { errorResponse, successResponse } from '../utils/responseHandler.js';

/**
 * @desc    Create a new member
 * @route   POST /api/members
 * @access  Private - GymOwner
 */
export const createMember = async (req, res) => {
  try {
    const {
      name, email, age, gender, phone, gymId, trainerId,
      BMI, goals, progress, password
    } = req.body;

    // First create a user account for the member
    const newUser = await User.create({
      name,
      email,
      password: password || 'password123', // Default password that should be changed on first login
      role: 'Member'
    });

    // Then create the member profile
    const member = await Member.create({
      name,
      email,
      age,
      gender,
      phone,
      gymId,
      trainerId: trainerId || null,
      userId: newUser._id,
      BMI: BMI || null,
      goals: goals || '',
      progress: progress || '',
      joinedDate: new Date()
    });

    res.status(201).json({
      success: true,
      data: member
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Get all members of a gym
 * @route   GET /api/members
 * @access  Private - GymOwner
 */
export const getMembers = async (req, res) => {
  try {
    const { gymId } = req.query;
    
    // If user is GymOwner, they should only see members from their gyms
    let query = {};
    
    if (req.user.role === 'GymOwner') {
      if (!gymId) {
        return res.status(400).json({
          success: false,
          message: 'Gym ID is required'
        });
      }
      query.gymId = gymId;
    }
    
    const members = await Member.find(query)
      .populate('trainerId', 'name email')
      .populate('gymId', 'gymName');
    
    res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Get a single member
 * @route   GET /api/members/:id
 * @access  Private - GymOwner, Trainer
 */
export const getMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('trainerId', 'name email')
      .populate('gymId', 'gymName');
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    // If GymOwner, check if member belongs to their gym
    if (req.user.role === 'GymOwner') {
      const gymOwned = await Gym.findOne({ 
        _id: member.gymId, 
        ownerId: req.user.id 
      });
      
      if (!gymOwned) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this member'
        });
      }
    }
    
    // If Trainer, check if member is assigned to them
    if (req.user.role === 'Trainer' && member.trainerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this member'
      });
    }
    
    res.status(200).json({
      success: true,
      data: member
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Update a member
 * @route   PUT /api/members/:id
 * @access  Private - GymOwner
 */
export const updateMember = async (req, res) => {
  try {
    const {
      name, email, age, gender, phone, trainerId,
      BMI, goals, progress, status
    } = req.body;
    
    let member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    // If GymOwner, check if member belongs to their gym
    if (req.user.role === 'GymOwner') {
      const gymOwned = await Gym.findOne({ 
        _id: member.gymId, 
        ownerId: req.user.id 
      });
      
      if (!gymOwned) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this member'
        });
      }
    }
    
    // Update member
    member = await Member.findByIdAndUpdate(
      req.params.id,
      {
        name: name || member.name,
        email: email || member.email,
        age: age || member.age,
        gender: gender || member.gender,
        phone: phone || member.phone,
        trainerId: trainerId !== undefined ? trainerId : member.trainerId,
        BMI: BMI !== undefined ? BMI : member.BMI,
        goals: goals !== undefined ? goals : member.goals,
        progress: progress !== undefined ? progress : member.progress,
        status: status || member.status
      },
      { new: true, runValidators: true }
    ).populate('trainerId', 'name email')
     .populate('gymId', 'gymName');
    
    // Also update the user profile if name or email changed
    if (name || email) {
      await User.findByIdAndUpdate(
        member.userId,
        {
          name: name || undefined,
          email: email || undefined
        },
        { runValidators: true }
      );
    }
    
    res.status(200).json({
      success: true,
      data: member
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Delete a member
 * @route   DELETE /api/members/:id
 * @access  Private - GymOwner
 */
export const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    // If GymOwner, check if member belongs to their gym
    if (req.user.role === 'GymOwner') {
      const gymOwned = await Gym.findOne({ 
        _id: member.gymId, 
        ownerId: req.user.id 
      });
      
      if (!gymOwned) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this member'
        });
      }
    }
    
    // Delete member profile
    await Member.findByIdAndDelete(req.params.id);
    
    // Don't delete the user account, just set status to inactive
    await User.findByIdAndUpdate(
      member.userId,
      { status: 'inactive' }
    );
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Add progress metric for a member
// @route   POST /api/members/:id/progress/:metricType
// @access  Private (GymOwner, Trainer, or Self)
export const addProgressMetric = async (req, res) => {
  try {
    const { id, metricType } = req.params;
    const { value, unit, date } = req.body;

    // Validate metric type
    const validMetrics = ['weight', 'height', 'bodyFat', 'muscleMass', 'chestMeasurement', 'waistMeasurement', 'armMeasurement', 'legMeasurement'];
    
    if (!validMetrics.includes(metricType)) {
      return errorResponse(res, 400, `Invalid metric type. Must be one of: ${validMetrics.join(', ')}`);
    }

    // Validate required fields
    if (!value) {
      return errorResponse(res, 400, 'Value is required');
    }

    // Get member
    const member = await Member.findById(id);
    
    if (!member) {
      return errorResponse(res, 404, 'Member not found');
    }

    // Authorization - only allow self, assigned trainer, or gym owner
    const isAuthorized = 
      req.user.id === member.userId.toString() || // Self
      req.user.id === member.trainerId?.toString() || // Assigned trainer
      req.user.role === 'GymOwner' || // Gym owner
      req.user.role === 'Admin'; // Admin
      
    if (!isAuthorized) {
      return errorResponse(res, 403, 'Not authorized to update this member\'s progress');
    }

    // Prepare new metric entry
    const metricEntry = {
      value,
      date: date ? new Date(date) : new Date()
    };
    
    // Add unit if applicable (some metrics like bodyFat don't have units)
    if (unit && metricType !== 'bodyFat') {
      // Validate unit for appropriate metrics
      if ((metricType === 'weight' || metricType === 'muscleMass') && !['kg', 'lbs'].includes(unit)) {
        return errorResponse(res, 400, 'Invalid unit for this metric. Must be kg or lbs');
      }
      if ((metricType === 'height' || metricType === 'chestMeasurement' || metricType === 'waistMeasurement' || 
           metricType === 'armMeasurement' || metricType === 'legMeasurement') && !['cm', 'in'].includes(unit)) {
        return errorResponse(res, 400, 'Invalid unit for this metric. Must be cm or in');
      }
      
      metricEntry.unit = unit;
    }

    // Initialize progressMetrics object if it doesn't exist
    if (!member.progressMetrics) {
      member.progressMetrics = {};
    }
    
    // Initialize metric array if it doesn't exist
    if (!member.progressMetrics[metricType]) {
      member.progressMetrics[metricType] = [];
    }
    
    // Add new entry to the start of the array
    member.progressMetrics[metricType].unshift(metricEntry);
    
    // Calculate BMI if weight and height are present
    if (metricType === 'weight' || metricType === 'height') {
      if (member.progressMetrics.weight?.length > 0 && member.progressMetrics.height?.length > 0) {
        const latestWeight = member.progressMetrics.weight[0];
        const latestHeight = member.progressMetrics.height[0];
        
        // Convert weight to kg if in lbs
        let weightInKg = latestWeight.value;
        if (latestWeight.unit === 'lbs') {
          weightInKg = latestWeight.value * 0.453592;
        }
        
        // Convert height to meters if in cm or inches
        let heightInMeters;
        if (latestHeight.unit === 'cm') {
          heightInMeters = latestHeight.value / 100;
        } else if (latestHeight.unit === 'in') {
          heightInMeters = latestHeight.value * 0.0254;
        }
        
        // Calculate BMI
        if (heightInMeters > 0) {
          member.BMI = parseFloat((weightInKg / (heightInMeters * heightInMeters)).toFixed(2));
        }
      }
    }
    
    await member.save();
    
    return successResponse(res, 201, 'Progress metric added successfully', member.progressMetrics[metricType][0]);
  } catch (error) {
    console.error('Add progress metric error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Get member progress history
// @route   GET /api/members/:id/progress
// @access  Private (GymOwner, Trainer, or Self)
export const getProgressHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { metricType } = req.query;
    
    // Get member
    const member = await Member.findById(id);
    
    if (!member) {
      return errorResponse(res, 404, 'Member not found');
    }
    
    // Authorization - only allow self, assigned trainer, or gym owner
    const isAuthorized = 
      req.user.id === member.userId.toString() || // Self
      req.user.id === member.trainerId?.toString() || // Assigned trainer
      req.user.role === 'GymOwner' || // Gym owner
      req.user.role === 'Admin'; // Admin
      
    if (!isAuthorized) {
      return errorResponse(res, 403, 'Not authorized to view this member\'s progress');
    }
    
    // Return specific metric if requested, otherwise return all
    if (metricType) {
      const validMetrics = ['weight', 'height', 'bodyFat', 'muscleMass', 'chestMeasurement', 'waistMeasurement', 'armMeasurement', 'legMeasurement'];
      
      if (!validMetrics.includes(metricType)) {
        return errorResponse(res, 400, `Invalid metric type. Must be one of: ${validMetrics.join(', ')}`);
      }
      
      const metricHistory = member.progressMetrics?.[metricType] || [];
      return successResponse(res, 200, `${metricType} history retrieved`, metricHistory);
    }
    
    // Return all progress metrics
    return successResponse(res, 200, 'Progress history retrieved', {
      BMI: member.BMI,
      progressMetrics: member.progressMetrics || {}
    });
  } catch (error) {
    console.error('Get progress history error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Delete progress metric entry
// @route   DELETE /api/members/:id/progress/:metricType/:entryId
// @access  Private (GymOwner, Trainer, or Self)
export const deleteProgressMetric = async (req, res) => {
  try {
    const { id, metricType, entryId } = req.params;
    
    // Validate metric type
    const validMetrics = ['weight', 'height', 'bodyFat', 'muscleMass', 'chestMeasurement', 'waistMeasurement', 'armMeasurement', 'legMeasurement'];
    
    if (!validMetrics.includes(metricType)) {
      return errorResponse(res, 400, `Invalid metric type. Must be one of: ${validMetrics.join(', ')}`);
    }
    
    // Get member
    const member = await Member.findById(id);
    
    if (!member) {
      return errorResponse(res, 404, 'Member not found');
    }
    
    // Authorization - only allow self, assigned trainer, or gym owner
    const isAuthorized = 
      req.user.id === member.userId.toString() || // Self
      req.user.id === member.trainerId?.toString() || // Assigned trainer
      req.user.role === 'GymOwner' || // Gym owner
      req.user.role === 'Admin'; // Admin
      
    if (!isAuthorized) {
      return errorResponse(res, 403, 'Not authorized to update this member\'s progress');
    }
    
    // Check if metric exists
    if (!member.progressMetrics || !member.progressMetrics[metricType]) {
      return errorResponse(res, 404, `No ${metricType} metrics found for this member`);
    }
    
    // Find the entry by ID
    const entryIndex = member.progressMetrics[metricType].findIndex(entry => entry._id.toString() === entryId);
    
    if (entryIndex === -1) {
      return errorResponse(res, 404, 'Progress metric entry not found');
    }
    
    // Remove the entry
    member.progressMetrics[metricType].splice(entryIndex, 1);
    
    // Recalculate BMI if needed
    if (metricType === 'weight' || metricType === 'height') {
      if (member.progressMetrics.weight?.length > 0 && member.progressMetrics.height?.length > 0) {
        const latestWeight = member.progressMetrics.weight[0];
        const latestHeight = member.progressMetrics.height[0];
        
        // Convert weight to kg if in lbs
        let weightInKg = latestWeight.value;
        if (latestWeight.unit === 'lbs') {
          weightInKg = latestWeight.value * 0.453592;
        }
        
        // Convert height to meters if in cm or inches
        let heightInMeters;
        if (latestHeight.unit === 'cm') {
          heightInMeters = latestHeight.value / 100;
        } else if (latestHeight.unit === 'in') {
          heightInMeters = latestHeight.value * 0.0254;
        }
        
        // Calculate BMI
        if (heightInMeters > 0) {
          member.BMI = parseFloat((weightInKg / (heightInMeters * heightInMeters)).toFixed(2));
        }
      } else {
        // Reset BMI if either weight or height is missing
        member.BMI = null;
      }
    }
    
    await member.save();
    
    return successResponse(res, 200, 'Progress metric entry deleted successfully');
  } catch (error) {
    console.error('Delete progress metric error:', error);
    return errorResponse(res, 500, 'Server error');
  }
}; 