import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/auth';
import { Admin } from '../models/Admin';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: { id: string; email: string };
        }
    }
}

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;
        if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });

        const payload = verifyToken(token);
        const admin = await Admin.findById(payload.sub);
        if (!admin) return res.status(401).json({ success: false, message: 'Admin no longer exists' });

        req.user = { id: admin.id as string, email: admin.email };
        next();
    } catch (err: any) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
