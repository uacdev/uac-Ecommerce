import { Router } from 'express';
import * as adminProfileController from '../controllers/adminProfileController';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.use(requireAdmin);

router.get('/profile', adminProfileController.getProfile);
router.put('/profile', adminProfileController.upsertProfile);

export default router;
