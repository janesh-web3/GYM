import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  addProductRating,
  getProductRatings
} from '../controllers/productController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);
router.get('/:id/ratings', getProductRatings);

// Protected routes - SuperAdmin only
router.post('/', protect, authorize('superadmin'), createProduct);
router.put('/:id', protect, authorize('superadmin'), updateProduct);
router.delete('/:id', protect, authorize('superadmin'), deleteProduct);

// Protected routes - Members
router.post('/:id/ratings', protect, authorize('member'), addProductRating);

export default router; 