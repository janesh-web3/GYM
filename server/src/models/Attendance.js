import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  role: {
    type: String,
    enum: ['Trainer', 'Member'],
    required: [true, 'Role is required']
  },
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: [true, 'Gym ID is required']
  },
  date: {
    type: Date,
    default: Date.now,
    required: [true, 'Date is required']
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in time is required']
  },
  checkOut: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'incomplete'],
    default: 'present'
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
attendanceSchema.index({ userId: 1 });
attendanceSchema.index({ gymId: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ role: 1 });

// Method to calculate duration when checking out
attendanceSchema.methods.calculateDuration = function() {
  if (this.checkIn && this.checkOut) {
    const checkInTime = new Date(this.checkIn).getTime();
    const checkOutTime = new Date(this.checkOut).getTime();
    this.duration = Math.round((checkOutTime - checkInTime) / (1000 * 60)); // Duration in minutes
  }
  return this.duration;
};

// Pre-save hook to set status based on check-in/check-out
attendanceSchema.pre('save', function(next) {
  if (this.checkIn && !this.checkOut) {
    this.status = 'incomplete';
  } else if (this.checkIn && this.checkOut) {
    this.calculateDuration();
    if (this.duration < 30) { // Less than 30 minutes is considered incomplete
      this.status = 'incomplete';
    }
  }
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance; 