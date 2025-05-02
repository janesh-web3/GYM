import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  age: {
    type: Number,
    required: [true, 'Age is required']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Gender is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: [true, 'Gym is required']
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User account is required']
  },
  premiumMembershipData: {
    memberQRCode: {
      type: String,
      default: null
    },
    lastVisitedGyms: [{
      gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym'
      },
      visitDate: {
        type: Date,
        default: Date.now
      }
    }],
    totalGymsVisited: {
      type: Number,
      default: 0
    }
  },
  BMI: {
    type: Number,
    default: null
  },
  goals: {
    type: String,
    trim: true,
    default: ''
  },
  progress: {
    type: String,
    trim: true,
    default: ''
  },
  progressMetrics: {
    weight: [{
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg'
      },
      date: {
        type: Date,
        default: Date.now
      }
    }],
    height: [{
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm'
      },
      date: {
        type: Date,
        default: Date.now
      }
    }],
    bodyFat: [{
      value: Number, // percentage
      date: {
        type: Date,
        default: Date.now
      }
    }],
    muscleMass: [{
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg'
      },
      date: {
        type: Date,
        default: Date.now
      }
    }],
    chestMeasurement: [{
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm'
      },
      date: {
        type: Date,
        default: Date.now
      }
    }],
    waistMeasurement: [{
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm'
      },
      date: {
        type: Date,
        default: Date.now
      }
    }],
    armMeasurement: [{
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm'
      },
      date: {
        type: Date,
        default: Date.now
      }
    }],
    legMeasurement: [{
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm'
      },
      date: {
        type: Date,
        default: Date.now
      }
    }]
  },
  joinedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
memberSchema.index({ name: 'text', email: 'text' });
memberSchema.index({ gymId: 1 });
memberSchema.index({ trainerId: 1 });

const Member = mongoose.model('Member', memberSchema);

export default Member; 