import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Session title is required'],
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
    required: [true, 'Trainer is required']
  },
  memberIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  }],
  date: {
    type: Date,
    required: [true, 'Session date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  capacity: {
    type: Number,
    default: 10
  },
  sessionType: {
    type: String,
    enum: ['group', 'individual', 'workshop'],
    default: 'group'
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  recurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', ''],
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
sessionSchema.index({ gymId: 1, date: 1 });
sessionSchema.index({ trainerId: 1, date: 1 });
sessionSchema.index({ memberIds: 1 });

// Custom validator to ensure end time is after start time
sessionSchema.pre('validate', function(next) {
  if (this.startTime && this.endTime) {
    const startHour = parseInt(this.startTime.split(':')[0]);
    const startMinute = parseInt(this.startTime.split(':')[1]);
    const endHour = parseInt(this.endTime.split(':')[0]);
    const endMinute = parseInt(this.endTime.split(':')[1]);
    
    if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
      this.invalidate('endTime', 'End time must be after start time');
    }
  }
  next();
});

const Session = mongoose.model('Session', sessionSchema);

export default Session; 