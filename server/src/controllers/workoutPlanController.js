import WorkoutPlan from '../models/WorkoutPlan.js';
import Member from '../models/Member.js';
import Gym from '../models/Gym.js';
import Trainer from '../models/Trainer.js';
import { handleError } from '../utils/errorHandler.js';

/**
 * @desc    Create a new workout plan
 * @route   POST /api/workout-plans
 * @access  Private - GymOwner, Trainer
 */
export const createWorkoutPlan = async (req, res) => {
  try {
    const {
      title, description, exercises, duration, level, goal,
      frequency, gymId, isTemplate, assignedTo
    } = req.body;

    // Check if user is authorized for this gym
    if (req.user.role === 'GymOwner') {
      const gym = await Gym.findOne({ _id: gymId, ownerId: req.user.id });
      if (!gym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to create workout plans for this gym'
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
    }

    // If plan is being assigned to members, ensure they belong to this gym
    if (assignedTo && assignedTo.length > 0) {
      const members = await Member.find({ 
        _id: { $in: assignedTo },
        gymId: gymId
      });

      if (members.length !== assignedTo.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more members do not belong to this gym'
        });
      }

      // If trainer, ensure they can only assign to their assigned members
      if (req.user.role === 'Trainer') {
        const trainer = await Trainer.findOne({ userId: req.user.id });
        const assignedMembers = await Member.find({
          _id: { $in: assignedTo },
          trainerId: trainer._id
        });

        if (assignedMembers.length !== assignedTo.length) {
          return res.status(403).json({
            success: false,
            message: 'Trainers can only assign workout plans to their own members'
          });
        }
      }
    }

    // Create the workout plan
    const workoutPlan = await WorkoutPlan.create({
      title,
      description: description || '',
      exercises: exercises || [],
      duration,
      level,
      goal: goal || 'general_fitness',
      frequency: frequency || 3,
      createdBy: req.user.id,
      gymId,
      isTemplate: isTemplate || false,
      assignedTo: assignedTo || []
    });

    res.status(201).json({
      success: true,
      data: workoutPlan
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Get all workout plans
 * @route   GET /api/workout-plans
 * @access  Private - GymOwner, Trainer
 */
export const getWorkoutPlans = async (req, res) => {
  try {
    const { gymId, level, goal, isTemplate } = req.query;
    let query = {};
    
    // Apply filters if provided
    if (gymId) query.gymId = gymId;
    if (level) query.level = level;
    if (goal) query.goal = goal;
    if (isTemplate !== undefined) query.isTemplate = isTemplate === 'true';
    
    // Access control based on user role
    if (req.user.role === 'GymOwner') {
      // Get all gyms owned by this user
      const gymsOwned = await Gym.find({ ownerId: req.user.id }).select('_id');
      const gymIds = gymsOwned.map(gym => gym._id);
      
      // Restrict to workout plans in their gyms
      query.gymId = { $in: gymIds };
    } else if (req.user.role === 'Trainer') {
      // Trainers can only see workout plans they created or for gyms they are assigned to
      const trainer = await Trainer.findOne({ userId: req.user.id });
      if (!trainer) {
        return res.status(404).json({
          success: false,
          message: 'Trainer profile not found'
        });
      }
      
      query.$or = [
        { createdBy: req.user.id }, // Plans they created
        { gymId: { $in: trainer.gyms } } // Plans for gyms they're assigned to
      ];
    }
    
    const workoutPlans = await WorkoutPlan.find(query)
      .populate('gymId', 'gymName')
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name email');
    
    res.status(200).json({
      success: true,
      count: workoutPlans.length,
      data: workoutPlans
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Get a single workout plan
 * @route   GET /api/workout-plans/:id
 * @access  Private - GymOwner, Trainer, Member (if assigned)
 */
export const getWorkoutPlan = async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findById(req.params.id)
      .populate('gymId', 'gymName')
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name email');
    
    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }
    
    // Access control
    if (req.user.role === 'GymOwner') {
      // Check if plan belongs to one of their gyms
      const gym = await Gym.findOne({ 
        _id: workoutPlan.gymId, 
        ownerId: req.user.id 
      });
      
      if (!gym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this workout plan'
        });
      }
    } else if (req.user.role === 'Trainer') {
      // Check if plan was created by this trainer or belongs to a gym they're assigned to
      const trainer = await Trainer.findOne({ userId: req.user.id });
      
      if (!trainer) {
        return res.status(404).json({
          success: false,
          message: 'Trainer profile not found'
        });
      }
      
      const isCreator = workoutPlan.createdBy.toString() === req.user.id;
      const isAssignedToGym = trainer.gyms.some(
        gymId => gymId.toString() === workoutPlan.gymId.toString()
      );
      
      if (!isCreator && !isAssignedToGym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this workout plan'
        });
      }
    } else if (req.user.role === 'Member') {
      // Members can only view plans assigned to them
      const member = await Member.findOne({ userId: req.user.id });
      
      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Member profile not found'
        });
      }
      
      const isAssigned = workoutPlan.assignedTo.some(
        id => id.toString() === member._id.toString()
      );
      
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this workout plan'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: workoutPlan
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Update a workout plan
 * @route   PUT /api/workout-plans/:id
 * @access  Private - GymOwner, Trainer (creator only)
 */
