import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { Order } from '../models/Order';

const checkoutAlertTitles = ['New order received', 'New customer'];

const notificationOrderReference = (notification: any) => {
    const metadataReference = notification.meta?.reference || notification.meta?.firstOrderRef;
    if (metadataReference) return String(metadataReference);
    return String(notification.description || '').match(/\bUAC-\d{4}-[A-Z0-9]+\b/i)?.[0] || '';
};

const filterUnpaidOpayAlerts = async (notifications: any[]) => {
    const references = Array.from(new Set(
        notifications
            .filter(notification => checkoutAlertTitles.includes(notification.title))
            .map(notificationOrderReference)
            .filter(Boolean)
    ));
    if (!references.length) return notifications;

    const orders = await Order.find({ reference: { $in: references } })
        .select('reference status paymentMethod')
        .lean();
    const ordersByReference = new Map(orders.map(order => [order.reference, order]));

    return notifications.filter(notification => {
        if (!checkoutAlertTitles.includes(notification.title)) return true;
        const order = ordersByReference.get(notificationOrderReference(notification));
        if (!order || String(order.paymentMethod || '').toLowerCase() !== 'opay') return true;

        if (notification.title === 'New order received') return false;
        return !['pending', 'cancelled'].includes(String(order.status || '').toLowerCase());
    });
};

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const limit = Math.min(parseInt(req.query.limit as string) || 25, 100);
        const onlyUnread = req.query.unread === 'true';
        const filter: Record<string, any> = {};
        if (onlyUnread) filter.isRead = false;

        const unreadAlertFilter = {
            isRead: false,
            title: { $in: checkoutAlertTitles }
        };
        const [items, otherUnreadCount, unreadAlerts] = await Promise.all([
            Notification.find(filter).sort({ date: -1 }).limit(Math.min(limit * 5, 500)),
            Notification.countDocuments({ isRead: false, title: { $nin: checkoutAlertTitles } }),
            Notification.find(unreadAlertFilter).select('title description meta').lean()
        ]);
        const visibleItems = await filterUnpaidOpayAlerts(items);
        const visibleUnreadAlerts = await filterUnpaidOpayAlerts(unreadAlerts);
        const unreadCount = otherUnreadCount + visibleUnreadAlerts.length;

        res.json({
            success: true,
            count: Math.min(visibleItems.length, limit),
            unreadCount,
            data: visibleItems.slice(0, limit).map(item => item.toJSON())
        });
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
