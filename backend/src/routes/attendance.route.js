import { Router } from 'express';
import * as attendanceController from '../controllers/attendance.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/roleGuard.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('GYM_ADMIN', 'SUPER_ADMIN'));

router.post('/check-in', attendanceController.checkIn);
router.get('/', attendanceController.getLogs);
router.get('/today', attendanceController.getToday);
router.get('/member/:memberId', attendanceController.getMemberAttendance);

export default router;