export const updateWorkoutPlan = async (req, res) => {
  try {
    const {
      title, description, exercises, duration, level, goal,
      frequency, isTemplate, assignedTo
    } = req.body;
    
    let workoutPlan = await WorkoutPlan.findById(req.params.id);
    
    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }
    
    // Access control
    if (req.user.role === 'GymOwner') {
      // Check if plan belongs to one of their gyms
      const gym = await Gym.findOne({ 
        _id: workoutPlan.gymId, 
        ownerId: req.user.id 
      });
      
      if (!gym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this workout plan'
        });
      }
    } else if (req.user.role === 'Trainer') {
      // Trainers can only update plans they created
      if (workoutPlan.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Trainers can only update workout plans they created'
        });
      }
    }
    
    // If plan is being assigned to members, ensure they belong to this gym
    if (assignedTo && assignedTo.length > 0) {
      const members = await Member.find({ 
        _id: { $in: assignedTo },
        gymId: workoutPlan.gymId
      });

      if (members.length !== assignedTo.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more members do not belong to this gym'
        });
      }

      // If trainer, ensure they can only assign to their assigned members
      if (req.user.role === 'Trainer') {
        const trainer = await Trainer.findOne({ userId: req.user.id });
        const assignedMembers = await Member.find({
          _id: { $in: assignedTo },
          trainerId: trainer._id
        });

        if (assignedMembers.length !== assignedTo.length) {
          return res.status(403).json({
            success: false,
            message: 'Trainers can only assign workout plans to their own members'
          });
        }
      }
    }
    
    // Update the workout plan
    const updateData = {
      title: title || workoutPlan.title,
      description: description !== undefined ? description : workoutPlan.description,
      exercises: exercises || workoutPlan.exercises,
      duration: duration || workoutPlan.duration,
      level: level || workoutPlan.level,
      goal: goal || workoutPlan.goal,
      frequency: frequency || workoutPlan.frequency,
      isTemplate: isTemplate !== undefined ? isTemplate : workoutPlan.isTemplate,
      assignedTo: assignedTo || workoutPlan.assignedTo
    };
    
    workoutPlan = await WorkoutPlan.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('gymId', 'gymName')
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name email');
    
    res.status(200).json({
      success: true,
      data: workoutPlan
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Delete a workout plan
 * @route   DELETE /api/workout-plans/:id
 * @access  Private - GymOwner, Trainer (creator only)
 */
export const deleteWorkoutPlan = async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findById(req.params.id);
    
    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }
    
    // Access control
    if (req.user.role === 'GymOwner') {
      // Check if plan belongs to one of their gyms
      const gym = await Gym.findOne({ 
        _id: workoutPlan.gymId, 
        ownerId: req.user.id 
      });
      
      if (!gym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this workout plan'
        });
      }
    } else if (req.user.role === 'Trainer') {
      // Trainers can only delete plans they created
      if (workoutPlan.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Trainers can only delete workout plans they created'
        });
      }
    }
    
    await WorkoutPlan.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Assign workout plan to members
 * @route   POST /api/workout-plans/:id/assign
 * @access  Private - GymOwner, Trainer
 */
