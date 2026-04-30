import { Router } from 'express';
import * as statsController from '../controllers/statsController';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.use(requireAdmin);

router.get('/kpis', statsController.getKpis);
router.get('/sales-chart', statsController.getSalesChart);
router.get('/best-sellers', statsController.getBestSellers);
router.get('/customers', statsController.getCustomers);
router.get('/customers/:email/orders', statsController.getCustomerOrders);
router.get('/geography', statsController.getGeography);
router.get('/revenue-by-category', statsController.getRevenueByCategory);
router.get('/orders-by-hour', statsController.getOrdersByHour);
router.get('/status-funnel', statsController.getStatusFunnel);
router.get('/web-analytics', statsController.getWebAnalytics);

export default router;
