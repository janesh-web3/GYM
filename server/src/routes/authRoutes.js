import express from 'express';
import { signup, login, getMe, updateSubscription } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/update-subscription', protect, updateSubscription);

export default router; 