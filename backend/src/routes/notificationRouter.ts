import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.use(requireAdmin);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);

export default router;
