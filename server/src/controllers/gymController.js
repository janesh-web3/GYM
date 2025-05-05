import Gym from '../models/Gym.js';
import GymMembership from '../models/GymMembership.js';
import { uploadMedia as uploadToCloudinary, deleteMedia as deleteCloudinaryMedia } from '../utils/cloudinary.js';
import fs from 'fs';
import Branch from '../models/Branch.js';
import mongoose from 'mongoose';

// @desc    Create new gym
// @route   POST /api/gyms
// @access  Private (GymOwner)
export const createGym = async (req, res) => {
  try {
    const gym = await Gym.create({
      ...req.body,
      ownerId: req.user._id
    });

    res.status(201).json(gym);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all gyms
// @route   GET /api/gyms
// @access  Public
export const getGyms = async (req, res) => {
  try {
    const { status, city, search } = req.query;
    const filter = {};

    // Add filters
    if (status) filter.status = status;
    if (city) filter['address.city'] = city;
    if (search) filter.$text = { $search: search };

    const gyms = await Gym.find(filter)
      .populate('ownerId', 'name email')
      .sort('-createdAt');

    res.json(gyms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single gym
// @route   GET /api/gyms/:id
// @access  Public
export const getGym = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id)
      .populate('ownerId', 'name email')
      .populate({
        path: 'branches',
        select: 'branchName address status photos description memberCount'
      })
      .populate({
        path: 'subscriptionPlans',
        match: { isActive: true }
      });

    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    res.json(gym);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update gym
// @route   PUT /api/gyms/:id
// @access  Private (GymOwner - only their own gym)
export const updateGym = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);

    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this gym' });
    }

    // Don't allow owner to update approval status
    const updateData = { ...req.body };
    delete updateData.isApproved;
    delete updateData.status;

    // Ensure phone, email, website, and working hours are properly handled
    // These fields should be explicitly set or kept as they were
    if (!updateData.phoneNumber && gym.phoneNumber) {
      updateData.phoneNumber = gym.phoneNumber;
    }

    if (!updateData.email && gym.email) {
      updateData.email = gym.email;
    }

    if (!updateData.website && gym.website) {
      updateData.website = gym.website;
    }

    if (!updateData.workingHours && gym.workingHours) {
      updateData.workingHours = gym.workingHours;
    }

    const updatedGym = await Gym.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedGym);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete gym
// @route   DELETE /api/gyms/:id
// @access  Private (GymOwner - only their own gym)
export const deleteGym = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);

    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this gym' });
    }

    await gym.remove();
    res.json({ message: 'Gym removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update gym status (approve/ban)
// @route   PATCH /api/gyms/:id/status
// @access  Private (SuperAdmin only)
export const updateGymStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'active', 'banned'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const gym = await Gym.findById(req.params.id);

    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    gym.status = status;
    gym.isApproved = status === 'active';
    await gym.save();

    res.json(gym);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Upload gym photos
// @route   POST /api/gyms/:id/photos
// @access  Private (GymOwner - only their own gym)
export const uploadPhotos = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);

    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this gym' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const result = await uploadToCloudinary(file, 'photos');
      return {
        url: result.url,
        public_id: result.public_id,
        caption: req.body.caption || ''
      };
    });

    const uploadedPhotos = await Promise.all(uploadPromises);
    gym.photos.push(...uploadedPhotos);
    await gym.save();

    res.json(gym);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Upload gym videos
// @route   POST /api/gyms/:id/videos
// @access  Private (GymOwner - only their own gym)
export const uploadVideos = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);

    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this gym' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const result = await uploadToCloudinary(file, 'videos');
      return {
        url: result.url,
        public_id: result.public_id,
        caption: req.body.caption || ''
      };
    });

    const uploadedVideos = await Promise.all(uploadPromises);
    gym.videos.push(...uploadedVideos);
    await gym.save();

    res.json(gym);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete gym media (photos/videos)
