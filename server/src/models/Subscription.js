import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Plan description is required']
  },
  price: {
    type: Number,
    required: [true, 'Plan price is required'],
    min: [0, 'Price cannot be negative']
  },
  duration: {
    value: {
      type: Number,
      required: [true, 'Duration value is required'],
      min: [1, 'Duration must be at least 1']
    },
    unit: {
      type: String,
      enum: ['day', 'week', 'month', 'year'],
      default: 'month'
    }
  },
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
    // Not required - can be null for gym-wide subscriptions
  },
  features: [{
    type: String,
    trim: true
  }],
  services: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    included: {
      type: Boolean,
      default: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  maxMembers: {
    type: Number,
    default: 0 // 0 means unlimited
  },
  currentMembers: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for querying
subscriptionPlanSchema.index({ gymId: 1, branchId: 1 });
subscriptionPlanSchema.index({ price: 1 });

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

// Schema for user subscriptions (instances of subscription plans)
const userSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true
  },
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
    // Optional - only if subscription is branch-specific
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  paymentMethod: {
    type: String
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for querying
userSubscriptionSchema.index({ userId: 1 });
userSubscriptionSchema.index({ gymId: 1, branchId: 1 });
userSubscriptionSchema.index({ status: 1 });
userSubscriptionSchema.index({ endDate: 1 });

// Virtual for checking if subscription is active
userSubscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && this.endDate > new Date();
});

// Virtual for checking if subscription is about to expire (within 7 days)
userSubscriptionSchema.virtual('isExpiringSoon').get(function() {
  if (this.status !== 'active') return false;
  
  const now = new Date();
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(now.getDate() + 7);
  
  return this.endDate <= sevenDaysFromNow && this.endDate > now;
});

const UserSubscription = mongoose.model('UserSubscription', userSubscriptionSchema);

export { SubscriptionPlan, UserSubscription }; 