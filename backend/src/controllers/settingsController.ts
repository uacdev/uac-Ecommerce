import { Request, Response } from 'express';
import { Setting } from '../models/Setting';

const normalizeKey = (key: any): string => String(key || '').trim().toLowerCase();

export const getSettings = async (_req: Request, res: Response) => {
    try {
        const settings = await Setting.find().sort({ key: 1 });
        res.json({ success: true, count: settings.length, data: settings });
    } catch (err: any) {
        console.error('Error in getSettings:', err);
        res.status(500).json({ success: false, message: err.message || 'Error fetching settings' });
    }
};

export const getSettingByKey = async (req: Request, res: Response) => {
    try {
        const key = normalizeKey(req.params.key);
        if (!key) return res.status(400).json({ success: false, message: 'key is required' });

        const setting = await Setting.findOne({ key });
        if (!setting) return res.status(404).json({ success: false, message: 'Setting not found' });
        res.json({ success: true, data: setting });
    } catch (err: any) {
        console.error('Error in getSettingByKey:', err);
        res.status(500).json({ success: false, message: err.message || 'Error fetching setting' });
    }
};

export const createSetting = async (req: Request, res: Response) => {
    try {
        const key = normalizeKey(req.body.key);
        const value = String(req.body.value || '').trim();
        if (!key || !value) {
            return res.status(400).json({ success: false, message: 'key and value are required' });
        }

        const setting = await Setting.findOneAndUpdate(
            { key },
            { $set: { value } },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );
        res.status(201).json({ success: true, data: setting });
    } catch (err: any) {
        console.error('Error in createSetting:', err);
        res.status(400).json({ success: false, message: err.message || 'Error creating setting' });
    }
};

export const upsertSetting = async (req: Request, res: Response) => {
    try {
        const key = normalizeKey(req.params.key);
        const value = String(req.body.value || '').trim();
        if (!key || !value) {
            return res.status(400).json({ success: false, message: 'value is required' });
        }

        const setting = await Setting.findOneAndUpdate(
            { key },
            { $set: { value } },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );
        res.json({ success: true, data: setting });
    } catch (err: any) {
        console.error('Error in upsertSetting:', err);
        res.status(400).json({ success: false, message: err.message || 'Error updating setting' });
    }
};

export const deleteSetting = async (req: Request, res: Response) => {
    try {
        const key = normalizeKey(req.params.key);
        if (!key) return res.status(400).json({ success: false, message: 'key is required' });

        const deleted = await Setting.findOneAndDelete({ key });
        if (!deleted) return res.status(404).json({ success: false, message: 'Setting not found' });

        res.json({ success: true, message: 'Setting deleted' });
    } catch (err: any) {
        console.error('Error in deleteSetting:', err);
        res.status(500).json({ success: false, message: err.message || 'Error deleting setting' });
    }
};
