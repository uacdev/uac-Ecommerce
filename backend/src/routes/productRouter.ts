import { Router } from 'express';
import * as productController from '../controllers/productController';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

// Public — storefront reads
router.get('/', productController.getProducts);
router.post('/:id/notify-when-restocked', productController.subscribeRestock);

// Admin only
router.get('/sales-summary', requireAdmin, productController.getProductsSalesSummary);
router.get('/:id/stats', requireAdmin, productController.getProductStats);

// Admin only
router.post('/', requireAdmin, productController.createProduct);
router.put('/:id', requireAdmin, productController.updateProduct);
router.patch('/:id/stock', requireAdmin, productController.updateProduct);
router.delete('/:id', requireAdmin, productController.deleteProduct);

export default router;
