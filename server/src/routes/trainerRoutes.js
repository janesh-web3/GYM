import express from 'express';
import { 
  createTrainer, 
  getTrainers, 
  getTrainer, 
  updateTrainer, 
  deleteTrainer 
} from '../controllers/trainerController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, authorize('gymOwner'), createTrainer)
  .get(protect, authorize('gymOwner', 'superadmin'), getTrainers);

router
  .route('/:id')
  .get(protect, authorize('gymOwner', 'superadmin'), getTrainer)
  .put(protect, authorize('gymOwner'), updateTrainer)
  .delete(protect, authorize('gymOwner'), deleteTrainer);

export default router; 