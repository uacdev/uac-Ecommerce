import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

// Public — storefront reads
router.get('/', categoryController.getCategories);

// Admin only
router.get('/:id/stats', requireAdmin, categoryController.getCategoryStats);
router.post('/', requireAdmin, categoryController.createCategory);
router.put('/:id', requireAdmin, categoryController.updateCategory);
router.delete('/:id', requireAdmin, categoryController.deleteCategory);

export default router;
