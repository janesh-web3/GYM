import Branch from '../models/Branch.js';
import User from '../models/User.js';
import { uploadMedia, deleteMedia } from '../utils/cloudinary.js';

// @desc    Create new branch
// @route   POST /api/branches
// @access  Private (GymOwner)
export const createBranch = async (req, res) => {
  try {
    const branch = await Branch.create({
      ...req.body,
      ownerId: req.user._id
    });

    res.status(201).json(branch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all branches for a gym owner
// @route   GET /api/branches
// @access  Private (GymOwner)
export const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ ownerId: req.user._id })
      .sort('-createdAt');

    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single branch
// @route   GET /api/branches/:id
// @access  Private (GymOwner)
export const getBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id)
      .populate('trainers', 'name email')
      .populate('members', 'name email');

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Check ownership
    if (branch.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this branch' });
    }

    res.json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update branch
// @route   PUT /api/branches/:id
// @access  Private (GymOwner)
export const updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Check ownership
    if (branch.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this branch' });
    }

    const updatedBranch = await Branch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedBranch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete branch
// @route   DELETE /api/branches/:id
// @access  Private (GymOwner)
export const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Check ownership
    if (branch.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this branch' });
    }

    await branch.remove();
    res.json({ message: 'Branch removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload branch photo
// @route   POST /api/branches/:id/photos
// @access  Private (GymOwner)
export const uploadPhoto = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Check ownership
    if (branch.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this branch' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const result = await uploadMedia(file, 'branch-photos');
      return {
        url: result.url,
        public_id: result.public_id,
        caption: req.body.caption || ''
      };
    });

    const uploadedPhotos = await Promise.all(uploadPromises);
    branch.photos.push(...uploadedPhotos);
    await branch.save();

    res.json(branch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete branch photo
// @route   DELETE /api/branches/:id/photos/:photoId
// @access  Private (GymOwner)
export const deletePhoto = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Check ownership
    if (branch.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this branch' });
    }

    const photoId = req.params.photoId;
    const photo = branch.photos.find(p => p._id.toString() === photoId);

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Delete from Cloudinary
    await deleteMedia(photo.public_id);

    // Remove from branch document
    branch.photos = branch.photos.filter(p => p._id.toString() !== photoId);
    await branch.save();

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add member to branch
// @route   POST /api/branches/:id/members
// @access  Private (GymOwner)
export const addMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Check ownership
    if (branch.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this branch' });
    }

    // Check if member exists
    const member = await User.findById(memberId);
    if (!member || member.role !== 'member') {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Check if member is already in the branch
    if (branch.members.includes(memberId)) {
      return res.status(400).json({ message: 'Member already added to this branch' });
    }

    branch.members.push(memberId);
    await branch.save();

    res.json(branch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove member from branch
// @route   DELETE /api/branches/:id/members/:memberId
// @access  Private (GymOwner)
export const removeMember = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Check ownership
    if (branch.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this branch' });
    }

    const memberId = req.params.memberId;

    // Check if member is in the branch
    if (!branch.members.includes(memberId)) {
      return res.status(400).json({ message: 'Member not found in this branch' });
    }

    branch.members = branch.members.filter(m => m.toString() !== memberId);
    await branch.save();

    res.json({ message: 'Member removed from branch successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add trainer to branch
// @route   POST /api/branches/:id/trainers
// @access  Private (GymOwner)
export const addTrainer = async (req, res) => {
  try {
    const { trainerId } = req.body;
    
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Check ownership
    if (branch.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this branch' });
    }

    // Check if trainer exists
    const trainer = await User.findById(trainerId);
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    // Check if trainer is already in the branch
    if (branch.trainers.includes(trainerId)) {
      return res.status(400).json({ message: 'Trainer already added to this branch' });
    }

    branch.trainers.push(trainerId);
    await branch.save();

    res.json(branch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove trainer from branch
// @route   DELETE /api/branches/:id/trainers/:trainerId
// @access  Private (GymOwner)
export const removeTrainer = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Check ownership
    if (branch.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this branch' });
    }

    const trainerId = req.params.trainerId;

    // Check if trainer is in the branch
    if (!branch.trainers.includes(trainerId)) {
      return res.status(400).json({ message: 'Trainer not found in this branch' });
    }

    branch.trainers = branch.trainers.filter(t => t.toString() !== trainerId);
    await branch.save();

    res.json({ message: 'Trainer removed from branch successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Reassign member to another branch
// @route   PUT /api/branches/:id/members/:memberId/reassign
// @access  Private (GymOwner)
export const reassignMember = async (req, res) => {
  try {
    const { targetBranchId } = req.body;
    const { id: currentBranchId, memberId } = req.params;
    
    // Check if current branch exists
    const currentBranch = await Branch.findById(currentBranchId);
    if (!currentBranch) {
      return res.status(404).json({ message: 'Current branch not found' });
    }

    // Check if target branch exists
    const targetBranch = await Branch.findById(targetBranchId);
    if (!targetBranch) {
      return res.status(404).json({ message: 'Target branch not found' });
    }

    // Check ownership of both branches
    if (currentBranch.ownerId.toString() !== req.user._id.toString() || 
        targetBranch.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to manage these branches' });
    }

    // Check if member is in the current branch
    if (!currentBranch.members.includes(memberId)) {
      return res.status(400).json({ message: 'Member not found in current branch' });
    }

    // Check if member is already in the target branch
    if (targetBranch.members.includes(memberId)) {
      return res.status(400).json({ message: 'Member already exists in target branch' });
    }

    // Remove member from current branch
    currentBranch.members = currentBranch.members.filter(m => m.toString() !== memberId);
    await currentBranch.save();

    // Add member to target branch
    targetBranch.members.push(memberId);
    await targetBranch.save();

    res.json({ message: 'Member reassigned successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 