import express from 'express';
import {
  createSubscriptionPlan,
  getSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  createSubscription,
  getSubscription,
  cancelSubscription,
  getUserSubscriptions,
  getSubscriptionStats
} from '../controllers/subscriptionController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/plans/:id', getSubscriptionPlan);

// Protected routes (need to be logged in)
router.use(protect);

// Gym owner routes
router.post('/plans', authorize('gymOwner'), createSubscriptionPlan);
router.put('/plans/:id', authorize('gymOwner'), updateSubscriptionPlan);
router.delete('/plans/:id', authorize('gymOwner'), deleteSubscriptionPlan);

// Member routes
router.post('/', authorize('member'), createSubscription);
router.get('/:id', getSubscription);
router.patch('/:id/cancel', authorize('member'), cancelSubscription);

// Routes added to userRoutes.js
// GET /api/users/subscriptions - Get current user's subscriptions

// Routes added to gymRoutes.js
// GET /api/gyms/:gymId/subscription-plans - Get plans for a gym
// GET /api/gyms/:gymId/subscriptions/stats - Get subscription stats for a gym

export default router; 