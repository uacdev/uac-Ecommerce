import { Order } from '../models/Order';
import { sendShippedOrderReminderEmail } from './email';

const REMINDER_AFTER_MS = 60 * 60 * 1000;
const CLAIM_TIMEOUT_MS = 10 * 60 * 1000;
const BATCH_SIZE = 50;

export const processShippedOrderReminders = async (now = new Date()) => {
    const eligibleBefore = new Date(now.getTime() - REMINDER_AFTER_MS);
    const reclaimBefore = new Date(now.getTime() - CLAIM_TIMEOUT_MS);
    const candidates = await Order.find({
        status: 'shipped',
        completionReminderSentAt: null,
        $or: [
            { shippedAt: { $lte: eligibleBefore } },
            { shippedAt: null, updated_at: { $lte: eligibleBefore } }
        ]
    }).select('_id shippedAt updated_at').limit(BATCH_SIZE).lean();

    for (const candidate of candidates) {
        const order = await Order.findOneAndUpdate(
            {
                _id: candidate._id,
                status: 'shipped',
                completionReminderSentAt: null,
                $and: [
                    {
                        $or: [
                            { shippedAt: { $lte: eligibleBefore } },
                            { shippedAt: null, updated_at: { $lte: eligibleBefore } }
                        ]
                    },
                    {
                        $or: [
                            { completionReminderClaimedAt: null },
                            { completionReminderClaimedAt: { $exists: false } },
                            { completionReminderClaimedAt: { $lt: reclaimBefore } }
                        ]
                    }
                ]
            },
            { $set: { completionReminderClaimedAt: now } },
            { returnDocument: 'after' }
        );
        if (!order) continue;

        const sent = await sendShippedOrderReminderEmail({
            reference: order.reference,
            buyerName: order.buyerName,
            buyerEmail: order.buyerEmail,
            shippedAt: candidate.shippedAt || candidate.updated_at || order.date
        });

        if (sent) {
            await Order.updateOne(
                { _id: order._id, completionReminderClaimedAt: now },
                { $set: { completionReminderSentAt: new Date() }, $unset: { completionReminderClaimedAt: 1 } }
            );
        } else {
            await Order.updateOne(
                { _id: order._id, completionReminderClaimedAt: now },
                { $unset: { completionReminderClaimedAt: 1 } }
            );
        }
    }
};

export const startShippedOrderReminderScheduler = () => {
    const run = () => processShippedOrderReminders().catch(err => console.error('Shipped-order reminder check failed:', err));
    void run();
    const timer = setInterval(run, 60 * 1000);
    timer.unref();
    return timer;
};
