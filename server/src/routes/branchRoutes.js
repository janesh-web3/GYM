import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { branchUpload } from '../middlewares/uploadMiddleware.js';
import {
  createBranch,
  getBranches,
  getBranch,
  updateBranch,
  deleteBranch,
  uploadBranchLogo,
  uploadBranchMedia,
  deleteBranchMedia,
  uploadPhoto,
  deletePhoto,
  addMember,
  removeMember,
  addTrainer,
  removeTrainer,
  reassignMember
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
  '/:id/logo', 
  branchUpload.single('logo', 'logo'), 
  branchUpload.errorHandler,
  uploadBranchLogo
);

router.post(
  '/:id/media/upload', 
  (req, res, next) => {
    // Determine which middleware to use based on the media type
    const mediaType = req.query.type || req.body.type || 'photo';
    const uploadMiddleware = branchUpload.array('files', mediaType, 10);
    uploadMiddleware(req, res, next);
  },
  branchUpload.errorHandler,
  uploadBranchMedia
);

router.delete('/:id/media/:mediaId', deleteBranchMedia);

// Member management
router.post('/:id/members', addMember);
router.delete('/:id/members/:memberId', removeMember);
router.put('/:id/members/:memberId/reassign', reassignMember);

// Trainer management
router.post('/:id/trainers', addTrainer);
router.delete('/:id/trainers/:trainerId', removeTrainer);

export default router; 