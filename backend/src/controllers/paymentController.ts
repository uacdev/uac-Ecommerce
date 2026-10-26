import { Request, Response } from 'express';
import crypto from 'crypto';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { sendOrderEmails } from '../lib/email';
import { notify } from '../lib/notify';
import { CHECKOUT_LOCK_MESSAGE, loadCheckoutLocked, loadCheckoutPolicy } from '../lib/checkoutPolicy';

const DEFAULT_OPAY_BASE_URL = 'https://sandboxapi.opaycheckout.com/api/v1/international';

function buildHmacSignature(payload: string): string {
    const hmac = crypto.createHmac('sha512', process.env.OPAY_SECRET_KEY || '');
    hmac.update(payload);
    return hmac.digest('hex');
}

function buildWebhookSignature(payload: any): string {
    const authPayload = `{Amount:"${payload.amount}",Currency:"${payload.currency}",Reference:"${payload.reference}",Refunded:${payload.refunded ? 't' : 'f'},Status:"${payload.status}",Timestamp:"${payload.timestamp}",Token:"${payload.token}",TransactionID:"${payload.transactionId}"}`;
    const hmac = crypto.createHmac('sha3-512', process.env.OPAY_SECRET_KEY || '');
    hmac.update(authPayload);
    return hmac.digest('hex');
}

const markOrderPaidAndNotify = async (reference: string) => {
    // Only the first successful callback sends confirmation emails. OPay can
    // deliver both a webhook and a browser verification for the same payment.
    const pendingOrder = await Order.findOne({ reference, status: 'pending' });
    if (!pendingOrder) return null;
    const paidAt = new Date();
    const policy = await loadCheckoutPolicy();
    const order = await Order.findOneAndUpdate(
        { reference, status: 'pending' },
        {
            status: 'paid',
            pickupDeadlineAt: String(pendingOrder.fulfillmentType || '').toLowerCase() === 'pickup'
                ? new Date(paidAt.getTime() + (Number((pendingOrder as any).pickupWindowMinutes) || policy.pickupWindowMinutes) * 60 * 1000)
                : null
        },
        { returnDocument: 'after' }
    );
    if (!order) return null;

    const emailPayload = {
        reference: order.reference,
        orderCreatedAt: order.date,
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail,
        buyerPhone: order.buyerPhone,
        buyerAddress: order.buyerAddress,
        items: order.items as any,
        productAmount: order.productAmount,
        deliveryFee: order.deliveryFee,
        deliveryZone: order.deliveryZone,
        amount: order.amount,
        paymentMethod: 'opay',
        fulfillmentType: order.fulfillmentType,
        pickupType: order.pickupType,
        dispatchAddress: order.dispatchAddress,
        dispatchPhone: order.dispatchPhone
    };

    let pickupEmailDetails: { pickupLocation?: string; pickupCode?: string; pickupDeadlineAt?: Date | null } = {};
    if (String(order.fulfillmentType || '').toLowerCase() === 'pickup') {
        const ids = Array.from(new Set((order.items as any[]).map((item: any) => String(item.productId || item.id || '')).filter(Boolean)));
        const products = ids.length ? await Product.find({ _id: { $in: ids } }, { location: 1 }) : [];
        pickupEmailDetails = {
            pickupLocation: Array.from(new Set(products.map(product => String(product.location || '')).filter(Boolean))).join(', ') || 'UAC Foods pickup point',
            pickupCode: order.pickupCode || '',
            pickupDeadlineAt: order.pickupDeadlineAt || null
        };
    }

    sendOrderEmails({ ...emailPayload, ...pickupEmailDetails })
        .then(result => {
            if (!result.admin) console.warn(`[OPay] Admin email not sent for ${reference}`);
        })
        .catch(err => console.error('[OPay] Email dispatch failed:', err));

    notify({
        type: 'order',
        title: 'Payment received',
        description: `${reference} · ${order.buyerName} · ₦${order.amount.toLocaleString('en-NG')}`,
        link: `/admin?order=${reference}`,
        meta: { orderId: order.id, reference, amount: order.amount, paymentMethod: 'opay' }
    });

    const previousPaidOrder = await Order.exists({
        _id: { $ne: order._id },
        buyerEmail: order.buyerEmail,
        status: { $in: ['paid', 'confirmed', 'shipped', 'delivered', 'completed'] }
    });
    if (!previousPaidOrder) {
        notify({
            type: 'customer',
            title: 'New customer',
            description: `${order.buyerName} · ${order.buyerEmail}`,
            meta: { email: order.buyerEmail, name: order.buyerName, firstOrderRef: order.reference }
        });
    }

    return order;
};

