import Session from '../models/Session.js';
import Gym from '../models/Gym.js';
import Trainer from '../models/Trainer.js';
import Member from '../models/Member.js';
import { handleError } from '../utils/errorHandler.js';

/**
 * @desc    Create a new session
 * @route   POST /api/sessions
 * @access  Private - GymOwner, Trainer
 */
export const createSession = async (req, res) => {
  try {
    const {
      title, gymId, trainerId, memberIds, date, startTime, endTime,
      description, capacity, sessionType, recurring, recurringPattern
    } = req.body;

    // Check if user is authorized for this gym
    if (req.user.role === 'GymOwner') {
      const gym = await Gym.findOne({ _id: gymId, ownerId: req.user.id });
      if (!gym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to create sessions for this gym'
        });
      }
    } else if (req.user.role === 'Trainer') {
      // Check if trainer is associated with this gym
      const trainer = await Trainer.findOne({ userId: req.user.id, gyms: { $in: [gymId] } });
      if (!trainer) {
        return res.status(403).json({
          success: false,
          message: 'Trainer is not associated with this gym'
        });
      }
      
      // If trainerId is provided, ensure it matches the logged-in trainer
      if (trainerId && trainer._id.toString() !== trainerId) {
        return res.status(403).json({
          success: false,
          message: 'Trainers can only create sessions for themselves'
        });
      }
    }

    // Create the session
    const session = await Session.create({
      title,
      gymId,
      trainerId,
      memberIds: memberIds || [],
      date,
      startTime,
      endTime,
      description: description || '',
      capacity: capacity || 10,
      sessionType: sessionType || 'group',
      recurring: recurring || false,
      recurringPattern: recurringPattern || '',
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Get all sessions
 * @route   GET /api/sessions
 * @access  Private - GymOwner, Trainer
 */
export const getSessions = async (req, res) => {
  try {
    const { gymId, trainerId, startDate, endDate } = req.query;
    let query = {};
    
    // Filter by gym
    if (gymId) {
      query.gymId = gymId;
    }
    
    // Filter by trainer
    if (trainerId) {
      query.trainerId = trainerId;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }
    
    // Access control based on user role
    if (req.user.role === 'GymOwner') {
      // Get all gyms owned by this user
      const gymsOwned = await Gym.find({ ownerId: req.user.id }).select('_id');
      const gymIds = gymsOwned.map(gym => gym._id);
      
      // Restrict to sessions in their gyms
      query.gymId = { $in: gymIds };
    } else if (req.user.role === 'Trainer') {
      // Trainers can only see their own sessions
      const trainer = await Trainer.findOne({ userId: req.user.id });
      if (!trainer) {
        return res.status(404).json({
          success: false,
          message: 'Trainer profile not found'
        });
      }
      query.trainerId = trainer._id;
    }
    
    const sessions = await Session.find(query)
      .populate('gymId', 'gymName')
      .populate('trainerId', 'name')
      .populate('memberIds', 'name email')
      .sort({ date: 1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Get a single session
 * @route   GET /api/sessions/:id
 * @access  Private - GymOwner, Trainer
 */
export const getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('gymId', 'gymName')
      .populate('trainerId', 'name')
      .populate('memberIds', 'name email phone')
      .populate('createdBy', 'name role');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // Access control
    if (req.user.role === 'GymOwner') {
      // Check if session belongs to one of their gyms
      const gym = await Gym.findOne({ 
        _id: session.gymId, 
        ownerId: req.user.id 
      });
      
      if (!gym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this session'
        });
      }
    } else if (req.user.role === 'Trainer') {
      // Check if session belongs to this trainer
      const trainer = await Trainer.findOne({ userId: req.user.id });
      if (!trainer || session.trainerId.toString() !== trainer._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this session'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Update a session
 * @route   PUT /api/sessions/:id
 * @access  Private - GymOwner, Trainer (only their own sessions)
 */
export const updateSession = async (req, res) => {
  try {
    const {
      title, memberIds, date, startTime, endTime,
      description, capacity, sessionType, status, recurring, recurringPattern
    } = req.body;
    
    let session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // Access control
    if (req.user.role === 'GymOwner') {
      // Check if session belongs to one of their gyms
      const gym = await Gym.findOne({ 
        _id: session.gymId, 
        ownerId: req.user.id 
      });
      
      if (!gym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this session'
        });
      }
    } else if (req.user.role === 'Trainer') {
      // Check if session belongs to this trainer
      const trainer = await Trainer.findOne({ userId: req.user.id });
      if (!trainer || session.trainerId.toString() !== trainer._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this session'
        });
      }
    }
    
    // Update session
    const updateData = {
      title: title || session.title,
      memberIds: memberIds || session.memberIds,
      date: date || session.date,
      startTime: startTime || session.startTime,
      endTime: endTime || session.endTime,
      description: description !== undefined ? description : session.description,
      capacity: capacity || session.capacity,
      sessionType: sessionType || session.sessionType,
      status: status || session.status,
      recurring: recurring !== undefined ? recurring : session.recurring,
      recurringPattern: recurringPattern !== undefined ? recurringPattern : session.recurringPattern
    };
    
    session = await Session.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('gymId', 'gymName')
      .populate('trainerId', 'name')
      .populate('memberIds', 'name email phone');
    
    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Delete a session
 * @route   DELETE /api/sessions/:id
 * @access  Private - GymOwner, Trainer (only their own sessions)
 */
export const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // Access control
    if (req.user.role === 'GymOwner') {
      // Check if session belongs to one of their gyms
      const gym = await Gym.findOne({ 
        _id: session.gymId, 
        ownerId: req.user.id 
      });
      
      if (!gym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this session'
        });
      }
    } else if (req.user.role === 'Trainer') {
      // Check if session belongs to this trainer
      const trainer = await Trainer.findOne({ userId: req.user.id });
      if (!trainer || session.trainerId.toString() !== trainer._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this session'
        });
      }
    }
    
    await Session.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Get sessions by trainer
 * @route   GET /api/sessions/trainer/:trainerId
 * @access  Private - GymOwner, Trainer
 */
