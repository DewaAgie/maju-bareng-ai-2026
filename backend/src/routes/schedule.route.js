import { Router } from 'express';
import * as scheduleController from '../controllers/schedule.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/roleGuard.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('GYM_ADMIN', 'SUPER_ADMIN'));

router.post('/', scheduleController.create);
router.get('/', scheduleController.getAll);
router.get('/weekly', scheduleController.getWeekly);
router.get('/:id', scheduleController.getById);
router.put('/:id', scheduleController.update);
router.delete('/:id', scheduleController.remove);

export default router;
