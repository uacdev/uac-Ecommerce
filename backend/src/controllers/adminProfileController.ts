import { Request, Response } from 'express';
import { Admin } from '../models/Admin';

const normalizeEmail = (e: any): string => String(e || '').trim().toLowerCase();

export const getProfile = async (req: Request, res: Response) => {
    try {
        // Prefer the authenticated user from JWT; fall back to ?email= for back-compat.
        const email = normalizeEmail((req as any).user?.email || req.query.email);
        if (!email) return res.status(400).json({ success: false, message: 'email is required' });

        const profile = await Admin.findOne({ email });
        if (!profile) return res.status(404).json({ success: false, message: 'Admin not found' });
        res.json({ success: true, data: profile });
    } catch (err: any) {
        console.error('Error in getProfile:', err);
        res.status(500).json({ success: false, message: err.message || 'Error fetching profile' });
    }
};

export const upsertProfile = async (req: Request, res: Response) => {
    try {
        const email = normalizeEmail((req as any).user?.email || req.body.email);
        if (!email) return res.status(400).json({ success: false, message: 'email is required' });

        const updates: Record<string, any> = {};
        if (req.body.fullName !== undefined) updates.fullName = String(req.body.fullName).trim();
        if (req.body.photo !== undefined) updates.photo = String(req.body.photo).trim();
        if (req.body.role !== undefined) updates.role = String(req.body.role).trim();

        const profile = await Admin.findOneAndUpdate(
            { email },
            { $set: updates },
            { returnDocument: 'after', runValidators: true }
        );
        if (!profile) return res.status(404).json({ success: false, message: 'Admin not found' });
        res.json({ success: true, data: profile });
    } catch (err: any) {
        console.error('Error in upsertProfile:', err);
        res.status(400).json({ success: false, message: err.message || 'Error updating profile' });
    }
};
