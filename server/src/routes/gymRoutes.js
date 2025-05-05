import express from 'express';
import { 
  createGym, 
  getGyms, 
  getGym, 
  updateGym, 
  deleteGym, 
  updateGymStatus,
  getGymStats,
  uploadPhotos,
  uploadVideos,
  uploadLogo,
  getActiveGyms,
  joinGym,
  checkMembershipStatus,
  getUserGymMemberships,
  getFeaturedGyms,
  toggleFeaturedStatus,
  getGymMembers,
  uploadMedia,
  deleteMedia,
  updateMediaCaption,
  getGymBranches,
  getGymWithBranches,
  approveGym,
  activateMember,
  updateMemberStatus
} from '../controllers/gymController.js';
import { 
  getGymSubscriptionPlans,
  getSubscriptionStats 
} from '../controllers/subscriptionController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { gymUpload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getGyms);
router.get('/active', getActiveGyms);
router.get('/featured', getFeaturedGyms);
router.get('/:id', getGymWithBranches);
router.get('/:gymId/branches', getGymBranches);
router.get('/:gymId/subscription-plans', getGymSubscriptionPlans);

// Protected routes (need to be logged in)
router.use(protect);

// Routes for gym membership
router.get('/:id/membership-status', checkMembershipStatus);
router.post('/:id/join', authorize('member'), joinGym);
router.get('/memberships', getUserGymMemberships);
router.get('/:id/members', authorize('gymOwner'), getGymMembers);
router.patch('/members/:memberId/activate', authorize('gymOwner'), activateMember);
router.patch('/members/:memberId/status', authorize('gymOwner'), updateMemberStatus);

// Routes restricted to superadmins only
router.patch('/:id/featured', authorize('superadmin'), toggleFeaturedStatus);

// Routes restricted to admins only
router.put('/:id/status', authorize('superadmin'), updateGymStatus);

// Routes restricted to gym owners
router.post('/', authorize('gymOwner'), createGym);
router.put('/:id', authorize('gymOwner'), updateGym);
router.delete('/:id', authorize('gymOwner'), deleteGym);
router.get('/:id/stats', authorize('gymOwner'), getGymStats);
router.get('/:gymId/subscriptions/stats', authorize('gymOwner'), getSubscriptionStats);

// Media routes with enhanced upload middleware
router.post(
  '/:id/logo', 
  authorize('gymOwner'), 
  gymUpload.single('logo', 'logo'), 
  gymUpload.errorHandler,
  uploadLogo
);

router.post(
  '/:id/media/upload',
  authorize('gymOwner'),
  (req, res, next) => {
    const mediaType = req.query.type || 'photo';
    gymUpload.array('files', mediaType, 10)(req, res, (err) => {
      if (err) {
        return gymUpload.errorHandler(err, req, res, next);
      }
      next();
    });
  },
  uploadMedia
);

router.route('/:id/media/:mediaId')
  .delete(authorize('gymOwner'), deleteMedia)
  .patch(authorize('gymOwner'), updateMediaCaption);

// Admin only routes
router.patch('/:id/approve', authorize('superadmin'), approveGym);

export default router; 