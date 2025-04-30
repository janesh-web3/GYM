import DietPlan from '../models/DietPlan.js';
import Member from '../models/Member.js';
import Gym from '../models/Gym.js';
import Trainer from '../models/Trainer.js';
import { handleError } from '../utils/errorHandler.js';

/**
 * @desc    Create a new diet plan
 * @route   POST /api/diet-plans
 * @access  Private - GymOwner, Trainer
 */
export const createDietPlan = async (req, res) => {
  try {
    const {
      title, description, meals, calories, goal,
      duration, restrictions, macros, gymId, isTemplate, assignedTo
    } = req.body;

    // Check if user is authorized for this gym
    if (req.user.role === 'GymOwner') {
      const gym = await Gym.findOne({ _id: gymId, ownerId: req.user.id });
      if (!gym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to create diet plans for this gym'
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
            message: 'Trainers can only assign diet plans to their own members'
          });
        }
      }
    }

    // Create the diet plan
    const dietPlan = await DietPlan.create({
      title,
      description: description || '',
      meals: meals || [],
      calories,
      goal,
      duration: duration || 4,
      restrictions: restrictions || ['none'],
      macros: macros || { protein: 30, carbs: 40, fats: 30 },
      createdBy: req.user.id,
      gymId,
      isTemplate: isTemplate || false,
      assignedTo: assignedTo || []
    });

    res.status(201).json({
      success: true,
      data: dietPlan
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Get all diet plans
 * @route   GET /api/diet-plans
 * @access  Private - GymOwner, Trainer
 */
export const getDietPlans = async (req, res) => {
  try {
    const { gymId, goal, isTemplate } = req.query;
    let query = {};
    
    // Apply filters if provided
    if (gymId) query.gymId = gymId;
    if (goal) query.goal = goal;
    if (isTemplate !== undefined) query.isTemplate = isTemplate === 'true';
    
    // Access control based on user role
    if (req.user.role === 'GymOwner') {
      // Get all gyms owned by this user
      const gymsOwned = await Gym.find({ ownerId: req.user.id }).select('_id');
      const gymIds = gymsOwned.map(gym => gym._id);
      
      // Restrict to diet plans in their gyms
      query.gymId = { $in: gymIds };
    } else if (req.user.role === 'Trainer') {
      // Trainers can only see diet plans they created or for gyms they are assigned to
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
    
    const dietPlans = await DietPlan.find(query)
      .populate('gymId', 'gymName')
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name email');
    
    res.status(200).json({
      success: true,
      count: dietPlans.length,
      data: dietPlans
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Get a single diet plan
 * @route   GET /api/diet-plans/:id
 * @access  Private - GymOwner, Trainer, Member (if assigned)
 */
export const getDietPlan = async (req, res) => {
  try {
    const dietPlan = await DietPlan.findById(req.params.id)
      .populate('gymId', 'gymName')
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name email');
    
    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }
    
    // Access control
    if (req.user.role === 'GymOwner') {
      // Check if plan belongs to one of their gyms
      const gym = await Gym.findOne({ 
        _id: dietPlan.gymId, 
        ownerId: req.user.id 
      });
      
      if (!gym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this diet plan'
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
      
      const isCreator = dietPlan.createdBy.toString() === req.user.id;
      const isAssignedToGym = trainer.gyms.some(
        gymId => gymId.toString() === dietPlan.gymId.toString()
      );
      
      if (!isCreator && !isAssignedToGym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this diet plan'
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
      
      const isAssigned = dietPlan.assignedTo.some(
        id => id.toString() === member._id.toString()
      );
      
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this diet plan'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: dietPlan
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Update a diet plan
 * @route   PUT /api/diet-plans/:id
 * @access  Private - GymOwner, Trainer (creator only)
 */
export const updateDietPlan = async (req, res) => {
  try {
    const {
      title, description, meals, calories, goal,
      duration, restrictions, macros, isTemplate, assignedTo
    } = req.body;
    
    let dietPlan = await DietPlan.findById(req.params.id);
    
    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }
    
    // Access control
    if (req.user.role === 'GymOwner') {
      // Check if plan belongs to one of their gyms
      const gym = await Gym.findOne({ 
        _id: dietPlan.gymId, 
        ownerId: req.user.id 
      });
      
      if (!gym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this diet plan'
        });
      }
    } else if (req.user.role === 'Trainer') {
      // Trainers can only update plans they created
      if (dietPlan.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Trainers can only update diet plans they created'
        });
      }
    }
    
    // If plan is being assigned to members, ensure they belong to this gym
    if (assignedTo && assignedTo.length > 0) {
      const members = await Member.find({ 
        _id: { $in: assignedTo },
        gymId: dietPlan.gymId
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
            message: 'Trainers can only assign diet plans to their own members'
          });
        }
      }
    }
    
    // Update the diet plan
    const updateData = {
      title: title || dietPlan.title,
      description: description !== undefined ? description : dietPlan.description,
      meals: meals || dietPlan.meals,
      calories: calories || dietPlan.calories,
      goal: goal || dietPlan.goal,
      duration: duration || dietPlan.duration,
      restrictions: restrictions || dietPlan.restrictions,
      macros: macros || dietPlan.macros,
      isTemplate: isTemplate !== undefined ? isTemplate : dietPlan.isTemplate,
      assignedTo: assignedTo || dietPlan.assignedTo
    };
    
    dietPlan = await DietPlan.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('gymId', 'gymName')
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name email');
    
    res.status(200).json({
      success: true,
      data: dietPlan
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Delete a diet plan
 * @route   DELETE /api/diet-plans/:id
 * @access  Private - GymOwner, Trainer (creator only)
 */
export const deleteDietPlan = async (req, res) => {
  try {
    const dietPlan = await DietPlan.findById(req.params.id);
    
    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }
    
    // Access control
    if (req.user.role === 'GymOwner') {
      // Check if plan belongs to one of their gyms
      const gym = await Gym.findOne({ 
        _id: dietPlan.gymId, 
        ownerId: req.user.id 
      });
      
      if (!gym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this diet plan'
        });
      }
    } else if (req.user.role === 'Trainer') {
      // Trainers can only delete plans they created
      if (dietPlan.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Trainers can only delete diet plans they created'
        });
      }
    }
    
    await DietPlan.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Assign diet plan to members
 * @route   POST /api/diet-plans/:id/assign
 * @access  Private - GymOwner, Trainer
 */
export const assignDietPlan = async (req, res) => {
  try {
    const { memberIds } = req.body;
    
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Member IDs are required'
      });
    }
    
    const dietPlan = await DietPlan.findById(req.params.id);
    
    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }
    
    // Access control
    if (req.user.role === 'GymOwner') {
      // Check if plan belongs to one of their gyms
      const gym = await Gym.findOne({ 
        _id: dietPlan.gymId, 
        ownerId: req.user.id 
      });
      
      if (!gym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to assign this diet plan'
        });
      }
      
      // Ensure all members belong to the gym
      const members = await Member.find({
        _id: { $in: memberIds },
        gymId: dietPlan.gymId
      });
      
      if (members.length !== memberIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more members do not belong to this gym'
        });
      }
    } else if (req.user.role === 'Trainer') {
      // Check if plan was created by this trainer
      if (dietPlan.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Trainers can only assign diet plans they created'
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
          message: 'Trainers can only assign diet plans to their own members'
        });
      }
    }
    
    // Update the assigned members
    const updatedPlan = await DietPlan.findByIdAndUpdate(
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
 * @desc    Unassign diet plan from members
 * @route   POST /api/diet-plans/:id/unassign
 * @access  Private - GymOwner, Trainer
 */
export const unassignDietPlan = async (req, res) => {
  try {
    const { memberIds } = req.body;
    
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Member IDs are required'
      });
    }
    
    const dietPlan = await DietPlan.findById(req.params.id);
    
    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }
    
    // Access control
    if (req.user.role === 'GymOwner') {
      // Check if plan belongs to one of their gyms
      const gym = await Gym.findOne({ 
        _id: dietPlan.gymId, 
        ownerId: req.user.id 
      });
      
      if (!gym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to unassign this diet plan'
        });
      }
    } else if (req.user.role === 'Trainer') {
      // Check if plan was created by this trainer
      if (dietPlan.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Trainers can only unassign diet plans they created'
        });
      }
    }
    
    // Update the assigned members
    const updatedPlan = await DietPlan.findByIdAndUpdate(
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
 * @desc    Get diet plans by member
 * @route   GET /api/diet-plans/member/:memberId
 * @access  Private - GymOwner, Trainer, Member
 */
export const getDietPlansByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    
    // Access control
    if (req.user.role === 'Member') {
      // Members can only view their own diet plans
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
          message: 'Members can only view their own diet plans'
        });
      }
    } else if (req.user.role === 'Trainer') {
      // Trainers can only view diet plans for their assigned members
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
          message: 'Trainers can only view diet plans for their assigned members'
        });
      }
    } else if (req.user.role === 'GymOwner') {
      // Gym owners can only view diet plans for members in their gyms
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
          message: 'Not authorized to view diet plans for this member'
        });
      }
    }
    
    const dietPlans = await DietPlan.find({ assignedTo: memberId })
      .populate('gymId', 'gymName')
      .populate('createdBy', 'name');
    
    res.status(200).json({
      success: true,
      count: dietPlans.length,
      data: dietPlans
    });
  } catch (error) {
    handleError(res, error);
  }
}; 