import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Customer } from '../models/Customer';
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

export const createCustomerReview = async (req: Request, res: Response) => {
    try {
        const { productId, orderReference, rating, comment } = req.body;
        if (!productId || !orderReference || rating === undefined) {
            return res.status(400).json({ success: false, message: 'productId, orderReference and rating are required' });
        }
        const numericRating = Number(rating);
        if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ success: false, message: 'rating must be between 1 and 5' });
        }

        const order = await Order.findOne({
            reference: orderReference,
            buyerEmail: req.customer!.email.toLowerCase(),
            status: { $in: ['delivered', 'completed'] }
        });
        if (!order) return res.status(403).json({ success: false, message: 'You can review products from delivered orders only' });

        const orderItem = order.items.find(item => String(item.productId) === String(productId));
        if (!orderItem) return res.status(403).json({ success: false, message: 'This product was not part of that order' });

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        const existing = await Review.findOne({ customerEmail: req.customer!.email.toLowerCase(), orderReference, productId });
        if (existing) return res.status(409).json({ success: false, message: 'You have already reviewed this product for this order' });

        const customer = await Customer.findById(req.customer!.id);
        const customerName = customer?.fullName?.trim() || req.customer!.email.split('@')[0];
        const created = await Review.create({
            productId,
            productName: product.name,
            customerName,
            customerEmail: req.customer!.email,
            orderReference,
            rating: numericRating,
            comment: String(comment || '').trim()
        });

        notify({
            type: 'review',
            title: `New ${numericRating}★ review`,
            description: `${customerName} on ${product.name}`,
            meta: { reviewId: created.id, productId: created.productId, rating: created.rating, orderReference }
        });

        res.status(201).json({ success: true, data: created });
    } catch (err: any) {
        console.error('Error in createCustomerReview:', err);
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

        const updated = await Review.findByIdAndUpdate(id, updates, { returnDocument: 'after', runValidators: true });
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
