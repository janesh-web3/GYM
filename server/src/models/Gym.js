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
  phoneNumber: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  website: {
    type: String,
    trim: true
  },
  workingHours: {
    openTime: {
      type: String,
      default: '09:00'
    },
    closeTime: {
      type: String,
      default: '22:00'
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
  logo: {
    url: String,
    public_id: String
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
  coinBalance: {
    type: Number,
    default: 0
  },
  coinReceivedHistory: [{
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    coins: {
      type: Number,
      required: true,
      default: 1
    }
  }],
  isApproved: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'banned'],
    default: 'pending'
  },
  // New fields for subscriptions and statistics
  totalMembers: {
    type: Number,
    default: 0
  },
  totalSubscriptions: {
    type: Number,
    default: 0
  },
  activeSubscriptions: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for branches - fetches all branches associated with this gym
gymSchema.virtual('branches', {
  ref: 'Branch',
  localField: '_id',
  foreignField: 'gymId',
  options: { sort: { branchName: 1 } }
});

// Virtual for subscriptions - fetches all subscription plans for this gym
gymSchema.virtual('subscriptionPlans', {
  ref: 'SubscriptionPlan',
  localField: '_id',
  foreignField: 'gymId',
  match: { isActive: true }
});

// Add index for faster queries
gymSchema.index({ gymName: 'text', 'address.city': 'text' });

// Middleware to delete media from Cloudinary when gym is deleted
gymSchema.pre('remove', async function(next) {
  try {
    const { deleteMedia } = await import('../utils/cloudinary.js');
    
    // Delete logo if it exists
    if (this.logo && this.logo.public_id) {
      await deleteMedia(this.logo.public_id);
    }
    
    // Delete all photos
    for (const photo of this.photos) {
      if (photo.public_id) {
        await deleteMedia(photo.public_id);
      }
    }
    
    // Delete all videos
    for (const video of this.videos) {
      if (video.public_id) {
        await deleteMedia(video.public_id, true);
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

const Gym = mongoose.model('Gym', gymSchema);

export default Gym; 