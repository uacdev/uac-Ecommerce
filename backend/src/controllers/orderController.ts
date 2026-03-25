import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

export const getOrders = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, count: data?.length || 0, data });
    } catch (err: any) {
        console.error('Error in getOrders:', err);
        res.status(500).json({ success: false, message: err.message || 'Error fetching orders' });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json({ success: true, data: data?.[0] });
    } catch (err: any) {
        console.error('Error in updateOrderStatus:', err);
        res.status(400).json({ success: false, message: err.message || 'Error updating order status' });
    }
};

export const createOrder = async (req: Request, res: Response) => {
    try {
        const orderData = req.body;
        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select();

        if (error) throw error;
        res.status(201).json({ success: true, data: data?.[0] });
    } catch (err: any) {
        console.error('Error in createOrder:', err);
        res.status(400).json({ success: false, message: err.message || 'Error creating order' });
    }
};

export const updateOrderDelivery = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body; // expected: { delivery_method, delivery_fee, logistics_partner }
        const { data, error } = await supabase
            .from('orders')
            .update({
                delivery_method: updates.delivery_method,
                delivery_fee: updates.delivery_fee,
                logistics_partner: updates.logistics_partner
            })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json({ success: true, data: data?.[0] });
    } catch (err: any) {
        console.error('Error in updateOrderDelivery:', err);
        res.status(400).json({ success: false, message: err.message || 'Error updating order delivery' });
    }
};
