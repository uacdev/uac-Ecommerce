import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Order } from '../models/Order';

const PAID_STATUSES = ['paid', 'confirmed', 'shipped', 'delivered', 'completed'];

// Categories ARE brands. Walk every product's `brand` and ensure a Category
// record exists for each. Idempotent — $setOnInsert means we never overwrite
// admin-edited fields (color, coverImage, abstract). No pruning: a brand
// without products yet (e.g. Supreme while imagery is pending) stays as a
// placeholder so the admin can pre-stage covers/copy. Admin-initiated deletes
// run through deleteCategory, which is the only path that removes one.
const ensureCategoriesFromProducts = async () => {
    const products = await Product.find({}, { brand: 1 }).lean();
    const brands = new Set<string>();
    for (const p of products) {
        const b = String(p.brand || '').trim();
        if (b) brands.add(b);
    }
    if (brands.size === 0) return;

    const ops = Array.from(brands).map(name => ({
        updateOne: {
            filter: { name },
            update: { $setOnInsert: { name, parent: 'Brand', color: 'bg-rose-50 text-rose-700' } },
            upsert: true
        }
    }));
    try { await Category.bulkWrite(ops, { ordered: false }); }
    catch (err: any) {
        if (err?.code !== 11000) throw err;
    }
};

export const getCategories = async (_req: Request, res: Response) => {
    try {
        await ensureCategoriesFromProducts();
        const data = await Category.find().sort({ parent: 1, name: 1 }).lean();
        res.json({ success: true, count: data.length, data });
    } catch (err: any) {
        console.error('Error in getCategories:', err);
        res.status(500).json({ success: false, message: err.message || 'Error fetching categories' });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, abstract, parent, color, coverImage, packagingOptions } = req.body;
        if (!name || !String(name).trim()) {
            return res.status(400).json({ success: false, message: 'name is required' });
        }
        const created = await Category.create({
            name: name.trim(),
            abstract,
            parent,
            color,
            coverImage,
            packagingOptions: Array.isArray(packagingOptions) ? packagingOptions : []
        });
        res.status(201).json({ success: true, data: created });
    } catch (err: any) {
        if (err?.code === 11000) {
            return res.status(409).json({ success: false, message: 'A category with that name already exists' });
        }
        console.error('Error in createCategory:', err);
        res.status(400).json({ success: false, message: err.message || 'Error creating category' });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const payload = req.body;
        if (payload?.packagingOptions && !Array.isArray(payload.packagingOptions)) {
            return res.status(400).json({ success: false, message: 'packagingOptions must be an array' });
        }
        const updated = await Category.findByIdAndUpdate(id, payload, { returnDocument: 'after', runValidators: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Category not found' });
        res.json({ success: true, data: updated });
    } catch (err: any) {
        if (err?.code === 11000) {
            return res.status(409).json({ success: false, message: 'A category with that name already exists' });
        }
        console.error('Error in updateCategory:', err);
        res.status(400).json({ success: false, message: err.message || 'Error updating category' });
    }
};

// Admin: deep stats for a single category
export const getCategoryStats = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

        // Categories are brand-keyed — match products by brand name.
        const products = await Product.find({ brand: category.name }).sort({ created_at: -1 });
        const productIds = products.map(p => String(p._id));

        // No products yet — return early with empty shape
        if (productIds.length === 0) {
            return res.json({
                success: true,
                data: {
                    category,
                    productCount: 0,
                    products: [],
                    totals: { soldUnits: 0, revenue: 0, orderCount: 0, uniqueBuyers: 0 },
                    topProducts: [],
                    recentOrders: [],
                    chart: monthlyEmptyBuckets()
                }
            });
        }

        // Aggregate sales for any product in this category
        const [salesAgg] = await Order.aggregate([
            { $match: { status: { $in: PAID_STATUSES } } },
            { $unwind: '$items' },
            { $match: { 'items.productId': { $in: productIds } } },
            { $group: {
                _id: null,
                soldUnits: { $sum: '$items.quantity' },
                revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                orders: { $addToSet: '$_id' },
                buyers: { $addToSet: '$buyerEmail' }
            } }
        ]);

        const totals = salesAgg
            ? {
                soldUnits: salesAgg.soldUnits,
                revenue: salesAgg.revenue,
                orderCount: salesAgg.orders.length,
                uniqueBuyers: salesAgg.buyers.length
            }
            : { soldUnits: 0, revenue: 0, orderCount: 0, uniqueBuyers: 0 };

        // Top products in category, by units sold
        const topProductsRaw = await Order.aggregate([
            { $match: { status: { $in: PAID_STATUSES } } },
            { $unwind: '$items' },
            { $match: { 'items.productId': { $in: productIds } } },
            { $group: {
                _id: '$items.productId',
                name: { $first: '$items.name' },
                image: { $first: '$items.image' },
                price: { $first: '$items.price' },
                soldUnits: { $sum: '$items.quantity' },
                revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
            } },
            { $sort: { soldUnits: -1 } },
            { $limit: 5 }
        ]);

        const productMap = new Map(products.map(p => [String(p._id), p]));
        const topProducts = topProductsRaw.map(t => {
            const p = productMap.get(String(t._id));
            return {
                id: t._id,
                name: t.name,
                image: p?.image || t.image,
                price: p?.price ?? t.price,
                soldUnits: t.soldUnits,
                revenue: t.revenue
            };
        });

        // Recent orders involving any product in this category (any status)
        const recentOrders = await Order.find({ 'items.productId': { $in: productIds } })
            .sort({ date: -1 })
            .limit(10)
            .select('reference buyerName buyerEmail amount status date items');

        // Monthly chart for last 12 months
        const now = new Date();
        const since = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        const monthlyRows = await Order.aggregate([
            { $match: { status: { $in: PAID_STATUSES }, date: { $gte: since } } },
            { $unwind: '$items' },
            { $match: { 'items.productId': { $in: productIds } } },
            { $group: {
                _id: { y: { $year: '$date' }, m: { $month: '$date' } },
                units: { $sum: '$items.quantity' },
                revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
            } }
        ]);
        const map = new Map<string, { units: number; revenue: number }>();
        for (const r of monthlyRows) map.set(`${r._id.y}-${r._id.m}`, { units: r.units, revenue: r.revenue });
        const chart = monthlyEmptyBuckets().map(b => {
            const v = map.get(b.key) || { units: 0, revenue: 0 };
            return { name: b.name, units: v.units, revenue: v.revenue };
        });

        res.json({
            success: true,
            data: {
                category,
                productCount: products.length,
                products,
                totals,
                topProducts,
                recentOrders,
                chart
            }
        });
    } catch (err: any) {
        console.error('Error in getCategoryStats:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const monthlyEmptyBuckets = () => {
    const out: { key: string; name: string }[] = [];
    const now = new Date();
    const cur = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    while (cur <= now) {
        out.push({
            key: `${cur.getFullYear()}-${cur.getMonth() + 1}`,
            name: cur.toLocaleDateString('en-NG', { month: 'short' })
        });
        cur.setMonth(cur.getMonth() + 1);
    }
    return out;
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await Category.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Category not found' });
        res.json({ success: true, message: 'Category deleted' });
    } catch (err: any) {
        console.error('Error in deleteCategory:', err);
        res.status(400).json({ success: false, message: err.message || 'Error deleting category' });
    }
};
