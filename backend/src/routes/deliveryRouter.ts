import { Router } from 'express';
import * as deliveryController from '../controllers/deliveryController';

const router = Router();

router.get('/zones', deliveryController.getDeliveryZones);
router.get('/states', deliveryController.getStates);

export default router;
