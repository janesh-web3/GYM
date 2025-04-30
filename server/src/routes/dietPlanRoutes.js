import express from 'express';
import {
  createDietPlan,
  getDietPlans,
  getDietPlan,
  updateDietPlan,
  deleteDietPlan,
  assignDietPlan,
  unassignDietPlan,
  getDietPlansByMember
} from '../controllers/dietPlanController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Base routes
router
  .route('/')
  .post(protect, authorize('gymOwner', 'trainer'), createDietPlan)
  .get(protect, authorize('gymOwner', 'trainer'), getDietPlans);

router
  .route('/:id')
  .get(protect, authorize('gymOwner', 'trainer', 'member'), getDietPlan)
  .put(protect, authorize('gymOwner', 'trainer'), updateDietPlan)
  .delete(protect, authorize('gymOwner', 'trainer'), deleteDietPlan);

// Assignment routes
router
  .route('/:id/assign')
  .post(protect, authorize('gymOwner', 'trainer'), assignDietPlan);

router
  .route('/:id/unassign')
  .post(protect, authorize('gymOwner', 'trainer'), unassignDietPlan);

// Member-specific route
router
  .route('/member/:memberId')
  .get(protect, authorize('gymOwner', 'trainer', 'member'), getDietPlansByMember);

export default router; 