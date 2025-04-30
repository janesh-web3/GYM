import mongoose from 'mongoose';

const gymSchema = new mongoose.Schema({
  gymName: {
    type: String,
    required: [true, 'Gym name is required'],
    trim: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    }
  },
  services: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    price: Number
  }],
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  photos: [{
    url: String,
    public_id: String,
    caption: String
  }],
  videos: [{
    url: String,
    public_id: String,
    caption: String
  }],
  isApproved: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'banned'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for faster queries
gymSchema.index({ gymName: 'text', 'address.city': 'text' });

// Middleware to delete media from Cloudinary when gym is deleted
gymSchema.pre('remove', async function(next) {
  try {
    const { deleteMedia } = await import('../utils/cloudinary.js');
    
    // Delete all photos
    for (const photo of this.photos) {
      if (photo.public_id) {
        await deleteMedia(photo.public_id);
      }
    }
    
    // Delete all videos
    for (const video of this.videos) {
      if (video.public_id) {
        await deleteMedia(video.public_id);
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

const Gym = mongoose.model('Gym', gymSchema);

export default Gym; 