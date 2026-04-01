import { Request, Response } from 'express';
import { db } from '../mockDb';

export const getOrders = async (req: Request, res: Response) => {
    try {
        const data = db.orders.getAll();
        res.json({ success: true, count: data.length, data });
    } catch (err: any) {
        console.error('Error in getOrders:', err);
        res.status(500).json({ success: false, message: err.message || 'Error fetching orders' });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = db.orders.updateStatus(id, status);
        
        if (!updated) throw new Error('Order not found');
        res.json({ success: true, data: updated });
    } catch (err: any) {
        console.error('Error in updateOrderStatus:', err);
        res.status(400).json({ success: false, message: err.message || 'Error updating order status' });
    }
};

export const createOrder = async (req: Request, res: Response) => {
    try {
        const orderData = req.body;
        const newOrder = db.orders.create(orderData);
        res.status(201).json({ success: true, data: newOrder });
    } catch (err: any) {
        console.error('Error in createOrder:', err);
        res.status(400).json({ success: false, message: err.message || 'Error creating order' });
    }
};

export const updateOrderDelivery = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body; // expected: { delivery_method, delivery_fee, logistics_partner }
        
        const updated = db.orders.updateDelivery(id, {
            delivery_method: updates.delivery_method,
            delivery_fee: updates.delivery_fee,
            logistics_partner: updates.logistics_partner
        });
        
        if (!updated) throw new Error('Order not found');
        res.json({ success: true, data: updated });
    } catch (err: any) {
        console.error('Error in updateOrderDelivery:', err);
        res.status(400).json({ success: false, message: err.message || 'Error updating order delivery' });
    }
};
