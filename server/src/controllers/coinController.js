import User from '../models/User.js';
import Gym from '../models/Gym.js';
import Member from '../models/Member.js';
import CoinTransaction from '../models/CoinTransaction.js';
import QRCode from 'qrcode';
import { asyncHandler } from '../middleware/asyncHandler.js';

// Generate QR code for a member
const generateMemberQR = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  
  // Find member
  const member = await Member.findById(memberId);
  if (!member) {
    return res.status(404).json({ success: false, message: 'Member not found' });
  }
  
  // Create QR code data
  const qrData = JSON.stringify({
    memberId: member._id,
    type: 'member'
  });
  
  // Generate QR code
  const qrCodeDataURL = await QRCode.toDataURL(qrData);
  
  // Save QR code to member
  member.premiumMembershipData.memberQRCode = qrCodeDataURL;
  await member.save();
  
  return res.status(200).json({
    success: true,
    qrCode: qrCodeDataURL
  });
});

// Generate QR code for a gym
const generateGymQR = asyncHandler(async (req, res) => {
  const { gymId } = req.params;
  
  // Find gym
  const gym = await Gym.findById(gymId);
  if (!gym) {
    return res.status(404).json({ success: false, message: 'Gym not found' });
  }
  
  // Create QR code data
  const qrData = JSON.stringify({
    gymId: gym._id,
    type: 'gym'
  });
  
  // Generate QR code
  const qrCodeDataURL = await QRCode.toDataURL(qrData);
  
  return res.status(200).json({
    success: true,
    qrCode: qrCodeDataURL
  });
});

// Purchase coins
const purchaseCoins = asyncHandler(async (req, res) => {
  const { userId, coins, amount } = req.body;
  
  // Validate request
  if (!userId || !coins || !amount) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  // Find user
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  // Verify user is premium
  if (user.subscriptionType !== 'premium') {
    return res.status(403).json({ 
      success: false, 
      message: 'Only premium members can purchase coins'
    });
  }
  
  // Update user coin balance
  user.coinBalance += parseInt(coins);
  
  // Add purchase to history
  user.coinPurchaseHistory.push({
    coins: parseInt(coins),
    amount: parseFloat(amount),
    date: Date.now()
  });
  
  await user.save();
  
  // Create transaction record
  await CoinTransaction.create({
    memberId: userId,
    gymId: null,
    coins: parseInt(coins),
    transactionType: 'purchase',
    ipAddress: req.ip,
    deviceInfo: req.headers['user-agent']
  });
  
  return res.status(200).json({
    success: true,
    message: `Successfully purchased ${coins} coins`,
    coinBalance: user.coinBalance
  });
});

// Use coin at gym (when member scans gym QR)
const useCoin = asyncHandler(async (req, res) => {
  const { memberId, gymId } = req.body;
  
  // Validate request
  if (!memberId || !gymId) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  // Find user and gym
  const user = await User.findById(memberId);
  const gym = await Gym.findById(gymId);
  const member = await Member.findOne({ userId: memberId });
  
  if (!user || !gym || !member) {
    return res.status(404).json({ 
      success: false, 
      message: 'User, gym, or member not found'
    });
  }
  
  // Verify user is premium
  if (user.subscriptionType !== 'premium') {
    return res.status(403).json({ 
      success: false, 
      message: 'Only premium members can use coins'
    });
  }
  
  // Check if user has sufficient coins
  if (user.coinBalance < 1) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient coin balance'
    });
  }
  
  // Check if user has already used a coin at this gym today
  const hasUsedCoinToday = await CoinTransaction.hasUsedCoinToday(memberId, gymId);
  
  if (hasUsedCoinToday) {
    return res.status(400).json({
      success: false,
      message: 'You have already used a coin at this gym today'
    });
  }
  
  // Update user coin balance
  user.coinBalance -= 1;
  await user.save();
  
  // Update gym coin balance
  gym.coinBalance += 1;
  
  // Add to gym coin history
  gym.coinReceivedHistory.push({
    memberId,
    coins: 1,
    date: Date.now()
  });
  
  await gym.save();
  
  // Update member's visited gyms
  member.premiumMembershipData.lastVisitedGyms.unshift({
    gymId,
    visitDate: Date.now()
  });
  
  // Make sure we keep only the last 10 visits
  if (member.premiumMembershipData.lastVisitedGyms.length > 10) {
    member.premiumMembershipData.lastVisitedGyms = member.premiumMembershipData.lastVisitedGyms.slice(0, 10);
  }
  
  // Increment total gyms visited if this is a new gym
  const uniqueGyms = new Set(member.premiumMembershipData.lastVisitedGyms.map(visit => visit.gymId.toString()));
  member.premiumMembershipData.totalGymsVisited = uniqueGyms.size;
  
  await member.save();
  
  // Create transaction record
  await CoinTransaction.create({
    memberId,
    gymId,
    coins: 1,
    transactionType: 'usage',
    ipAddress: req.ip,
    deviceInfo: req.headers['user-agent']
  });
  
  return res.status(200).json({
    success: true,
    message: 'Successfully used 1 coin',
    coinBalance: user.coinBalance
  });
});