// @route   DELETE /api/gyms/:id/media/:mediaId
// @access  Private (GymOwner - only their own gym)
export const deleteMedia = async (req, res) => {
  try {
    const { id, mediaId } = req.params;
    const gym = await Gym.findById(id);

    if (!gym) {
      return res.status(404).json({ 
        success: false, 
        message: 'Gym not found' 
      });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete media from this gym' 
      });
    }

    // Find the media item - could be in photos or videos
    let mediaType = 'photo';
    let mediaItem = gym.photos.find(p => p._id.toString() === mediaId);
    
    if (!mediaItem) {
      mediaItem = gym.videos.find(v => v._id.toString() === mediaId);
      if (mediaItem) {
        mediaType = 'video';
      }
    }

    if (!mediaItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Media not found' 
      });
    }

    // Delete from Cloudinary if public_id exists
    if (mediaItem.public_id) {
      await deleteCloudinaryMedia(mediaItem.public_id, mediaType === 'video');
    }

    // Remove from the gym document
    if (mediaType === 'photo') {
      gym.photos = gym.photos.filter(p => p._id.toString() !== mediaId);
    } else {
      gym.videos = gym.videos.filter(v => v._id.toString() !== mediaId);
    }
    
    await gym.save();

    res.status(200).json({ 
      success: true, 
      message: `${mediaType} deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error deleting media' 
    });
  }
};

// @desc    Get gym statistics (members, trainers, media count, monthly coins)
// @route   GET /api/gyms/:id/stats
// @access  Private (GymOwner, SuperAdmin)
export const getGymStats = async (req, res) => {
  try {
    const gymId = req.params.id;
    
    // Get the gym
    const gym = await Gym.findById(gymId);
    
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }
    
    // Check ownership or superadmin privileges
    if (req.user.role !== 'superadmin' && gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access these stats' });
    }
    
    // Import Models when needed
    const Member = await import('../models/Member.js').then(m => m.default);
    const Trainer = await import('../models/Trainer.js').then(m => m.default);
    
    // Get current date and first day of current month for monthly calculations
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calculate stats
    const membersCount = await Member.countDocuments({ gymId });
    const trainersCount = await Trainer.countDocuments({ gymId });
    const mediaCount = (gym.photos ? gym.photos.length : 0) + (gym.videos ? gym.videos.length : 0);
    
    // Calculate monthly coins received
    const monthlyCoins = gym.coinReceivedHistory
      .filter(transaction => new Date(transaction.date) >= firstDayOfMonth)
      .reduce((total, transaction) => total + transaction.coins, 0);
    
    const stats = {
      membersCount,
      trainersCount,
      mediaCount,
      monthlyCoins,
      totalCoins: gym.coinBalance
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload gym logo
// @route   POST /api/gyms/:id/logo
// @access  Private (GymOwner - only their own gym)
export const uploadLogo = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);

    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this gym' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // If gym already has a logo, delete the old one from Cloudinary
    if (gym.logo && gym.logo.public_id) {
      await deleteCloudinaryMedia(gym.logo.public_id);
    }

    // Upload the new logo to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'gym-logos');

    // Update the gym with the new logo
    gym.logo = {
      url: result.url,
      public_id: result.public_id
    };

    await gym.save();

    // Remove the temporary file if it exists
    if (req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    res.json({ 
      success: true, 
      data: { 
        logo: gym.logo 
      } 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all active gyms
// @route   GET /api/gyms/active
// @access  Public
export const getActiveGyms = async (req, res) => {
  try {
    const { city, search, limit = 20, page = 1 } = req.query;
    const filter = { status: 'active' };

    // Add additional filters
    if (city) filter['address.city'] = city;
    if (search) filter.$text = { $search: search };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const gyms = await Gym.find(filter)
      .select('gymName address description logo photos videos services')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Gym.countDocuments(filter);

    res.json({
      gyms,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a gym as a member
// @route   POST /api/gyms/:id/join
// @access  Private (Member role)
export const joinGym = async (req, res) => {
  try {
    const gymId = req.params.id;
    const userId = req.user._id;

    // Check if gym exists and is active
    const gym = await Gym.findOne({ _id: gymId, status: 'active' });
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found or not active' });
    }

    // Check if user is already a member of this gym
    const existingMembership = await GymMembership.findOne({ userId, gymId });
    if (existingMembership) {
      return res.status(400).json({ 
        message: 'You are already a member of this gym',
        membership: existingMembership
      });
    }

    // Create new membership
    const gymMembership = await GymMembership.create({
      userId,
      gymId,
      status: 'active'
    });

    await gymMembership.populate('gymId', 'gymName address');

    res.status(201).json({
      message: 'Successfully joined the gym',
      membership: gymMembership
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Check user's membership status for a gym
// @route   GET /api/gyms/:id/membership-status
// @access  Private
export const checkMembershipStatus = async (req, res) => {
  try {
    const gymId = req.params.id;
    const userId = req.user._id;

    const membership = await GymMembership.findOne({ userId, gymId });
    
    if (!membership) {
      return res.json({ isMember: false });
    }

    res.json({
      isMember: true,
      status: membership.status,
      joinedDate: membership.joinedDate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get gyms the user is a member of
// @route   GET /api/gyms/memberships
// @access  Private
export const getUserGymMemberships = async (req, res) => {
  try {
    const userId = req.user._id;

    const memberships = await GymMembership.find({ userId, status: 'active' })
      .populate('gymId', 'gymName address description logo photos videos');

    res.json(memberships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle featured status of a gym
// @route   PATCH /api/gyms/:id/featured
// @access  Private (SuperAdmin only)
export const toggleFeaturedStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;
    
    // Validate that isFeatured is a boolean
    if (typeof isFeatured !== 'boolean') {
      return res.status(400).json({ 
        success: false,
        message: 'isFeatured must be a boolean value' 
      });
    }

    const gym = await Gym.findById(id);
    
    if (!gym) {
      return res.status(404).json({ 
        success: false,
        message: 'Gym not found' 
      });
    }

    // Update the featured status
    gym.isFeatured = isFeatured;
    await gym.save();

    res.status(200).json({
      success: true,
      message: `Gym has been ${isFeatured ? 'marked as featured' : 'removed from featured'}`,
      gym: {
        _id: gym._id,
        gymName: gym.gymName,
        isFeatured: gym.isFeatured
      }
    });
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error updating featured status' 
    });
  }
};

// @desc    Get all featured gyms
// @route   GET /api/gyms/featured
// @access  Public
export const getFeaturedGyms = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    // Find active and featured gyms
    const featuredGyms = await Gym.find({ 
      isFeatured: true,
      status: 'active'  // Only return active gyms
    })
    .select('gymName address description logo photos videos services')
    .sort('-updatedAt')
    .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: featuredGyms.length,
      data: featuredGyms
    });
  } catch (error) {
    console.error('Error fetching featured gyms:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error fetching featured gyms' 
    });
  }
};

// @desc    Get a single gym with branches
// @route   GET /api/gyms/:id
// @access  Public
export const getGymWithBranches = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    
    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    // Find all associated branches with basic details
    const branches = await Branch.find({ gymId: gym._id })
      .select('branchName address description photos videos memberCount status')
      .lean();

    // Add branches data to the gym object
    const gymWithBranches = {
      ...gym.toObject(),
      branches: branches.map(branch => ({
        ...branch,
        // Add a thumbnail from the first photo if available
        thumbnail: branch.photos && branch.photos.length > 0 
          ? branch.photos[0].url 
          : null
      }))
    };

    res.json(gymWithBranches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a gym (change status to active)
// @route   PATCH /api/gyms/:id/approve
// @access  Private (SuperAdmin only)
export const approveGym = async (req, res) => {
  try {
    const { id } = req.params;
    
    const gym = await Gym.findById(id);
    
    if (!gym) {
      return res.status(404).json({ 
        success: false,
        message: 'Gym not found' 
      });
    }

    // Update approval status
    gym.status = 'active';
    gym.isApproved = true;
    await gym.save();

    res.status(200).json({
      success: true,
      message: 'Gym has been approved successfully',
      gym: {
        _id: gym._id,
        gymName: gym.gymName,
        status: gym.status,
        isApproved: gym.isApproved
      }
    });
  } catch (error) {
    console.error('Error approving gym:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error approving gym' 
    });
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
      return res.status(404).json({ 
        success: false,
        message: "Gym not found" 
      });
    }

    // Find all branches for this gym
    const branches = await Branch.find({ gymId })
      .select('branchName address status photos description memberCount')
      .sort('branchName');
    
    res.status(200).json({
      success: true,
      count: branches.length,
      data: branches
    });
  } catch (error) {
    console.error('Error fetching gym branches:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error fetching branches' 
    });
  }
};

// @desc    Update media caption
// @route   PATCH /api/gyms/:id/media/:mediaId
// @access  Private (GymOwner - only their own gym)
export const updateMediaCaption = async (req, res) => {
  try {
    const { id, mediaId } = req.params;
    const { caption } = req.body;
    
    if (!caption) {
      return res.status(400).json({
        success: false,
        message: 'Caption is required'
      });
    }

    const gym = await Gym.findById(id);

    if (!gym) {
      return res.status(404).json({ 
        success: false, 
        message: 'Gym not found' 
      });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update media for this gym' 
      });
    }

    // Find and update the media item
    let mediaUpdated = false;
    
    // Check photos
    for (let i = 0; i < gym.photos.length; i++) {
      if (gym.photos[i]._id.toString() === mediaId) {
        gym.photos[i].caption = caption;
        mediaUpdated = true;
        break;
      }
    }
    
    // Check videos if not found in photos
    if (!mediaUpdated) {
      for (let i = 0; i < gym.videos.length; i++) {
        if (gym.videos[i]._id.toString() === mediaId) {
          gym.videos[i].caption = caption;
          mediaUpdated = true;
          break;
        }
      }
    }

    if (!mediaUpdated) {
      return res.status(404).json({ 
        success: false, 
        message: 'Media not found' 
      });
    }
    
    await gym.save();

    res.status(200).json({ 
      success: true, 
      message: 'Caption updated successfully' 
    });
  } catch (error) {
    console.error('Error updating caption:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error updating caption' 
    });
  }
};

// @desc    Get all members for a specific gym (including branch members)
// @route   GET /api/gyms/:id/members
// @access  Private (GymOwner)
export const getGymMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      branchId, 
      search,
      page = 1, 
      limit = 20
    } = req.query;
    
    // Verify gym exists and user has access
    const gym = await Gym.findById(id);
    if (!gym) {
      return res.status(404).json({ 
        success: false, 
        message: 'Gym not found' 
      });
    }

    // Check authorization - only gym owner can see members
    if (gym.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view gym members' 
      });
    }

    // Get all branches for this gym
    const branches = await Branch.find({ gymId: id }, '_id branchName address');
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query for gym members
    const gymMemberQuery = { gymId: id };
    if (status) {
      gymMemberQuery.status = status;
    }

    // Build query for branch members
    const branchMemberQuery = { 
      gymId: id 
    };
    
    if (status) {
      branchMemberQuery.status = status;
    }
    
    if (branchId) {
      branchMemberQuery.branchId = branchId;
    }

    // Get gym members (direct members without branch)
    const gymMembers = await GymMembership.find(gymMemberQuery)
      .populate({
        path: 'userId',
        select: 'name email profileImage',
        match: search ? { 
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ] 
        } : {}
      })
      .sort('-joinDate')
      .lean();

    // Filter out members where userId didn't match search (if search was provided)
    const filteredGymMembers = search 
      ? gymMembers.filter(member => member.userId) 
      : gymMembers;

    // Map gym members to a consistent format
    const formattedGymMembers = filteredGymMembers.map(member => ({
      _id: member._id,
      userId: member.userId,
      status: member.status,
      joinDate: member.joinDate,
      type: 'gym', // To distinguish between gym and branch members
      subscriptionId: member.subscriptionId,
      branch: null // Direct gym members don't have a branch
    }));

    // Get branch members
    const BranchMembership = mongoose.model('BranchMembership');
    const branchMembers = await BranchMembership.find(branchMemberQuery)
      .populate({
        path: 'userId',
        select: 'name email profileImage',
        match: search ? { 
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ] 
        } : {}
      })
      .populate('branchId', 'branchName address')
      .sort('-joinDate')
      .lean();

    // Filter out members where userId didn't match search (if search was provided)
    const filteredBranchMembers = search 
      ? branchMembers.filter(member => member.userId) 
      : branchMembers;

    // Map branch members to a consistent format
    const formattedBranchMembers = filteredBranchMembers.map(member => ({
      _id: member._id,
      userId: member.userId,
      status: member.status,
      joinDate: member.joinDate,
      type: 'branch',
      subscriptionId: member.subscriptionId,
      branch: member.branchId
    }));

    // Combine and sort all members by join date (most recent first)
    let allMembers = [...formattedGymMembers, ...formattedBranchMembers]
      .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));

    // Calculate total for pagination
    const total = allMembers.length;

    // Apply pagination to the combined results
    const paginatedMembers = allMembers.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      count: total,
      branches, // Include branches for filtering in frontend
      memberships: paginatedMembers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching gym members:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error fetching members' 
    });
  }
};

// @desc    Upload media for gym (photos/videos)
// @route   POST /api/gyms/:id/media/upload
// @access  Private (GymOwner - only their own gym)
export const uploadMedia = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);

    if (!gym) {
      return res.status(404).json({ 
        success: false, 
        message: 'Gym not found' 
      });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to upload media to this gym' 
      });
    }

    // Files are already uploaded to Cloudinary by the middleware
    if (!req.files && !req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files uploaded' 
      });
    }

    // Handle both single file and multiple files
    const files = req.files || [req.file];
    const type = req.query.type || req.body.type || 'photo';
    const isVideo = type === 'video';
    
    const uploadResults = [];
    
    // Process each file
    for (const file of files) {
      // Create media object from Cloudinary response
      let mediaObj = {
        url: file.path, // Cloudinary URL is in path
        public_id: file.filename, // Cloudinary public_id is in filename
        caption: req.body.caption || file.originalname || ''
      };
      
      // Save to appropriate array in gym document
      if (isVideo) {
        const newVideo = mediaObj;
        gym.videos.push(newVideo);
        uploadResults.push({
          ...newVideo,
          type: 'video'
        });
      } else {
        const newPhoto = mediaObj;
        gym.photos.push(newPhoto);
        uploadResults.push({
          ...newPhoto,
          type: 'photo'
        });
      }
    }

    await gym.save();

    res.status(200).json({ 
      success: true, 
      data: uploadResults
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error uploading media' 
    });
  }
};

// @desc    Activate a pending gym member
// @route   PATCH /api/gyms/members/:memberId/activate
// @access  Private (GymOwner)
export const activateMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    // Find the membership
    const membership = await GymMembership.findById(memberId);
    if (!membership) {
      return res.status(404).json({ 
        success: false, 
        message: "Membership not found" 
      });
    }

    // Get the associated gym
    const gym = await Gym.findById(membership.gymId);
    if (!gym) {
      return res.status(404).json({ 
        success: false, 
        message: "Gym not found" 
      });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to activate members for this gym" 
      });
    }

    // Check if already active
    if (membership.status === "active") {
      return res.status(400).json({ 
        success: false, 
        message: "Member is already active" 
      });
    }

    // Activate the membership
    membership.status = "active";
    await membership.save();

    // Update gym member count if needed
    if (membership.status === "pending") {
      gym.totalMembers = (gym.totalMembers || 0) + 1;
      await gym.save();
    }

    res.status(200).json({
      success: true,
      data: membership,
      message: "Member activated successfully"
    });
  } catch (error) {
    console.error('Error activating gym member:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error activating member' 
    });
  }
};

// @desc    Update a gym member's status
// @route   PATCH /api/gyms/members/:memberId/status
// @access  Private (GymOwner)
export const updateMemberStatus = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['active', 'inactive', 'pending', 'suspended'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status. Status must be active, inactive, pending, or suspended" 
      });
    }

    // Find the membership
    const membership = await GymMembership.findById(memberId);
    if (!membership) {
      return res.status(404).json({ 
        success: false, 
        message: "Membership not found" 
      });
    }

    // Get the associated gym
    const gym = await Gym.findById(membership.gymId);
    if (!gym) {
      return res.status(404).json({ 
        success: false, 
        message: "Gym not found" 
      });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to update members for this gym" 
      });
    }

    // Get the previous status to handle count updates
    const previousStatus = membership.status;

    // Update the membership status
    membership.status = status;
    await membership.save();

    // Update gym member count if needed
    if (previousStatus !== 'active' && status === 'active') {
      // Member became active, increment count
      gym.totalMembers = (gym.totalMembers || 0) + 1;
      await gym.save();
    } else if (previousStatus === 'active' && status !== 'active') {
      // Member became inactive, decrement count
      gym.totalMembers = Math.max(0, (gym.totalMembers || 1) - 1);
      await gym.save();
    }

    res.status(200).json({
      success: true,
      data: membership,
      message: `Member status updated to ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating gym member status:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error updating member status' 
    });
  }
}; 