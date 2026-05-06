import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Visit } from '../models/Visit';
import { CheckoutSession } from '../models/CheckoutSession';
import { NIGERIAN_STATES } from '../data/nigerianStates';

const utcDayKey = (d: Date) => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const PAID_STATUSES = ['paid', 'confirmed', 'shipped', 'delivered', 'completed'];

const pctDelta = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

const fmtTrend = (delta: number) => {
    const sign = delta >= 0 ? '+' : '';
    return `${sign}${delta.toFixed(1)}%`;
};

// Compute % of buyers (this month) whose lifetime order count > 1.
// Returns { rate, prevRate } so the caller can derive a month-over-month trend.
const computeReturningRate = async (thisMonthStart: Date, lastMonthStart: Date) => {
    const buildRate = async (windowStart: Date, windowEnd: Date) => {
        const buyersThisWindow: string[] = await Order.distinct('buyerEmail', {
            date: { $gte: windowStart, $lt: windowEnd },
            buyerEmail: { $ne: '' }
        });
        if (buyersThisWindow.length === 0) return 0;
        // Of those buyers, how many had a PRIOR order before the window?
        const returning = await Order.distinct('buyerEmail', {
            buyerEmail: { $in: buyersThisWindow },
            date: { $lt: windowStart }
        });
        return (returning.length / buyersThisWindow.length) * 100;
    };
    const rate = await buildRate(thisMonthStart, new Date());
    const prevRate = await buildRate(lastMonthStart, thisMonthStart);
    return { rate, prevRate };
};

// Abandonment = sessions started in window that never converted / total sessions started.
const computeAbandonmentRate = async (thisMonthStart: Date, lastMonthStart: Date) => {
    const buildRate = async (windowStart: Date, windowEnd: Date) => {
        const total = await CheckoutSession.countDocuments({
            startedAt: { $gte: windowStart, $lt: windowEnd }
        });
        if (total === 0) return 0;
        const abandoned = await CheckoutSession.countDocuments({
            startedAt: { $gte: windowStart, $lt: windowEnd },
            convertedAt: null
        });
        return (abandoned / total) * 100;
    };
    const rate = await buildRate(thisMonthStart, new Date());
    const prevRate = await buildRate(lastMonthStart, thisMonthStart);
    return { rate, prevRate };
};

// Today's unique-visitor count, plus yesterday's so the UI can render a trend.
const computeVisitorStats = async () => {
    const today = utcDayKey(new Date());
    const yesterday = utcDayKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
    const [todayCount, yesterdayCount] = await Promise.all([
        Visit.countDocuments({ dateKey: today }),
        Visit.countDocuments({ dateKey: yesterday })
    ]);
    return { today: todayCount, yesterday: yesterdayCount };
};

