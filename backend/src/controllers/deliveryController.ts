import { Request, Response } from 'express';
import { DeliveryZone } from '../models/DeliveryZone';

export const getDeliveryZones = async (_req: Request, res: Response) => {
    try {
        const zones = await DeliveryZone.find().sort({ name: 1 });
        res.json({ success: true, count: zones.length, data: zones });
    } catch (err: any) {
        console.error('Error in getDeliveryZones:', err);
        res.status(500).json({ success: false, message: err.message || 'Error fetching delivery zones' });
    }
};

export const getStates = async (_req: Request, res: Response) => {
    // Only Lagos state is supported for delivery.
    const states = ['Lagos'];
    res.json({ success: true, count: states.length, data: states });
};

export const createDeliveryZone = async (req: Request, res: Response) => {
    try {
        const name = String(req.body.name || '').trim();
        const fee = Number(req.body.fee);
        if (!name) return res.status(400).json({ success: false, message: 'Zone name is required' });
        if (Number.isNaN(fee) || fee < 0) return res.status(400).json({ success: false, message: 'Zone fee must be a non-negative number' });

        const zone = await DeliveryZone.findOneAndUpdate(
            { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}$`, 'i') },
            { $set: { name, fee } },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );
        res.status(201).json({ success: true, data: zone });
    } catch (err: any) {
        console.error('Error in createDeliveryZone:', err);
        res.status(400).json({ success: false, message: err.message || 'Error creating delivery zone' });
    }
};

export const updateDeliveryZone = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const name = String(req.body.name || '').trim();
        const fee = Number(req.body.fee);
        if (!name) return res.status(400).json({ success: false, message: 'Zone name is required' });
        if (Number.isNaN(fee) || fee < 0) return res.status(400).json({ success: false, message: 'Zone fee must be a non-negative number' });

        const zone = await DeliveryZone.findByIdAndUpdate(
            id,
            { $set: { name, fee } },
            { returnDocument: 'after', runValidators: true }
        );
        if (!zone) return res.status(404).json({ success: false, message: 'Delivery zone not found' });
        res.json({ success: true, data: zone });
    } catch (err: any) {
        console.error('Error in updateDeliveryZone:', err);
        res.status(400).json({ success: false, message: err.message || 'Error updating delivery zone' });
    }
};

export const deleteDeliveryZone = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await DeliveryZone.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Delivery zone not found' });
        res.json({ success: true, message: 'Delivery zone deleted' });
    } catch (err: any) {
        console.error('Error in deleteDeliveryZone:', err);
        res.status(400).json({ success: false, message: err.message || 'Error deleting delivery zone' });
    }
};
