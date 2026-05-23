import { Router } from 'express';
import * as memberController from '../controllers/member.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/roleGuard.middleware.js';
import { upload, setUploadDir } from '../middleware/upload.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('GYM_ADMIN', 'SUPER_ADMIN'));

router.post('/', setUploadDir('members'), upload.single('avatar'), memberController.create);
router.get('/', memberController.getAll);
router.get('/:id', memberController.getById);
router.put('/:id', setUploadDir('members'), upload.single('avatar'), memberController.update);
router.delete('/:id', memberController.remove);
router.post('/:id/membership', memberController.assignMembership);

export default router;