// Get user coin history
const getUserCoinHistory = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const transactions = await CoinTransaction.find({ memberId: userId })
    .sort({ date: -1 })
    .populate('gymId', 'gymName address')
    .select('gymId coins transactionType date status');
  
  const user = await User.findById(userId)
    .select('coinBalance coinPurchaseHistory');
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  return res.status(200).json({
    success: true,
    coinBalance: user.coinBalance,
    purchaseHistory: user.coinPurchaseHistory,
    transactions
  });
});

// Get gym coin history
const getGymCoinHistory = asyncHandler(async (req, res) => {
  const { gymId } = req.params;
  
  const transactions = await CoinTransaction.find({ 
    gymId, 
    transactionType: 'usage' 
  })
    .sort({ date: -1 })
    .populate('memberId', 'name email')
    .select('memberId coins date');
  
  const gym = await Gym.findById(gymId)
    .select('coinBalance coinReceivedHistory');
  
  if (!gym) {
    return res.status(404).json({ success: false, message: 'Gym not found' });
  }
  
  // Calculate monthly totals
  const monthlyTotals = {};
  gym.coinReceivedHistory.forEach(record => {
    const date = new Date(record.date);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyTotals[yearMonth]) {
      monthlyTotals[yearMonth] = 0;
    }
    
    monthlyTotals[yearMonth] += record.coins;
  });
  
  return res.status(200).json({
    success: true,
    coinBalance: gym.coinBalance,
    transactions,
    monthlyTotals
  });
});

// Get admin dashboard coin data
const getAdminCoinData = asyncHandler(async (req, res) => {
  // Get all gyms with coin balances
  const gyms = await Gym.find()
    .select('gymName coinBalance coinReceivedHistory')
    .sort({ coinBalance: -1 });
  
  // Calculate total coins in circulation
  const users = await User.find()
    .select('coinBalance');
  
  const totalCoinsCirculating = users.reduce((total, user) => total + user.coinBalance, 0);
  
  // Calculate total coins held by gyms
  const totalCoinsHeldByGyms = gyms.reduce((total, gym) => total + gym.coinBalance, 0);
  
  // Calculate monthly distribution per gym
  const gymMonthlyStats = {};
  
  for (const gym of gyms) {
    gymMonthlyStats[gym._id] = {};
    
    gym.coinReceivedHistory.forEach(record => {
      const date = new Date(record.date);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!gymMonthlyStats[gym._id][yearMonth]) {
        gymMonthlyStats[gym._id][yearMonth] = 0;
      }
      
      gymMonthlyStats[gym._id][yearMonth] += record.coins;
    });
  }
  
  return res.status(200).json({
    success: true,
    totalCoinsCirculating,
    totalCoinsHeldByGyms,
    gyms: gyms.map(gym => ({
      _id: gym._id,
      gymName: gym.gymName,
      coinBalance: gym.coinBalance,
      monthlyStats: gymMonthlyStats[gym._id]
    }))
  });
});

// Simulate payout to a gym
const simulateGymPayout = asyncHandler(async (req, res) => {
  const { gymId, amount, coins } = req.body;
  
  if (!gymId || !amount || !coins) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  const gym = await Gym.findById(gymId);
  
  if (!gym) {
    return res.status(404).json({ success: false, message: 'Gym not found' });
  }
  
  if (gym.coinBalance < coins) {
    return res.status(400).json({ 
      success: false, 
      message: `Gym only has ${gym.coinBalance} coins, but trying to pay out ${coins} coins` 
    });
  }
  
  // Update gym coin balance
  gym.coinBalance -= coins;
  await gym.save();
  
  return res.status(200).json({
    success: true,
    message: `Successfully simulated payout of ${amount} for ${coins} coins`,
    remainingBalance: gym.coinBalance
  });
});

export {
  generateMemberQR,
  generateGymQR,
  purchaseCoins,
  useCoin,
  getUserCoinHistory,
  getGymCoinHistory,
  getAdminCoinData,
  simulateGymPayout
}; 