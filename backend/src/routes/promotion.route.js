import { Router } from 'express';
import * as promotionController from '../controllers/promotion.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/roleGuard.middleware.js';
import { upload, setUploadDir } from '../middleware/upload.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('GYM_ADMIN', 'SUPER_ADMIN'));

router.post('/', setUploadDir('promotions'), upload.single('image'), promotionController.create);
router.get('/', promotionController.getAll);
router.get('/:id', promotionController.getById);
router.put('/:id', setUploadDir('promotions'), upload.single('image'), promotionController.update);
router.delete('/:id', promotionController.remove);

export default router;
