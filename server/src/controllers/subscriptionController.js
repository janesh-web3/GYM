import mongoose from 'mongoose';
import { SubscriptionPlan, UserSubscription } from '../models/Subscription.js';
import Gym from '../models/Gym.js';
import Branch from '../models/Branch.js';
import BranchMembership from '../models/BranchMembership.js';

// @desc    Create a new subscription plan
// @route   POST /api/subscriptions/plans
// @access  Private (GymOwner)
export const createSubscriptionPlan = async (req, res) => {
  try {
    const { gymId, branchId } = req.body;

    // Verify gym exists and user owns it
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to create subscription plans for this gym' });
    }

    // If branch is specified, verify it exists and belongs to the gym
    if (branchId) {
      const branch = await Branch.findById(branchId);
      if (!branch) {
        return res.status(404).json({ message: 'Branch not found' });
      }

      if (branch.gymId.toString() !== gymId) {
        return res.status(400).json({ message: 'Branch does not belong to the specified gym' });
      }
    }

    // Create the subscription plan
    const subscriptionPlan = await SubscriptionPlan.create({
      ...req.body,
      gymId
    });

    res.status(201).json(subscriptionPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all subscription plans for a gym
// @route   GET /api/gyms/:gymId/subscription-plans
// @access  Public
export const getGymSubscriptionPlans = async (req, res) => {
  try {
    const { gymId } = req.params;
    const { branchId } = req.query;

    // Verify gym exists
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // Build query
    const query = { 
      gymId,
      isActive: true
    };

    // If branchId is specified, include only plans for that branch or gym-wide plans
    if (branchId) {
      query.$or = [
        { branchId },
        { branchId: null }, // Gym-wide plans
        { branchId: { $exists: false } } // Gym-wide plans (alternative schema)
      ];
    }

    const plans = await SubscriptionPlan.find(query).sort('price');
    
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a specific subscription plan
// @route   GET /api/subscriptions/plans/:id
// @access  Public
export const getSubscriptionPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a subscription plan
// @route   PUT /api/subscriptions/plans/:id
// @access  Private (GymOwner)
export const updateSubscriptionPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    // Verify gym exists and user owns it
    const gym = await Gym.findById(plan.gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Associated gym not found' });
    }

    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update subscription plans for this gym' });
    }

    // Don't allow changing gymId
    const updateData = { ...req.body };
    delete updateData.gymId;

    // Update the plan
    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a subscription plan
// @route   DELETE /api/subscriptions/plans/:id
// @access  Private (GymOwner)
export const deleteSubscriptionPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    // Verify gym exists and user owns it
    const gym = await Gym.findById(plan.gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Associated gym not found' });
    }

    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete subscription plans for this gym' });
    }

    // Check if there are active subscriptions using this plan
    const activeSubscriptionsCount = await UserSubscription.countDocuments({
      planId: plan._id,
      status: 'active'
    });

    if (activeSubscriptionsCount > 0) {
      // Instead of deleting, mark as inactive
      plan.isActive = false;
      await plan.save();
      return res.json({ 
        message: 'Plan has active subscriptions and cannot be deleted. It has been marked as inactive instead.',
        plan
      });
    }

    // If no active subscriptions, delete the plan
    await plan.remove();
    res.json({ message: 'Subscription plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Subscribe to a plan
// @route   POST /api/subscriptions
// @access  Private (Member)
export const createSubscription = async (req, res) => {
  try {
    const { planId, branchId, paymentMethod, autoRenew = false } = req.body;

    // Verify plan exists and is active
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ message: 'Subscription plan not found or inactive' });
    }

    // Verify gym exists and is active
    const gym = await Gym.findById(plan.gymId);
    if (!gym || gym.status !== 'active') {
      return res.status(400).json({ message: 'The gym associated with this plan is not active' });
    }

    // If the plan is branch-specific, verify the branch
    if (plan.branchId && (!branchId || plan.branchId.toString() !== branchId)) {
      return res.status(400).json({ message: 'This subscription plan is for a specific branch' });
    }

    // If branch is specified, verify it exists and belongs to the gym
    if (branchId) {
      const branch = await Branch.findById(branchId);
      if (!branch) {
        return res.status(404).json({ message: 'Branch not found' });
      }

      if (branch.gymId.toString() !== plan.gymId.toString()) {
        return res.status(400).json({ message: 'Branch does not belong to the specified gym' });
      }

      if (branch.status !== 'active') {
        return res.status(400).json({ message: 'This branch is not currently accepting new members' });
      }
    }

    // Check if user already has an active subscription for this gym/branch
    const existingSubscription = await UserSubscription.findOne({
      userId: req.user._id,
      gymId: plan.gymId,
      ...(branchId ? { branchId } : {}),
      status: 'active'
    });

    if (existingSubscription) {
      return res.status(400).json({ message: 'You already have an active subscription for this gym/branch' });
    }

    // Calculate end date based on plan duration
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    // Add duration based on unit
    switch (plan.duration.unit) {
      case 'day':
        endDate.setDate(endDate.getDate() + plan.duration.value);
        break;
      case 'week':
        endDate.setDate(endDate.getDate() + (plan.duration.value * 7));
        break;
      case 'month':
        endDate.setMonth(endDate.getMonth() + plan.duration.value);
        break;
      case 'year':
        endDate.setFullYear(endDate.getFullYear() + plan.duration.value);
        break;
    }

    // Create subscription (payment processing would happen here in production)
    // For this implementation, we're assuming payment is successful
    const subscription = await UserSubscription.create({
      userId: req.user._id,
      planId,
      gymId: plan.gymId,
      branchId: branchId || null,
      startDate,
      endDate,
      status: 'active', // In production, this might start as 'pending' until payment confirms
      paymentStatus: 'completed', // In production, this would be set after payment processing
      paymentMethod,
      autoRenew
    });

    // Update plan current members count
    plan.currentMembers += 1;
    await plan.save();

    // Update gym subscription counts
    gym.totalSubscriptions += 1;
    gym.activeSubscriptions += 1;
    await gym.save();

    // If branch is specified, create or update branch membership
    if (branchId) {
      // Check if user is already a member of this branch
      const existingMembership = await BranchMembership.findOne({
        userId: req.user._id,
        branchId
      });

      if (existingMembership) {
        // Update existing membership
        existingMembership.status = 'active';
        existingMembership.subscriptionId = subscription._id;
        await existingMembership.save();
      } else {
        // Create new membership
        await BranchMembership.create({
          userId: req.user._id,
          branchId,
          gymId: plan.gymId,
          subscriptionId: subscription._id,
          status: 'active'
        });

        // Update branch member count
        const branch = await Branch.findById(branchId);
        if (branch) {
          branch.memberCount += 1;
          await branch.save();
        }
      }
    }

    res.status(201).json(subscription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's subscriptions
// @route   GET /api/users/subscriptions
// @access  Private (Member)
export const getUserSubscriptions = async (req, res) => {
  try {
    const { status } = req.query;

    // Build query
    const query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    // Get subscriptions with populated data
    const subscriptions = await UserSubscription.find(query)
      .populate('planId')
      .populate('gymId', 'gymName logo address')
      .populate('branchId', 'branchName address')
      .sort('-startDate');

    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get subscription details
// @route   GET /api/subscriptions/:id
// @access  Private (User owning the subscription or gym owner)
export const getSubscription = async (req, res) => {
  try {
    const subscription = await UserSubscription.findById(req.params.id)
      .populate('planId')
      .populate('gymId', 'gymName logo address ownerId')
      .populate('branchId', 'branchName address')
      .populate('userId', 'name email profileImage');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check authorization - only subscription owner or gym owner can view
    if (
      subscription.userId._id.toString() !== req.user._id.toString() &&
      subscription.gymId.ownerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'superadmin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this subscription' });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel subscription
// @route   PATCH /api/subscriptions/:id/cancel
// @access  Private (User owning the subscription)
export const cancelSubscription = async (req, res) => {
  try {
    const subscription = await UserSubscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check authorization - only subscription owner can cancel
    if (subscription.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this subscription' });
    }

    // Update subscription status
    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    await subscription.save();

    // Update gym active subscription count
    const gym = await Gym.findById(subscription.gymId);
    if (gym) {
      gym.activeSubscriptions -= 1;
      await gym.save();
    }

    res.json({ message: 'Subscription cancelled successfully', subscription });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get subscription statistics for a gym
// @route   GET /api/gyms/:gymId/subscriptions/stats
// @access  Private (GymOwner)
export const getSubscriptionStats = async (req, res) => {
  try {
    const { gymId } = req.params;

    // Verify gym exists and user owns it
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    if (gym.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized to access subscription statistics for this gym' });
    }

    // Get subscriptions count by status
    const statusStats = await UserSubscription.aggregate([
      { $match: { gymId: mongoose.Types.ObjectId(gymId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get subscriptions count by branch
    const branchStats = await UserSubscription.aggregate([
      { 
        $match: { 
          gymId: mongoose.Types.ObjectId(gymId),
          branchId: { $exists: true, $ne: null } 
        }
      },
      { $group: { _id: '$branchId', count: { $sum: 1 } } }
    ]);

    // Get branches to add names to the stats
    const branches = await Branch.find({ 
      _id: { $in: branchStats.map(stat => stat._id) }
    }, {
      branchName: 1
    });

    // Format branch stats
    const branchStatsWithNames = branchStats.map(stat => {
      const branch = branches.find(b => b._id.toString() === stat._id.toString());
      return {
        branchId: stat._id,
        branchName: branch ? branch.branchName : 'Unknown Branch',
        count: stat.count
      };
    });

    // Get subscriptions without a branch (gym-wide)
    const gymWideCount = await UserSubscription.countDocuments({
      gymId,
      $or: [
        { branchId: null },
        { branchId: { $exists: false } }
      ]
    });

    // Get count by plan
    const planStats = await UserSubscription.aggregate([
      { $match: { gymId: mongoose.Types.ObjectId(gymId) } },
      { $group: { _id: '$planId', count: { $sum: 1 } } }
    ]);

    // Get plans to add names
    const plans = await SubscriptionPlan.find({
      _id: { $in: planStats.map(stat => stat._id) }
    }, {
      name: 1,
      price: 1
    });

    // Format plan stats
    const planStatsWithNames = planStats.map(stat => {
      const plan = plans.find(p => p._id.toString() === stat._id.toString());
      return {
        planId: stat._id,
        planName: plan ? plan.name : 'Unknown Plan',
        price: plan ? plan.price : 0,
        count: stat.count
      };
    });

    // Calculate revenue
    const revenueStats = planStatsWithNames.reduce((acc, plan) => {
      return acc + (plan.price * plan.count);
    }, 0);

    // Format status stats
    const statusCounts = {};
    statusStats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    // Get total member count (unique users with active subscriptions)
    const totalMembers = await UserSubscription.aggregate([
      { 
        $match: { 
          gymId: mongoose.Types.ObjectId(gymId),
          status: 'active'
        }
      },
      { $group: { _id: '$userId' } },
      { $count: 'total' }
    ]);

    const uniqueMembers = totalMembers.length > 0 ? totalMembers[0].total : 0;

    res.json({
      totalSubscriptions: await UserSubscription.countDocuments({ gymId }),
      activeSubscriptions: statusCounts.active || 0,
      uniqueMembers,
      branchStats: [
        ...branchStatsWithNames,
        { branchId: null, branchName: 'Gym-wide', count: gymWideCount }
      ],
      planStats: planStatsWithNames,
      statusCounts,
      totalRevenue: revenueStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 