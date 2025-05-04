import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUser,
  deleteUser,
  updateUser,
  updateUserStatus
} from '../controllers/userController.js';
import { getUserSubscriptions } from '../controllers/subscriptionController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public routes for authentication
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/subscriptions', getUserSubscriptions);

// Admin only routes
router.use(authorize('admin', 'superadmin'));
router.get('/', getUsers);
router.get('/:id', getUser);
router.delete('/:id', deleteUser);
router.put('/:id', updateUser);
router.patch('/:id/status', updateUserStatus);

export default router; 