export const initiatePayment = async (req: Request, res: Response) => {
    try {
        if (await loadCheckoutLocked()) {
            return res.status(503).json({ success: false, message: CHECKOUT_LOCK_MESSAGE });
        }

        const { reference, amount, buyerName, buyerEmail, buyerPhone, productName } = req.body;

        if (!reference || !amount) {
            return res.status(400).json({ success: false, message: 'reference and amount are required' });
        }

        const amountInKobo = Math.round(Number(amount) * 100);

        const payload = {
            country: 'NG',
            reference,
            amount: {
                total: amountInKobo,
                currency: 'NGN'
            },
            returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:5180'}/success?ref=${reference}`,
            cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:5180'}/order-failed?ref=${reference}`,
            displayName: 'UAC Foods Limited',
            customerVisitSource: 'BROWSER',
            userClientIP: (() => {
                let raw = ((req.headers['x-forwarded-for'] as string) || req.ip || '').split(',')[0].trim();
                if (!raw) return '127.0.0.1';
                // Normalize common IPv6 -> IPv4 mappings
                if (raw.startsWith('::ffff:')) raw = raw.replace('::ffff:', '');
                if (raw === '::1' || raw === '::') raw = '127.0.0.1';
                // OPay expects length between 7 and 50; ensure a reasonable fallback for local dev
                if (raw.length < 7) raw = '127.0.0.1';
                return raw;
            })(),
            userInfo: {
                userName: buyerName || '',
                userEmail: buyerEmail || '',
                userMobile: buyerPhone || ''
            },
            product: {
                name: productName || 'UAC Foods Limited Order',
                description: productName || 'UAC Foods Limited Order'
            }
        };

        const opayUrl = `${process.env.OPAY_BASE_URL || DEFAULT_OPAY_BASE_URL}/cashier/create`;
        const payloadString = JSON.stringify(payload);

        // Resolve env vars at request-time in case they were not available at module load
        const merchantId = process.env.OPAY_MERCHANT_ID || '';
        const publicKey = process.env.OPAY_PUBLIC_KEY || '';

        console.log('[OPay] POST', opayUrl);
        console.log('[OPay] MerchantId:', merchantId);
        console.log('[OPay] Payload:', payloadString);

        if (!merchantId || !publicKey) {
            console.error('[OPay] Missing configuration: MerchantId or PublicKey not set');
            return res.status(500).json({ success: false, message: 'Payment gateway not configured' });
        }

        const response = await fetch(opayUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicKey}`,
                'MerchantId': merchantId
            },
            body: payloadString
        });

        const rawText = await response.text();
        console.log('[OPay] HTTP status:', response.status);
        console.log('[OPay] Raw response:', rawText);

        let data: any;
        try { data = JSON.parse(rawText); } catch { data = { code: 'PARSE_ERR', message: rawText }; }

        if (data.code !== '00000') {
            console.error('[OPay] initiate failed — code:', data.code, '| message:', data.message, '| full:', JSON.stringify(data));
            return res.status(400).json({ success: false, message: data.message || 'Payment initiation failed', opayCode: data.code, opayData: data });
        }

        res.json({ success: true, cashierUrl: data.data?.cashierUrl, reference });
    } catch (err: any) {
        console.error('[OPay] initiatePayment error:', err);
        res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    }
};

export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : req.body;
        const payloadObj = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
        if (!payloadObj?.payload || typeof payloadObj.sha512 !== 'string') {
            return res.status(400).json({ code: '00002', message: 'Invalid callback payload' });
        }

        const receivedSig = payloadObj.sha512;
        const expectedSig = buildWebhookSignature(payloadObj.payload);

        if (receivedSig.toLowerCase() !== expectedSig.toLowerCase()) {
            console.warn('[OPay] Webhook signature mismatch');
            return res.status(401).json({ code: '02003', message: 'Signature mismatch' });
        }

        const { reference, status } = payloadObj.payload;

        if (!reference) {
            return res.status(400).json({ code: '00002', message: 'Missing reference' });
        }

        if (status === 'SUCCESS') {
            const order = await markOrderPaidAndNotify(reference);
            console.log(`[OPay] Order ${reference} marked as paid via webhook`);
        } else if (status === 'FAIL' || status === 'CLOSED') {
            await Order.findOneAndUpdate({ reference }, { status: 'cancelled' });
            console.log(`[OPay] Order ${reference} cancelled via webhook`);
        }

        res.json({ code: '00000', message: 'SUCCESS' });
    } catch (err: any) {
        console.error('[OPay] handleWebhook error:', err);
        res.status(500).json({ code: '99999', message: 'Internal error' });
    }
};

export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const { reference } = req.body;

        if (!reference) {
            return res.status(400).json({ success: false, message: 'reference is required' });
        }

        const merchantId = process.env.OPAY_MERCHANT_ID || '';
        const payload = { country: 'NG', reference };
        const signature = buildHmacSignature(JSON.stringify(payload));

        const response = await fetch(`${process.env.OPAY_BASE_URL || DEFAULT_OPAY_BASE_URL}/cashier/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${signature}`,
                'MerchantId': merchantId
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json() as any;

        if (data.code !== '00000') {
            return res.status(400).json({ success: false, message: data.message || 'Verification failed' });
        }

        const paymentStatus = data.data?.status;

        if (paymentStatus === 'SUCCESS') {
            const paidOrder = await markOrderPaidAndNotify(reference)
                || await Order.findOne({ reference }, { items: 1 });
            const purchasedItems = (paidOrder?.items || []).map((item: any) => ({
                productId: String(item.productId || item.id || ''),
                quantity: Number(item.quantity) || 0
            })).filter((item: any) => item.productId && item.quantity > 0);
            return res.json({ success: true, status: 'paid', data: data.data, purchasedItems });
        }

        res.json({ success: false, status: (paymentStatus || 'pending').toLowerCase(), data: data.data });
    } catch (err: any) {
        console.error('[OPay] verifyPayment error:', err);
        res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    }
};
