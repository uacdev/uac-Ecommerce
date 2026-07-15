import { Request, Response } from 'express';
import { Notification } from '../models/Notification';

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const limit = Math.min(parseInt(req.query.limit as string) || 25, 100);
        const onlyUnread = req.query.unread === 'true';
        const filter: Record<string, any> = {};
        if (onlyUnread) filter.isRead = false;

        const [items, unreadCount] = await Promise.all([
            Notification.find(filter).sort({ date: -1 }).limit(limit),
            Notification.countDocuments({ isRead: false })
        ]);

        res.json({ success: true, count: items.length, unreadCount, data: items });
    } catch (err: any) {
        console.error('Error in getNotifications:', err);
        res.status(500).json({ success: false, message: err.message || 'Error fetching notifications' });
    }
};

export const markRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updated = await Notification.findByIdAndUpdate(id, { isRead: true }, { returnDocument: 'after' });
        if (!updated) return res.status(404).json({ success: false, message: 'Notification not found' });
        res.json({ success: true, data: updated });
    } catch (err: any) {
        console.error('Error in markRead:', err);
        res.status(400).json({ success: false, message: err.message || 'Error marking as read' });
    }
};

export const markAllRead = async (_req: Request, res: Response) => {
    try {
        const r = await Notification.updateMany({ isRead: false }, { isRead: true });
        res.json({ success: true, modified: r.modifiedCount });
    } catch (err: any) {
        console.error('Error in markAllRead:', err);
        res.status(400).json({ success: false, message: err.message || 'Error marking all as read' });
    }
};
