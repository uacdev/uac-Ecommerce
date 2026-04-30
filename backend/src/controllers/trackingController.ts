import { Request, Response } from 'express';
import { Visit } from '../models/Visit';
import { CheckoutSession } from '../models/CheckoutSession';

const dayKey = (d: Date = new Date()) => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

// POST /api/track/visit  { visitorId, path? }
// Idempotent per (visitorId, day) — a returning visitor on the same day is a no-op.
export const trackVisit = async (req: Request, res: Response) => {
    try {
        const { visitorId, path } = req.body || {};
        if (!visitorId || typeof visitorId !== 'string') {
            return res.status(400).json({ success: false, message: 'visitorId is required' });
        }
        const ua = (req.headers['user-agent'] as string) || '';
        await Visit.updateOne(
            { visitorId, dateKey: dayKey() },
            { $setOnInsert: { visitorId, dateKey: dayKey(), path: path || '', userAgent: ua } },
            { upsert: true }
        );
        res.json({ success: true });
    } catch (err: any) {
        // duplicate key on the unique compound index just means we already counted them today
        if (err?.code === 11000) return res.json({ success: true });
        console.error('Error in trackVisit:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/track/checkout-start  { visitorId?, email? }  → { sessionId }
export const startCheckout = async (req: Request, res: Response) => {
    try {
        const { visitorId, email } = req.body || {};
        const session = await new CheckoutSession({
            visitorId: visitorId || '',
            email: email ? String(email).trim().toLowerCase() : '',
            startedAt: new Date()
        }).save();
        res.json({ success: true, sessionId: String(session._id) });
    } catch (err: any) {
        console.error('Error in startCheckout:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
