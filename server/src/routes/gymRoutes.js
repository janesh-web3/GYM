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
  deleteGymMedia,
  uploadLogo,
  uploadGymMedia
} from '../controllers/gymController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { gymUpload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getGyms);
router.get('/:id', getGym);

// Protected routes (need to be logged in)
router.use(protect);

// Routes restricted to admins only
router.put('/:id/status', authorize('admin'), updateGymStatus);

// Routes restricted to gym owners
router.post('/', authorize('gymOwner'), createGym);
router.put('/:id', authorize('gymOwner'), updateGym);
router.delete('/:id', authorize('gymOwner'), deleteGym);
router.get('/:id/stats', authorize('gymOwner', 'admin'), getGymStats);

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
    // Determine which middleware to use based on the media type
    const mediaType = req.query.type || req.body.type || 'photo';
    const uploadMiddleware = gymUpload.array('files', mediaType, 10);
    uploadMiddleware(req, res, next);
  },
  gymUpload.errorHandler,
  uploadGymMedia
);

router.delete('/:id/media/:mediaId', authorize('gymOwner'), deleteGymMedia);

export default router; 