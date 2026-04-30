import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

// Public — customers create orders + pick delivery method post-checkout
router.post('/', orderController.createOrder);
router.patch('/:id/delivery-method', orderController.customerSelectDeliveryMethod);

// Admin only
router.get('/', requireAdmin, orderController.getOrders);
router.patch('/:id/status', requireAdmin, orderController.updateOrderStatus);
router.patch('/:id/delivery', requireAdmin, orderController.updateOrderDelivery);
router.delete('/:id', requireAdmin, orderController.deleteOrder);

export default router;
