import crypto from 'crypto';
import { Order } from '../models/Order';
import { Product } from '../models/Product';

/*
 * SAP integration (via SAP API Management)
 *
 * When an order is paid we:
 *   1. create a sales order in SAP (customer, material, plant, quantity — SAP prices it), then
 *   2. send a signed PAYMENT_SUCCESS notification so SAP can post the payment.
 * Both are linked by our order reference (PurchaseOrderByCustomer / transactionReference).
 * SAP later confirms the payment posting on POST /api/sap/payment-callback.
 *
 * Progress is stored on the order (sapStatus, sapSalesOrderNo, sapPaymentSentAt, …),
 * so a retry only repeats the step that has not succeeded yet.
 */

const DEFAULT_BASE_URL = 'https://uacnplc.test01.apimanagement.eu20.hana.ondemand.com';
const REQUEST_TIMEOUT_MS = 20_000;
const MAX_AUTO_ATTEMPTS = 8;
const RETRY_AFTER_MS = 10 * 60 * 1000;
const STALE_LOCK_MS = 10 * 60 * 1000;
const SYNCABLE_ORDER_STATUSES = ['paid', 'confirmed', 'shipped', 'delivered', 'completed'];

// Fulfilment location → SAP plant (confirmed by UFL business).
const DEFAULT_PLANTS: Record<string, string> = { Ojota: '4000', Oregun: '4001', Kerang: '4051' };

// City used on the address of pickup orders.
const PICKUP_CITIES: Record<string, string> = { Ojota: 'Lagos', Oregun: 'Lagos', Kerang: 'Plateau' };

// State → SAP region code. Only Lagos (25) is confirmed from UFL's SAP screen; add others via
// SAP_REGION_CODES='{"Ogun":"28"}' once confirmed. States without a code are sent without Region.
const DEFAULT_REGION_CODES: Record<string, string> = { Lagos: '25' };

// SAP address field lengths.
const clip = (value: unknown, max: number) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

const env = (key: string, fallback = '') => String(process.env[key] ?? fallback).trim();

export const sapConfig = () => ({
    enabled: env('SAP_ENABLED').toLowerCase() === 'true',
    baseUrl: env('SAP_API_BASE_URL', DEFAULT_BASE_URL).replace(/\/+$/, ''),
    apiKey: env('SAP_API_KEY'),
    salesOrderPath: env('SAP_SALES_ORDER_PATH', '/API_SALES_ORDER_HEADER/A_SalesOrder'),
    salesOrderType: env('SAP_SALES_ORDER_TYPE', 'ZUOR'),
    salesOrganization: env('SAP_SALES_ORGANIZATION', '4000'),
    distributionChannel: env('SAP_DISTRIBUTION_CHANNEL', '15'),
    division: env('SAP_DIVISION', '99'),
    soldToParty: env('SAP_SOLD_TO_PARTY'),
    partnerFunction: env('SAP_PARTNER_FUNCTION', 'SP'),
    regionCodes: (() => {
        try { return { ...DEFAULT_REGION_CODES, ...JSON.parse(env('SAP_REGION_CODES', '{}')) }; }
        catch { return DEFAULT_REGION_CODES; }
    })(),
    paymentPath: env('SAP_PAYMENT_PATH', '/ecommerce_ufl/payments/callback'),
    paymentAccountRef: env('SAP_PAYMENT_ACCOUNT_REF'),
    paymentSecret: env('SAP_PAYMENT_SECRET'),
    callbackToken: env('SAP_CALLBACK_TOKEN')
});

export class SapError extends Error {
    constructor(message: string, public retryable: boolean) {
        super(message);
    }
}

// HMAC-SHA512 of the exact body string, lowercase hex (128 chars).
export const signSapPayload = (body: string, secret: string) =>
    crypto.createHmac('sha512', secret).update(body, 'utf8').digest('hex');

// "YYYY-MM-DD HH:mm:ss.S" in Lagos time (WAT, UTC+1, no daylight saving).
export const formatSapDateTime = (date: Date) => {
    const iso = new Date(date.getTime() + 60 * 60 * 1000).toISOString();
    return `${iso.slice(0, 10)} ${iso.slice(11, 19)}.${iso.slice(20, 21)}`;
};

