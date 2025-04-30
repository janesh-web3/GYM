import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'chat', 'system'],
    default: 'info'
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Gym', 'Member', 'Trainer', 'Session', 'WorkoutPlan', 'DietPlan', 'Order', 'Product', 'Chat', 'User'],
      default: null
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  link: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
notificationSchema.index({ recipientId: 1 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 