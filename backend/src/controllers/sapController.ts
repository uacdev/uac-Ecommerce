import { Request, Response } from 'express';
import crypto from 'crypto';
import { Order } from '../models/Order';
import { SapCallback } from '../models/SapCallback';
import { findSalesOrderByReference, sapConfig, syncOrderToSap } from '../lib/sap';

const tokensMatch = (a: string, b: string) => {
    const x = Buffer.from(a);
    const y = Buffer.from(b);
    return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// POST /api/sap/payment-callback — SAP confirms a payment was posted.
// Body: { PaymentNotification: { CompanyCode, DocumentNo, Note, PaymentRef, Status } }
// Auth: shared token in the `x-sap-callback-token` header (method still to be confirmed by SAP).
export const handlePaymentCallback = async (req: Request, res: Response) => {
    const expected = sapConfig().callbackToken;
    if (!expected) return res.status(503).json({ success: false, message: 'SAP callback is not configured' });
    if (!tokensMatch(String(req.headers['x-sap-callback-token'] || ''), expected)) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const n = req.body?.PaymentNotification;
    if (!n || typeof n !== 'object') return res.status(400).json({ success: false, message: 'PaymentNotification is required' });

    const paymentRef = String(n.PaymentRef || '').trim();
    const status = String(n.Status || '').trim();
    const documentNo = String(n.DocumentNo || '').trim();

    // SAP says PaymentRef is its own value, so match on either our reference or the OPay ID.
    const order = paymentRef
        ? await Order.findOne({ $or: [{ reference: paymentRef }, { opayTransactionId: paymentRef }] })
        : null;

    await SapCallback.create({
        paymentRef, documentNo, status,
        companyCode: String(n.CompanyCode || ''),
        note: String(n.Note || '').slice(0, 1000),
        orderReference: order?.reference || '',
        matched: Boolean(order),
        raw: req.body
    });

    if (order && status.toLowerCase() === 'success') {
        await Order.updateOne({ _id: order._id }, { sapPaymentDocumentNo: documentNo, sapPaymentPostedAt: new Date() });
    } else if (!order) {
        console.warn(`[SAP] Payment callback for unknown reference "${paymentRef}" (status ${status})`);
    } else {
        console.warn(`[SAP] Payment callback for ${order.reference} reported status "${status}": ${n.Note || ''}`);
    }

    res.json({ success: true });
};

// POST /api/orders/:id/sap-sync — admin retries sending an order to SAP.
export const retryOrderSync = async (req: Request, res: Response) => {
    const result = await syncOrderToSap(String(req.params.id), { manual: true });
    const order = await Order.findById(req.params.id);
    res.status(result.ok ? 200 : 422).json({ success: result.ok, message: result.message, data: order });
};

// GET /api/sap/connection-check — admin only, read-only. Confirms the API key and IP
// whitelist work by looking up a reference that doesn't exist. Creates nothing in SAP.
export const connectionCheck = async (_req: Request, res: Response) => {
    const cfg = sapConfig();
    try {
        await findSalesOrderByReference('CONNECTION-CHECK');
        res.json({ success: true, message: 'Connected to SAP Sales Order API', enabled: cfg.enabled, baseUrl: cfg.baseUrl });
    } catch (err: any) {
        res.status(502).json({ success: false, message: err?.message || String(err), enabled: cfg.enabled, baseUrl: cfg.baseUrl });
    }
};