// Gateway errors come as { fault: { faultstring } }, SAP backend errors as { error: { message: { value } } }.
const readSapError = (body: any, fallback: string) => {
    const msg = body?.error?.message?.value ?? body?.error?.message ?? body?.fault?.faultstring ?? body?.message;
    return typeof msg === 'string' && msg.trim() ? msg.trim() : fallback;
};

const sapRequest = async (method: 'GET' | 'POST', url: string, body: string | undefined, headers: Record<string, string>) => {
    let res: globalThis.Response;
    try {
        res = await fetch(url, {
            method,
            headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), Accept: 'application/json', ...headers },
            body,
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        });
    } catch (err: any) {
        throw new SapError(`Could not reach SAP: ${err?.message || err}`, true);
    }
    const text = await res.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON response */ }
    return { res, text, json };
};

// 4xx validation errors need a data fix; auth/whitelist (401/403), throttling and 5xx are worth retrying.
const isRetryableStatus = (status: number) => status >= 500 || status === 401 || status === 403 || status === 408 || status === 429;

// One-time customer address (format from SAP's sample, 20 Nov 2026). We hold one free-text
// address + state, so the address goes in StreetName and the state in CityName.
// Pickup orders have no delivery address, so we send the pickup location instead.
export const buildBuyerAddress = (order: any, pickupLocation: string, regionCodes: Record<string, string>) => {
    const isPickup = String(order.fulfillmentType || '').toLowerCase() === 'pickup';
    const street = isPickup ? `Pickup - ${pickupLocation || 'UAC Foods'}` : order.buyerAddress;
    const city = isPickup ? PICKUP_CITIES[pickupLocation] || '' : order.buyerState || '';
    const region = regionCodes[city];
    const phone = clip(order.buyerPhone, 30);
    return {
        OrganizationName1: clip(order.buyerName, 40),
        StreetName: clip(street, 60),
        CityName: clip(city, 40),
        ...(region ? { Region: region } : {}),
        Country: 'NG',
        ...(phone ? { PhoneNumber: phone, MobileNumber: phone } : {}),
        ...(order.buyerEmail ? { EmailAddress: clip(order.buyerEmail, 241) } : {})
    };
};

export const buildSalesOrderPayload = async (order: any) => {
    const cfg = sapConfig();
    if (!cfg.soldToParty) throw new SapError('SAP_SOLD_TO_PARTY is not configured', false);

    const ids = Array.from(new Set((order.items || []).map((item: any) => String(item.productId))));
    const products: any[] = await Product.find({ _id: { $in: ids } }, { name: 1, location: 1, sapMaterialCode: 1 });
    const byId = new Map(products.map(p => [String(p._id), p]));

    const problems: string[] = [];
    const items = (order.items || []).map((item: any, index: number) => {
        const product = byId.get(String(item.productId));
        const material = String(product?.sapMaterialCode || '').trim();
        const plant = DEFAULT_PLANTS[String(product?.location || '')] || '';
        if (!product) problems.push(`${item.name}: product no longer exists`);
        else if (!material) problems.push(`${product.name}: no SAP material code`);
        else if (!plant) problems.push(`${product.name}: no SAP plant for location "${product.location}"`);
        return {
            SalesOrderItem: String((index + 1) * 10),
            Material: material,
            ProductionPlant: plant,
            RequestedQuantity: String(item.quantity)
        };
    });
    if (problems.length) throw new SapError(problems.join('; '), false);

    const pickupLocation = String(products.find(p => p.location)?.location || '');
    return {
        SalesOrderType: cfg.salesOrderType,
        SalesOrganization: cfg.salesOrganization,
        DistributionChannel: cfg.distributionChannel,
        OrganizationDivision: cfg.division,
        SoldToParty: cfg.soldToParty,
        PurchaseOrderByCustomer: order.reference,
        to_Partner: [{
            PartnerFunction: cfg.partnerFunction,
            Customer: cfg.soldToParty,
            to_Address: [buildBuyerAddress(order, pickupLocation, cfg.regionCodes)]
        }],
        to_Item: items
    };
};

