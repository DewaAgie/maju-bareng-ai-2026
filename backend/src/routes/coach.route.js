import { Router } from 'express';
import * as coachController from '../controllers/coach.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/roleGuard.middleware.js';
import { upload, setUploadDir } from '../middleware/upload.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('GYM_ADMIN', 'SUPER_ADMIN'));

router.post('/', setUploadDir('coaches'), upload.single('avatar'), coachController.create);
router.get('/', coachController.getAll);
router.get('/:id', coachController.getById);
router.put('/:id', setUploadDir('coaches'), upload.single('avatar'), coachController.update);
router.delete('/:id', coachController.remove);

export default router;
