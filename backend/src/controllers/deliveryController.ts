import { Request, Response } from 'express';
import { DELIVERY_ZONES } from '../data/deliveryZones';
import { NIGERIAN_STATES } from '../data/nigerianStates';

export const getDeliveryZones = async (_req: Request, res: Response) => {
    res.json({ success: true, count: DELIVERY_ZONES.length, data: DELIVERY_ZONES });
};

export const getStates = async (_req: Request, res: Response) => {
    res.json({ success: true, count: NIGERIAN_STATES.length, data: NIGERIAN_STATES });
};