// Looks up a sales order by our order reference (GET with $filter, per SAP's API document).
export const findSalesOrderByReference = async (reference: string): Promise<string | null> => {
    const cfg = sapConfig();
    const odataString = (v: string) => `'${v.replace(/'/g, "''")}'`;
    const filter = `SalesOrganization eq ${odataString(cfg.salesOrganization)} and PurchaseOrderByCustomer eq ${odataString(reference)}`;
    const url = `${cfg.baseUrl}${cfg.salesOrderPath}?$filter=${encodeURIComponent(filter)}&$select=SalesOrder&$top=1`;
    const { res, text, json } = await sapRequest('GET', url, undefined, { APIkey: cfg.apiKey });
    if (!res.ok) {
        throw new SapError(`Sales order lookup failed (HTTP ${res.status}): ${readSapError(json, text.slice(0, 300))}`, isRetryableStatus(res.status));
    }
    const found = json?.d?.results?.[0]?.SalesOrder;
    return found ? String(found) : null;
};

export const createSalesOrder = async (order: any): Promise<string> => {
    const cfg = sapConfig();
    if (!cfg.apiKey) throw new SapError('SAP_API_KEY is not configured', false);
    const payload = await buildSalesOrderPayload(order);

    // An earlier attempt may have created the order but timed out before we saw the reply.
    // Checking first means a retry never creates a duplicate in SAP.
    const existing = await findSalesOrderByReference(order.reference);
    if (existing) return existing;

    const { res, text, json } = await sapRequest('POST', `${cfg.baseUrl}${cfg.salesOrderPath}`, JSON.stringify(payload), { APIkey: cfg.apiKey });
    if (!res.ok) {
        throw new SapError(`Sales order rejected (HTTP ${res.status}): ${readSapError(json, text.slice(0, 300))}`, isRetryableStatus(res.status));
    }
    const salesOrderNo = json?.d?.SalesOrder ?? json?.SalesOrder;
    if (!salesOrderNo) {
        // Retry is safe: the lookup above will find the order if it was created.
        throw new SapError(`Sales order response had no SalesOrder number: ${text.slice(0, 300)}`, true);
    }
    return String(salesOrderNo);
};

export const buildPaymentNotification = (order: any) => {
    const cfg = sapConfig();
    if (!cfg.paymentAccountRef) throw new SapError('SAP_PAYMENT_ACCOUNT_REF is not configured', false);
    const amountPaid = Number(order.amount) || 0;
    const fee = Number(order.opayFee) || 0;
    return {
        eventType: 'PAYMENT_SUCCESS',
        eventData: {
            product: { reference: cfg.paymentAccountRef, type: 'RESERVED_ACCOUNT' },
            transactionReference: order.reference,
            ...(order.opayTransactionId ? { paymentReference: order.opayTransactionId } : {}),
            paidOn: formatSapDateTime(order.paidAt || order.statusUpdatedAt || new Date()),
            paymentDescription: `UAC Foods e-commerce order ${order.reference}`,
            amountPaid,
            totalPayable: amountPaid,
            paymentMethod: 'OPAY',
            currency: 'NGN',
            settlementAmount: Math.round((amountPaid - fee) * 100) / 100,
            paymentStatus: 'PAID',
            customer: { name: order.buyerName || '', email: order.buyerEmail || null }
        }
    };
};

export const sendPaymentNotification = async (order: any) => {
    const cfg = sapConfig();
    if (!cfg.paymentSecret) throw new SapError('SAP_PAYMENT_SECRET is not configured', false);
    // Sign the exact string we send — any re-serialisation would change the hash.
    const body = JSON.stringify(buildPaymentNotification(order));
    const headers: Record<string, string> = { 'eCommerce-signature': signSapPayload(body, cfg.paymentSecret) };
    if (cfg.apiKey) headers.APIkey = cfg.apiKey;

    const { res, text, json } = await sapRequest('POST', `${cfg.baseUrl}${cfg.paymentPath}`, body, headers);
    if (!res.ok || (json?.code && json.code !== '00000')) {
        throw new SapError(`Payment notification rejected (HTTP ${res.status}): ${readSapError(json, text.slice(0, 300))}`, isRetryableStatus(res.status) || res.ok);
    }
};

