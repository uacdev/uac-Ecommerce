import { Notification } from '../models/Notification';

type NotifyInput = {
    type: 'order' | 'review' | 'inventory' | 'customer' | 'system';
    title: string;
    description?: string;
    link?: string;
    meta?: Record<string, any>;
};

export const notify = async (input: NotifyInput) => {
    try {
        await Notification.create({
            type: input.type,
            title: input.title,
            description: input.description || '',
            link: input.link || '',
            meta: input.meta || {}
        });
    } catch (err) {
        console.error('Failed to create notification:', err);
    }
};
