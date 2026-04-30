import { Request, Response } from 'express';
import { Admin } from '../models/Admin';
import { signToken, signResetToken, verifyResetToken, comparePassword, hashPassword } from '../lib/auth';
import { sendPasswordResetEmail } from '../lib/email';

const normalizeEmail = (e: any): string => String(e || '').trim().toLowerCase();

export const login = async (req: Request, res: Response) => {
    try {
        const email = normalizeEmail(req.body.email);
        const password = String(req.body.password || '');
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        const admin = await Admin.findOne({ email }).select('+passwordHash');
        if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const ok = await comparePassword(password, admin.passwordHash);
        if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const token = signToken({ sub: admin.id as string, email: admin.email });
        // toJSON strips the passwordHash
        res.json({ success: true, token, admin: admin.toJSON() });
    } catch (err: any) {
        console.error('Error in login:', err);
        res.status(500).json({ success: false, message: err.message || 'Login failed' });
    }
};

export const me = async (req: Request, res: Response) => {
    try {
        const admin = await Admin.findById(req.user!.id);
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
        res.json({ success: true, admin });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message || 'Error fetching admin' });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const newPassword = String(req.body.newPassword || '');
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }
        const admin = await Admin.findById(req.user!.id).select('+passwordHash');
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

        // Optionally verify current password if provided
        if (req.body.currentPassword) {
            const ok = await comparePassword(String(req.body.currentPassword), admin.passwordHash);
            if (!ok) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        admin.passwordHash = await hashPassword(newPassword);
        admin.passwordChangedAt = new Date();
        await admin.save();
        res.json({ success: true, message: 'Password updated' });
    } catch (err: any) {
        console.error('Error in changePassword:', err);
        res.status(400).json({ success: false, message: err.message || 'Error changing password' });
    }
};

const RESET_TTL_MINUTES = 30;

const buildResetUrl = (token: string) => {
    const base = process.env.FRONTEND_URL
        || process.env.PUBLIC_BASE_URL?.replace(/4000$/, '5174')
        || 'http://localhost:5174';
    return `${base.replace(/\/$/, '')}/admin/reset-password?token=${encodeURIComponent(token)}`;
};

// Public. Always returns 200 with a generic message — never leaks whether an email exists.
export const requestPasswordReset = async (req: Request, res: Response) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        const admin = await Admin.findOne({ email });
        if (admin) {
            const token = signResetToken({ sub: admin.id as string, email: admin.email });
            const resetUrl = buildResetUrl(token);
            // Fire-and-don't-wait so we respond fast and don't leak timing.
            sendPasswordResetEmail({
                email: admin.email,
                fullName: admin.fullName,
                resetUrl,
                ttlMinutes: RESET_TTL_MINUTES
            }).catch(err => console.error('Reset email dispatch failed:', err));
        }

        // Always identical response.
        res.json({
            success: true,
            message: 'If that email is registered, a password reset link has been sent.'
        });
    } catch (err: any) {
        console.error('Error in requestPasswordReset:', err);
        res.status(500).json({ success: false, message: 'Error processing request' });
    }
};

// Public. Verifies the short-lived reset token and applies the new password.
// Tokens issued before the last password change are rejected (auto-invalidates after a successful reset).
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const token = String(req.body.token || '');
        const newPassword = String(req.body.newPassword || '');
        if (!token) return res.status(400).json({ success: false, message: 'Token is required' });
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }

        let payload;
        try {
            payload = verifyResetToken(token);
        } catch {
            return res.status(400).json({ success: false, message: 'This reset link is invalid or has expired' });
        }

        const admin = await Admin.findById(payload.sub).select('+passwordHash');
        if (!admin) return res.status(400).json({ success: false, message: 'This reset link is invalid' });

        // Reject tokens issued before the most recent password change
        const tokenIssuedAtMs = (payload.iat || 0) * 1000;
        const lastChange = admin.passwordChangedAt instanceof Date ? admin.passwordChangedAt.getTime() : 0;
        if (tokenIssuedAtMs < lastChange - 1000) {
            return res.status(400).json({ success: false, message: 'This reset link is no longer valid' });
        }

        admin.passwordHash = await hashPassword(newPassword);
        // Bump passwordChangedAt to at least 2s past this token's iat so
        // re-using the same token will be caught by the issuedAt-vs-passwordChangedAt check.
        const safeChangeAt = Math.max(Date.now(), tokenIssuedAtMs + 2000);
        admin.passwordChangedAt = new Date(safeChangeAt);
        await admin.save();

        res.json({ success: true, message: 'Password updated. You can now sign in.' });
    } catch (err: any) {
        console.error('Error in resetPassword:', err);
        res.status(400).json({ success: false, message: err.message || 'Error resetting password' });
    }
};