/**
 * Push one paid order to SAP. Safe to call repeatedly and from several servers:
 * a lock on the order stops two runs overlapping, and finished steps are skipped.
 * `manual` lets an admin retry an order that failed with a non-retryable error.
 */
export const syncOrderToSap = async (orderId: string, { manual = false } = {}) => {
    if (!sapConfig().enabled) return { ok: false, skipped: true, message: 'SAP integration is disabled' };

    const now = new Date();
    const claimable: any[] = [
        { sapStatus: 'not_sent' },
        { sapStatus: 'processing', sapLockedAt: { $lt: new Date(now.getTime() - STALE_LOCK_MS) } },
        manual ? { sapStatus: 'failed' } : { sapStatus: 'failed', sapRetryable: true }
    ];
    const order = await Order.findOneAndUpdate(
        { _id: orderId, status: { $in: SYNCABLE_ORDER_STATUSES }, $or: claimable },
        { sapStatus: 'processing', sapLockedAt: now, sapLastAttemptAt: now, $inc: { sapAttempts: 1 } },
        { returnDocument: 'after' }
    );
    if (!order) return { ok: false, skipped: true, message: 'Order is not paid, already synced, or being synced' };

    try {
        if (!order.sapSalesOrderNo) {
            const salesOrderNo = await createSalesOrder(order);
            order.sapSalesOrderNo = salesOrderNo;
            await Order.updateOne({ _id: order._id }, { sapSalesOrderNo: salesOrderNo, sapSalesOrderAt: new Date() });
            console.log(`[SAP] Sales order ${salesOrderNo} created for ${order.reference}`);
        }
        if (!order.sapPaymentSentAt) {
            await sendPaymentNotification(order);
            await Order.updateOne({ _id: order._id }, { sapPaymentSentAt: new Date() });
            console.log(`[SAP] Payment notification sent for ${order.reference}`);
        }
        await Order.updateOne({ _id: order._id }, { sapStatus: 'synced', sapError: '', sapRetryable: true, sapLockedAt: null });
        return { ok: true, salesOrderNo: order.sapSalesOrderNo };
    } catch (err: any) {
        const retryable = err instanceof SapError ? err.retryable : true;
        const message = String(err?.message || err).slice(0, 1000);
        await Order.updateOne({ _id: order._id }, { sapStatus: 'failed', sapError: message, sapRetryable: retryable, sapLockedAt: null });
        console.error(`[SAP] Sync failed for ${order.reference} (${retryable ? 'will retry' : 'needs attention'}): ${message}`);
        return { ok: false, message };
    }
};

// Sends paid orders that haven't reached SAP yet, and retries recent failures.
export const processSapQueue = async () => {
    if (!sapConfig().enabled) return;
    const now = Date.now();
    const due = await Order.find({
        status: { $in: SYNCABLE_ORDER_STATUSES },
        $or: [
            { sapStatus: 'not_sent', paidAt: { $ne: null } },
            { sapStatus: 'processing', sapLockedAt: { $lt: new Date(now - STALE_LOCK_MS) } },
            { sapStatus: 'failed', sapRetryable: true, sapAttempts: { $lt: MAX_AUTO_ATTEMPTS }, sapLastAttemptAt: { $lt: new Date(now - RETRY_AFTER_MS) } }
        ]
    }, { _id: 1 }).limit(20);
    for (const { _id } of due) await syncOrderToSap(String(_id));
};

export const startSapScheduler = () => {
    const run = () => processSapQueue().catch(err => console.error('[SAP] Queue run failed:', err));
    const timer = setInterval(run, 5 * 60 * 1000);
    timer.unref();
    return timer;
};
