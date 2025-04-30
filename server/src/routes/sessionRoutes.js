import express from 'express';
import { 
  createSession,
  getSessions,
  getSession,
  updateSession,
  deleteSession,
  getSessionsByTrainer,
  getSessionsByMember,
  getSessionsByGym
} from '../controllers/sessionController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Base routes
router
  .route('/')
  .post(protect, authorize('gymOwner', 'trainer'), createSession)
  .get(protect, authorize('gymOwner', 'trainer'), getSessions);

router
  .route('/:id')
  .get(protect, authorize('gymOwner', 'trainer', 'member'), getSession)
  .put(protect, authorize('gymOwner', 'trainer'), updateSession)
  .delete(protect, authorize('gymOwner', 'trainer'), deleteSession);

// Special routes for filtering
router
  .route('/trainer/:trainerId')
  .get(protect, authorize('gymOwner', 'trainer'), getSessionsByTrainer);

router
  .route('/member/:memberId')
  .get(protect, authorize('gymOwner', 'trainer', 'member'), getSessionsByMember);

router
  .route('/gym/:gymId')
  .get(protect, authorize('gymOwner', 'trainer'), getSessionsByGym);

export default router; 