export const getKpis = async (_req: Request, res: Response) => {
    try {
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const [thisMonth, lastMonth, allOrders, totalProducts, returning, abandonment, visitors] = await Promise.all([
            Order.aggregate([
                { $match: { date: { $gte: thisMonthStart } } },
                { $group: { _id: null, revenue: { $sum: '$amount' }, count: { $sum: 1 }, customers: { $addToSet: '$buyerEmail' } } }
            ]),
            Order.aggregate([
                { $match: { date: { $gte: lastMonthStart, $lt: thisMonthStart } } },
                { $group: { _id: null, revenue: { $sum: '$amount' }, count: { $sum: 1 }, customers: { $addToSet: '$buyerEmail' } } }
            ]),
            Order.aggregate([
                { $group: { _id: null, revenue: { $sum: '$amount' }, count: { $sum: 1 }, customers: { $addToSet: '$buyerEmail' } } }
            ]),
            Product.countDocuments(),
            computeReturningRate(thisMonthStart, lastMonthStart),
            computeAbandonmentRate(thisMonthStart, lastMonthStart),
            computeVisitorStats()
        ]);

        const tm = thisMonth[0] || { revenue: 0, count: 0, customers: [] };
        const lm = lastMonth[0] || { revenue: 0, count: 0, customers: [] };
        const all = allOrders[0] || { revenue: 0, count: 0, customers: [] };

        const revenueDelta = pctDelta(tm.revenue, lm.revenue);
        const ordersDelta = pctDelta(tm.count, lm.count);
        const aovThis = tm.count > 0 ? tm.revenue / tm.count : 0;
        const aovLast = lm.count > 0 ? lm.revenue / lm.count : 0;
        const aovDelta = pctDelta(aovThis, aovLast);

        const totalCustomers = (all.customers || []).length;
        const newThisMonth = (tm.customers || []).filter((e: string) => !(lm.customers || []).includes(e)).length;
        const newLastMonth = (lm.customers || []).length;
        const customersDelta = pctDelta(newThisMonth, newLastMonth);

        // Returning rate is already a percentage — its delta is in percentage points, not relative.
        const returningDelta = returning.rate - returning.prevRate;
        // Abandonment going DOWN is good, so flip the sign for `positive`.
        const abandonmentDelta = abandonment.rate - abandonment.prevRate;
        const visitorsDelta = pctDelta(visitors.today, visitors.yesterday);

        res.json({
            success: true,
            data: {
                totalRevenue: all.revenue,
                totalOrders: all.count,
                avgOrderValue: all.count > 0 ? all.revenue / all.count : 0,
                totalCustomers,
                totalProducts,
                returningRate: returning.rate,
                abandonmentRate: abandonment.rate,
                dailyVisitors: visitors.today,
                trends: {
                    revenue: { value: revenueDelta, label: fmtTrend(revenueDelta), positive: revenueDelta >= 0 },
                    orders: { value: ordersDelta, label: fmtTrend(ordersDelta), positive: ordersDelta >= 0 },
                    aov: { value: aovDelta, label: fmtTrend(aovDelta), positive: aovDelta >= 0 },
                    customers: { value: customersDelta, label: fmtTrend(customersDelta), positive: customersDelta >= 0 },
                    returning: { value: returningDelta, label: `${returningDelta >= 0 ? '+' : ''}${returningDelta.toFixed(1)}%`, positive: returningDelta >= 0 },
                    abandonment: { value: abandonmentDelta, label: `${abandonmentDelta >= 0 ? '+' : ''}${abandonmentDelta.toFixed(1)}%`, positive: abandonmentDelta <= 0 },
                    visitors: { value: visitorsDelta, label: fmtTrend(visitorsDelta), positive: visitorsDelta >= 0 }
                }
            }
        });
    } catch (err: any) {
        console.error('Error in getKpis:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getSalesChart = async (req: Request, res: Response) => {
    try {
        const timeframe = String(req.query.timeframe || 'Monthly');
        const now = new Date();

        let startDate: Date;
        let groupBy: any;
        let labelFormat: (d: Date) => string;

        if (timeframe === 'Daily') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);
            groupBy = { y: { $year: '$date' }, m: { $month: '$date' }, d: { $dayOfMonth: '$date' } };
            labelFormat = (d) => d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
        } else if (timeframe === 'Weekly') {
            startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
            groupBy = { y: { $isoWeekYear: '$date' }, w: { $isoWeek: '$date' } };
            labelFormat = (d) => `Wk ${getIsoWeek(d)}`;
        } else {
            startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
            groupBy = { y: { $year: '$date' }, m: { $month: '$date' } };
            labelFormat = (d) => d.toLocaleDateString('en-NG', { month: 'short' });
        }

        const rows = await Order.aggregate([
            { $match: { date: { $gte: startDate } } },
            { $group: { _id: groupBy, value: { $sum: '$amount' } } },
            { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1, '_id.w': 1 } }
        ]);

        const buckets = buildBuckets(startDate, now, timeframe);
        const map = new Map<string, number>();
        for (const r of rows) {
            map.set(bucketKey(r._id, timeframe), r.value);
        }

        const data = buckets.map(b => ({
            name: labelFormat(b.date),
            value: map.get(b.key) || 0
        }));

        res.json({ success: true, timeframe, data });
    } catch (err: any) {
        console.error('Error in getSalesChart:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const getIsoWeek = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

const bucketKey = (id: any, timeframe: string) => {
    if (timeframe === 'Daily') return `${id.y}-${id.m}-${id.d}`;
    if (timeframe === 'Weekly') return `${id.y}-W${id.w}`;
    return `${id.y}-${id.m}`;
};

const buildBuckets = (start: Date, end: Date, timeframe: string) => {
    const buckets: { key: string; date: Date }[] = [];
    const cur = new Date(start);
    if (timeframe === 'Daily') {
        while (cur <= end) {
            buckets.push({ key: `${cur.getFullYear()}-${cur.getMonth() + 1}-${cur.getDate()}`, date: new Date(cur) });
            cur.setDate(cur.getDate() + 1);
        }
    } else if (timeframe === 'Weekly') {
        while (cur <= end) {
            buckets.push({ key: `${cur.getFullYear()}-W${getIsoWeek(cur)}`, date: new Date(cur) });
            cur.setDate(cur.getDate() + 7);
        }
    } else {
        while (cur <= end) {
            buckets.push({ key: `${cur.getFullYear()}-${cur.getMonth() + 1}`, date: new Date(cur) });
            cur.setMonth(cur.getMonth() + 1);
        }
    }
    return buckets;
};

export const getBestSellers = async (_req: Request, res: Response) => {
    try {
        const top = await Order.aggregate([
            { $match: { status: { $in: PAID_STATUSES } } },
            { $unwind: '$items' },
            { $group: {
                _id: '$items.productId',
                name: { $first: '$items.name' },
                image: { $first: '$items.image' },
                price: { $first: '$items.price' },
                unitsSold: { $sum: '$items.quantity' },
                revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
            } },
            { $sort: { unitsSold: -1 } },
            { $limit: 5 }
        ]);

        // If no paid orders yet, return top 5 by created_at as a placeholder
        if (top.length === 0) {
            const fallback = await Product.find().sort({ created_at: -1 }).limit(5);
            return res.json({
                success: true,
                data: fallback.map(p => ({
                    id: p.id,
                    name: p.name,
                    image: p.image,
                    price: p.price,
                    unitsSold: 0,
                    revenue: 0
                }))
            });
        }

        // Backfill name/image/price from the live Product. Match by id first;
        // if the original product was deleted (e.g. catalogue reseed), fall
        // back to a prefix-name match — `Gala` finds `Gala Classic 60g…`.
        const productIds = top.map(t => String(t._id));
        const products = await Product.find({ _id: { $in: productIds } });
        const productMap = new Map(products.map(p => [String(p._id), p]));

        const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const resolved = await Promise.all(top.map(async (t) => {
            let live = productMap.get(String(t._id));
            if (!live && t.name) {
                live = await Product.findOne({
                    name: new RegExp(`^${escapeRegex(t.name)}\\b`, 'i')
                }) || undefined;
            }
            return {
                id: live?._id || t._id,
                name: live?.name || t.name || '',
                image: live?.image || live?.images?.[0] || t.image || '',
                price: live?.price ?? t.price ?? 0,
                unitsSold: t.unitsSold,
                revenue: t.revenue
            };
        }));

        res.json({ success: true, data: resolved });
    } catch (err: any) {
        console.error('Error in getBestSellers:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const ONGOING_STATUSES = ['pending', 'paid', 'confirmed', 'shipped'];
const DONE_STATUSES = ['delivered', 'completed'];

export const getCustomerOrders = async (req: Request, res: Response) => {
    try {
        const email = String(req.params.email || '').trim().toLowerCase();
        if (!email) return res.status(400).json({ success: false, message: 'email is required' });

        const orders = await Order.find({ buyerEmail: email }).sort({ date: -1 });
        if (orders.length === 0) {
            return res.json({
                success: true,
                data: {
                    summary: {
                        totalOrders: 0,
                        ongoingOrders: 0,
                        completedOrders: 0,
                        cancelledOrders: 0,
                        totalSpend: 0,
                        joinDate: null,
                        lastOrderDate: null,
                        name: '',
                        phone: ''
                    },
                    orders: []
                }
            });
        }

        const ongoing = orders.filter(o => ONGOING_STATUSES.includes(o.status as string)).length;
        const completed = orders.filter(o => DONE_STATUSES.includes(o.status as string)).length;
        const cancelled = orders.filter(o => o.status === 'cancelled').length;
        const totalSpend = orders
            .filter(o => o.status !== 'cancelled')
            .reduce((s, o) => s + (o.amount || 0), 0);

        // Use the most recent non-empty values for name/phone
        const latest = orders[0];

        res.json({
            success: true,
            data: {
                summary: {
                    totalOrders: orders.length,
                    ongoingOrders: ongoing,
                    completedOrders: completed,
                    cancelledOrders: cancelled,
                    totalSpend,
                    joinDate: orders[orders.length - 1].date,
                    lastOrderDate: latest.date,
                    name: latest.buyerName,
                    phone: latest.buyerPhone
                },
                orders
            }
        });
    } catch (err: any) {
        console.error('Error in getCustomerOrders:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getGeography = async (_req: Request, res: Response) => {
    try {
        const rows = await Order.aggregate([
            { $match: { buyerState: { $exists: true, $ne: '' } } },
            { $group: {
                _id: '$buyerState',
                orderCount: { $sum: 1 },
                revenue: { $sum: '$amount' },
                customers: { $addToSet: '$buyerEmail' }
            } },
            { $project: {
                _id: 0,
                state: '$_id',
                orderCount: 1,
                revenue: 1,
                customerCount: { $size: '$customers' }
            } },
            { $sort: { orderCount: -1 } }
        ]);

        // Pad zero-state entries so every state appears for the heatmap
        const present = new Set(rows.map(r => r.state));
        const padded = [
            ...rows,
            ...NIGERIAN_STATES
                .filter(s => !present.has(s))
                .map(state => ({ state, orderCount: 0, revenue: 0, customerCount: 0 }))
        ];

        const totals = rows.reduce(
            (acc, r) => ({ orders: acc.orders + r.orderCount, revenue: acc.revenue + r.revenue }),
            { orders: 0, revenue: 0 }
        );

        res.json({
            success: true,
            totals,
            data: padded
        });
    } catch (err: any) {
        console.error('Error in getGeography:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getRevenueByCategory = async (_req: Request, res: Response) => {
    try {
        const rows = await Order.aggregate([
            { $match: { status: { $in: PAID_STATUSES } } },
            { $unwind: '$items' },
            { $lookup: {
                from: 'products',
                let: { pid: '$items.productId' },
                pipeline: [{ $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$pid'] } } }],
                as: 'product'
            } },
            { $addFields: {
                category: {
                    $ifNull: [{ $arrayElemAt: ['$product.category', 0] }, '$items.name']
                }
            } },
            { $group: {
                _id: '$category',
                revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                units: { $sum: '$items.quantity' }
            } },
            { $project: { _id: 0, category: '$_id', revenue: 1, units: 1 } },
            { $sort: { revenue: -1 } }
        ]);
        res.json({ success: true, data: rows });
    } catch (err: any) {
        console.error('Error in getRevenueByCategory:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getOrdersByHour = async (_req: Request, res: Response) => {
    try {
        // 1=Sun ... 7=Sat in $dayOfWeek; we'll re-key to 0=Sun ... 6=Sat for the UI
        const rows = await Order.aggregate([
            { $group: {
                _id: { dow: { $dayOfWeek: '$date' }, hour: { $hour: '$date' } },
                count: { $sum: 1 }
            } }
        ]);

        // Build a 7×24 grid (rows=days Sun..Sat, cols=hours 0..23)
        const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
        let max = 0;
        for (const r of rows) {
            const day = (r._id.dow - 1) % 7;
            const hour = r._id.hour;
            if (day >= 0 && day < 7 && hour >= 0 && hour < 24) {
                grid[day][hour] = r.count;
                if (r.count > max) max = r.count;
            }
        }
        res.json({ success: true, max, data: grid });
    } catch (err: any) {
        console.error('Error in getOrdersByHour:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const ALL_STATUSES = ['pending', 'paid', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled'];

export const getStatusFunnel = async (_req: Request, res: Response) => {
    try {
        const rows = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$amount' } } }
        ]);
        const map = new Map<string, { count: number; revenue: number }>();
        rows.forEach(r => map.set(r._id, { count: r.count, revenue: r.revenue }));
        const data = ALL_STATUSES.map(status => ({
            status,
            count: map.get(status)?.count || 0,
            revenue: map.get(status)?.revenue || 0
        }));
        res.json({ success: true, data });
    } catch (err: any) {
        console.error('Error in getStatusFunnel:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Country code → display name. We only store the ISO-2 code on Visit so we
// can render the chart with full names. Limited to the relevant set; everything
// else just shows the raw code.
const COUNTRY_NAMES: Record<string, string> = {
    NG: 'Nigeria', GB: 'United Kingdom', US: 'United States', CA: 'Canada',
    GH: 'Ghana', ZA: 'South Africa', KE: 'Kenya', DE: 'Germany',
    FR: 'France', IT: 'Italy', ES: 'Spain', NL: 'Netherlands',
    IE: 'Ireland', AU: 'Australia', AE: 'United Arab Emirates', SA: 'Saudi Arabia',
    IN: 'India', CN: 'China', JP: 'Japan', BR: 'Brazil',
    EG: 'Egypt', MA: 'Morocco', SN: 'Senegal', CM: 'Cameroon'
};

// GET /api/stats/web-analytics?days=30
// Aggregates the Visit collection into the cards/charts the admin tab renders.
export const getWebAnalytics = async (req: Request, res: Response) => {
    try {
        const days = Math.min(365, Math.max(1, parseInt(String(req.query.days || '30'), 10)));
        const since = new Date();
        since.setUTCDate(since.getUTCDate() - days + 1);
        since.setUTCHours(0, 0, 0, 0);
        const sinceKey = since.toISOString().slice(0, 10);

        const matchWindow = { dateKey: { $gte: sinceKey } };

        const [
            totalsAgg,
            byCountry,
            bySource,
            byDay,
            byPath,
            byNigeriaState
        ] = await Promise.all([
            Visit.aggregate([
                { $match: matchWindow },
                { $group: { _id: null, total: { $sum: 1 }, uniqueVisitors: { $addToSet: '$visitorId' } } },
                { $project: { _id: 0, total: 1, uniqueVisitors: { $size: '$uniqueVisitors' } } }
            ]),
            Visit.aggregate([
                { $match: { ...matchWindow, countryCode: { $ne: '' } } },
                { $group: { _id: '$countryCode', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 12 }
            ]),
            Visit.aggregate([
                { $match: matchWindow },
                { $group: { _id: '$referrerSource', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Visit.aggregate([
                { $match: matchWindow },
                { $group: { _id: '$dateKey', count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            Visit.aggregate([
                { $match: { ...matchWindow, path: { $ne: '' } } },
                { $group: { _id: '$path', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            Visit.aggregate([
                { $match: { ...matchWindow, countryCode: 'NG', region: { $ne: '' } } },
                { $group: { _id: '$region', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 12 }
            ])
        ]);

        // Pad the daily series so the chart shows zero-buckets, not gaps.
        const dailyMap = new Map<string, number>();
        for (const r of byDay) dailyMap.set(r._id, r.count);
        const daily: { date: string; count: number }[] = [];
        const cursor = new Date(since);
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        while (cursor <= today) {
            const k = cursor.toISOString().slice(0, 10);
            daily.push({ date: k, count: dailyMap.get(k) || 0 });
            cursor.setUTCDate(cursor.getUTCDate() + 1);
        }

        res.json({
            success: true,
            data: {
                window: { days, since: sinceKey },
                totals: totalsAgg[0] || { total: 0, uniqueVisitors: 0 },
                byCountry: byCountry.map(c => ({
                    code: c._id,
                    name: COUNTRY_NAMES[c._id] || c._id,
                    count: c.count
                })),
                bySource: bySource.map(s => ({ source: s._id || 'direct', count: s.count })),
                byPath: byPath.map(p => ({ path: p._id, count: p.count })),
                byNigeriaState: byNigeriaState.map(s => ({ region: s._id, count: s.count })),
                daily
            }
        });
    } catch (err: any) {
        console.error('Error in getWebAnalytics:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getCustomers = async (_req: Request, res: Response) => {
    try {
        const rows = await Order.aggregate([
            { $group: {
                _id: '$buyerEmail',
                name: { $first: '$buyerName' },
                email: { $first: '$buyerEmail' },
                phone: { $first: '$buyerPhone' },
                orders: { $sum: 1 },
                totalSpend: { $sum: '$amount' },
                joinDate: { $min: '$date' },
                lastOrderDate: { $max: '$date' }
            } },
            { $sort: { lastOrderDate: -1 } }
        ]);

        const data = rows.map(r => ({
            id: Buffer.from(r._id || '').toString('base64').slice(0, 12),
            name: r.name || 'Unknown',
            email: r.email || '',
            phone: r.phone || '',
            orders: r.orders,
            totalSpend: r.totalSpend,
            joinDate: r.joinDate,
            lastOrderDate: r.lastOrderDate
        }));

        res.json({ success: true, count: data.length, data });
    } catch (err: any) {
        console.error('Error in getCustomers:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
