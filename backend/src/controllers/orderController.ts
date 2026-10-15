import { Request, Response } from 'express';
import { Order, ORDER_STATUSES, DELIVERY_METHODS } from '../models/Order';
import { Notification } from '../models/Notification';
import { Product } from '../models/Product';
import { DeliveryZone } from '../models/DeliveryZone';
import { isNigerianState } from '../data/nigerianStates';
import { sendOrderEmails, sendBackInStockEmails, sendPickupOrderReceivedEmail, sendPickupReminderEmail, sendPaymentConfirmationEmail, sendOrderStatusEmail } from '../lib/email';
import { notify } from '../lib/notify';
import { StockSubscription } from '../models/StockSubscription';
import { CheckoutSession } from '../models/CheckoutSession';
import { loadCheckoutPolicy, type CheckoutPolicy } from '../lib/checkoutPolicy';
import mongoose from 'mongoose';

const resolveZoneByName = async (name?: string) => {
    if (!name || !String(name).trim()) return null;
    return DeliveryZone.findOne({ name: new RegExp(`^${String(name).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
};

const COMMISSION_RATE = 0.10;
const ORDER_TIME_ZONE = 'Africa/Lagos';

const getOrderWindowMessage = (policy: CheckoutPolicy, date = new Date()) => {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: ORDER_TIME_ZONE,
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    const weekday = values.weekday.toLowerCase();
    const minuteOfDay = Number(values.hour) * 60 + Number(values.minute);
    const [openHour, openMinute] = policy.opensAt.split(':').map(Number);
    const [closeHour, closeMinute] = policy.closesAt.split(':').map(Number);
    const opensAt = openHour * 60 + openMinute;
    const closesAt = closeHour * 60 + closeMinute;

    if (!policy.weekdays.includes(weekday) || minuteOfDay < opensAt || minuteOfDay >= closesAt) {
        return `Orders are available ${policy.weekdays.join(', ')} from ${policy.opensAt} to ${policy.closesAt} WAT.`;
    }
    return '';
};

const resolvePickupLocation = async (items: any[] = []) => {
    const ids = Array.from(new Set((items || []).map((it: any) => String(it.productId || it.id || '')).filter(Boolean)));
    if (!ids.length) return 'UAC Foods pickup point';

    const products = await Product.find({ _id: { $in: ids } }, { location: 1, name: 1 });
    const locations = Array.from(new Set(products.map(p => String(p.location || '')).filter(Boolean)));
    return locations.length ? locations.join(', ') : 'UAC Foods pickup point';
};

const maybeSendPickupReceivedEmail = async (order: any) => {
    if (!order || String(order.fulfillmentType || '').toLowerCase() !== 'pickup') return;
    if (String(order.status || '').toLowerCase() !== 'paid') return;

    const pickupLocation = await resolvePickupLocation(order.items || []);
    sendPickupOrderReceivedEmail({
        reference: order.reference,
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail,
        buyerPhone: order.buyerPhone,
        items: order.items as any,
        productAmount: order.productAmount,
        amount: order.amount,
        pickupLocation,
        pickupCode: order.pickupCode || '',
        pickupType: order.pickupType || 'self',
        dispatchAddress: order.dispatchAddress || '',
        dispatchPhone: order.dispatchPhone || '',
        pickupDeadlineAt: order.pickupDeadlineAt || null
    }).catch(err => console.error('Pickup received email dispatch failed:', err));
};

const maybeSendPaymentConfirmationEmail = async (order: any) => {
    if (!order) return false;
    if (!order.buyerEmail) return false;

    const pickupLocation = String(order.fulfillmentType || '').toLowerCase() === 'pickup'
        ? await resolvePickupLocation(order.items || [])
        : '';

    try {
        return await sendPaymentConfirmationEmail({
            reference: order.reference,
            buyerName: order.buyerName,
            buyerEmail: order.buyerEmail,
            buyerPhone: order.buyerPhone,
            items: order.items as any,
            productAmount: order.productAmount,
            amount: order.amount,
            pickupLocation,
            pickupCode: order.pickupCode || '',
            buyerAddress: order.buyerAddress || '',
            deliveryZone: order.deliveryZone || '',
            fulfillmentType: order.fulfillmentType || 'delivery',
            pickupType: order.pickupType || 'self',
            dispatchAddress: order.dispatchAddress || '',
            dispatchPhone: order.dispatchPhone || '',
            pickupDeadlineAt: order.pickupDeadlineAt || null
        });
    } catch (err) {
        console.error('Payment confirmation email dispatch failed:', err);
        return false;
    }
};

const generateReference = () =>
    `UAC-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

const generatePickupCode = () =>
    `UAC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

// Restore stock for a list of items previously decremented. Used both as a rollback
// when a multi-item order fails partway, and when an admin deletes/cancels an order.
const rollbackStock = async (entries: { productId: string; quantity: number }[]) => {
    for (const e of entries) {
        try {
            await Product.findByIdAndUpdate(e.productId, { $inc: { stockCount: e.quantity } });
        } catch (err) {
            console.error('Stock rollback failed for', e.productId, err);
        }
    }
};

// When an order is deleted/cancelled, give the units back. If a product was previously
// out_of_stock and now has stock, flip status back and fire the restock-subscriber emails.
const restoreOrderStock = async (orderItems: any[]) => {
    for (const it of orderItems) {
        const pid = String(it.productId);
        const qty = Number(it.quantity || 0);
        if (!pid || qty <= 0) continue;
        const updated = await Product.findByIdAndUpdate(
            pid,
            { $inc: { stockCount: qty } },
            { returnDocument: 'after' }
        );
        if (!updated) continue;
        // If it was out, and now has stock, flip status and fire restock emails
        if (updated.stockCount > 0 && updated.status === 'out_of_stock') {
            updated.status = 'available';
            await updated.save();
            // Fire any pending back-in-stock subscribers (mirrors productController.subscribeRestock flow)
            const subs = await StockSubscription.find({ productId: updated._id, notifiedAt: null });
            if (subs.length > 0) {
                const emails = subs.map(s => s.email);
                sendBackInStockEmails({ productId: String(updated._id), productName: updated.name as string, emails })
                    .catch(err => console.error('Restock email dispatch failed:', err));
                await StockSubscription.updateMany(
                    { _id: { $in: subs.map(s => s._id) } },
                    { $set: { notifiedAt: new Date() } }
                );
                notify({
                    type: 'inventory',
                    title: 'Back-in-stock emails sent',
                    description: `${updated.name} · ${emails.length} subscriber${emails.length === 1 ? '' : 's'}`,
                    meta: { productId: String(updated._id), count: emails.length }
                });
            }
        }
    }
};

export const getOrders = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 25));
        const status = (req.query.status as string) || '';
        const q = ((req.query.q as string) || '').trim();

        const filter: Record<string, any> = {};
        if (status && status !== 'all' && ORDER_STATUSES.includes(status as any)) {
            filter.status = status;
        }
        if (req.query.excludeAwaitingPayment === 'true') {
            filter.$nor = [{ status: 'pending', paymentMethod: { $regex: /^opay$/i } }];
        }
        if (q) {
            const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [
                { reference: rx },
                { buyerName: rx },
                { buyerEmail: rx },
                { buyerPhone: rx }
            ];
        }

        const [data, total] = await Promise.all([
            Order.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(limit),
            Order.countDocuments(filter)
        ]);

        res.json({
            success: true,
            count: data.length,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit))
            }
        });
    } catch (err: any) {
        console.error('Error in getOrders:', err);
        res.status(500).json({ success: false, message: err.message || 'Error fetching orders' });
    }
};

export const createOrder = async (req: Request, res: Response) => {
    try {
        const {
            items, buyerName, buyerEmail, buyerPhone, buyerAddress, buyerState,
            deliveryZone, paymentMethod, fulfillmentType, pickupType, pickupWindowAccepted,
            dispatchAddress, dispatchPhone, checkoutSessionId
        } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'items must contain at least one product' });
        }
        const checkoutPolicy = await loadCheckoutPolicy();
        const orderWindowMessage = getOrderWindowMessage(checkoutPolicy);
        if (orderWindowMessage) {
            return res.status(403).json({ success: false, message: orderWindowMessage });
        }
        const isOpay = String(paymentMethod || '').toLowerCase() === 'opay';
        const fulfillment = String(fulfillmentType || 'delivery').trim();
        const pickupArrangement = String(pickupType || 'self').trim();
        const isDelivery = fulfillment === 'delivery';
        const address = String(buyerAddress || '').trim();
        const normalizedState = String(buyerState || '').trim();

        if (!['pickup', 'delivery'].includes(fulfillment)) {
            return res.status(400).json({ success: false, message: 'fulfillmentType must be pickup or delivery' });
        }
        if (!['self', 'dispatch'].includes(pickupArrangement)) {
            return res.status(400).json({ success: false, message: 'pickupType must be self or dispatch' });
        }
        if (isDelivery && !checkoutPolicy.platformDeliveryEnabled) {
            return res.status(400).json({ success: false, message: 'Platform delivery is currently unavailable' });
        }
        if (fulfillment === 'pickup' && pickupArrangement === 'self' && !checkoutPolicy.selfPickupEnabled) {
            return res.status(400).json({ success: false, message: 'Self pickup is currently unavailable' });
        }
        if (fulfillment === 'pickup' && pickupArrangement === 'dispatch' && !checkoutPolicy.dispatchEnabled) {
            return res.status(400).json({ success: false, message: 'Dispatch rider pickup is currently unavailable' });
        }

        if (isDelivery) {
            if (!buyerName || !buyerEmail || !buyerPhone || !address) {
                return res.status(400).json({ success: false, message: 'buyerName, buyerEmail, buyerPhone and buyerAddress are required for delivery orders' });
            }
        } else {
            // pickup: require name, email, phone only
            if (!buyerName || !buyerEmail || !buyerPhone) {
                return res.status(400).json({ success: false, message: 'buyerName, buyerEmail and buyerPhone are required for pickup orders' });
            }
            if (pickupWindowAccepted !== true) {
                return res.status(400).json({
                    success: false,
                    message: `Confirm that you understand your order will be ready for pickup within ${checkoutPolicy.pickupWindowMinutes} minutes after payment confirmation`
                });
            }
            if (pickupArrangement === 'dispatch') {
                const normalizedDispatchAddress = String(dispatchAddress || '').trim();
                const normalizedDispatchPhone = String(dispatchPhone || '').trim();
                if (!normalizedDispatchAddress || !normalizedDispatchPhone) {
                    return res.status(400).json({ success: false, message: 'dispatchAddress and dispatchPhone are required when using a dispatch rider' });
                }
                if (!/^\+?[\d\s().-]{7,20}$/.test(normalizedDispatchPhone) || normalizedDispatchPhone.replace(/\D/g, '').length < 7) {
                    return res.status(400).json({ success: false, message: 'Enter a valid dispatch rider contact number' });
                }
            }
        }
        if (isDelivery) {
            if (!normalizedState) {
                return res.status(400).json({ success: false, message: 'buyerState is required for delivery' });
            }
            if (normalizedState.toLowerCase() !== 'lagos') {
                return res.status(400).json({ success: false, message: 'Delivery is only available within Lagos State' });
            }
        }
        if (isDelivery && !deliveryZone) {
            return res.status(400).json({ success: false, message: 'deliveryZone is required for delivery orders' });
        }
        if (normalizedState && !isNigerianState(normalizedState)) {
            return res.status(400).json({ success: false, message: 'buyerState must be a valid Nigerian state name' });
        }

        const productAmount = items.reduce((sum: number, it: any) => sum + (Number(it.price) * Number(it.quantity)), 0);
        const zone = isDelivery ? await resolveZoneByName(deliveryZone) : null;
        if (isDelivery && deliveryZone && !zone) {
            return res.status(400).json({ success: false, message: 'deliveryZone is invalid' });
        }
        const deliveryFee = zone?.fee ?? 0;
        const amount = productAmount + deliveryFee;
        const commission = Math.round(productAmount * COMMISSION_RATE);

        const reference = generateReference();
        const pickupCode = fulfillment === 'pickup' ? generatePickupCode() : '';

        // ─── Stock reservation ─────────────────────────────────────────
        // Atomic conditional decrement per item. If any item fails, roll back the
        // ones we already decremented so we never half-consume inventory.
        const decremented: { productId: string; quantity: number }[] = [];
        const productIds = items.map((it: any) => String(it.productId || it.id));
        const productDocs = await Product.find({ _id: { $in: productIds } });
        const productMap = new Map(productDocs.map(p => [String(p._id), p]));
        const missingProductId = productIds.find(id => !productMap.has(id));
        if (missingProductId) {
            return res.status(404).json({ success: false, message: `Product ${missingProductId} not found` });
        }
        if (isDelivery && !productDocs.every(product =>
            [product.brand, product.category, product.name].some(value => String(value || '').toLowerCase().includes('swan'))
        )) {
            return res.status(400).json({ success: false, message: 'Platform delivery is only available for SWAN products' });
        }

        for (const item of items) {
            const pid = String(item.productId || item.id);
            const qty = Number(item.quantity);
            const product = productMap.get(pid);
            if (!product) {
                await rollbackStock(decremented);
                return res.status(404).json({ success: false, message: `Product ${pid} not found` });
            }
            const updated = await Product.findOneAndUpdate(
                { _id: pid, stockCount: { $gte: qty } },
                { $inc: { stockCount: -qty } },
                { returnDocument: 'after' }
            );
            if (!updated) {
                await rollbackStock(decremented);
                return res.status(409).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Only ${product.stockCount} left.`
                });
            }
            decremented.push({ productId: pid, quantity: qty });

            // Auto-flip status if stock just hit zero
            if (updated.stockCount === 0 && updated.status !== 'out_of_stock') {
                updated.status = 'out_of_stock';
                await updated.save();
                notify({
                    type: 'inventory',
                    title: 'Out of stock',
                    description: `${updated.name} is now out of stock — last unit just sold.`,
                    meta: { productId: updated.id, name: updated.name }
                });
            }
        }

        // Detect first-time customer BEFORE creating the order
        const normalizedEmail = String(buyerEmail).trim().toLowerCase();
        const isNewCustomer = !(await Order.exists({
            buyerEmail: normalizedEmail,
            status: { $in: ['paid', 'confirmed', 'shipped', 'delivered', 'completed'] }
        }));

        const created = await new Order({
            reference,
            items: items.map((it: any) => ({
                productId: it.productId || it.id,
                name: it.name,
                image: it.image || '',
                price: Number(it.price),
                quantity: Number(it.quantity)
            })),
            productAmount,
            deliveryFee,
            amount,
            commission,
            buyerName,
            buyerEmail: normalizedEmail,
            buyerPhone,
            buyerAddress: isDelivery ? address : '',
            buyerState: isDelivery ? normalizedState : '',
            deliveryZone: isDelivery ? zone?.name || '' : '',
            fulfillmentType: fulfillment || 'delivery',
            pickupType: fulfillment === 'pickup' ? pickupArrangement : 'self',
            pickupWindowAccepted: fulfillment === 'pickup' && pickupWindowAccepted === true,
            pickupWindowMinutes: fulfillment === 'pickup' ? checkoutPolicy.pickupWindowMinutes : 60,
            dispatchAddress: fulfillment === 'pickup' && pickupArrangement === 'dispatch' ? String(dispatchAddress).trim() : '',
            dispatchPhone: fulfillment === 'pickup' && pickupArrangement === 'dispatch' ? String(dispatchPhone).trim() : '',
            pickupCode,
            paymentMethod: paymentMethod || ''
        }).save();

        // For OPay, email is deferred until the webhook confirms payment.
        // For all other methods (bank transfer, etc.) send immediately.
        if (paymentMethod !== 'opay') {
            sendOrderEmails({
                reference,
                buyerName, buyerEmail, buyerPhone, buyerAddress,
                items: created.items as any,
                productAmount, deliveryFee, deliveryZone: zone?.name,
                amount, paymentMethod, fulfillmentType: created.fulfillmentType,
                pickupType: created.pickupType, dispatchAddress: created.dispatchAddress,
                dispatchPhone: created.dispatchPhone
            }).catch(err => console.error('Email dispatch failed:', err));
        }

        if (!isOpay) {
            notify({
                type: 'order',
                title: 'New order received',
                description: `${reference} · ${buyerName} · ₦${amount.toLocaleString('en-NG')}`,
                link: `/admin?order=${reference}`,
                meta: { orderId: created.id, reference, amount }
            });

            if (isNewCustomer) {
                notify({
                    type: 'customer',
                    title: 'New customer',
                    description: `${buyerName} · ${normalizedEmail}`,
                    meta: { email: normalizedEmail, name: buyerName, firstOrderRef: reference }
                });
            }
        }

        // Mark the checkout session as converted so abandonment-rate stats stay accurate.
        // Failure here doesn't block the order — analytics is best-effort.
        if (checkoutSessionId && mongoose.Types.ObjectId.isValid(checkoutSessionId)) {
            CheckoutSession.updateOne(
                { _id: checkoutSessionId, convertedAt: null },
                { $set: { convertedAt: new Date(), orderId: created.id, orderReference: reference } }
            ).catch(err => console.error('CheckoutSession conversion mark failed:', err));
        }

        res.status(201).json({ success: true, data: created });
    } catch (err: any) {
        console.error('Error in createOrder:', err);
        res.status(400).json({ success: false, message: err.message || 'Error creating order' });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, sendConfirmationEmail } = req.body;
        if (!ORDER_STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: `status must be one of ${ORDER_STATUSES.join(', ')}` });
        }
        const before = await Order.findById(id);
        if (!before) return res.status(404).json({ success: false, message: 'Order not found' });
        if (status === 'completed' && before.status !== 'completed') {
            return res.status(403).json({ success: false, message: 'Customers complete shipped orders from their account after rating and reviewing every item' });
        }

        const statusUpdate: Record<string, any> = { status };
        if (status === 'shipped' && before.status !== 'shipped') {
            statusUpdate.shippedAt = new Date();
            statusUpdate.completionReminderClaimedAt = null;
            statusUpdate.completionReminderSentAt = null;
        }
        if (status === 'paid' && String(before.fulfillmentType || '').toLowerCase() === 'pickup') {
            const policy = await loadCheckoutPolicy();
            const pickupWindowMinutes = Number((before as any).pickupWindowMinutes) || policy.pickupWindowMinutes;
            statusUpdate.pickupDeadlineAt = before.pickupDeadlineAt || new Date(Date.now() + pickupWindowMinutes * 60 * 1000);
        }
        const updated = await Order.findByIdAndUpdate(id, statusUpdate, { returnDocument: 'after' });
        if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });

        // Cancellation: hand the inventory back, re-trigger restock subscribers if applicable.
        // Only the FIRST transition into 'cancelled' restores stock — re-saving 'cancelled'
        // doesn't double-credit.
        if (before.status !== 'cancelled' && updated.status === 'cancelled') {
            await restoreOrderStock(updated.items as any[]);
        }

        if (updated.status === 'paid' && String(updated.fulfillmentType || '').toLowerCase() === 'pickup') {
            await maybeSendPickupReceivedEmail(updated);
        }

        const statusEmailSent = before.status !== updated.status
            ? await sendOrderStatusEmail({
                reference: updated.reference,
                buyerName: updated.buyerName,
                buyerEmail: updated.buyerEmail,
                status: updated.status,
                fulfillmentType: updated.fulfillmentType,
                pickupType: updated.pickupType,
                dispatchAddress: updated.dispatchAddress,
                dispatchPhone: updated.dispatchPhone,
                buyerAddress: updated.buyerAddress,
                deliveryZone: updated.deliveryZone,
                pickupDeadlineAt: updated.pickupDeadlineAt
            })
            : false;

        let emailSent = false;
        if (before.status !== 'confirmed' && updated.status === 'confirmed' && sendConfirmationEmail) {
            emailSent = await maybeSendPaymentConfirmationEmail(updated);
        }

        res.json({ success: true, data: updated, emailSent, statusEmailSent });
    } catch (err: any) {
        console.error('Error in updateOrderStatus:', err);
        res.status(400).json({ success: false, message: err.message || 'Error updating order status' });
    }
};

