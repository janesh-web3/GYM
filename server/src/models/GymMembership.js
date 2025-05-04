import mongoose from 'mongoose';

const gymMembershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true
  },
  joinedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Compound index to ensure uniqueness of user-gym pairs
gymMembershipSchema.index({ userId: 1, gymId: 1 }, { unique: true });

const GymMembership = mongoose.model('GymMembership', gymMembershipSchema);

export default GymMembership; 