import { Request, Response } from 'express';
import crypto from 'crypto';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { sendOrderEmails, sendPickupOrderReceivedEmail } from '../lib/email';

const OPAY_MERCHANT_ID = process.env.OPAY_MERCHANT_ID || '';
const OPAY_PUBLIC_KEY = process.env.OPAY_PUBLIC_KEY || '';
const OPAY_SECRET_KEY = process.env.OPAY_SECRET_KEY || '';
const OPAY_BASE_URL = process.env.OPAY_BASE_URL || 'https://sandboxapi.opaycheckout.com/api/v1/international';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

function buildHmacSignature(payload: string): string {
    const hmac = crypto.createHmac('sha512', OPAY_SECRET_KEY);
    hmac.update(payload);
    return hmac.digest('hex');
}

const resolvePickupLocation = async (items: any[] = []) => {
    const ids = Array.from(new Set((items || []).map((it: any) => String(it.productId || it.id || '')).filter(Boolean)));
    if (!ids.length) return 'UAC Foods pickup point';

    const products = await Product.find({ _id: { $in: ids } }, { location: 1 });
    const locations = Array.from(new Set(products.map(p => String(p.location || '')).filter(Boolean)));
    return locations.length ? locations.join(', ') : 'UAC Foods pickup point';
};

export const initiatePayment = async (req: Request, res: Response) => {
    try {
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
            returnUrl: `${FRONTEND_URL}/success?ref=${reference}`,
            callbackUrl: `${FRONTEND_URL}/success?ref=${reference}`,
            cancelUrl: `${FRONTEND_URL}/order-failed?ref=${reference}`,
            displayName: 'UFL Foods',
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
                name: productName || 'UFL Foods Order',
                description: productName || 'UFL Foods Order'
            }
        };

        const opayUrl = `${OPAY_BASE_URL}/cashier/create`;
        const payloadString = JSON.stringify(payload);
        const signature = buildHmacSignature(payloadString);

        // Resolve env vars at request-time in case they were not available at module load
        const merchantId = process.env.OPAY_MERCHANT_ID || OPAY_MERCHANT_ID || '';
        const publicKey = process.env.OPAY_PUBLIC_KEY || OPAY_PUBLIC_KEY || '';

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
        const payloadObj = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        
        const receivedSig = payloadObj.sha512;
        const payloadToSign = JSON.stringify(payloadObj.payload);
        const expectedSig = buildHmacSignature(payloadToSign);

        if (receivedSig !== expectedSig) {
            console.warn('[OPay] Webhook signature mismatch');
            return res.status(401).json({ code: '02003', message: 'Signature mismatch' });
        }

        const { reference, status } = payloadObj.payload;

        if (!reference) {
            return res.status(400).json({ code: '00002', message: 'Missing reference' });
        }

        if (status === 'SUCCESS') {
            const order = await Order.findOneAndUpdate({ reference }, { status: 'paid' }, { returnDocument: 'after' });
            console.log(`[OPay] Order ${reference} marked as paid via webhook`);
            if (order) {
                sendOrderEmails({
                    reference: order.reference,
                    buyerName: order.buyerName,
                    buyerEmail: order.buyerEmail,
                    buyerPhone: order.buyerPhone,
                    buyerAddress: order.buyerAddress,
                    items: order.items as any,
                    productAmount: order.productAmount,
                    deliveryFee: order.deliveryFee,
                    deliveryZone: order.deliveryZone,
                    amount: order.amount,
                    paymentMethod: 'opay'
                }).catch(err => console.error('[OPay] Email dispatch failed:', err));

                if (String(order.fulfillmentType || '').toLowerCase() === 'pickup') {
                    const pickupLocation = await resolvePickupLocation(order.items as any[]);
                    sendPickupOrderReceivedEmail({
                        reference: order.reference,
                        buyerName: order.buyerName,
                        buyerEmail: order.buyerEmail,
                        buyerPhone: order.buyerPhone,
                        items: order.items as any,
                        productAmount: order.productAmount,
                        amount: order.amount,
                        pickupLocation,
                        pickupCode: order.pickupCode || ''
                    }).catch(err => console.error('[OPay] Pickup received email failed:', err));
                }
            }
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

        const payload = { reference, merchantId: OPAY_MERCHANT_ID };
        const signature = buildHmacSignature(JSON.stringify(payload));

        const response = await fetch(`${OPAY_BASE_URL}/cashier/status/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${signature}`,
                'MerchantId': OPAY_MERCHANT_ID
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json() as any;

        if (data.code !== '00000') {
            return res.status(400).json({ success: false, message: data.message || 'Verification failed' });
        }

        const paymentStatus = data.data?.status;

        if (paymentStatus === 'SUCCESS') {
            const order = await Order.findOneAndUpdate({ reference }, { status: 'paid' }, { returnDocument: 'after' });
            if (order && String(order.fulfillmentType || '').toLowerCase() === 'pickup') {
                const pickupLocation = await resolvePickupLocation(order.items as any[]);
                sendPickupOrderReceivedEmail({
                    reference: order.reference,
                    buyerName: order.buyerName,
                    buyerEmail: order.buyerEmail,
                    buyerPhone: order.buyerPhone,
                    items: order.items as any,
                    productAmount: order.productAmount,
                    amount: order.amount,
                    pickupLocation,
                    pickupCode: order.pickupCode || ''
                }).catch(err => console.error('[OPay] Pickup received email failed:', err));
            }
            return res.json({ success: true, status: 'paid', data: data.data });
        }

        res.json({ success: false, status: (paymentStatus || 'pending').toLowerCase(), data: data.data });
    } catch (err: any) {
        console.error('[OPay] verifyPayment error:', err);
        res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    }
};
