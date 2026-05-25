import { Router } from 'express';
import express from 'express';
import * as paymentController from '../controllers/paymentController';

const router = Router();

// initiate and verify get their own express.json() because this router is mounted
// before the global express.json() in app.ts (required so webhook can use express.raw())
router.post('/initiate', express.json(), paymentController.initiatePayment);
router.post('/verify', express.json(), paymentController.verifyPayment);

// express.raw() captures the exact bytes OPay sent so we can verify the HMAC signature
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

export default router;
