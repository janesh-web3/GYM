import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { branchUpload } from '../middlewares/uploadMiddleware.js';
import {
  createBranch,
  getGymBranches as getBranches,
  getBranch,
  updateBranch,
  deleteBranch,
  uploadBranchMedia,
  deleteBranchMedia,
  joinBranch,
  getBranchMembers,
  getBranchStats
} from '../controllers/branchController.js';

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

// Media routes with enhanced upload middleware
router.post(
  '/:id/media',
  uploadBranchMedia
);

router.delete('/:id/media/:mediaId', deleteBranchMedia);

// Member routes
router.post('/:id/join', authorize('member'), joinBranch);

// Admin routes
router.get('/:id/members', authorize('gymOwner', 'trainer'), getBranchMembers);
router.get('/:id/stats', authorize('gymOwner'), getBranchStats);

export default router; 