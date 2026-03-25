import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

export const getKpis = async (req: Request, res: Response) => {
    try {
        // In a real database, you'd perform aggregations here
        // For MVP, we'll fetch orders and products to compute metrics
        const { data: orders, error: oError } = await supabase.from('orders').select('amount, status, created_at');
        const { count: customerCount, error: cError } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

        if (oError || cError) throw oError || cError;

        const totalRevenue = orders?.reduce((sum, o) => sum + o.amount, 0) || 0;
        const totalOrders = orders?.length || 0;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        res.json({
            success: true,
            data: {
                totalRevenue,
                totalOrders,
                avgOrderValue,
                totalCustomers: customerCount || 0,
                returningRate: '68%', // Placeholder for complex logic
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
        
        // Mocking sophisticated time-series data for the frontend chart
        // In a production app, use SQL grouping and summing functions (rpc) or Supabase functions
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
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('price', { ascending: false }) // Temporary placeholder for 'sold_count'
            .limit(5);

        if (error) throw error;
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getCustomers = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        const customers = data?.map(profile => ({
            id: profile.id,
            name: profile.full_name || profile.name || 'Unknown',
            email: profile.email || 'No email',
            phone: profile.phone || 'No phone',
            orders: Math.floor(Math.random() * 20), // Mock orders for UI
            joinDate: profile.created_at || new Date().toISOString()
        })) || [];

        res.json({ success: true, count: customers.length, data: customers });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};
