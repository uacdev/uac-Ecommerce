import { Router } from 'express';
import * as statsController from '../controllers/statsController';

const router = Router();

router.get('/kpis', statsController.getKpis);
router.get('/sales-chart', statsController.getSalesChart);
router.get('/best-sellers', statsController.getBestSellers);
router.get('/customers', statsController.getCustomers);

export default router;
