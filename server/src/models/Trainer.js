import mongoose from 'mongoose';

const trainerSchema = new mongoose.Schema({
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
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User account is required']
  },
  gyms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym'
  }],
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  experience: {
    type: Number, // Years of experience
    default: 0
  },
  certifications: [{
    name: {
      type: String,
      required: true
    },
    issuedBy: String,
    year: Number
  }],
  availability: {
    type: String,
    default: 'Full-time'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  joinedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for assigned members
trainerSchema.virtual('assignedMembers', {
  ref: 'Member',
  localField: '_id',
  foreignField: 'trainerId',
  justOne: false
});

// Add indexes for faster queries
trainerSchema.index({ name: 'text', email: 'text', specialization: 'text' });
trainerSchema.index({ gyms: 1 });

const Trainer = mongoose.model('Trainer', trainerSchema);

export default Trainer; 