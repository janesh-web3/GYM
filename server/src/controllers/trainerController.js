import Trainer from '../models/Trainer.js';
import User from '../models/User.js';
import Gym from '../models/Gym.js';
import { handleError } from '../utils/errorHandler.js';

/**
 * @desc    Create a new trainer
 * @route   POST /api/trainers
 * @access  Private - GymOwner
 */
export const createTrainer = async (req, res) => {
  try {
    const {
      name, email, specialization, phone, gyms,
      bio, experience, certifications, availability, password
    } = req.body;

    // First create a user account for the trainer
    const newUser = await User.create({
      name,
      email,
      password: password || 'trainer123', // Default password that should be changed on first login
      role: 'Trainer'
    });

    // Then create the trainer profile
    const trainer = await Trainer.create({
      name,
      email,
      specialization,
      phone,
      userId: newUser._id,
      gyms: gyms || [],
      bio: bio || '',
      experience: experience || 0,
      certifications: certifications || [],
      availability: availability || 'Full-time',
      joinedDate: new Date()
    });

    res.status(201).json({
      success: true,
      data: trainer
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Get all trainers
 * @route   GET /api/trainers
 * @access  Private - GymOwner, SuperAdmin
 */
export const getTrainers = async (req, res) => {
  try {
    const { gymId } = req.query;
    let query = {};
    
    // If gymId is provided, filter trainers by gym
    if (gymId) {
      query.gyms = { $in: [gymId] };
    }
    
    // If user is GymOwner, they should only see trainers from their gyms
    if (req.user.role === 'GymOwner') {
      // Get all gyms owned by this user
      const gymsOwned = await Gym.find({ ownerId: req.user.id }).select('_id');
      const gymIds = gymsOwned.map(gym => gym._id);
      
      // Find trainers who are associated with any of these gyms
      query.gyms = { $in: gymIds };
    }
    
    const trainers = await Trainer.find(query)
      .populate('gyms', 'gymName')
      .populate({
        path: 'assignedMembers',
        select: 'name email phone'
      });
    
    res.status(200).json({
      success: true,
      count: trainers.length,
      data: trainers
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Get a single trainer
 * @route   GET /api/trainers/:id
 * @access  Private - GymOwner, SuperAdmin
 */
export const getTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .populate('gyms', 'gymName')
      .populate({
        path: 'assignedMembers',
        select: 'name email phone'
      });
    
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }
    
    // If GymOwner, check if trainer is associated with their gym
    if (req.user.role === 'GymOwner') {
      const gymsOwned = await Gym.find({ ownerId: req.user.id }).select('_id');
      const gymIds = gymsOwned.map(gym => gym._id.toString());
      
      const trainerHasAccessToOwnerGym = trainer.gyms.some(gymId => 
        gymIds.includes(gymId.toString())
      );
      
      if (!trainerHasAccessToOwnerGym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this trainer'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: trainer
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Update a trainer
 * @route   PUT /api/trainers/:id
 * @access  Private - GymOwner
 */
export const updateTrainer = async (req, res) => {
  try {
    const {
      name, email, specialization, phone, gyms,
      bio, experience, certifications, availability, status
    } = req.body;
    
    let trainer = await Trainer.findById(req.params.id);
    
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }
    
    // If GymOwner, check if trainer is associated with their gym
    if (req.user.role === 'GymOwner') {
      const gymsOwned = await Gym.find({ ownerId: req.user.id }).select('_id');
      const gymIds = gymsOwned.map(gym => gym._id.toString());
      
      const trainerHasAccessToOwnerGym = trainer.gyms.some(gymId => 
        gymIds.includes(gymId.toString())
      );
      
      if (!trainerHasAccessToOwnerGym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this trainer'
        });
      }
      
      // If gyms are being updated, ensure GymOwner can only assign trainers to their own gyms
      if (gyms && gyms.length > 0) {
        const allGymsAuthorized = gyms.every(gymId => gymIds.includes(gymId.toString()));
        
        if (!allGymsAuthorized) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to assign trainer to gyms you do not own'
          });
        }
      }
    }
    
    // Update trainer
    trainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      {
        name: name || trainer.name,
        email: email || trainer.email,
        specialization: specialization || trainer.specialization,
        phone: phone || trainer.phone,
        gyms: gyms || trainer.gyms,
        bio: bio !== undefined ? bio : trainer.bio,
        experience: experience !== undefined ? experience : trainer.experience,
        certifications: certifications || trainer.certifications,
        availability: availability || trainer.availability,
        status: status || trainer.status
      },
      { new: true, runValidators: true }
    ).populate('gyms', 'gymName')
     .populate({
        path: 'assignedMembers',
        select: 'name email phone'
      });
    
    // Also update the user profile if name or email changed
    if (name || email) {
      await User.findByIdAndUpdate(
        trainer.userId,
        {
          name: name || undefined,
          email: email || undefined
        },
        { runValidators: true }
      );
    }
    
    res.status(200).json({
      success: true,
      data: trainer
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Delete a trainer
 * @route   DELETE /api/trainers/:id
 * @access  Private - GymOwner
 */
export const deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }
    
    // If GymOwner, check if trainer is associated with their gym
    if (req.user.role === 'GymOwner') {
      const gymsOwned = await Gym.find({ ownerId: req.user.id }).select('_id');
      const gymIds = gymsOwned.map(gym => gym._id.toString());
      
      const trainerHasAccessToOwnerGym = trainer.gyms.some(gymId => 
        gymIds.includes(gymId.toString())
      );
      
      if (!trainerHasAccessToOwnerGym) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this trainer'
        });
      }
    }
    
    // Delete trainer profile
    await Trainer.findByIdAndDelete(req.params.id);
    
    // Don't delete the user account, just set status to inactive
    await User.findByIdAndUpdate(
      trainer.userId,
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