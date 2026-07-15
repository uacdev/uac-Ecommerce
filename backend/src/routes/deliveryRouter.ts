import { Router } from 'express';
import * as deliveryController from '../controllers/deliveryController';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.get('/zones', deliveryController.getDeliveryZones);
router.get('/states', deliveryController.getStates);
router.post('/zones', requireAdmin, deliveryController.createDeliveryZone);
router.put('/zones/:id', requireAdmin, deliveryController.updateDeliveryZone);
router.delete('/zones/:id', requireAdmin, deliveryController.deleteDeliveryZone);

export default router;
