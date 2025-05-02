import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Member',
      status: role === 'Member' ? 'active' : 'pending'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log(req.body);
    // Check for user email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Account is not active' });
    }

    // If role is provided, validate that it matches the user's role
    if (role && user.role !== role) {
      return res.status(401).json({ message: 'Invalid role for this user' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error.message);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    // User is already available in req.user from the protect middleware
    // Remove sensitive information 
    const user = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
      // Include any other non-sensitive fields that frontend needs
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt
    };
    
    res.json(user);
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user subscription type
export const updateSubscription = asyncHandler(async (req, res) => {
  const { userId, subscriptionType } = req.body;
  
  // Validate input
  if (!userId || !subscriptionType) {
    return res.status(400).json({
      success: false,
      message: 'User ID and subscription type are required'
    });
  }
  
  // Validate subscription type
  if (!['basic', 'premium'].includes(subscriptionType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid subscription type'
    });
  }
  
  // Find and update user
  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Update user
  user.subscriptionType = subscriptionType;
  await user.save();
  
  return res.status(200).json({
    success: true,
    message: `Subscription updated to ${subscriptionType}`,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionType: user.subscriptionType,
      coinBalance: user.coinBalance || 0
    }
  });
}); 