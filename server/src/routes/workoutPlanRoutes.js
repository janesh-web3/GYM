import express from 'express';
import {
  createWorkoutPlan,
  getWorkoutPlans,
  getWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  assignWorkoutPlan,
  unassignWorkoutPlan,
  getWorkoutPlansByMember
} from '../controllers/workoutPlanController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Base routes
router
  .route('/')
  .post(protect, authorize('gymOwner', 'trainer'), createWorkoutPlan)
  .get(protect, authorize('gymOwner', 'trainer'), getWorkoutPlans);

router
  .route('/:id')
  .get(protect, authorize('gymOwner', 'trainer', 'member'), getWorkoutPlan)
  .put(protect, authorize('gymOwner', 'trainer'), updateWorkoutPlan)
  .delete(protect, authorize('gymOwner', 'trainer'), deleteWorkoutPlan);

// Assignment routes
router
  .route('/:id/assign')
  .post(protect, authorize('gymOwner', 'trainer'), assignWorkoutPlan);

router
  .route('/:id/unassign')
  .post(protect, authorize('gymOwner', 'trainer'), unassignWorkoutPlan);

// Member-specific route
router
  .route('/member/:memberId')
  .get(protect, authorize('gymOwner', 'trainer', 'member'), getWorkoutPlansByMember);

export default router; 