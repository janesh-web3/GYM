import Branch from '../models/Branch.js';
import Gym from '../models/Gym.js';
import { uploadMedia, deleteMedia } from '../utils/cloudinary.js';
import fs from 'fs';

// @desc    Create new branch
// @route   POST /api/branches
// @access  Private (GymOwner)
export const createBranch = async (req, res) => {
  try {
    // Find the gym owned by this user
    const gym = await Gym.findOne({ ownerId: req.user._id });
    
    if (!gym) {
      return res.status(404).json({ 
        success: false,
        message: 'No gym found for this user'
      });
    }

    const branchData = {
      branchName : req.body.branchName,
      gymId: gym._id,
      ownerId: req.user._id,
      address: {
        street: req.body.address.street,
        city: req.body.address.city,
        state: req.body.address.state,
        zipCode: req.body.address.zipCode,
        country: req.body.address.country
      },
      phoneNumber: req.body.contactNumber,
      email: req.body.email,
      openingHours : req.body.openingHours,
      description: req.body.description,
      services: req.body.services,
      status : req.body.status,
      photos: req.body.photos,
      trainers: req.body.trainers,
      members: req.body.members
    };
    console.log(branchData);
    // Create branch with the found gym's ID
    const branch = await Branch.create(branchData);

    res.status(201).json({
      success: true,
      data: branch
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get all branches for a gym
// @route   GET /api/branches
// @access  Private (GymOwner)
export const getBranches = async (req, res) => {
  try {
    // Find the gym owned by this user
    const gym = await Gym.findOne({ ownerId: req.user._id });
    
    if (!gym) {
      return res.status(404).json({ 
        success: false,
        message: 'No gym found for this user' 
      });
    }
    
    // Find all branches for this gym
    const branches = await Branch.find({ gymId: gym._id })
      .populate('gymId', 'gymName')
      .sort('-createdAt');

    res.json({
      success: true,
      count: branches.length,
      data: branches
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get single branch
// @route   GET /api/branches/:id
// @access  Private (GymOwner)
export const getBranch = async (req, res) => {
  try {
    // Find the gym owned by this user
    const gym = await Gym.findOne({ ownerId: req.user._id });
    
    if (!gym) {
      return res.status(404).json({ 
        success: false,
        message: 'No gym found for this user' 
      });
    }
    
    // Find the branch
    const branch = await Branch.findById(req.params.id)
      .populate('gymId', 'gymName');
    
    if (!branch) {
      return res.status(404).json({ 
        success: false,
        message: 'Branch not found' 
      });
    }
    
    // Ensure the branch belongs to the user's gym
    if (branch.gymId.toString() !== gym._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to access this branch' 
      });
    }
    
    res.json({
      success: true,
      data: branch
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Update branch
// @route   PUT /api/branches/:id
// @access  Private (GymOwner)
export const updateBranch = async (req, res) => {
  try {
    // Find the gym owned by this user
    const gym = await Gym.findOne({ ownerId: req.user._id });
    
    if (!gym) {
      return res.status(404).json({ 
        success: false,
        message: 'No gym found for this user' 
      });
    }
    
    const branch = await Branch.findById(req.params.id);
    
    if (!branch) {
      return res.status(404).json({ 
        success: false,
        message: 'Branch not found' 
      });
    }
    
    // Ensure the branch belongs to the user's gym
    if (branch.gymId.toString() !== gym._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this branch' 
      });
    }
    
    // Ensure specific fields are properly handled
    const updateData = { ...req.body };
    
    // Don't allow changing the gymId
    delete updateData.gymId;
    delete updateData.ownerId;
    
    // Update the branch
    const updatedBranch = await Branch.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: updatedBranch
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Delete branch
// @route   DELETE /api/branches/:id
// @access  Private (GymOwner)
export const deleteBranch = async (req, res) => {
  try {
    // Find the gym owned by this user
    const gym = await Gym.findOne({ ownerId: req.user._id });
    
    if (!gym) {
      return res.status(404).json({ 
        success: false,
        message: 'No gym found for this user' 
      });
    }
    
    const branch = await Branch.findById(req.params.id);
    
    if (!branch) {
      return res.status(404).json({ 
        success: false,
        message: 'Branch not found' 
      });
    }
    
    // Ensure the branch belongs to the user's gym
    if (branch.gymId.toString() !== gym._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this branch' 
      });
    }
    
    await branch.remove();
    
    res.json({ 
      success: true,
      data: {},
      message: 'Branch removed' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Upload branch logo
// @route   POST /api/branches/:id/logo
// @access  Private (GymOwner)
export const uploadBranchLogo = async (req, res) => {
  try {
    // Find the gym owned by this user
    const gym = await Gym.findOne({ ownerId: req.user._id });
    
    if (!gym) {
      return res.status(404).json({ 
        success: false,
        message: 'No gym found for this user' 
      });
    }
    
    const branch = await Branch.findById(req.params.id);
    
    if (!branch) {
      return res.status(404).json({ 
        success: false,
        message: 'Branch not found' 
      });
    }
    
    // Ensure the branch belongs to the user's gym
    if (branch.gymId.toString() !== gym._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this branch' 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }
    
    // If branch already has a logo, delete the old one from Cloudinary
    if (branch.logo && branch.logo.public_id) {
      await deleteMedia(branch.logo.public_id);
    }
    
    // Upload the new logo to Cloudinary
    const result = await uploadMedia(req.file.path, 'branch-logos');
    
    // Update the branch with the new logo
    branch.logo = {
      url: result.url,
      public_id: result.public_id
    };
    
    await branch.save();
    
    // Remove the temporary file if it exists
    if (req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    
    res.json({ 
      success: true, 
      data: { 
        logo: branch.logo 
      } 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Upload branch media (photo/video)
// @route   POST /api/branches/:id/media/upload
// @access  Private (GymOwner)
export const uploadBranchMedia = async (req, res) => {
  try {
    // Find the gym owned by this user
    const gym = await Gym.findOne({ ownerId: req.user._id });
    
    if (!gym) {
      return res.status(404).json({ 
        success: false,
        message: 'No gym found for this user' 
      });
    }
    
    const branch = await Branch.findById(req.params.id);
    
    if (!branch) {
      return res.status(404).json({ 
        success: false,
        message: 'Branch not found' 
      });
    }
    
    // Ensure the branch belongs to the user's gym
    if (branch.gymId.toString() !== gym._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this branch' 
      });
    }
    
    // Files are already uploaded to Cloudinary by the middleware
    // and available as req.file or req.files
    if (!req.files && !req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files uploaded' 
      });
    }
    
    // Handle both single file and multiple files
    const files = req.files || [req.file];
    const type = req.body.type || req.fileType || 'photo';
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
      
      // Save to appropriate array in branch document
      if (type === 'logo') {
        // If branch already has a logo, delete the old one if we have the public_id
        if (branch.logo && branch.logo.public_id) {
          try {
            await deleteMedia(branch.logo.public_id);
          } catch (err) {
            console.error('Error deleting old logo:', err);
            // Continue even if delete fails
          }
        }
        
        branch.logo = mediaObj;
        uploadResults.push({
          ...mediaObj,
          type: 'logo'
        });
      } else if (isVideo) {
        const newVideo = mediaObj;
        branch.videos.push(newVideo);
        uploadResults.push({
          ...newVideo,
          type: 'video'
        });
      } else {
        const newPhoto = mediaObj;
        branch.photos.push(newPhoto);
        uploadResults.push({
          ...newPhoto,
          type: 'photo'
        });
      }
    }
    
    await branch.save();
    
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

// @desc    Delete branch media
// @route   DELETE /api/branches/:id/media/:mediaId
// @access  Private (GymOwner)
export const deleteBranchMedia = async (req, res) => {
  try {
    // Find the gym owned by this user
    const gym = await Gym.findOne({ ownerId: req.user._id });
    
    if (!gym) {
      return res.status(404).json({ 
        success: false,
        message: 'No gym found for this user' 
      });
    }
    
    const branch = await Branch.findById(req.params.id);
    
    if (!branch) {
      return res.status(404).json({ 
        success: false,
        message: 'Branch not found' 
      });
    }
    
    // Ensure the branch belongs to the user's gym
    if (branch.gymId.toString() !== gym._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this branch' 
      });
    }
    
    const mediaId = req.params.mediaId;
    let media = branch.photos.find(p => p._id.toString() === mediaId) ||
                branch.videos.find(v => v._id.toString() === mediaId);
    
    if (!media) {
      return res.status(404).json({ 
        success: false,
        message: 'Media not found' 
      });
    }
    
    // Delete from Cloudinary
    await deleteMedia(media.public_id, media.url.includes('video'));
    
    // Remove from branch document
    branch.photos = branch.photos.filter(p => p._id.toString() !== mediaId);
    branch.videos = branch.videos.filter(v => v._id.toString() !== mediaId);
    
    await branch.save();
    
    res.json({ 
      success: true,
      message: 'Media deleted successfully' 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Upload a photo for a branch
// @route   POST /api/branches/:id/photos
// @access  Private (GymOwner)
export const uploadPhoto = async (req, res) => {
  try {
    // Find the gym owned by this user
    const gym = await Gym.findOne({ ownerId: req.user._id });
    
    if (!gym) {
      return res.status(404).json({ 
        success: false,
        message: 'No gym found for this user' 
      });
    }
    
    const branch = await Branch.findById(req.params.id);
    
    if (!branch) {
      return res.status(404).json({ 
        success: false,
        message: 'Branch not found' 
      });
    }
    
    // Ensure the branch belongs to the user's gym
    if (branch.gymId.toString() !== gym._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this branch' 
      });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No files uploaded' 
      });
    }
    
    const uploadedPhotos = [];
    
    // Process each uploaded photo
    for (const file of req.files) {
      // Upload to Cloudinary
      const result = await uploadMedia(file.path, 'branch-photos');
      
      // Add to branch photos
      const photo = {
        url: result.url,
        public_id: result.public_id,
        caption: req.body.caption || ''
      };
      
      branch.photos.push(photo);
      uploadedPhotos.push(photo);
      
      // Remove temporary file
      fs.unlinkSync(file.path);
    }
    
    // Save the branch with new photos
    await branch.save();
    
    res.status(201).json({
      success: true,
      data: uploadedPhotos
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Delete a photo from a branch
// @route   DELETE /api/branches/:id/photos/:photoId
// @access  Private (GymOwner)
export const deletePhoto = async (req, res) => {
  try {
    // Find the gym owned by this user
    const gym = await Gym.findOne({ ownerId: req.user._id });
    
    if (!gym) {
      return res.status(404).json({ 
        success: false,
        message: 'No gym found for this user' 
      });
    }
    
    const branch = await Branch.findById(req.params.id);
    
    if (!branch) {
      return res.status(404).json({ 
        success: false,
        message: 'Branch not found' 
      });
    }
    
    // Ensure the branch belongs to the user's gym
    if (branch.gymId.toString() !== gym._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this branch' 
      });
    }
    
    // Find the photo by ID
    const photoIndex = branch.photos.findIndex(
      (photo) => photo._id.toString() === req.params.photoId
    );
    
    if (photoIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: 'Photo not found' 
      });
    }
    
    // Get the photo to delete
    const photoToDelete = branch.photos[photoIndex];
    
    // Delete from Cloudinary
    await deleteMedia(photoToDelete.public_id);
    
    // Remove from branch document
    branch.photos.splice(photoIndex, 1);
    await branch.save();
    
    res.json({ 
      success: true,
      message: 'Photo deleted successfully' 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Add a member to a branch
// @route   POST /api/branches/:id/members
// @access  Private (GymOwner)
export const addMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    
    if (!memberId) {
      return res.status(400).json({ 
        success: false,
        message: 'Member ID is required' 
      });
    }
    
    // Find the gym owned by this user
    const gym = await Gym.findOne({ ownerId: req.user._id });
    
    if (!gym) {
      return res.status(404).json({ 
        success: false,
        message: 'No gym found for this user' 
      });
    }
    
    const branch = await Branch.findById(req.params.id);
    
    if (!branch) {
      return res.status(404).json({ 
        success: false,
        message: 'Branch not found' 
      });
    }
    
    // Ensure the branch belongs to the user's gym
    if (branch.gymId.toString() !== gym._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this branch' 
      });
    }
    
    // Check if member is already in this branch
    if (branch.members.includes(memberId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Member is already assigned to this branch' 
      });
    }
    
    // Add member to branch
    branch.members.push(memberId);
    await branch.save();
    
    res.status(200).json({
      success: true,
      message: 'Member added to branch successfully',
      data: branch.members
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Remove a member from a branch
// @route   DELETE /api/branches/:id/members/:memberId
// @access  Private (GymOwner)
export const removeMember = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    
    if (!branch) {
      return res.status(404).json({ 
        success: false,
        message: 'Branch not found' 
      });
    }
    
    // Check authorization
    const gym = await Gym.findById(branch.gymId);
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this branch' 
      });
    }
    
    // Check if member is in this branch
    const memberIndex = branch.members.indexOf(req.params.memberId);
    if (memberIndex === -1) {
      return res.status(400).json({ 
        success: false,
        message: 'Member is not assigned to this branch' 
      });
    }
    
    // Remove member from branch
    branch.members.splice(memberIndex, 1);
    await branch.save();
    
    res.status(200).json({
      success: true,
      message: 'Member removed from branch successfully',
      data: branch.members
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Reassign a member to another branch
// @route   PUT /api/branches/:id/members/:memberId/reassign
// @access  Private (GymOwner)
export const reassignMember = async (req, res) => {
  try {
    const { targetBranchId } = req.body;
    
    if (!targetBranchId) {
      return res.status(400).json({ 
        success: false,
        message: 'Target branch ID is required' 
      });
    }
    
    // Get source branch
    const sourceBranch = await Branch.findById(req.params.id);
    if (!sourceBranch) {
      return res.status(404).json({ 
        success: false,
        message: 'Source branch not found' 
      });
    }
    
    // Get target branch
    const targetBranch = await Branch.findById(targetBranchId);
    if (!targetBranch) {
      return res.status(404).json({ 
        success: false,
        message: 'Target branch not found' 
      });
    }
    
    // Check authorization for both branches
    const sourceGym = await Gym.findById(sourceBranch.gymId);
    const targetGym = await Gym.findById(targetBranch.gymId);
    
    if (sourceGym.ownerId.toString() !== req.user._id.toString() ||
        targetGym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update these branches' 
      });
    }
    
    const memberId = req.params.memberId;
    
    // Check if member is in source branch
    const memberIndexInSource = sourceBranch.members.indexOf(memberId);
    if (memberIndexInSource === -1) {
      return res.status(400).json({ 
        success: false,
        message: 'Member is not assigned to the source branch' 
      });
    }
    
    // Check if member is already in target branch
    if (targetBranch.members.includes(memberId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Member is already assigned to the target branch' 
      });
    }
    
    // Remove from source branch
    sourceBranch.members.splice(memberIndexInSource, 1);
    await sourceBranch.save();
    
    // Add to target branch
    targetBranch.members.push(memberId);
    await targetBranch.save();
    
    res.status(200).json({
      success: true,
      message: 'Member reassigned successfully'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Add a trainer to a branch
// @route   POST /api/branches/:id/trainers
// @access  Private (GymOwner)
export const addTrainer = async (req, res) => {
  try {
    const { trainerId } = req.body;
    
    if (!trainerId) {
      return res.status(400).json({ 
        success: false,
        message: 'Trainer ID is required' 
      });
    }
    
    const branch = await Branch.findById(req.params.id);
    
    if (!branch) {
      return res.status(404).json({ 
        success: false,
        message: 'Branch not found' 
      });
    }
    
    // Check authorization
    const gym = await Gym.findById(branch.gymId);
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this branch' 
      });
    }
    
    // Check if trainer is already in this branch
    if (branch.trainers.includes(trainerId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Trainer is already assigned to this branch' 
      });
    }
    
    // Add trainer to branch
    branch.trainers.push(trainerId);
    await branch.save();
    
    res.status(200).json({
      success: true,
      message: 'Trainer added to branch successfully',
      data: branch.trainers
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Remove a trainer from a branch
// @route   DELETE /api/branches/:id/trainers/:trainerId
// @access  Private (GymOwner)
export const removeTrainer = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    
    if (!branch) {
      return res.status(404).json({ 
        success: false,
        message: 'Branch not found' 
      });
    }
    
    // Check authorization
    const gym = await Gym.findById(branch.gymId);
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this branch' 
      });
    }
    
    // Check if trainer is in this branch
    const trainerIndex = branch.trainers.indexOf(req.params.trainerId);
    if (trainerIndex === -1) {
      return res.status(400).json({ 
        success: false,
        message: 'Trainer is not assigned to this branch' 
      });
    }
    
    // Remove trainer from branch
    branch.trainers.splice(trainerIndex, 1);
    await branch.save();
    
    res.status(200).json({
      success: true,
      message: 'Trainer removed from branch successfully',
      data: branch.trainers
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
}; 