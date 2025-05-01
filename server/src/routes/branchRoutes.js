import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  createBranch,
  getBranches,
  getBranch,
  updateBranch,
  deleteBranch,
  uploadPhoto,
  deletePhoto,
  addMember,
  removeMember,
  addTrainer,
  removeTrainer,
  reassignMember
} from '../controllers/branchController.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

// Protected routes (need to be logged in)
router.use(protect);

// Restrict to gym owner
router.use(authorize('gymOwner'));

// Branch CRUD operations
router.route('/')
  .post(createBranch)
  .get(getBranches);

router.route('/:id')
  .get(getBranch)
  .put(updateBranch)
  .delete(deleteBranch);

// Photo management
router.post('/:id/photos', upload.array('photos'), uploadPhoto);
router.delete('/:id/photos/:photoId', deletePhoto);

// Member management
router.post('/:id/members', addMember);
router.delete('/:id/members/:memberId', removeMember);
router.put('/:id/members/:memberId/reassign', reassignMember);

// Trainer management
router.post('/:id/trainers', addTrainer);
router.delete('/:id/trainers/:trainerId', removeTrainer);

export default router; 