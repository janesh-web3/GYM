import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver is required']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  media: {
    type: String,
    default: null
  },
  mediaType: {
    type: String,
    enum: [null, 'image', 'video', 'document'],
    default: null
  },
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    default: null
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
chatMessageSchema.index({ senderId: 1, receiverId: 1 });
chatMessageSchema.index({ receiverId: 1, read: 1 });
chatMessageSchema.index({ createdAt: -1 });
chatMessageSchema.index({ gymId: 1 });

// Virtual for checking if message is from the current user
chatMessageSchema.virtual('isFromUser').get(function(userId) {
  return this.senderId.toString() === userId.toString();
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage; 