// Public — invoked by the customer post-checkout to lock in assisted vs self-arranged.
// Cannot change zone/fee/partner; admin uses updateOrderDelivery for that.
export const customerSelectDeliveryMethod = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { deliveryMethod } = req.body;
        if (!['assisted', 'self'].includes(deliveryMethod)) {
            return res.status(400).json({ success: false, message: 'deliveryMethod must be "assisted" or "self"' });
        }
        const updated = await Order.findByIdAndUpdate(id, { deliveryMethod }, { returnDocument: 'after' });
        if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, data: updated });
    } catch (err: any) {
        console.error('Error in customerSelectDeliveryMethod:', err);
        res.status(400).json({ success: false, message: err.message || 'Error selecting delivery' });
    }
};

export const sendPickupReminder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (String(order.fulfillmentType || '').toLowerCase() !== 'pickup') {
            return res.status(400).json({ success: false, message: 'Reminder emails are only available for pickup orders' });
        }
        if (!['paid', 'confirmed'].includes(String(order.status || ''))) {
            return res.status(400).json({ success: false, message: 'Reminder emails are only available for paid or confirmed pickup orders' });
        }

        const pickupLocation = await resolvePickupLocation(order.items as any[]);
        const sent = await sendPickupReminderEmail({
            reference: order.reference,
            buyerName: order.buyerName,
            buyerEmail: order.buyerEmail,
            buyerPhone: order.buyerPhone,
            items: order.items as any,
            productAmount: order.productAmount,
            amount: order.amount,
            pickupLocation,
            pickupCode: order.pickupCode || '',
            pickupType: order.pickupType || 'self',
            dispatchAddress: order.dispatchAddress || '',
            dispatchPhone: order.dispatchPhone || '',
            pickupDeadlineAt: order.pickupDeadlineAt || null
        });

        let pickupReminderSentAt = order.pickupReminderSentAt || null;
        if (sent) {
            pickupReminderSentAt = new Date();
            order.pickupReminderSentAt = pickupReminderSentAt;
            await order.save();
        }

        res.json({
            success: true,
            sent,
            pickupReminderSentAt,
            message: sent ? 'Buyer notified: the order is ready for pickup.' : 'Could not notify the buyer that the order is ready for pickup.'
        });
    } catch (err: any) {
        console.error('Error in sendPickupReminder:', err);
        res.status(400).json({ success: false, message: err.message || 'Error sending pickup reminder' });
    }
};