export const assignWorkoutPlan = async (req, res) => {
  try {
    const { memberIds } = req.body;
    
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Member IDs are required'
      });
    }
    
    const workoutPlan = await WorkoutPlan.findById(req.params.id);
    
    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }
    
    // Access control
    if (req.user.role === 'GymOwner') {
      // Check if plan belongs to one of their gyms
      const gym = await Gym.findOne({ 
        _id: workoutPlan.gymId, 
        ownerId: req.user.id 
      });
      
      if (!gym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to assign this workout plan'
        });
      }
      
      // Ensure all members belong to the gym
      const members = await Member.find({
        _id: { $in: memberIds },
        gymId: workoutPlan.gymId
      });
      
      if (members.length !== memberIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more members do not belong to this gym'
        });
      }
    } else if (req.user.role === 'Trainer') {
      // Check if plan was created by this trainer
      if (workoutPlan.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Trainers can only assign workout plans they created'
        });
      }
      
      // Ensure all members are assigned to this trainer
      const trainer = await Trainer.findOne({ userId: req.user.id });
      const assignedMembers = await Member.find({
        _id: { $in: memberIds },
        trainerId: trainer._id
      });
      
      if (assignedMembers.length !== memberIds.length) {
        return res.status(403).json({
          success: false,
          message: 'Trainers can only assign workout plans to their own members'
        });
      }
    }
    
    // Update the assigned members
    const updatedPlan = await WorkoutPlan.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { assignedTo: { $each: memberIds } } },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email');
    
    res.status(200).json({
      success: true,
      data: updatedPlan
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Unassign workout plan from members
 * @route   POST /api/workout-plans/:id/unassign
 * @access  Private - GymOwner, Trainer
 */
export const unassignWorkoutPlan = async (req, res) => {
  try {
    const { memberIds } = req.body;
    
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Member IDs are required'
      });
    }
    
    const workoutPlan = await WorkoutPlan.findById(req.params.id);
    
    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }
    
    // Access control
    if (req.user.role === 'GymOwner') {
      // Check if plan belongs to one of their gyms
      const gym = await Gym.findOne({ 
        _id: workoutPlan.gymId, 
        ownerId: req.user.id 
      });
      
      if (!gym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to unassign this workout plan'
        });
      }
    } else if (req.user.role === 'Trainer') {
      // Check if plan was created by this trainer
      if (workoutPlan.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Trainers can only unassign workout plans they created'
        });
      }
    }
    
    // Update the assigned members
    const updatedPlan = await WorkoutPlan.findByIdAndUpdate(
      req.params.id,
      { $pullAll: { assignedTo: memberIds } },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email');
    
    res.status(200).json({
      success: true,
      data: updatedPlan
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Get workout plans by member
 * @route   GET /api/workout-plans/member/:memberId
 * @access  Private - GymOwner, Trainer, Member
 */
export const getWorkoutPlansByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    
    // Access control
    if (req.user.role === 'Member') {
      // Members can only view their own workout plans
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
          message: 'Members can only view their own workout plans'
        });
      }
    } else if (req.user.role === 'Trainer') {
      // Trainers can only view workout plans for their assigned members
      const trainer = await Trainer.findOne({ userId: req.user.id });
      
      if (!trainer) {
        return res.status(404).json({
          success: false,
          message: 'Trainer profile not found'
        });
      }
      
      const member = await Member.findById(memberId);
      
      if (!member || member.trainerId.toString() !== trainer._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Trainers can only view workout plans for their assigned members'
        });
      }
    } else if (req.user.role === 'GymOwner') {
      // Gym owners can only view workout plans for members in their gyms
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
          message: 'Not authorized to view workout plans for this member'
        });
      }
    }
    
    const workoutPlans = await WorkoutPlan.find({ assignedTo: memberId })
      .populate('gymId', 'gymName')
      .populate('createdBy', 'name');
    
    res.status(200).json({
      success: true,
      count: workoutPlans.length,
      data: workoutPlans
    });
  } catch (error) {
    handleError(res, error);
  }
}; 