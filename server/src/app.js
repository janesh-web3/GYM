import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import gymRoutes from './routes/gymRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import trainerRoutes from './routes/trainerRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import workoutPlanRoutes from './routes/workoutPlanRoutes.js';
import dietPlanRoutes from './routes/dietPlanRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/workout-plans', workoutPlanRoutes);
app.use('/api/diet-plans', dietPlanRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', superAdminRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Gym Management API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app; 