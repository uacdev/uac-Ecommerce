import { Router } from 'express';
import * as reviewController from '../controllers/reviewController';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

// Public — storefront read
router.get('/', reviewController.getReviews);

// Admin only
router.patch('/:id', requireAdmin, reviewController.updateReview);
router.delete('/:id', requireAdmin, reviewController.deleteReview);

export default router;
