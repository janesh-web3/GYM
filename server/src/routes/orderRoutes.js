import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders
} from '../controllers/orderController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Member routes
router.post('/', protect, authorize('member'), createOrder);
router.get('/', protect, authorize('member'), getUserOrders);
router.put('/:id/cancel', protect, authorize('member', 'superadmin'), cancelOrder);

// Admin routes
router.get('/admin', protect, authorize('superadmin'), getAllOrders);
router.put('/:id/status', protect, authorize('superadmin'), updateOrderStatus);

// Common routes with authorization logic in the controller
router.get('/:id', protect, getOrderById);

export default router; 