import Branch from '../models/Branch.js';
import Gym from '../models/Gym.js';
import BranchMembership from '../models/BranchMembership.js';
import { uploadMedia, deleteMedia } from '../utils/cloudinary.js';
import { UserSubscription } from '../models/Subscription.js';
import mongoose from 'mongoose';

// @desc    Create new branch for a gym
// @route   POST /api/branches
// @access  Private (GymOwner)
export const createBranch = async (req, res) => {
  try {
    const { gymId } = req.body;

    // Verify that the gym exists and belongs to the user
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // Check ownership of the gym
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add branches to this gym' });
    }

    // Create the branch
    const branch = await Branch.create({
      ...req.body,
      gymId
    });

    res.status(201).json(branch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all branches for a specific gym
// @route   GET /api/gyms/:gymId/branches
// @access  Public
export const getGymBranches = async (req, res) => {
  try {
    const { gymId } = req.params;
    
    // Verify gym exists
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    const branches = await Branch.find({ gymId }).sort('branchName');
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single branch by ID
// @route   GET /api/branches/:id
// @access  Public
export const getBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id)
      .populate('trainers', 'name profileImage');

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a branch
// @route   PUT /api/branches/:id
// @access  Private (GymOwner of the associated gym)
export const updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Get the associated gym to check ownership
    const gym = await Gym.findById(branch.gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Associated gym not found' });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this branch' });
    }

    // Don't allow changing the gymId relationship
    const updateData = { ...req.body };
    delete updateData.gymId;

    const updatedBranch = await Branch.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedBranch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a branch
// @route   DELETE /api/branches/:id
// @access  Private (GymOwner of the associated gym)
export const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Get the associated gym to check ownership
    const gym = await Gym.findById(branch.gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Associated gym not found' });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this branch' });
    }

    await branch.remove();
    res.json({ message: 'Branch removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload media (photos/videos) for a branch
// @route   POST /api/branches/:id/media
// @access  Private (GymOwner of the associated gym)
export const uploadBranchMedia = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Get the associated gym to check ownership
    const gym = await Gym.findById(branch.gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Associated gym not found' });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to upload media to this branch' });
    }

    // Determine media type (photo or video)
    const mediaType = req.query.type || req.body.type || 'photo';
    const isVideo = mediaType === 'video';
    
    const uploadPromises = req.files.map(async (file) => {
      const result = await uploadMedia(file, isVideo ? 'videos' : 'photos');
      return {
        url: result.url,
        public_id: result.public_id,
        caption: req.body.caption || ''
      };
    });

    const uploadedMedia = await Promise.all(uploadPromises);
    
    // Add to the appropriate array based on type
    if (isVideo) {
      branch.videos.push(...uploadedMedia);
    } else {
      branch.photos.push(...uploadedMedia);
    }
    
    await branch.save();
    res.json(branch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete media from a branch
// @route   DELETE /api/branches/:id/media/:mediaId
// @access  Private (GymOwner of the associated gym)
export const deleteBranchMedia = async (req, res) => {
  try {
    const { id, mediaId } = req.params;
    const { type } = req.query; // 'photo' or 'video'
    
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Get the associated gym to check ownership
    const gym = await Gym.findById(branch.gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Associated gym not found' });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete media from this branch' });
    }

    const mediaArray = type === 'video' ? branch.videos : branch.photos;
    const mediaIndex = mediaArray.findIndex(item => item._id.toString() === mediaId);
    
    if (mediaIndex === -1) {
      return res.status(404).json({ message: `${type} not found` });
    }

    const media = mediaArray[mediaIndex];
    
    // Delete from Cloudinary
    if (media.public_id) {
      await deleteMedia(media.public_id, type === 'video');
    }

    // Remove from the branch document
    if (type === 'video') {
      branch.videos.splice(mediaIndex, 1);
    } else {
      branch.photos.splice(mediaIndex, 1);
    }
    
    await branch.save();
    res.json({ message: `${type} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a branch as a member
// @route   POST /api/branches/:id/join
// @access  Private (Member)
export const joinBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { subscriptionId } = req.body;
    
    // Verify branch exists and is active
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    
    if (branch.status !== 'active') {
      return res.status(400).json({ message: 'This branch is not currently accepting new members' });
    }

    // Verify gym exists and is active
    const gym = await Gym.findById(branch.gymId);
    if (!gym || gym.status !== 'active') {
      return res.status(400).json({ message: 'The gym associated with this branch is not active' });
    }

    // Check if user is already a member of this branch
    const existingMembership = await BranchMembership.findOne({
      userId: req.user._id,
      branchId: id
    });

    if (existingMembership && existingMembership.status === 'active') {
      return res.status(400).json({ message: 'You are already a member of this branch' });
    }

    // If subscription is provided, validate it
    let subscription = null;
    if (subscriptionId) {
      subscription = await UserSubscription.findById(subscriptionId)
        .populate('planId');
        
      if (!subscription) {
        return res.status(404).json({ message: 'Subscription not found' });
      }
      
      if (subscription.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'This subscription does not belong to you' });
      }
      
      if (subscription.status !== 'active') {
        return res.status(400).json({ message: 'This subscription is not active' });
      }
      
      // Verify subscription is for this gym/branch
      if (subscription.gymId.toString() !== branch.gymId.toString()) {
        return res.status(400).json({ message: 'This subscription is not valid for this gym' });
      }
      
      // If branch-specific subscription, make sure it matches
      if (subscription.branchId && subscription.branchId.toString() !== id) {
        return res.status(400).json({ message: 'This subscription is for a different branch' });
      }
    }
    
    // Create new membership or reactivate existing one
    let membership;
    
    if (existingMembership) {
      // Update existing membership
      existingMembership.status = 'active';
      existingMembership.subscriptionId = subscriptionId || existingMembership.subscriptionId;
      existingMembership.joinDate = new Date();
      
      membership = await existingMembership.save();
    } else {
      // Create new membership
      membership = await BranchMembership.create({
        userId: req.user._id,
        branchId: id,
        gymId: branch.gymId,
        subscriptionId: subscriptionId || null,
        status: 'active'
      });
      
      // Update branch member count
      branch.memberCount += 1;
      await branch.save();
      
      // Update gym total members count
      gym.totalMembers += 1;
      await gym.save();
    }
    
    res.status(201).json({
      success: true,
      message: 'Successfully joined the branch',
      membership
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all members of a branch
// @route   GET /api/branches/:id/members
// @access  Private (GymOwner, Manager)
export const getBranchMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, status } = req.query;
    
    // Verify branch exists
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    
    // Get the associated gym to check ownership
    const gym = await Gym.findById(branch.gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Associated gym not found' });
    }
    
    // Check authorization - only gym owner or branch manager can see members
    if (
      gym.ownerId.toString() !== req.user._id.toString() &&
      (!branch.manager || branch.manager.toString() !== req.user._id.toString()) &&
      req.user.role !== 'superadmin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view branch members' });
    }
    
    // Build query
    const query = { branchId: id };
    if (status) {
      query.status = status;
    }
    
    // Pagination
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { joinDate: -1 },
      populate: [
        { path: 'userId', select: 'name email profileImage' },
        { path: 'subscriptionId', populate: { path: 'planId', select: 'name price' } }
      ]
    };
    
    // Get paginated results
    const memberships = await BranchMembership.find(query)
      .populate('userId', 'name email profileImage')
      .populate({
        path: 'subscriptionId',
        populate: { path: 'planId', select: 'name price' }
      })
      .sort('-joinDate')
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);
    
    // Get total count
    const total = await BranchMembership.countDocuments(query);
    
    res.json({
      memberships,
      pagination: {
        total,
        page: options.page,
        pages: Math.ceil(total / options.limit),
        limit: options.limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get stats for a branch
// @route   GET /api/branches/:id/stats
// @access  Private (GymOwner, Manager)
export const getBranchStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify branch exists
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    
    // Get the associated gym to check ownership
    const gym = await Gym.findById(branch.gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Associated gym not found' });
    }
    
    // Check authorization - only gym owner or branch manager can see stats
    if (
      gym.ownerId.toString() !== req.user._id.toString() &&
      (!branch.manager || branch.manager.toString() !== req.user._id.toString()) &&
      req.user.role !== 'superadmin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view branch statistics' });
    }
    
    // Get member counts
    const totalMembers = await BranchMembership.countDocuments({ branchId: id });
    const activeMembers = await BranchMembership.countDocuments({ branchId: id, status: 'active' });
    
    // Get subscription stats
    const subscriptionStats = await BranchMembership.aggregate([
      { $match: { branchId: mongoose.Types.ObjectId(id) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Format subscription stats
    const statusCounts = {};
    subscriptionStats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });
    
    // Get check-in stats
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const checkInsToday = await BranchMembership.countDocuments({
      branchId: id,
      lastCheckIn: { $gte: startOfDay }
    });
    
    // Get revenue stats from subscriptions
    const subscriptions = await UserSubscription.find({
      branchId: id,
      status: 'active',
      paymentStatus: 'completed'
    }).populate('planId');
    
    let totalRevenue = 0;
    if (subscriptions.length > 0) {
      totalRevenue = subscriptions.reduce((sum, sub) => {
        return sum + (sub.planId ? sub.planId.price : 0);
      }, 0);
    }
    
    res.json({
      totalMembers,
      activeMembers,
      statusCounts,
      checkInsToday,
      totalRevenue,
      subscriptionCount: subscriptions.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 