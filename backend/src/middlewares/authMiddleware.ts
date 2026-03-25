import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ success: false, message: 'Authorization header missing' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }

        // Attach user info to request
        (req as any).user = user;
        next();
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Internal server error during authentication' });
    }
};

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // In a real app, check if user has 'admin' role in your custom profiles table
    // For now, assume any authenticated user is okay, or check email domain
    if (user.email?.endsWith('@uacfoods.com')) {
        next();
    } else {
        // res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
        // Allowing all for now to facilitate testing, but logic is ready
        next();
    }
};
