import Branch from "../models/Branch.js";
import Gym from "../models/Gym.js";
import BranchMembership from "../models/BranchMembership.js";
import { uploadMedia, deleteMedia } from "../utils/cloudinary.js";
import { UserSubscription, SubscriptionPlan } from "../models/Subscription.js";
import mongoose from "mongoose";

// @desc    Create new branch for a gym
// @route   POST /api/branches
// @access  Private (GymOwner)
export const createBranch = async (req, res) => {
  try {
console.log(req.body)
    // Verify that the gym exists and belongs to the user
    const gym = await Gym.findOne({ownerId : req.user._id});
    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    // Check ownership of the gym
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to add branches to this gym" });
    }

    // Create the branch
    const branch = await Branch.create({
      ...req.body,
      gymId : gym._id,
    });

    res.status(201).json(branch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all branches for a specific gym
// @route   GET /api/gyms/:gymId/branches
// @access  Public
export const getGymBranches = async (req, res) => {
  try {
    // Verify gym exists
    const gym = await Gym.findOne({ ownerId: req.user._id });
    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    const branches = await Branch.find({ gymId: gym._id }).sort("branchName");
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single branch by ID
// @route   GET /api/branches/:id
// @access  Public
export const getBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id).populate(
      "trainers",
      "name profileImage"
    );

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a branch
// @route   PUT /api/branches/:id
// @access  Private (GymOwner of the associated gym)
export const updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // Get the associated gym to check ownership
    const gym = await Gym.findById(branch.gymId);
    if (!gym) {
      return res.status(404).json({ message: "Associated gym not found" });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this branch" });
    }

    // Don't allow changing the gymId relationship
    const updateData = { ...req.body };
    delete updateData.gymId;

    const updatedBranch = await Branch.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedBranch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a branch
// @route   DELETE /api/branches/:id
// @access  Private (GymOwner of the associated gym)
export const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // Get the associated gym to check ownership
    const gym = await Gym.findById(branch.gymId);
    if (!gym) {
      return res.status(404).json({ message: "Associated gym not found" });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this branch" });
    }

    await branch.remove();
    res.json({ message: "Branch removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload media (photos/videos) for a branch
// @route   POST /api/branches/:id/media
// @access  Private (GymOwner of the associated gym)
export const uploadBranchMedia = async (req, res) => {
  try {
    // Verify files are present
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No files uploaded" 
      });
    }

    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ 
        success: false, 
        message: "Branch not found" 
      });
    }

    // Get the associated gym to check ownership
    const gym = await Gym.findById(branch.gymId);
    if (!gym) {
      return res.status(404).json({ 
        success: false, 
        message: "Associated gym not found" 
      });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ 
          success: false, 
          message: "Not authorized to upload media to this branch" 
        });
    }

    // Determine media type (photo or video)
    const mediaType = req.query.type || req.body.type || "photo";
    const isVideo = mediaType === "video";

    // Process uploaded files from Cloudinary (already uploaded by middleware)
    const uploadedMedia = req.files.map((file) => {
      return {
        url: file.path, // Cloudinary URL is in path
        public_id: file.filename, // Cloudinary public_id is in filename
        caption: req.body.caption || file.originalname || "",
      };
    });

    // Use $push operator to add media without triggering validation on the entire document
    const updateField = isVideo ? "videos" : "photos";
    const updatedBranch = await Branch.findByIdAndUpdate(
      req.params.id,
      { $push: { [updateField]: { $each: uploadedMedia } } },
      { new: true, runValidators: false }
    );

    if (!updatedBranch) {
      return res.status(404).json({
        success: false,
        message: "Failed to update branch with new media"
      });
    }

    res.status(201).json({
      success: true,
      data: uploadedMedia,
      [updateField]: updatedBranch[updateField],
      message: `${isVideo ? 'Videos' : 'Photos'} uploaded successfully`
    });
  } catch (error) {
    console.error('Branch media upload error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Delete media from a branch
// @route   DELETE /api/branches/:id/media/:mediaId
// @access  Private (GymOwner of the associated gym)
export const deleteBranchMedia = async (req, res) => {
  try {
    const { id, mediaId } = req.params;
    const { type } = req.query; // 'photo' or 'video'

    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // Get the associated gym to check ownership
    const gym = await Gym.findById(branch.gymId);
    if (!gym) {
      return res.status(404).json({ message: "Associated gym not found" });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete media from this branch" });
    }

    const mediaArray = type === "video" ? branch.videos : branch.photos;
    const mediaIndex = mediaArray.findIndex(
      (item) => item._id.toString() === mediaId
    );

    if (mediaIndex === -1) {
      return res.status(404).json({ message: `${type} not found` });
    }

    const media = mediaArray[mediaIndex];

    // Delete from Cloudinary
    if (media.public_id) {
      await deleteMedia(media.public_id, type === "video");
    }

    // Remove from the branch document
    if (type === "video") {
      branch.videos.splice(mediaIndex, 1);
    } else {
      branch.photos.splice(mediaIndex, 1);
    }

    await branch.save();
    res.json({ message: `${type} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a branch as a member
// @route   POST /api/branches/:id/join
// @route   POST /api/branches/:id/subscribe
// @access  Private (Member)
export const joinBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { subscriptionId, paymentMethodId, couponCode } = req.body;

    // Verify branch exists and is active
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({ 
        success: false, 
        message: "Branch not found" 
      });
    }

    if (branch.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This branch is not currently accepting new members",
      });
    }

    // Verify gym exists and is active
    const gym = await Gym.findById(branch.gymId);
    if (!gym || gym.status !== "active") {
      return res.status(400).json({ 
        success: false, 
        message: "The gym associated with this branch is not active" 
      });
    }

    // Check if user is already a member of this branch
    const existingMembership = await BranchMembership.findOne({
      userId: req.user._id,
      branchId: id,
    });

    if (existingMembership && existingMembership.status === "active") {
      return res.status(400).json({ 
        success: false, 
        message: "You are already a member of this branch" 
      });
    }

    // If subscription is provided, validate and process it
    let subscription = null;
    let paymentIntent = null;
    let subscriptionProcessed = false;

    if (subscriptionId) {
      // Find the subscription plan
      const plan = await SubscriptionPlan.findById(subscriptionId);
      
      if (!plan) {
        return res.status(404).json({ 
          success: false, 
          message: "Subscription plan not found" 
        });
      }

      // Verify plan belongs to this gym and branch (if branch-specific)
      if (plan.gymId.toString() !== branch.gymId.toString()) {
        return res.status(400).json({ 
          success: false, 
          message: "This subscription plan is not valid for this gym" 
        });
      }

      if (plan.branchId && plan.branchId.toString() !== id) {
        return res.status(400).json({ 
          success: false, 
          message: "This subscription plan is for a different branch" 
        });
      }

      // Create user subscription
      const endDate = new Date();
      if (plan.duration.unit === 'day') {
        endDate.setDate(endDate.getDate() + plan.duration.value);
      } else if (plan.duration.unit === 'week') {
        endDate.setDate(endDate.getDate() + plan.duration.value * 7);
      } else if (plan.duration.unit === 'month') {
        endDate.setMonth(endDate.getMonth() + plan.duration.value);
      } else if (plan.duration.unit === 'year') {
        endDate.setFullYear(endDate.getFullYear() + plan.duration.value);
      }

      // Process payment (assumed implementation - would integrate with Stripe or other payment provider)
      if (paymentMethodId) {
        try {
          // Placeholder for payment processing logic
          // In a real implementation, this would call Stripe or another payment gateway
          // paymentIntent = await stripe.paymentIntents.create({...});
          
          // For now, simulate successful payment
          paymentIntent = {
            id: `pi_${Date.now()}`,
            status: 'succeeded'
          };
          
          subscriptionProcessed = true;
        } catch (paymentError) {
          console.error('Payment processing error:', paymentError);
          return res.status(400).json({
            success: false,
            message: "Payment processing failed",
            error: paymentError.message
          });
        }
      }
      
      // Create the user subscription
      subscription = await UserSubscription.create({
        userId: req.user._id,
        planId: plan._id,
        gymId: branch.gymId,
        branchId: id,
        startDate: new Date(),
        endDate,
        status: paymentIntent ? 'active' : 'pending',
        paymentStatus: paymentIntent ? 'completed' : 'pending',
        paymentId: paymentIntent ? paymentIntent.id : undefined,
        paymentMethod: paymentMethodId ? 'card' : undefined,
        autoRenew: !!req.body.autoRenew
      });

      // Increment plan usage count
      plan.currentMembers = (plan.currentMembers || 0) + 1;
      await plan.save();
    }

    // Create new membership or reactivate existing one
    let membership;

    if (existingMembership) {
      // Update existing membership
      existingMembership.status = subscription ? 'active' : 'pending';
      existingMembership.subscriptionId = subscription ? subscription._id : existingMembership.subscriptionId;
      existingMembership.joinDate = new Date();

      membership = await existingMembership.save();
    } else {
      // Create new membership
      membership = await BranchMembership.create({
        userId: req.user._id,
        branchId: id,
        gymId: branch.gymId,
        subscriptionId: subscription ? subscription._id : null,
        status: subscription ? 'active' : 'pending',
      });

      // Only increase counts if status is active (paid subscription)
      if (membership.status === 'active') {
        // Update branch member count
        branch.memberCount += 1;
        await branch.save();

        // Update gym total members count
        gym.totalMembers = (gym.totalMembers || 0) + 1;
        await gym.save();
      }
    }

    res.status(201).json({
      success: true,
      message: membership.status === 'active' 
        ? "Successfully joined the branch" 
        : "Membership request submitted and awaiting approval",
      membership,
      subscription,
      paymentIntent: paymentIntent ? { 
        id: paymentIntent.id, 
        status: paymentIntent.status 
      } : null
    });
  } catch (error) {
    console.error('Error joining branch:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get all members of a branch
// @route   GET /api/branches/:id/members
// @access  Private (GymOwner, Manager)
export const getBranchMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    // Verify branch exists
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // Get the associated gym to check ownership
    const gym = await Gym.findById(branch.gymId);
    if (!gym) {
      return res.status(404).json({ message: "Associated gym not found" });
    }

    // Check authorization - only gym owner or branch manager can see members
    if (
      gym.ownerId.toString() !== req.user._id.toString() &&
      (!branch.manager ||
        branch.manager.toString() !== req.user._id.toString()) &&
      req.user.role !== "superadmin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view branch members" });
    }

    // Build query
    const query = { branchId: id };
    if (status) {
      query.status = status;
    }

    // Pagination
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { joinDate: -1 },
      populate: [
        { path: "userId", select: "name email profileImage" },
        {
          path: "subscriptionId",
          populate: { path: "planId", select: "name price" },
        },
      ],
    };

    // Get paginated results
    const memberships = await BranchMembership.find(query)
      .populate("userId", "name email profileImage")
      .populate({
        path: "subscriptionId",
        populate: { path: "planId", select: "name price" },
      })
      .sort("-joinDate")
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);

    // Get total count
    const total = await BranchMembership.countDocuments(query);

    res.json({
      memberships,
      pagination: {
        total,
        page: options.page,
        pages: Math.ceil(total / options.limit),
        limit: options.limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get stats for a branch
// @route   GET /api/branches/:id/stats
// @access  Private (GymOwner, Manager)
export const getBranchStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify branch exists
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // Get the associated gym to check ownership
    const gym = await Gym.findById(branch.gymId);
    if (!gym) {
      return res.status(404).json({ message: "Associated gym not found" });
    }

    // Check authorization - only gym owner or branch manager can see stats
    if (
      gym.ownerId.toString() !== req.user._id.toString() &&
      (!branch.manager ||
        branch.manager.toString() !== req.user._id.toString()) &&
      req.user.role !== "superadmin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view branch statistics" });
    }

    // Get member counts
    const totalMembers = await BranchMembership.countDocuments({
      branchId: id,
    });
    const activeMembers = await BranchMembership.countDocuments({
      branchId: id,
      status: "active",
    });

    // Get subscription stats
    const subscriptionStats = await BranchMembership.aggregate([
      { $match: { branchId: mongoose.Types.ObjectId(id) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Format subscription stats
    const statusCounts = {};
    subscriptionStats.forEach((stat) => {
      statusCounts[stat._id] = stat.count;
    });

    // Get check-in stats
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const checkInsToday = await BranchMembership.countDocuments({
      branchId: id,
      lastCheckIn: { $gte: startOfDay },
    });

    // Get revenue stats from subscriptions
    const subscriptions = await UserSubscription.find({
      branchId: id,
      status: "active",
      paymentStatus: "completed",
    }).populate("planId");

    let totalRevenue = 0;
    if (subscriptions.length > 0) {
      totalRevenue = subscriptions.reduce((sum, sub) => {
        return sum + (sub.planId ? sub.planId.price : 0);
      }, 0);
    }

    res.json({
      totalMembers,
      activeMembers,
      statusCounts,
      checkInsToday,
      totalRevenue,
      subscriptionCount: subscriptions.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Activate a pending member
// @route   PATCH /api/branches/members/:memberId/activate
// @access  Private (GymOwner)
export const activateMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    // Find the membership
    const membership = await BranchMembership.findById(memberId);
    if (!membership) {
      return res.status(404).json({ 
        success: false, 
        message: "Membership not found" 
      });
    }

    // Get the associated branch
    const branch = await Branch.findById(membership.branchId);
    if (!branch) {
      return res.status(404).json({ 
        success: false, 
        message: "Branch not found" 
      });
    }

    // Get the associated gym to check ownership
    const gym = await Gym.findById(branch.gymId);
    if (!gym) {
      return res.status(404).json({ 
        success: false, 
        message: "Associated gym not found" 
      });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to activate members for this branch" 
      });
    }

    // Check if already active
    if (membership.status === "active") {
      return res.status(400).json({ 
        success: false, 
        message: "Member is already active" 
      });
    }

    // Activate the membership
    membership.status = "active";
    await membership.save();

    // If this is the first activation (joining), increment member counts
    if (membership.status === "pending") {
      // Update branch member count
      branch.memberCount += 1;
      await branch.save();

      // Update gym total members count if needed
      gym.totalMembers = (gym.totalMembers || 0) + 1;
      await gym.save();
    }

    res.status(200).json({
      success: true,
      data: membership,
      message: "Member activated successfully"
    });
  } catch (error) {
    console.error('Error activating member:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update a branch member's status
// @route   PATCH /api/branches/members/:memberId/status
// @access  Private (GymOwner)
export const updateMemberStatus = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['active', 'inactive', 'pending', 'suspended'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status. Status must be active, inactive, pending, or suspended" 
      });
    }

    // Find the membership
    const membership = await BranchMembership.findById(memberId);
    if (!membership) {
      return res.status(404).json({ 
        success: false, 
        message: "Membership not found" 
      });
    }

    // Get the associated branch
    const branch = await Branch.findById(membership.branchId);
    if (!branch) {
      return res.status(404).json({ 
        success: false, 
        message: "Branch not found" 
      });
    }

    // Get the associated gym
    const gym = await Gym.findById(branch.gymId);
    if (!gym) {
      return res.status(404).json({ 
        success: false, 
        message: "Associated gym not found" 
      });
    }

    // Check ownership
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to update members for this branch" 
      });
    }

    // Get the previous status to handle count updates
    const previousStatus = membership.status;

    // Update the membership status
    membership.status = status;
    await membership.save();

    // Update branch member count if needed
    if (previousStatus !== 'active' && status === 'active') {
      // Member became active, increment count
      branch.memberCount = (branch.memberCount || 0) + 1;
      await branch.save();
      
      // Update gym total members count
      gym.totalMembers = (gym.totalMembers || 0) + 1;
      await gym.save();
    } else if (previousStatus === 'active' && status !== 'active') {
      // Member became inactive, decrement count
      branch.memberCount = Math.max(0, (branch.memberCount || 1) - 1);
      await branch.save();
      
      // Update gym total members count
      gym.totalMembers = Math.max(0, (gym.totalMembers || 1) - 1);
      await gym.save();
    }

    res.status(200).json({
      success: true,
      data: membership,
      message: `Member status updated to ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating branch member status:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error updating member status' 
    });
  }
};
