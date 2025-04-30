import express from 'express';
import { 
  checkIn, 
  checkOut, 
  getMyAttendanceHistory, 
  getAttendanceById,
  getGymAttendance,
  getAttendanceAnalytics,
  updateAttendance,
  deleteAttendance
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Member & Trainer routes
router.post('/check-in', protect, authorize('member', 'trainer'), checkIn);
router.post('/check-out', protect, authorize('member', 'trainer'), checkOut);
router.get('/history', protect, authorize('member', 'trainer'), getMyAttendanceHistory);

// GymOwner routes
router.get('/gym/:gymId', protect, authorize('gymOwner', 'Admin'), getGymAttendance);
router.get('/analytics/gym/:gymId', protect, authorize('gymOwner', 'Admin'), getAttendanceAnalytics);

// Common routes with appropriate authorization
router.route('/:id')
  .get(protect, getAttendanceById) // Authorization done in controller
  .put(protect, authorize('gymOwner', 'Admin'), updateAttendance)
  .delete(protect, authorize('gymOwner', 'Admin'), deleteAttendance);

export default router; 