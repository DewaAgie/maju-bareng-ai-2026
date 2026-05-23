import { Router } from 'express';
import * as planController from '../controllers/membershipPlan.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/roleGuard.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('GYM_ADMIN', 'SUPER_ADMIN'));

router.post('/', planController.create);
router.get('/', planController.getAll);
router.get('/:id', planController.getById);
router.put('/:id', planController.update);
router.delete('/:id', planController.remove);

export default router;
