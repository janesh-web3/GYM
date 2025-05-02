import mongoose from 'mongoose';

const coinTransactionSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true
  },
  coins: {
    type: Number,
    required: true,
    default: 1
  },
  transactionType: {
    type: String,
    enum: ['purchase', 'usage'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  ipAddress: {
    type: String
  },
  deviceInfo: {
    type: String
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
coinTransactionSchema.index({ memberId: 1, date: -1 });
coinTransactionSchema.index({ gymId: 1, date: -1 });
coinTransactionSchema.index({ memberId: 1, gymId: 1, date: -1 });

// Static method to check if a member has already used a coin at a gym today
coinTransactionSchema.statics.hasUsedCoinToday = async function(memberId, gymId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  const count = await this.countDocuments({
    memberId,
    gymId,
    transactionType: 'usage',
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
  
  return count > 0;
};

const CoinTransaction = mongoose.model('CoinTransaction', coinTransactionSchema);

export default CoinTransaction; 