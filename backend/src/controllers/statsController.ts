import { Request, Response } from 'express';
import { db } from '../mockDb';

export const getKpis = async (req: Request, res: Response) => {
    try {
        const orders = db.orders.getAll();
        
        const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0) || 0;
        const totalOrders = orders.length || 0;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const customerCount = new Set(orders.map(o => o.buyer_email)).size;

        res.json({
            success: true,
            data: {
                totalRevenue,
                totalOrders,
                avgOrderValue,
                totalCustomers: customerCount || 0,
                returningRate: '68%',
                abandonmentRate: '23.8%'
            }
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getSalesChart = async (req: Request, res: Response) => {
    try {
        const { timeframe } = req.query; // 'Daily', 'Weekly', 'Monthly'
        const data = [
            { name: 'Jan', value: 4000 }, { name: 'Feb', value: 3000 }, { name: 'Mar', value: 5000 },
            { name: 'Apr', value: 2780 }, { name: 'May', value: 1890 }, { name: 'Jun', value: 2390 },
            { name: 'Jul', value: 3490 }, { name: 'Aug', value: 4000 }, { name: 'Sep', value: 5500 },
            { name: 'Oct', value: 6000 }, { name: 'Nov', value: 4800 }, { name: 'Dec', value: 5900 }
        ];

        res.json({ success: true, timeframe, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getBestSellers = async (req: Request, res: Response) => {
    try {
        const products = db.products.getAll();
        const data = products.slice(0, 5); // Just return top 5 for mock
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getCustomers = async (req: Request, res: Response) => {
    try {
        const orders = db.orders.getAll();
        // Extract unique customers from orders
        const customersMap = new Map();
        
        orders.forEach(o => {
            if (o.buyer_email && !customersMap.has(o.buyer_email)) {
                customersMap.set(o.buyer_email, {
                    id: Math.random().toString(36).substr(2, 9),
                    name: o.buyer_name || 'Unknown',
                    email: o.buyer_email || 'No email',
                    phone: o.buyer_phone || 'No phone',
                    orders: 1,
                    joinDate: o.date
                });
            } else if (customersMap.has(o.buyer_email)) {
                customersMap.get(o.buyer_email).orders += 1;
            }
        });

        const customers = Array.from(customersMap.values());
        res.json({ success: true, count: customers.length, data: customers });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};
