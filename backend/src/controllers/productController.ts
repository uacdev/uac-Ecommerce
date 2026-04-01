import { Request, Response } from 'express';
import { db } from '../mockDb';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const data = db.products.getAll();
        res.json({ success: true, count: data.length, data });
    } catch (err: any) {
        console.error('Error in getProducts:', err);
        res.status(500).json({ success: false, message: err.message || 'Error fetching products' });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const productData = req.body;
        const newProduct = db.products.create(productData);
        res.status(201).json({ success: true, data: newProduct });
    } catch (err: any) {
        console.error('Error in createProduct:', err);
        res.status(400).json({ success: false, message: err.message || 'Error creating product' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updated = db.products.update(id, updates);
        
        if (!updated) throw new Error('Product not found');
        res.json({ success: true, data: updated });
    } catch (err: any) {
        console.error('Error in updateProduct:', err);
        res.status(400).json({ success: false, message: err.message || 'Error updating product' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        db.products.delete(id);
        res.json({ success: true, message: 'Product deleted' });
    } catch (err: any) {
        console.error('Error in deleteProduct:', err);
        res.status(400).json({ success: false, message: err.message || 'Error deleting product' });
    }
};
