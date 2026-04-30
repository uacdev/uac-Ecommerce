import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { notify } from '../lib/notify';

export const getReviews = async (req: Request, res: Response) => {
    try {
        const { productId, approved } = req.query;
        const filter: Record<string, any> = {};
        if (productId) filter.productId = productId;
        if (approved !== undefined) filter.approved = approved === 'true';

        const data = await Review.find(filter).sort({ date: -1 });
        res.json({ success: true, count: data.length, data });
    } catch (err: any) {
        console.error('Error in getReviews:', err);
        res.status(500).json({ success: false, message: err.message || 'Error fetching reviews' });
    }
};

export const createReview = async (req: Request, res: Response) => {
    try {
        const { productId, customerName, customerEmail, rating, comment } = req.body;

        if (!productId || !customerName || rating === undefined) {
            return res.status(400).json({ success: false, message: 'productId, customerName and rating are required' });
        }
        if (Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({ success: false, message: 'rating must be between 1 and 5' });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        const created = await Review.create({
            productId,
            productName: product.name,
            customerName,
            customerEmail: customerEmail || '',
            rating: Number(rating),
            comment: comment || ''
        });

        notify({
            type: 'review',
            title: `New ${rating}★ review`,
            description: `${customerName} on ${product.name}`,
            meta: { reviewId: created.id, productId: created.productId, rating: created.rating }
        });

        res.status(201).json({ success: true, data: created });
    } catch (err: any) {
        console.error('Error in createReview:', err);
        res.status(400).json({ success: false, message: err.message || 'Error creating review' });
    }
};

export const updateReview = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates: Record<string, any> = {};
        if (req.body.rating !== undefined) updates.rating = Number(req.body.rating);
        if (req.body.comment !== undefined) updates.comment = req.body.comment;
        if (req.body.approved !== undefined) updates.approved = !!req.body.approved;

        const updated = await Review.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Review not found' });
        res.json({ success: true, data: updated });
    } catch (err: any) {
        console.error('Error in updateReview:', err);
        res.status(400).json({ success: false, message: err.message || 'Error updating review' });
    }
};

export const deleteReview = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await Review.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Review not found' });
        res.json({ success: true, message: 'Review deleted' });
    } catch (err: any) {
        console.error('Error in deleteReview:', err);
        res.status(400).json({ success: false, message: err.message || 'Error deleting review' });
    }
};
