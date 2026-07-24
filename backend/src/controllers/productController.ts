import { Request, Response } from 'express';
import { Product, PRODUCT_LOCATIONS } from '../models/Product';
import { StockSubscription } from '../models/StockSubscription';
import { notify } from '../lib/notify';
import { sendBackInStockEmails } from '../lib/email';

const ALLOWED_FIELDS = [
    'name', 'brand', 'description', 'category', 'image', 'images',
    'location', 'packaging', 'piecesPerPack', 'displayOrder', 'price', 'status', 'stockCount', 'is_reserved'
];

const sanitize = (body: any) => {
    const out: Record<string, any> = {};
    for (const k of ALLOWED_FIELDS) {
        if (k in body) out[k] = body[k];
    }
    return out;
};

const normalizePiecesPerPack = (value: any) => {
    if (value === undefined || value === null || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const normalizeDisplayOrder = (value: any) => {
    if (value === undefined || value === null || value === '') return 0;
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
};

export const getProducts = async (_req: Request, res: Response) => {
    try {
        const data = await Product.find().sort({ displayOrder: 1, created_at: -1 });
        res.json({ success: true, count: data.length, data });
    } catch (err: any) {
        console.error('Error in getProducts:', err);
        res.status(500).json({ success: false, message: err.message || 'Error fetching products' });
    }
};

// Admin-only: per-product sales totals (units sold + revenue) across paid orders.
export const getProductsSalesSummary = async (_req: Request, res: Response) => {
    try {
        // Lazy-import to keep this controller free of cross-module knowledge
        const { Order } = await import('../models/Order');
        const PAID = ['paid', 'confirmed', 'shipped', 'delivered', 'completed'];

        const rows = await Order.aggregate([
            { $match: { status: { $in: PAID } } },
            { $unwind: '$items' },
            { $group: {
                _id: '$items.productId',
                soldUnits: { $sum: '$items.quantity' },
                revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                orders: { $sum: 1 }
            } },
            { $project: { _id: 0, productId: '$_id', soldUnits: 1, revenue: 1, orders: 1 } }
        ]);

        const summary: Record<string, { soldUnits: number; revenue: number; orders: number }> = {};
        for (const r of rows) {
            summary[String(r.productId)] = { soldUnits: r.soldUnits, revenue: r.revenue, orders: r.orders };
        }
        res.json({ success: true, data: summary });
    } catch (err: any) {
        console.error('Error in getProductsSalesSummary:', err);
        res.status(500).json({ success: false, message: err.message || 'Error fetching sales summary' });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const payload = sanitize(req.body);
        if (!payload.name) return res.status(400).json({ success: false, message: 'name is required' });
        if (!payload.category) return res.status(400).json({ success: false, message: 'category is required' });
        if (payload.price === undefined || payload.price === null || payload.price === '') {
            return res.status(400).json({ success: false, message: 'price is required' });
        }
        if (!payload.location || !PRODUCT_LOCATIONS.includes(payload.location)) {
            return res.status(400).json({ success: false, message: `location must be one of ${PRODUCT_LOCATIONS.join(', ')}` });
        }
        // Status is derived from stockCount; ignore any incoming status on create
        const stock = Number(payload.stockCount ?? 0);
        payload.stockCount = stock;
        payload.status = stock > 0 ? 'available' : 'out_of_stock';
        payload.piecesPerPack = normalizePiecesPerPack(payload.piecesPerPack);
        payload.displayOrder = normalizeDisplayOrder(payload.displayOrder);

        const created = await Product.create(payload);

        // Auto-register the brand as a Category record so the admin tab
        // reflects the storefront without manual upkeep. Best-effort — a
        // failure here doesn't block the create.
        try {
            if (payload.brand) {
                const { Category } = await import('../models/Category');
                await Category.updateOne(
                    { name: payload.brand },
                    { $setOnInsert: { name: payload.brand, parent: 'Brand', color: 'bg-rose-50 text-rose-700' } },
                    { upsert: true }
                );
            }
        } catch (catErr: any) {
            if (catErr?.code !== 11000) console.warn('Auto-category sync failed (non-fatal):', catErr?.message);
        }

        res.status(201).json({ success: true, data: created });
    } catch (err: any) {
        console.error('Error in createProduct:', err);
        res.status(400).json({ success: false, message: err.message || 'Error creating product' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const payload = sanitize(req.body);
        if (payload.location && !PRODUCT_LOCATIONS.includes(payload.location)) {
            return res.status(400).json({ success: false, message: `location must be one of ${PRODUCT_LOCATIONS.join(', ')}` });
        }

        const before = await Product.findById(id);
        if (!before) return res.status(404).json({ success: false, message: 'Product not found' });

        // Status is no longer set manually — it is always derived from stockCount.
        // If the admin sent a stockCount, recalc status. Otherwise leave both alone.
        if (payload.piecesPerPack !== undefined) {
            payload.piecesPerPack = normalizePiecesPerPack(payload.piecesPerPack);
        }
        if (payload.displayOrder !== undefined) {
            payload.displayOrder = normalizeDisplayOrder(payload.displayOrder);
        }

        if (payload.stockCount !== undefined) {
            const newStock = Math.max(0, Number(payload.stockCount));
            payload.stockCount = newStock;
            payload.status = newStock > 0 ? 'available' : 'out_of_stock';
        } else {
            // Strip any stale status from the payload so admin can't drift it from inventory truth
            delete payload.status;
        }

        const updated = await Product.findByIdAndUpdate(id, payload, { returnDocument: 'after', runValidators: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Product not found' });

        const beforeStatus = String(before.status);
        const afterStatus = String(updated.status);

        // Notify on transition into out_of_stock
        if (beforeStatus !== 'out_of_stock' && afterStatus === 'out_of_stock') {
            notify({
                type: 'inventory',
                title: 'Inventory alert · out of stock',
                description: `${updated.name} just hit zero stock.`,
                meta: { productId: updated.id, name: updated.name }
            });
        }

        // Restock: was out, now available — fire emails to all pending subscribers
        if (beforeStatus === 'out_of_stock' && afterStatus === 'available') {
            void sendRestockEmails(updated.id as string, updated.name as string);
        }

        res.json({ success: true, data: updated });
    } catch (err: any) {
        console.error('Error in updateProduct:', err);
        res.status(400).json({ success: false, message: err.message || 'Error updating product' });
    }
};

const PAID_STATUSES = ['paid', 'confirmed', 'shipped', 'delivered', 'completed'];

// Admin: deep stats for a single product
export const getProductStats = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        const { Order } = await import('../models/Order');
        const { Review } = await import('../models/Review');

        const productIdStr = String(product._id);

        // Sales summary: $unwind items, match this product, group totals
        const [salesAgg] = await Order.aggregate([
            { $match: { status: { $in: PAID_STATUSES } } },
            { $unwind: '$items' },
            { $match: { 'items.productId': productIdStr } },
            { $group: {
                _id: null,
                soldUnits: { $sum: '$items.quantity' },
                revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                orderCount: { $sum: 1 },
                buyers: { $addToSet: '$buyerEmail' }
            } }
        ]);

        const sales = salesAgg
            ? { soldUnits: salesAgg.soldUnits, revenue: salesAgg.revenue, orderCount: salesAgg.orderCount, uniqueBuyers: salesAgg.buyers.length }
            : { soldUnits: 0, revenue: 0, orderCount: 0, uniqueBuyers: 0 };

        // Recent orders containing this product (last 10, any status)
        const recentOrders = await Order.find({ 'items.productId': productIdStr })
            .sort({ date: -1 })
            .limit(10)
            .select('reference buyerName buyerEmail amount status date items');

        // Top buyers of this product (by quantity)
        const topBuyers = await Order.aggregate([
            { $match: { status: { $in: PAID_STATUSES } } },
            { $unwind: '$items' },
            { $match: { 'items.productId': productIdStr } },
            { $group: {
                _id: '$buyerEmail',
                name: { $first: '$buyerName' },
                units: { $sum: '$items.quantity' },
                spend: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                orders: { $sum: 1 }
            } },
            { $sort: { units: -1 } },
            { $limit: 5 },
            { $project: { _id: 0, email: '$_id', name: 1, units: 1, spend: 1, orders: 1 } }
        ]);

        // Monthly sales chart for last 12 months
        const now = new Date();
        const since = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        const monthlyRows = await Order.aggregate([
            { $match: { status: { $in: PAID_STATUSES }, date: { $gte: since } } },
            { $unwind: '$items' },
            { $match: { 'items.productId': productIdStr } },
            { $group: {
                _id: { y: { $year: '$date' }, m: { $month: '$date' } },
                units: { $sum: '$items.quantity' },
                revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
            } }
        ]);

        const map = new Map<string, { units: number; revenue: number }>();
        for (const r of monthlyRows) {
            map.set(`${r._id.y}-${r._id.m}`, { units: r.units, revenue: r.revenue });
        }
        const chart: { name: string; units: number; revenue: number }[] = [];
        const cur = new Date(since);
        while (cur <= now) {
            const k = `${cur.getFullYear()}-${cur.getMonth() + 1}`;
            const row = map.get(k) || { units: 0, revenue: 0 };
            chart.push({
                name: cur.toLocaleDateString('en-NG', { month: 'short' }),
                units: row.units,
                revenue: row.revenue
            });
            cur.setMonth(cur.getMonth() + 1);
        }

        // Reviews
        const reviews = await Review.find({ productId: product._id }).sort({ date: -1 }).limit(5);
        const allRatings = await Review.find({ productId: product._id }).select('rating');
        const reviewSummary = {
            count: allRatings.length,
            avgRating: allRatings.length > 0
                ? Number((allRatings.reduce((s, r) => s + (r.rating as number), 0) / allRatings.length).toFixed(2))
                : 0
        };

        // Pending restock subscribers
        const pendingRestock = await StockSubscription.countDocuments({
            productId: product._id,
            notifiedAt: null
        });

        res.json({
            success: true,
            data: {
                product,
                sales,
                chart,
                recentOrders,
                topBuyers,
                reviews: { ...reviewSummary, recent: reviews },
                pendingRestockSubscribers: pendingRestock
            }
        });
    } catch (err: any) {
        console.error('Error in getProductStats:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Helper: dispatch back-in-stock emails to pending subscribers, log audit notification.
const sendRestockEmails = async (productId: string, productName: string) => {
    try {
        const subs = await StockSubscription.find({ productId, notifiedAt: null });
        if (subs.length === 0) return;

        const emails = subs.map(s => s.email);
        const result = await sendBackInStockEmails({ productId, productName, emails });

        await StockSubscription.updateMany(
            { _id: { $in: subs.map(s => s._id) } },
            { $set: { notifiedAt: new Date() } }
        );

        notify({
            type: 'inventory',
            title: 'Back-in-stock emails sent',
            description: `${productName} · ${emails.length} subscriber${emails.length === 1 ? '' : 's'}${result.failed > 0 ? ` (${result.failed} failed)` : ''}`,
            meta: { productId, count: emails.length, failed: result.failed }
        });
    } catch (err) {
        console.error('Restock email dispatch failed:', err);
    }
};

// Public — customer subscribes to a notification for an out-of-stock product
export const subscribeRestock = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const email = String(req.body.email || '').trim().toLowerCase();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'A valid email is required' });
        }
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        if (product.status !== 'out_of_stock') {
            return res.status(400).json({ success: false, message: 'This product is currently in stock — no need to subscribe.' });
        }

        // Upsert: create if no pending subscription exists for this (product, email)
        try {
            await new StockSubscription({
                productId: product._id,
                productName: product.name,
                email
            }).save();
        } catch (err: any) {
            if (err?.code === 11000) {
                return res.json({ success: true, message: "You're already on the list — we'll email you when it's back." });
            }
            throw err;
        }

        res.status(201).json({ success: true, message: "We'll email you the moment it's back in stock." });
    } catch (err: any) {
        console.error('Error in subscribeRestock:', err);
        res.status(400).json({ success: false, message: err.message || 'Could not save subscription' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, message: 'Product deleted' });
    } catch (err: any) {
        console.error('Error in deleteProduct:', err);
        res.status(400).json({ success: false, message: err.message || 'Error deleting product' });
    }
};

export const bulkCreateProducts = async (req: Request, res: Response) => {
    try {
        const { products } = req.body;
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ success: false, message: 'An array of products is required' });
        }

        const validProducts = [];
        const errors = [];
        const brandsToCreate = new Set<string>();
        const categoryNamesNeeded = new Set<string>();

        // First pass: validate rows and collect category names we need to resolve
        for (let i = 0; i < products.length; i++) {
            const payload = sanitize(products[i]);
            const rowNum = i + 1;

            if (!payload.name) { errors.push(`Row ${rowNum}: name is required`); continue; }
            if (!payload.category) { errors.push(`Row ${rowNum}: category is required`); continue; }
            if (payload.price === undefined || payload.price === null || payload.price === '') {
                errors.push(`Row ${rowNum}: price is required`); continue;
            }
            if (!payload.location || !PRODUCT_LOCATIONS.includes(payload.location)) {
                errors.push(`Row ${rowNum}: location must be one of ${PRODUCT_LOCATIONS.join(', ')}`); continue;
            }

            const stock = Number(payload.stockCount ?? 0);
            payload.stockCount = stock;
            payload.status = stock > 0 ? 'available' : 'out_of_stock';
            payload.piecesPerPack = normalizePiecesPerPack(payload.piecesPerPack);

            if (payload.brand) brandsToCreate.add(payload.brand);

            // Track which categories need image lookup (only when no image supplied)
            if (!payload.image) categoryNamesNeeded.add(payload.category);

            validProducts.push(payload);
        }

        if (errors.length > 0) {
            return res.status(400).json({ success: false, message: 'Validation failed for some products', errors });
        }

        // Fetch all needed categories in one query and build a name → coverImage map
        const { Category } = await import('../models/Category');
        const categoryImageMap: Record<string, string> = {};
        if (categoryNamesNeeded.size > 0) {
            const cats = await Category.find(
                { name: { $in: Array.from(categoryNamesNeeded) } },
                { name: 1, coverImage: 1 }
            );
            for (const c of cats) {
                if (c.coverImage) categoryImageMap[c.name] = c.coverImage;
            }
        }

        // Second pass: apply category image fallback
        for (const payload of validProducts) {
            if (!payload.image && categoryImageMap[payload.category]) {
                payload.image = categoryImageMap[payload.category];
            }
        }

        const created = await Product.insertMany(validProducts);

        // Auto-sync brands as Category records (best-effort)
        if (brandsToCreate.size > 0) {
            try {
                const bulkOps = Array.from(brandsToCreate).map(brand => ({
                    updateOne: {
                        filter: { name: brand },
                        update: { $setOnInsert: { name: brand, parent: 'Brand', color: 'bg-rose-50 text-rose-700' } },
                        upsert: true
                    }
                }));
                await Category.bulkWrite(bulkOps);
            } catch (catErr: any) {
                console.warn('Auto-category sync failed for bulk insert (non-fatal):', catErr?.message);
            }
        }

        res.status(201).json({ success: true, count: created.length, data: created });
    } catch (err: any) {
        console.error('Error in bulkCreateProducts:', err);
        res.status(400).json({ success: false, message: err.message || 'Error creating products in bulk' });
    }
};

