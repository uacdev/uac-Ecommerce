import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, count: data?.length || 0, data });
    } catch (err: any) {
        console.error('Error in getProducts:', err);
        res.status(500).json({ success: false, message: err.message || 'Error fetching products' });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const productData = req.body;
        const { data, error } = await supabase
            .from('products')
            .insert([productData])
            .select();

        if (error) throw error;
        res.status(201).json({ success: true, data: data[0] });
    } catch (err: any) {
        console.error('Error in createProduct:', err);
        res.status(400).json({ success: false, message: err.message || 'Error creating product' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json({ success: true, data: data?.[0] });
    } catch (err: any) {
        console.error('Error in updateProduct:', err);
        res.status(400).json({ success: false, message: err.message || 'Error updating product' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true, message: 'Product deleted' });
    } catch (err: any) {
        console.error('Error in deleteProduct:', err);
        res.status(400).json({ success: false, message: err.message || 'Error deleting product' });
    }
};
