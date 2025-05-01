import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  branchName: {
    type: String,
    required: [true, 'Branch name is required'],
    trim: true
  },
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true
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
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required']
  },
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  services: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    price: Number
  }],
  photos: [{
    url: String,
    public_id: String,
    caption: String
  }],
  trainers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for faster queries
branchSchema.index({ branchName: 'text', 'address.city': 'text' });

// Middleware to delete media from Cloudinary when branch is deleted
branchSchema.pre('remove', async function(next) {
  try {
    const { deleteMedia } = await import('../utils/cloudinary.js');
    
    // Delete all photos
    for (const photo of this.photos) {
      if (photo.public_id) {
        await deleteMedia(photo.public_id);
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

const Branch = mongoose.model('Branch', branchSchema);

export default Branch; 