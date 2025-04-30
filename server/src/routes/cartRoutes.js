import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All cart routes require authentication and Member role
router.use(protect);
router.use(authorize('member'));

router.route('/')
  .get(getCart)
  .delete(clearCart);

router.post('/items', addToCart);

router.route('/items/:productId')
  .put(updateCartItem)
  .delete(removeFromCart);

export default router; 