import { Router } from 'express';
import * as gymController from '../controllers/gym.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/roleGuard.middleware.js';
import { upload, setUploadDir } from '../middleware/upload.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('SUPER_ADMIN'));

router.post('/', setUploadDir('gyms'), upload.single('logo'), gymController.create);
router.get('/', gymController.getAll);
router.get('/:id', gymController.getById);
router.put('/:id', setUploadDir('gyms'), upload.single('logo'), gymController.update);
router.delete('/:id', gymController.remove);

export default router;