export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await Order.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Order not found' });

        // Restore inventory for non-cancelled orders. Cancelled orders already had stock returned.
        if (deleted.status !== 'cancelled') {
            await restoreOrderStock(deleted.items as any[]);
        }

        notify({
            type: 'order',
            title: 'Order deleted',
            description: `${deleted.reference} · ${deleted.buyerName} · ₦${(deleted.amount || 0).toLocaleString('en-NG')}`,
            meta: { reference: deleted.reference, deletedBy: (req as any).user?.email }
        });
        res.json({ success: true, message: 'Order deleted' });
    } catch (err: any) {
        console.error('Error in deleteOrder:', err);
        res.status(400).json({ success: false, message: err.message || 'Error deleting order' });
    }
};

export const deleteUnpaidCustomerOrder = async (req: Request, res: Response) => {
    try {
        const email = String(req.customer?.email || '').trim().toLowerCase();
        if (!email) return res.status(401).json({ success: false, message: 'Sign-in required' });

        const deleted = await Order.findOneAndDelete({
            _id: req.params.id,
            buyerEmail: email,
            status: 'pending'
        });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Unpaid order not found or it can no longer be deleted' });
        }

        await restoreOrderStock(deleted.items as any[]);
        await Notification.deleteMany({
            title: { $in: ['New order received', 'New customer'] },
            $or: [
                { 'meta.reference': deleted.reference },
                { 'meta.firstOrderRef': deleted.reference }
            ]
        }).catch(err => console.error('Unpaid-order notification cleanup failed:', err));
        res.json({ success: true, message: 'Unpaid order deleted' });
    } catch (err: any) {
        console.error('Error in deleteUnpaidCustomerOrder:', err);
        res.status(400).json({ success: false, message: err.message || 'Error deleting unpaid order' });
    }
};

