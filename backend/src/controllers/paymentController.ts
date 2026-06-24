import { Request, Response } from 'express';
import crypto from 'crypto';
import { Order } from '../models/Order';
import { sendOrderEmails } from '../lib/email';

const OPAY_MERCHANT_ID = process.env.OPAY_MERCHANT_ID || '';
const OPAY_PUBLIC_KEY = process.env.OPAY_PUBLIC_KEY || '';
const OPAY_SECRET_KEY = process.env.OPAY_SECRET_KEY || '';
const OPAY_BASE_URL = process.env.OPAY_BASE_URL || 'https://sandboxapi.opaycheckout.com/api/v1/international';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

function buildHmacSignature(payload: string): string {
    return Buffer.from(
        crypto.createHmac('sha512', OPAY_SECRET_KEY).update(payload).digest()
    ).toString('base64');
}

export const initiatePayment = async (req: Request, res: Response) => {
    try {
        const { reference, amount, buyerName, buyerEmail, buyerPhone, productName } = req.body;

        if (!reference || !amount) {
            return res.status(400).json({ success: false, message: 'reference and amount are required' });
        }

        const amountInKobo = Math.round(Number(amount) * 100);

        const payload = {
            merchantId: OPAY_MERCHANT_ID,
            reference,
            mchShortName: 'UFL Foods',
            productName: productName || 'UFL Foods Order',
            productDesc: productName || 'UFL Foods Order',
            supplierReference: reference,
            callbackUrl: `${FRONTEND_URL}/success?ref=${reference}`,
            returnUrl: `${FRONTEND_URL}/success?ref=${reference}`,
            failureReturnUrl: `${FRONTEND_URL}/order-failed?ref=${reference}`,
            currency: 'NGN',
            amount: {
                total: amountInKobo,
                currency: 'NGN'
            },
            clientInfo: {
                userAgent: req.headers['user-agent'] || '',
                ipAddress: ((req.headers['x-forwarded-for'] as string) || req.ip || '').split(',')[0].trim(),
                acceptLanguage: req.headers['accept-language'] || 'en-US',
                screenHeight: '900',
                screenWidth: '1440'
            },
            metadata: { reference, buyerName, buyerEmail, buyerPhone }
        };

        const response = await fetch(`${OPAY_BASE_URL}/cashier/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPAY_PUBLIC_KEY}`,
                'MerchantId': OPAY_MERCHANT_ID
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json() as any;

        if (data.code !== '00000') {
            console.error('[OPay] initiate failed:', data);
            return res.status(400).json({ success: false, message: data.message || 'Payment initiation failed' });
        }

        res.json({ success: true, cashierUrl: data.data?.cashierUrl, reference });
    } catch (err: any) {
        console.error('[OPay] initiatePayment error:', err);
        res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    }
};

export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const rawBody = req.body instanceof Buffer
            ? req.body.toString('utf8')
            : JSON.stringify(req.body);

        const authHeader = (req.headers['authorization'] || '') as string;
        const receivedSig = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        const expectedSig = buildHmacSignature(rawBody);

        if (receivedSig !== expectedSig) {
            console.warn('[OPay] Webhook signature mismatch');
            return res.status(401).json({ code: '02003', message: 'Signature mismatch' });
        }

        const payload = JSON.parse(rawBody);
        const { reference, status } = payload;

        if (!reference) {
            return res.status(400).json({ code: '00002', message: 'Missing reference' });
        }

        if (status === 'SUCCESS') {
            const order = await Order.findOneAndUpdate({ reference }, { status: 'paid' }, { new: true });
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
            await Order.findOneAndUpdate({ reference }, { status: 'paid' });
            return res.json({ success: true, status: 'paid', data: data.data });
        }

        res.json({ success: false, status: (paymentStatus || 'pending').toLowerCase(), data: data.data });
    } catch (err: any) {
        console.error('[OPay] verifyPayment error:', err);
        res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    }
};
