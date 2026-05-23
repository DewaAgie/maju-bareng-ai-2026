import { Router } from 'express';
import * as classController from '../controllers/class.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/roleGuard.middleware.js';
import { upload, setUploadDir } from '../middleware/upload.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('GYM_ADMIN', 'SUPER_ADMIN'));

router.post('/', setUploadDir('classes'), upload.single('image'), classController.create);
router.get('/', classController.getAll);
router.get('/:id', classController.getById);
router.put('/:id', setUploadDir('classes'), upload.single('image'), classController.update);
router.delete('/:id', classController.remove);

export default router;
