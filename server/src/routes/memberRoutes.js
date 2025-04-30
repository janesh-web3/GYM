import express from 'express';
import { 
  createMember, 
  getMembers, 
  getMember, 
  updateMember, 
  deleteMember,
  addProgressMetric,
  getProgressHistory,
  deleteProgressMetric
} from '../controllers/memberController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, authorize('gymOwner'), createMember)
  .get(protect, authorize('gymOwner', 'trainer', 'superadmin'), getMembers);

router
  .route('/:id')
  .get(protect, authorize('gymOwner', 'trainer', 'superadmin'), getMember)
  .put(protect, authorize('gymOwner'), updateMember)
  .delete(protect, authorize('gymOwner'), deleteMember);

// Progress tracking routes
router.get('/:id/progress', protect, getProgressHistory);
router.post('/:id/progress/:metricType', protect, addProgressMetric);
router.delete('/:id/progress/:metricType/:entryId', protect, deleteProgressMetric);

export default router; 