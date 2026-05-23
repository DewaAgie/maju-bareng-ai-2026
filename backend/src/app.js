import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import env from './config/env.js';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.route.js';
import gymRoutes from './routes/gym.route.js';
import coachRoutes from './routes/coach.route.js';
import facilityRoutes from './routes/facility.route.js';
import classRoutes from './routes/class.route.js';
import scheduleRoutes from './routes/schedule.route.js';
import memberRoutes from './routes/member.route.js';
import attendanceRoutes from './routes/attendance.route.js';
import membershipPlanRoutes from './routes/membershipPlan.route.js';
import promotionRoutes from './routes/promotion.route.js';
import dashboardRoutes from './routes/dashboard.route.js';
import chatbotRoutes from './routes/chatbot.route.js';
import publicRoutes from './routes/public.route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Middleware ──────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── API Routes ─────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/gyms', gymRoutes);
app.use('/api/v1/coaches', coachRoutes);
app.use('/api/v1/facilities', facilityRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/membership-plans', membershipPlanRoutes);
app.use('/api/v1/promotions', promotionRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/chatbot', chatbotRoutes);
app.use('/api/v1/public', publicRoutes);

// ─── Health Check ───────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'GymCore API is running', timestamp: new Date().toISOString() });
});

// ─── Error Handler ──────────────────────────────────
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`
  🏋️  GymCore API Server
  ──────────────────────
  🚀 Running on:  http://localhost:${env.PORT}
  📡 API Base:    http://localhost:${env.PORT}/api/v1
  🌐 Frontend:   ${env.FRONTEND_URL}
  ──────────────────────
  `);
});

export default app;
