import express from 'express';
import {
  generateMemberQR,
  generateGymQR,
  purchaseCoins,
  useCoin,
  getUserCoinHistory,
  getGymCoinHistory,
  getAdminCoinData,
  simulateGymPayout
} from '../controllers/coinController.js';
import { authorize, protect } from '../middlewares/auth.js';

const router = express.Router();

// Generate QR codes
router.get('/qr/member/:memberId', protect, generateMemberQR);
router.get('/qr/gym/:gymId', protect, generateGymQR);

// Coin purchase and usage
router.post('/purchase', protect, authorize('member'), purchaseCoins);
router.post('/use', protect, authorize('member'), useCoin);
router.post('/scan', protect, useCoin); // Same endpoint as use but with different name

// History endpoints
router.get('/user/:userId', protect, getUserCoinHistory);
router.get('/gym/:gymId', protect, getGymCoinHistory);

// Admin endpoints
router.get('/admin/dashboard', protect, authorize('superadmin'), getAdminCoinData);
router.post('/admin/payout', protect, authorize('superadmin'), simulateGymPayout);

export default router; 