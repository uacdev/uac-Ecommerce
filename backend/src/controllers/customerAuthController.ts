import { Request, Response } from 'express';
import { Customer } from '../models/Customer';
import { Order } from '../models/Order';
import { signCustomerToken, signCustomerResetToken, verifyCustomerResetToken, comparePassword, hashPassword } from '../lib/auth';
import { isNigerianState } from '../data/nigerianStates';
import { notify } from '../lib/notify';
import { sendPasswordResetEmail } from '../lib/email';

const normalizeEmail = (e: any): string => String(e || '').trim().toLowerCase();
const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export const signup = async (req: Request, res: Response) => {
    try {
        const email = normalizeEmail(req.body.email);
        const password = String(req.body.password || '');
        const fullName = String(req.body.fullName || '').trim();
        const phone = String(req.body.phone || '').trim();

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'A valid email is required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }
        if (!fullName) {
            return res.status(400).json({ success: false, message: 'Full name is required' });
        }

        const existing = await Customer.findOne({ email });
        if (existing) {
            return res.status(409).json({ success: false, message: 'An account with that email already exists. Sign in instead.' });
        }

        const passwordHash = await hashPassword(password);
        const customer = await new Customer({ email, passwordHash, fullName, phone }).save();

        const token = signCustomerToken({ sub: customer.id as string, email: customer.email });

        notify({
            type: 'customer',
            title: 'New customer signup',
            description: `${fullName} · ${email}`,
            meta: { email, name: fullName, source: 'signup' }
        });

        res.status(201).json({ success: true, token, customer: customer.toJSON() });
    } catch (err: any) {
        if (err?.code === 11000) {
            return res.status(409).json({ success: false, message: 'An account with that email already exists.' });
        }
        console.error('Error in customer signup:', err);
        res.status(500).json({ success: false, message: err.message || 'Signup failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const email = normalizeEmail(req.body.email);
        const password = String(req.body.password || '');
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        const customer = await Customer.findOne({ email }).select('+passwordHash');
        if (!customer) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        const ok = await comparePassword(password, customer.passwordHash);
        if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const token = signCustomerToken({ sub: customer.id as string, email: customer.email });
        res.json({ success: true, token, customer: customer.toJSON() });
    } catch (err: any) {
        console.error('Error in customer login:', err);
        res.status(500).json({ success: false, message: err.message || 'Login failed' });
    }
};

export const me = async (req: Request, res: Response) => {
    try {
        const customer = await Customer.findById(req.customer!.id);
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
        res.json({ success: true, customer });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message || 'Error fetching account' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const updates: Record<string, any> = {};
        if (req.body.fullName !== undefined) updates.fullName = String(req.body.fullName).trim();
        if (req.body.phone !== undefined) updates.phone = String(req.body.phone).trim();
        if (req.body.defaultAddress !== undefined) updates.defaultAddress = String(req.body.defaultAddress).trim();
        if (req.body.defaultState !== undefined) {
            const s = String(req.body.defaultState).trim();
            if (s && !isNigerianState(s)) {
                return res.status(400).json({ success: false, message: 'defaultState must be a valid Nigerian state' });
            }
            updates.defaultState = s;
        }
        const customer = await Customer.findByIdAndUpdate(req.customer!.id, updates, { new: true });
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
        res.json({ success: true, customer });
    } catch (err: any) {
        console.error('Error in updateProfile:', err);
        res.status(400).json({ success: false, message: err.message || 'Error updating profile' });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const newPassword = String(req.body.newPassword || '');
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }
        const customer = await Customer.findById(req.customer!.id).select('+passwordHash');
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

        if (req.body.currentPassword) {
            const ok = await comparePassword(String(req.body.currentPassword), customer.passwordHash);
            if (!ok) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        customer.passwordHash = await hashPassword(newPassword);
        customer.passwordChangedAt = new Date();
        await customer.save();
        res.json({ success: true, message: 'Password updated' });
    } catch (err: any) {
        console.error('Error in customer changePassword:', err);
        res.status(400).json({ success: false, message: err.message || 'Error changing password' });
    }
};

const RESET_TTL_MINUTES = 30;

const buildCustomerResetUrl = (token: string) => {
    const base = process.env.FRONTEND_URL || 'http://localhost:5180';
    return `${base.replace(/\/$/, '')}/account/reset-password?token=${encodeURIComponent(token)}`;
};

// Public. Always returns 200 with a generic message — never leaks whether an email exists.
export const requestPasswordReset = async (req: Request, res: Response) => {
    try {
        const email = normalizeEmail(req.body.email);
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        const customer = await Customer.findOne({ email });
        if (customer) {
            const token = signCustomerResetToken({ sub: customer.id as string, email: customer.email });
            sendPasswordResetEmail({
                email: customer.email,
                fullName: customer.fullName,
                resetUrl: buildCustomerResetUrl(token),
                ttlMinutes: RESET_TTL_MINUTES
            }).catch(err => console.error('Customer reset email dispatch failed:', err));
        }
        // Identical response either way.
        res.json({
            success: true,
            message: 'If that email is registered, a password reset link has been sent.'
        });
    } catch (err: any) {
        console.error('Error in customer requestPasswordReset:', err);
        res.status(500).json({ success: false, message: 'Error processing request' });
    }
};

// Public. Verifies short-lived reset token (purpose-locked) and applies new password.
// Tokens issued before passwordChangedAt are rejected, so re-using a consumed token fails.
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const token = String(req.body.token || '');
        const newPassword = String(req.body.newPassword || '');
        if (!token) return res.status(400).json({ success: false, message: 'Token is required' });
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }

        let payload;
        try { payload = verifyCustomerResetToken(token); }
        catch { return res.status(400).json({ success: false, message: 'This reset link is invalid or has expired' }); }

        const customer = await Customer.findById(payload.sub).select('+passwordHash');
        if (!customer) return res.status(400).json({ success: false, message: 'This reset link is invalid' });

        const tokenIssuedAtMs = (payload.iat || 0) * 1000;
        const lastChange = customer.passwordChangedAt instanceof Date ? customer.passwordChangedAt.getTime() : 0;
        if (tokenIssuedAtMs + 1000 < lastChange) {
            return res.status(400).json({ success: false, message: 'This reset link is no longer valid' });
        }

        customer.passwordHash = await hashPassword(newPassword);
        const safeChangeAt = Math.max(Date.now(), tokenIssuedAtMs + 2000);
        customer.passwordChangedAt = new Date(safeChangeAt);
        await customer.save();

        res.json({ success: true, message: 'Password updated. You can now sign in.' });
    } catch (err: any) {
        console.error('Error in customer resetPassword:', err);
        res.status(400).json({ success: false, message: err.message || 'Error resetting password' });
    }
};

// Order history for the signed-in customer.
// Matches by customer.email — picks up guest orders placed under the same email before signup.
export const myOrders = async (req: Request, res: Response) => {
    try {
        const email = req.customer!.email.toLowerCase();
        const orders = await Order.find({ buyerEmail: email }).sort({ date: -1 });

        const summary = {
            totalOrders: orders.length,
            ongoingOrders: orders.filter(o => ['pending', 'paid', 'confirmed', 'shipped'].includes(o.status as string)).length,
            completedOrders: orders.filter(o => ['delivered', 'completed'].includes(o.status as string)).length,
            totalSpend: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.amount || 0), 0)
        };

        res.json({ success: true, summary, orders });
    } catch (err: any) {
        console.error('Error in myOrders:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