export const updateOrderDelivery = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { deliveryMethod, deliveryZone, logisticsPartner, pickupType, dispatchAddress, dispatchPhone } = req.body;

        const updates: Record<string, any> = {};
        if (deliveryMethod) {
            if (!DELIVERY_METHODS.includes(deliveryMethod)) {
                return res.status(400).json({ success: false, message: `deliveryMethod must be one of ${DELIVERY_METHODS.join(', ')}` });
            }
            updates.deliveryMethod = deliveryMethod;
        }
        if (deliveryZone !== undefined) {
            const zone = await resolveZoneByName(deliveryZone);
            if (deliveryZone && !zone) {
                return res.status(400).json({ success: false, message: 'Unknown delivery zone' });
            }
            updates.deliveryZone = zone?.name || '';
            updates.deliveryFee = zone?.fee ?? 0;
        }
        if (logisticsPartner !== undefined) updates.logisticsPartner = logisticsPartner;

        if (pickupType !== undefined) {
            if (!['self', 'dispatch'].includes(pickupType)) {
                return res.status(400).json({ success: false, message: 'pickupType must be self or dispatch' });
            }
            if (pickupType === 'dispatch') {
                const address = String(dispatchAddress || '').trim();
                const phone = String(dispatchPhone || '').trim();
                if (!address || !phone) {
                    return res.status(400).json({ success: false, message: 'Dispatch address and rider contact number are required' });
                }
                if (!/^\+?[\d\s().-]{7,20}$/.test(phone) || phone.replace(/\D/g, '').length < 7) {
                    return res.status(400).json({ success: false, message: 'Enter a valid dispatch rider contact number' });
                }
                updates.dispatchAddress = address;
                updates.dispatchPhone = phone;
            } else {
                updates.dispatchAddress = '';
                updates.dispatchPhone = '';
            }
            updates.pickupType = pickupType;
        }

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (pickupType !== undefined && String(order.fulfillmentType || '').toLowerCase() !== 'pickup') {
            return res.status(400).json({ success: false, message: 'Pickup arrangement can only be changed for pickup orders' });
        }

        Object.assign(order, updates);
        if (updates.deliveryFee !== undefined) {
            order.amount = order.productAmount + order.deliveryFee;
        }
        await order.save();

        res.json({ success: true, data: order });
    } catch (err: any) {
        console.error('Error in updateOrderDelivery:', err);
        res.status(400).json({ success: false, message: err.message || 'Error updating order delivery' });
    }
};