export const getSessionsByTrainer = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.$lte = new Date(endDate);
      }
    }
    
    let query = { trainerId };
    if (Object.keys(dateFilter).length > 0) {
      query.date = dateFilter;
    }
    
    // If trainer is requesting, ensure they're only accessing their own sessions
    if (req.user.role === 'Trainer') {
      const trainer = await Trainer.findOne({ userId: req.user.id });
      if (!trainer) {
        return res.status(404).json({
          success: false,
          message: 'Trainer profile not found'
        });
      }
      
      if (trainer._id.toString() !== trainerId) {
        return res.status(403).json({
          success: false,
          message: 'Trainers can only view their own sessions'
        });
      }
    }
    
    // If gym owner, ensure they're only accessing sessions for their gyms
    if (req.user.role === 'GymOwner') {
      const gymsOwned = await Gym.find({ ownerId: req.user.id }).select('_id');
      const gymIds = gymsOwned.map(gym => gym._id);
      
      query.gymId = { $in: gymIds };
    }
    
    const sessions = await Session.find(query)
      .populate('gymId', 'gymName')
      .populate('memberIds', 'name email phone')
      .sort({ date: 1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Get sessions by member
 * @route   GET /api/sessions/member/:memberId
 * @access  Private - GymOwner, Trainer, Member
 */
export const getSessionsByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.$lte = new Date(endDate);
      }
    }
    
    let query = { memberIds: memberId };
    if (Object.keys(dateFilter).length > 0) {
      query.date = dateFilter;
    }
    
    // Access control
    if (req.user.role === 'Member') {
      // Members can only view their own sessions
      const member = await Member.findOne({ userId: req.user.id });
      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Member profile not found'
        });
      }
      
      if (member._id.toString() !== memberId) {
        return res.status(403).json({
          success: false,
          message: 'Members can only view their own sessions'
        });
      }
    } else if (req.user.role === 'Trainer') {
      // Trainers can only view sessions for members assigned to them
      const trainer = await Trainer.findOne({ userId: req.user.id });
      if (!trainer) {
        return res.status(404).json({
          success: false,
          message: 'Trainer profile not found'
        });
      }
      
      // Add filter to only show sessions with this trainer
      query.trainerId = trainer._id;
    } else if (req.user.role === 'GymOwner') {
      // Gym owners can only view sessions in their gyms
      const member = await Member.findById(memberId);
      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Member not found'
        });
      }
      
      const gym = await Gym.findOne({
        _id: member.gymId,
        ownerId: req.user.id
      });
      
      if (!gym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view sessions for this member'
        });
      }
      
      // Add filter for gym
      query.gymId = member.gymId;
    }
    
    const sessions = await Session.find(query)
      .populate('gymId', 'gymName')
      .populate('trainerId', 'name')
      .sort({ date: 1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Get sessions by gym
 * @route   GET /api/sessions/gym/:gymId
 * @access  Private - GymOwner, Trainer
 */
export const getSessionsByGym = async (req, res) => {
  try {
    const { gymId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.$lte = new Date(endDate);
      }
    }
    
    let query = { gymId };
    if (Object.keys(dateFilter).length > 0) {
      query.date = dateFilter;
    }
    
    // Access control
    if (req.user.role === 'GymOwner') {
      // Gym owners can only view sessions in their gyms
      const gym = await Gym.findOne({
        _id: gymId,
        ownerId: req.user.id
      });
      
      if (!gym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view sessions for this gym'
        });
      }
    } else if (req.user.role === 'Trainer') {
      // Trainers can only view sessions for gyms they're assigned to
      const trainer = await Trainer.findOne({ 
        userId: req.user.id,
        gyms: { $in: [gymId] }
      });
      
      if (!trainer) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view sessions for this gym'
        });
      }
      
      // Add filter to only show sessions with this trainer
      query.trainerId = trainer._id;
    }
    
    const sessions = await Session.find(query)
      .populate('trainerId', 'name')
      .populate('memberIds', 'name email')
      .sort({ date: 1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    handleError(res, error);
  }
}; 