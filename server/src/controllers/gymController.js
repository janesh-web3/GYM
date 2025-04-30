import Gym from '../models/Gym.js';
import { uploadMedia, deleteMedia } from '../utils/cloudinary.js';

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