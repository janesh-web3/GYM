import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { branchUpload } from '../middlewares/uploadMiddleware.js';
import {
  createBranch,
  getGymBranches,
  getBranch,
  updateBranch,
  deleteBranch,
  uploadBranchMedia,
  deleteBranchMedia,
  joinBranch,
  getBranchMembers,
  getBranchStats,
  activateMember,
  updateMemberStatus
} from '../controllers/branchController.js';

const router = express.Router();

// Protected routes (need to be logged in)
router.use(protect);

// Branch CRUD operations
router.route('/')
  .post(authorize('gymOwner'), createBranch)
  .get(authorize('gymOwner'), getGymBranches);

router.route('/:id')
  .get(getBranch) // Public - anyone can view branch details
  .put(authorize('gymOwner'), updateBranch)
  .delete(authorize('gymOwner'), deleteBranch);

// Media routes with enhanced upload middleware
router.post(
  '/:id/media',
  authorize('gymOwner'),
  (req, res, next) => {
    // Set the mediaType based on the query parameter
    const mediaType = req.query.type || 'photo';
    // Apply the appropriate middleware based on the media type
    branchUpload.array('files', mediaType, 10)(req, res, (err) => {
      if (err) {
        return branchUpload.errorHandler(err, req, res, next);
      }
      next();
    });
  },
  uploadBranchMedia
);

router.delete('/:id/media/:mediaId', authorize('gymOwner'), deleteBranchMedia);

// Member routes
router.post('/:id/join', authorize('member'), joinBranch);
router.post('/:id/subscribe', authorize('member'), joinBranch);

// Member management
router.get('/:id/members', authorize('gymOwner', 'trainer'), getBranchMembers);
router.patch('/members/:memberId/activate', authorize('gymOwner'), activateMember);
router.patch('/members/:memberId/status', authorize('gymOwner'), updateMemberStatus);
router.get('/:id/stats', authorize('gymOwner'), getBranchStats);

export default router; 