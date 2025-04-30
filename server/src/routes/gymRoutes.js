import express from 'express';
import { 
  createGym, 
  getGyms, 
  getGym, 
  updateGym, 
  deleteGym, 
  updateGymStatus 
} from '../controllers/gymController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getGyms);
router.get('/:id', getGym);

// GymOwner routes
router.post('/', protect, authorize('gymOwner'), createGym);
router.put('/:id', protect, authorize('gymOwner'), updateGym);
router.delete('/:id', protect, authorize('gymOwner'), deleteGym);

// SuperAdmin routes
router.patch('/:id/status', protect, authorize('superadmin'), updateGymStatus);

export default router; 