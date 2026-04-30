import { Request, Response, NextFunction } from 'express';
import { verifyCustomerToken } from '../lib/auth';
import { Customer } from '../models/Customer';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            customer?: { id: string; email: string };
        }
    }
}

export const requireCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;
        if (!token) return res.status(401).json({ success: false, message: 'Sign-in required' });

        const payload = verifyCustomerToken(token);
        const customer = await Customer.findById(payload.sub);
        if (!customer) return res.status(401).json({ success: false, message: 'Account no longer exists' });

        // Reject tokens issued before the most recent password change
        const issuedAtMs = (payload.iat || 0) * 1000;
        const lastChangeMs = customer.passwordChangedAt instanceof Date ? customer.passwordChangedAt.getTime() : 0;
        if (issuedAtMs + 1000 <= lastChangeMs) {
            return res.status(401).json({ success: false, message: 'Session is no longer valid' });
        }

        req.customer = { id: customer.id as string, email: customer.email };
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
