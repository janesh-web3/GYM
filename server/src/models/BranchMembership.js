import mongoose from 'mongoose';

const branchMembershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSubscription'
    // Optional - only if joined through a subscription
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastCheckIn: {
    type: Date
  },
  totalCheckIns: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Add indexes for querying
branchMembershipSchema.index({ userId: 1, branchId: 1 }, { unique: true });
branchMembershipSchema.index({ branchId: 1 });
branchMembershipSchema.index({ gymId: 1 });
branchMembershipSchema.index({ status: 1 });

// Method to check in a member
branchMembershipSchema.methods.checkIn = async function() {
  this.lastCheckIn = new Date();
  this.totalCheckIns += 1;
  return this.save();
};

const BranchMembership = mongoose.model('BranchMembership', branchMembershipSchema);

export default BranchMembership; 