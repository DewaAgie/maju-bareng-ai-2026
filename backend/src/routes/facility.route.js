import { Router } from 'express';
import * as facilityController from '../controllers/facility.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/roleGuard.middleware.js';
import { upload, setUploadDir } from '../middleware/upload.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('GYM_ADMIN', 'SUPER_ADMIN'));

router.post('/', setUploadDir('facilities'), upload.single('image'), facilityController.create);
router.get('/', facilityController.getAll);
router.get('/:id', facilityController.getById);
router.put('/:id', setUploadDir('facilities'), upload.single('image'), facilityController.update);
router.delete('/:id', facilityController.remove);

export default router;
