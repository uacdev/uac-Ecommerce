import { Router } from 'express';
import * as tracking from '../controllers/trackingController';

const router = Router();

// Both endpoints are public — the storefront calls them without auth.
router.post('/visit', tracking.trackVisit);
router.post('/checkout-start', tracking.startCheckout);

export default router;
