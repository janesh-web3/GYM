import express from 'express';
import {
  getAllGyms,
  updateGymStatus,
  getAllUsers,
  updateUserStatus,
  getDashboardStats,
  getRevenueReports,
  getGymPerformanceReports,
  getProductReports
} from '../controllers/superAdminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply middleware to all routes - require SuperAdmin role
router.use(protect);
router.use(authorize('superadmin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Gyms management
router.get('/gyms', getAllGyms);
router.put('/gyms/:id/status', updateGymStatus);

// Users management
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);

// Reports
router.get('/reports/revenue', getRevenueReports);
router.get('/reports/gyms', getGymPerformanceReports);
router.get('/reports/products', getProductReports);

export default router; 