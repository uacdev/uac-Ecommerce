import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Order } from '../models/Order';

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const search = async (req: Request, res: Response) => {
    try {
        const q = String(req.query.q || '').trim();
        if (q.length < 2) {
            return res.json({ success: true, query: q, products: [], orders: [], customers: [] });
        }
        const limit = Math.min(10, Math.max(1, parseInt(req.query.limit as string) || 5));
        const rx = new RegExp(escapeRegExp(q), 'i');

        const [products, orders, customerRows] = await Promise.all([
            Product.find({
                $or: [
                    { name: rx },
                    { brand: rx },
                    { category: rx }
                ]
            }).select('name brand category price image').limit(limit),

            Order.find({
                $or: [
                    { reference: rx },
                    { buyerName: rx },
                    { buyerEmail: rx },
                    { buyerPhone: rx }
                ]
            }).select('reference buyerName buyerEmail amount status date').sort({ date: -1 }).limit(limit),

            Order.aggregate([
                {
                    $match: {
                        $or: [
                            { buyerName: rx },
                            { buyerEmail: rx },
                            { buyerPhone: rx }
                        ]
                    }
                },
                {
                    $group: {
                        _id: '$buyerEmail',
                        name: { $first: '$buyerName' },
                        email: { $first: '$buyerEmail' },
                        phone: { $first: '$buyerPhone' },
                        orders: { $sum: 1 },
                        totalSpend: { $sum: '$amount' },
                        lastOrderDate: { $max: '$date' }
                    }
                },
                { $sort: { lastOrderDate: -1 } },
                { $limit: limit }
            ])
        ]);

        res.json({
            success: true,
            query: q,
            products,
            orders,
            customers: customerRows.map(c => ({
                name: c.name,
                email: c.email,
                phone: c.phone,
                orders: c.orders,
                totalSpend: c.totalSpend,
                lastOrderDate: c.lastOrderDate
            }))
        });
    } catch (err: any) {
        console.error('Error in search:', err);
        res.status(500).json({ success: false, message: err.message || 'Search failed' });
    }
};
