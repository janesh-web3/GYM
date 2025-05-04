import express from 'express';
import { 
  getRevenueReports,
  getGymPerformanceReports,
  getProductReports,
  getGyms,
  updateGymStatusByAdmin,
  getAdminStats
} from '../controllers/superAdminController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All superadmin routes require authentication and superadmin role
router.use(protect, authorize('superadmin'));

// Reports
router.get('/reports/revenue', getRevenueReports);
router.get('/reports/gyms', getGymPerformanceReports);
router.get('/reports/products', getProductReports);

// Gyms management
router.get('/gyms', getGyms);
router.put('/gyms/:id/status', updateGymStatusByAdmin);

// Dashboard stats
router.get('/stats', getAdminStats);

export default router; 