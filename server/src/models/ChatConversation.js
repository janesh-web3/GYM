import mongoose from 'mongoose';

const chatConversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    content: {
      type: String,
      default: ''
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
chatConversationSchema.index({ participants: 1 });
chatConversationSchema.index({ 'lastMessage.timestamp': -1 });
chatConversationSchema.index({ gymId: 1 });

// Add method to check if a user is a participant in the conversation
chatConversationSchema.methods.hasParticipant = function(userId) {
  return this.participants.some(id => id.toString() === userId.toString());
};

// Add method to get the other participant in a 1-on-1 conversation
chatConversationSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(id => id.toString() !== userId.toString());
};

// Add method to update unread count
chatConversationSchema.methods.updateUnreadCount = function(userId, increment = true) {
  const stringId = userId.toString();
  const currentCount = this.unreadCount.get(stringId) || 0;
  
  if (increment) {
    this.unreadCount.set(stringId, currentCount + 1);
  } else {
    this.unreadCount.set(stringId, 0);
  }
  
  return this;
};

const ChatConversation = mongoose.model('ChatConversation', chatConversationSchema);

export default ChatConversation; 