import Gym from '../models/Gym.js';
import { uploadMedia, deleteMedia } from '../utils/cloudinary.js';
import fs from 'fs';

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
      .populate('ownerId', 'name email');

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
      const result = await uploadMedia(file, 'photos');
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
      const result = await uploadMedia(file, 'videos');
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

// @desc    Delete gym media
// @route   DELETE /api/gyms/:id/media/:mediaId
// @access  Private (GymOwner - only their own gym)
export const deleteGymMedia = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);

    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this gym' });
    }

    const mediaId = req.params.mediaId;
    let media = gym.photos.find(p => p._id.toString() === mediaId) ||
                gym.videos.find(v => v._id.toString() === mediaId);

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Delete from Cloudinary
    await deleteMedia(media.public_id);

    // Remove from gym document
    gym.photos = gym.photos.filter(p => p._id.toString() !== mediaId);
    gym.videos = gym.videos.filter(v => v._id.toString() !== mediaId);
    await gym.save();

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
      await deleteMedia(gym.logo.public_id);
    }

    // Upload the new logo to Cloudinary
    const result = await uploadMedia(req.file.path, 'gym-logos');

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

// @desc    Upload media for gym (photos/videos)
// @route   POST /api/gyms/:id/media/upload
// @access  Private (GymOwner - only their own gym)
export const uploadGymMedia = async (req, res) => {
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
        message: 'Not authorized to update this gym' 
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
      
      // Save to appropriate array in gym document
      if (type === 'logo') {
        // If gym already has a logo, delete the old one if we have the public_id
        if (gym.logo && gym.logo.public_id) {
          try {
            await deleteMedia(gym.logo.public_id);
          } catch (err) {
            console.error('Error deleting old logo:', err);
            // Continue even if delete fails
          }
        }
        
        gym.logo = mediaObj;
        uploadResults.push({
          ...mediaObj,
          type: 'logo'
        });
      } else if (isVideo) {
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