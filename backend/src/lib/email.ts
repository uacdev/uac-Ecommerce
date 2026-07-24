import { Resend } from 'resend';

let client: Resend | null = null;

const getClient = () => {
    if (client) return client;
    const key = process.env.RESEND_API_KEY;
    if (!key) {
        console.warn('⚠️  RESEND_API_KEY not set — emails will be skipped.');
        return null;
    }
    client = new Resend(key);
    return client;
};

const FROM = process.env.RESEND_FROM || `UAC Foods <noreply@${process.env.RESEND_DOMAIN || 'app.uacfoodsng.com'}>`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

type OrderItem = { name: string; quantity: number; price: number; image?: string };
type OrderEmailPayload = {
    reference: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    buyerAddress: string;
    items: OrderItem[];
    productAmount: number;
    deliveryFee: number;
    deliveryZone?: string;
    amount: number;
    paymentMethod?: string;
};

type PickupEmailPayload = {
    reference: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    items: OrderItem[];
    productAmount: number;
    amount: number;
    pickupLocation: string;
    pickupCode?: string;
};

const fmtNgn = (n: number) => `₦${n.toLocaleString('en-NG')}`;

const renderItemsTable = (items: OrderItem[]) => `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
            <tr style="background:#f7f7f7;text-align:left;">
                <th style="padding:10px;border-bottom:1px solid #eee;font-size:12px;">Item</th>
                <th style="padding:10px;border-bottom:1px solid #eee;font-size:12px;">Qty</th>
                <th style="padding:10px;border-bottom:1px solid #eee;font-size:12px;text-align:right;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            ${items.map(it => `
                <tr>
                    <td style="padding:10px;border-bottom:1px solid #f1f1f1;font-size:13px;">${it.name}</td>
                    <td style="padding:10px;border-bottom:1px solid #f1f1f1;font-size:13px;">${it.quantity}</td>
                    <td style="padding:10px;border-bottom:1px solid #f1f1f1;font-size:13px;text-align:right;">${fmtNgn(it.price * it.quantity)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
`;

const customerHtml = (o: OrderEmailPayload) => `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
        <div style="border-bottom:3px solid #ed0000;padding-bottom:16px;margin-bottom:24px;">
            <img src="https://ufl-ecommerce-website.vercel.app/images/uac_foods_full.png" alt="UAC Foods" style="height:48px;width:auto;display:block;" />
            <p style="margin:4px 0 0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1.5px;">Order confirmation</p>
        </div>

        <p style="font-size:15px;line-height:1.5;">Hi ${o.buyerName.split(' ')[0]},</p>
        <p style="font-size:14px;line-height:1.6;color:#333;">Thanks for your order. We've received it and our team is preparing it for dispatch. Below is a summary of what's coming your way.</p>

        <div style="background:#f9f9f9;border-radius:12px;padding:16px;margin:20px 0;font-size:13px;">
            <strong>Order reference:</strong> ${o.reference}
        </div>

        ${renderItemsTable(o.items)}

        <table style="width:100%;font-size:13px;margin-top:8px;">
            <tr><td style="padding:6px 0;color:#666;">Subtotal</td><td style="text-align:right;">${fmtNgn(o.productAmount)}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Delivery${o.deliveryZone ? ` (${o.deliveryZone})` : ''}</td><td style="text-align:right;">${fmtNgn(o.deliveryFee)}</td></tr>
            <tr style="border-top:1px solid #eee;"><td style="padding:10px 0;font-weight:bold;">Total</td><td style="text-align:right;font-weight:bold;color:#ed0000;font-size:16px;">${fmtNgn(o.amount)}</td></tr>
        </table>

        <div style="margin-top:24px;padding:16px;background:#f9f9f9;border-radius:12px;font-size:13px;line-height:1.6;">
            <strong style="display:block;margin-bottom:6px;">Delivering to</strong>
            ${o.buyerAddress}<br/>
            ${o.buyerPhone}
        </div>

        <p style="font-size:12px;color:#888;margin-top:32px;line-height:1.5;">If you didn't place this order, reply to this email and we'll sort it out.</p>
        <p style="font-size:12px;color:#aaa;margin-top:8px;">UAC Foods Nigeria · ${new Date().getFullYear()}</p>
    </div>
`;

const adminHtml = (o: OrderEmailPayload) => `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
        <h1 style="margin:0 0 16px;font-size:18px;color:#ed0000;">New order · ${o.reference}</h1>

        <table style="width:100%;font-size:13px;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#666;width:40%;">Customer</td><td>${o.buyerName}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Email</td><td>${o.buyerEmail}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Phone</td><td>${o.buyerPhone}</td></tr>
            <tr><td style="padding:6px 0;color:#666;vertical-align:top;">Address</td><td>${o.buyerAddress}</td></tr>
            ${o.deliveryZone ? `<tr><td style="padding:6px 0;color:#666;">Zone</td><td>${o.deliveryZone}</td></tr>` : ''}
            ${o.paymentMethod ? `<tr><td style="padding:6px 0;color:#666;">Payment</td><td>${o.paymentMethod}</td></tr>` : ''}
        </table>

        ${renderItemsTable(o.items)}

        <table style="width:100%;font-size:13px;margin-top:8px;">
            <tr><td style="padding:6px 0;color:#666;">Items subtotal</td><td style="text-align:right;">${fmtNgn(o.productAmount)}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Delivery</td><td style="text-align:right;">${fmtNgn(o.deliveryFee)}</td></tr>
            <tr style="border-top:1px solid #eee;"><td style="padding:10px 0;font-weight:bold;">Total</td><td style="text-align:right;font-weight:bold;">${fmtNgn(o.amount)}</td></tr>
        </table>
    </div>
`;

type ResetEmailPayload = {
    email: string;
    fullName: string;
    resetUrl: string;
    ttlMinutes: number;
};

const resetHtml = (p: ResetEmailPayload) => `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111;">
        <div style="border-bottom:3px solid #ed0000;padding-bottom:16px;margin-bottom:24px;">
            <img src="https://ufl-ecommerce-website.vercel.app/images/uac_foods_full.png" alt="UAC Foods" style="height:48px;width:auto;display:block;" />
            <p style="margin:4px 0 0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1.5px;">Password reset</p>
        </div>

        <p style="font-size:15px;line-height:1.5;">Hi ${p.fullName?.split(' ')[0] || 'there'},</p>
        <p style="font-size:14px;line-height:1.6;color:#333;">We received a request to reset the password on your admin account. Click the button below within the next ${p.ttlMinutes} minutes to set a new one.</p>

        <div style="text-align:center;margin:32px 0;">
            <a href="${p.resetUrl}" style="display:inline-block;background:#ed0000;color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:bold;font-size:14px;">
                Reset password
            </a>
        </div>

        <p style="font-size:12px;color:#666;line-height:1.6;">Or paste this link into your browser:<br/>
            <a href="${p.resetUrl}" style="color:#ed0000;word-break:break-all;">${p.resetUrl}</a>
        </p>

        <p style="font-size:12px;color:#888;margin-top:32px;line-height:1.5;">If you didn't request a password reset, you can ignore this email. Your password won't change.</p>
        <p style="font-size:12px;color:#aaa;margin-top:8px;">UAC Foods Nigeria · ${new Date().getFullYear()}</p>
    </div>
`;

export const sendPasswordResetEmail = async (payload: ResetEmailPayload) => {
    const c = getClient();
    if (!c) return false;
    try {
        await c.emails.send({
            from: FROM,
            to: payload.email,
            subject: 'Reset your UAC Foods admin password',
            html: resetHtml(payload)
        });
        return true;
    } catch (err) {
        console.error('Reset email failed:', err);
        return false;
    }
};

type RestockEmailPayload = {
    productId: string;
    productName: string;
    emails: string[];
};

const restockHtml = (productName: string, productLink: string) => `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111;">
        <div style="border-bottom:3px solid #ed0000;padding-bottom:16px;margin-bottom:24px;">
            <img src="https://ufl-ecommerce-website.vercel.app/images/uac_foods_full.png" alt="UAC Foods" style="height:48px;width:auto;display:block;" />
            <p style="margin:4px 0 0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1.5px;">It's back in stock</p>
        </div>

        <p style="font-size:16px;line-height:1.5;">Good news —</p>
        <p style="font-size:18px;line-height:1.4;color:#111;font-weight:bold;margin:8px 0 16px;">${productName} is available again.</p>
        <p style="font-size:14px;line-height:1.6;color:#333;">You asked to be notified when this came back. It just did. Tap the button below before someone else grabs it.</p>

        <div style="text-align:center;margin:32px 0;">
            <a href="${productLink}" style="display:inline-block;background:#ed0000;color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:bold;font-size:14px;">
                Order now
            </a>
        </div>

        <p style="font-size:11px;color:#888;line-height:1.5;margin-top:32px;">You're receiving this because you subscribed to a stock alert. We won't email you again about this product unless you re-subscribe.</p>
        <p style="font-size:11px;color:#aaa;margin-top:6px;">UAC Foods Nigeria · ${new Date().getFullYear()}</p>
    </div>
`;

export const sendBackInStockEmails = async (payload: RestockEmailPayload): Promise<{ sent: number; failed: number }> => {
    const c = getClient();
    if (!c) return { sent: 0, failed: payload.emails.length };

    const frontend = (process.env.FRONTEND_URL || 'http://localhost:5180').replace(/\/$/, '');
    const productLink = `${frontend}/product/${payload.productId}`;
    const html = restockHtml(payload.productName, productLink);

    const results = await Promise.allSettled(
        payload.emails.map(to =>
            c.emails.send({
                from: FROM,
                to,
                subject: `${payload.productName} is back in stock`,
                html
            })
        )
    );
    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - sent;
    if (failed > 0) {
        results.forEach((r, i) => {
            if (r.status === 'rejected') console.error(`Restock email to ${payload.emails[i]} failed:`, r.reason);
        });
    }
    return { sent, failed };
};

const pickupReceivedHtml = (p: PickupEmailPayload) => `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
        <div style="border-bottom:3px solid #ed0000;padding-bottom:16px;margin-bottom:24px;">
            <img src="https://ufl-ecommerce-website.vercel.app/images/uac_foods_full.png" alt="UAC Foods" style="height:48px;width:auto;display:block;" />
            <p style="margin:4px 0 0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1.5px;">Pickup order received</p>
        </div>

        <p style="font-size:15px;line-height:1.5;">Hi ${p.buyerName.split(' ')[0]},</p>
        <p style="font-size:14px;line-height:1.6;color:#333;">We’ve received your pickup order and it’s now being prepared. We’ll let you know as soon as it’s ready for collection.</p>

        <div style="background:#f9f9f9;border-radius:12px;padding:16px;margin:20px 0;font-size:13px;">
            <strong>Order reference:</strong> ${p.reference}
            ${p.pickupCode ? `<br/><strong>Pickup code:</strong> ${p.pickupCode}` : ''}
        </div>

        ${renderItemsTable(p.items)}

        <div style="margin-top:20px;padding:16px;background:#f9f9f9;border-radius:12px;font-size:13px;line-height:1.6;">
            <strong style="display:block;margin-bottom:6px;">Pickup location</strong>
            ${p.pickupLocation}
        </div>

        <p style="font-size:12px;color:#888;margin-top:32px;line-height:1.5;">If you need anything else, reply to this email and we’ll help.</p>
        <p style="font-size:12px;color:#aaa;margin-top:8px;">UAC Foods Nigeria · ${new Date().getFullYear()}</p>
    </div>
`;

const pickupReminderHtml = (p: PickupEmailPayload) => `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
        <div style="border-bottom:3px solid #ed0000;padding-bottom:16px;margin-bottom:24px;">
            <img src="https://ufl-ecommerce-website.vercel.app/images/uac_foods_full.png" alt="UAC Foods" style="height:48px;width:auto;display:block;" />
            <p style="margin:4px 0 0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1.5px;">Pickup reminder</p>
        </div>

        <p style="font-size:15px;line-height:1.5;">Hi ${p.buyerName.split(' ')[0]},</p>
        <p style="font-size:14px;line-height:1.6;color:#333;">Your pickup order is ready for collection. Please head to the pickup location below with your pickup code.</p>

        <div style="background:#f9f9f9;border-radius:12px;padding:16px;margin:20px 0;font-size:13px;">
            <strong>Order reference:</strong> ${p.reference}
            ${p.pickupCode ? `<br/><strong>Pickup code:</strong> ${p.pickupCode}` : ''}
        </div>

        ${renderItemsTable(p.items)}

        <div style="margin-top:20px;padding:16px;background:#f9f9f9;border-radius:12px;font-size:13px;line-height:1.6;">
            <strong style="display:block;margin-bottom:6px;">Pickup location</strong>
            ${p.pickupLocation}
        </div>

        <p style="font-size:12px;color:#888;margin-top:32px;line-height:1.5;">If you’re running late, reply to this email and we’ll help you sort it out.</p>
        <p style="font-size:12px;color:#aaa;margin-top:8px;">UAC Foods Nigeria · ${new Date().getFullYear()}</p>
    </div>
`;

export const sendOrderEmails = async (payload: OrderEmailPayload) => {
    const c = getClient();
    if (!c) return { customer: false, admin: false };

    const results = await Promise.allSettled([
        c.emails.send({
            from: FROM,
            to: payload.buyerEmail,
            subject: `Order confirmed — ${payload.reference}`,
            html: customerHtml(payload)
        }),
        ADMIN_EMAIL
            ? c.emails.send({
                from: FROM,
                to: ADMIN_EMAIL,
                subject: `[UAC] New order ${payload.reference} — ${fmtNgn(payload.amount)}`,
                html: adminHtml(payload)
            })
            : Promise.resolve(null)
    ]);

    const customerOk = results[0].status === 'fulfilled';
    const adminOk = results[1].status === 'fulfilled' && results[1].value !== null;

    if (results[0].status === 'rejected') console.error('Customer email failed:', results[0].reason);
    if (results[1].status === 'rejected') console.error('Admin email failed:', results[1].reason);

    return { customer: customerOk, admin: adminOk };
};

export const sendPickupOrderReceivedEmail = async (payload: PickupEmailPayload) => {
    const c = getClient();
    if (!c) return false;

    try {
        await c.emails.send({
            from: FROM,
            to: payload.buyerEmail,
            subject: `Pickup order received — ${payload.reference}`,
            html: pickupReceivedHtml(payload)
        });
        return true;
    } catch (err) {
        console.error('Pickup received email failed:', err);
        return false;
    }
};

export const sendPickupReminderEmail = async (payload: PickupEmailPayload) => {
    const c = getClient();
    if (!c) return false;

    try {
        await c.emails.send({
            from: FROM,
            to: payload.buyerEmail,
            subject: `Your pickup order is ready — ${payload.reference}`,
            html: pickupReminderHtml(payload)
        });
        return true;
    } catch (err) {
        console.error('Pickup reminder email failed:', err);
        return false;
    }
};
