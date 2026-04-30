import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as customerAuthController from '../controllers/customerAuthController';
import { requireCustomer } from '../middlewares/requireCustomer';

const router = Router();

// 10 failed login attempts / 15 min, generous for typos but kills brute-force.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { success: false, message: 'Too many failed sign-in attempts. Try again in 15 minutes.' }
});

// 5 signups / hour from a single IP — stops bot signup floods.
const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many signups from this connection. Try again later.' }
});

// 5 forgot-password requests / 15 min from a single IP — stops email floods.
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many reset requests. Try again in 15 minutes.' }
});

// Public
router.post('/auth/signup', signupLimiter, customerAuthController.signup);
router.post('/auth/login', loginLimiter, customerAuthController.login);
router.post('/auth/forgot-password', forgotPasswordLimiter, customerAuthController.requestPasswordReset);
router.post('/auth/reset-password', customerAuthController.resetPassword);

// Customer-authenticated
router.get('/auth/me', requireCustomer, customerAuthController.me);
router.put('/auth/profile', requireCustomer, customerAuthController.updateProfile);
router.post('/auth/change-password', requireCustomer, customerAuthController.changePassword);
router.get('/orders', requireCustomer, customerAuthController.myOrders);

export default router;
