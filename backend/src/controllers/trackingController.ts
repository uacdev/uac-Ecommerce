import { Request, Response } from 'express';
import geoip from 'geoip-lite';
import { Visit } from '../models/Visit';
import { CheckoutSession } from '../models/CheckoutSession';
import { classifyReferrer } from '../lib/referrer';

const dayKey = (d: Date = new Date()) => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

// Pull the originating client IP. Express's req.ip already respects trust-proxy
// (set in app.ts), but we also fall through XFF in case a downstream proxy
// added headers we should peel.
const clientIp = (req: Request): string => {
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff.length > 0) {
        return xff.split(',')[0].trim();
    }
    return (req.ip || '').replace(/^::ffff:/, '');
};

// POST /api/track/visit  { visitorId, path?, referrer? }
// Idempotent per (visitorId, day) — a returning visitor on the same day is a no-op.
export const trackVisit = async (req: Request, res: Response) => {
    try {
        const { visitorId, path, referrer: refererBody } = req.body || {};
        if (!visitorId || typeof visitorId !== 'string') {
            return res.status(400).json({ success: false, message: 'visitorId is required' });
        }
        const ua = (req.headers['user-agent'] as string) || '';
        // Prefer client-supplied referrer (document.referrer), fall back to the
        // request header for environments where the JS hint can't see one.
        const referer = (typeof refererBody === 'string' && refererBody) ||
                        (req.headers.referer as string) ||
                        (req.headers.referrer as string) || '';
        const ip = clientIp(req);
        const geo = ip ? geoip.lookup(ip) : null;
        const ownHost = (req.headers.host as string) || '';
        const referrerSource = classifyReferrer(referer, ownHost);

        await Visit.updateOne(
            { visitorId, dateKey: dayKey() },
            {
                $setOnInsert: {
                    visitorId,
                    dateKey: dayKey(),
                    path: path || '',
                    userAgent: ua,
                    ip,
                    country: geo?.country || '',
                    countryCode: geo?.country || '',
                    region: geo?.region || '',
                    city: geo?.city || '',
                    referrer: referer || '',
                    referrerSource
                }
            },
            { upsert: true }
        );
        res.json({ success: true });
    } catch (err: any) {
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
