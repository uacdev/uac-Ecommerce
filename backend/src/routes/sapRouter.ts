import { Router } from 'express';
import * as sapController from '../controllers/sapController';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.post('/payment-callback', sapController.handlePaymentCallback);
router.get('/connection-check', requireAdmin, sapController.connectionCheck);

export default router;
