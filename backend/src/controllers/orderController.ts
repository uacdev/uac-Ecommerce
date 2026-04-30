import { Request, Response } from 'express';
import { Order, ORDER_STATUSES, DELIVERY_METHODS } from '../models/Order';
import { Product } from '../models/Product';
import { findZoneByName } from '../data/deliveryZones';
import { isNigerianState } from '../data/nigerianStates';
import { sendOrderEmails, sendBackInStockEmails } from '../lib/email';
import { notify } from '../lib/notify';
import { StockSubscription } from '../models/StockSubscription';
import { CheckoutSession } from '../models/CheckoutSession';
import mongoose from 'mongoose';

const COMMISSION_RATE = 0.10;

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
            { new: true }
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
            deliveryZone, paymentMethod, fulfillmentType, checkoutSessionId
        } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'items must contain at least one product' });
        }
        if (!buyerName || !buyerEmail || !buyerPhone || !buyerAddress) {
            return res.status(400).json({ success: false, message: 'buyerName, buyerEmail, buyerPhone and buyerAddress are required' });
        }
        if (buyerState && !isNigerianState(String(buyerState).trim())) {
            return res.status(400).json({ success: false, message: 'buyerState must be a valid Nigerian state name' });
        }

        const productAmount = items.reduce((sum: number, it: any) => sum + (Number(it.price) * Number(it.quantity)), 0);
        const zone = deliveryZone ? findZoneByName(deliveryZone) : null;
        const deliveryFee = zone?.fee ?? 0;
        const amount = productAmount + deliveryFee;
        const commission = Math.round(productAmount * COMMISSION_RATE);

        const reference = generateReference();
        const pickupCode = fulfillmentType === 'pickup' ? generatePickupCode() : '';

        // ─── Stock reservation ─────────────────────────────────────────
        // Atomic conditional decrement per item. If any item fails, roll back the
        // ones we already decremented so we never half-consume inventory.
        const decremented: { productId: string; quantity: number }[] = [];
        const productIds = items.map((it: any) => String(it.productId || it.id));
        const productDocs = await Product.find({ _id: { $in: productIds } });
        const productMap = new Map(productDocs.map(p => [String(p._id), p]));

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
                { new: true }
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
        const isNewCustomer = !(await Order.exists({ buyerEmail: normalizedEmail }));

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
            buyerAddress,
            buyerState: buyerState ? String(buyerState).trim() : '',
            deliveryZone: zone?.name || '',
            fulfillmentType: fulfillmentType || 'delivery',
            pickupCode,
            paymentMethod: paymentMethod || ''
        }).save();

        // Fire-and-don't-wait emails. We respond fast; failures get logged but don't block the order.
        sendOrderEmails({
            reference,
            buyerName, buyerEmail, buyerPhone, buyerAddress,
            items: created.items as any,
            productAmount, deliveryFee, deliveryZone: zone?.name,
            amount, paymentMethod
        }).catch(err => console.error('Email dispatch failed:', err));

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
        const { status } = req.body;
        if (!ORDER_STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: `status must be one of ${ORDER_STATUSES.join(', ')}` });
        }
        const before = await Order.findById(id);
        if (!before) return res.status(404).json({ success: false, message: 'Order not found' });

        const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });

        // Cancellation: hand the inventory back, re-trigger restock subscribers if applicable.
        // Only the FIRST transition into 'cancelled' restores stock — re-saving 'cancelled'
        // doesn't double-credit.
        if (before.status !== 'cancelled' && updated.status === 'cancelled') {
            await restoreOrderStock(updated.items as any[]);
        }

        res.json({ success: true, data: updated });
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
        const updated = await Order.findByIdAndUpdate(id, { deliveryMethod }, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, data: updated });
    } catch (err: any) {
        console.error('Error in customerSelectDeliveryMethod:', err);
        res.status(400).json({ success: false, message: err.message || 'Error selecting delivery' });
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

export const updateOrderDelivery = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { deliveryMethod, deliveryZone, logisticsPartner } = req.body;

        const updates: Record<string, any> = {};
        if (deliveryMethod) {
            if (!DELIVERY_METHODS.includes(deliveryMethod)) {
                return res.status(400).json({ success: false, message: `deliveryMethod must be one of ${DELIVERY_METHODS.join(', ')}` });
            }
            updates.deliveryMethod = deliveryMethod;
        }
        if (deliveryZone !== undefined) {
            const zone = findZoneByName(deliveryZone);
            if (deliveryZone && !zone) {
                return res.status(400).json({ success: false, message: 'Unknown delivery zone' });
            }
            updates.deliveryZone = zone?.name || '';
            if (zone) updates.deliveryFee = zone.fee;
        }
        if (logisticsPartner !== undefined) updates.logisticsPartner = logisticsPartner;

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

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
