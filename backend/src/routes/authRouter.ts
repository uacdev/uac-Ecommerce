import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/authController';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

// 10 failed attempts per 15 min from a single IP. Successful logins don't count.
// Generous enough for typos; still kills any brute-force attack instantly.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { success: false, message: 'Too many failed login attempts. Try again in 15 minutes.' }
});

// Tighter limit on forgot-password: stops abuse of the email-sending side channel.
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many reset requests. Try again in 15 minutes.' }
});

router.post('/login', loginLimiter, authController.login);
router.get('/me', requireAdmin, authController.me);
router.post('/change-password', requireAdmin, authController.changePassword);
router.post('/forgot-password', forgotPasswordLimiter, authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

export default router;
