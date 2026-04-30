import { Request, Response } from 'express';
import { saveImage } from '../lib/storage';

export const uploadImage = async (req: Request, res: Response) => {
    try {
        const file = (req as any).file as { buffer: Buffer; originalname: string; mimetype: string; size: number } | undefined;
        if (!file) return res.status(400).json({ success: false, message: 'No file uploaded (field name: "file")' });

        if (!file.mimetype.startsWith('image/')) {
            return res.status(400).json({ success: false, message: 'Only image files are accepted' });
        }

        const stored = await saveImage(file.buffer, file.originalname, file.mimetype);
        res.status(201).json({ success: true, data: stored });
    } catch (err: any) {
        console.error('Error in uploadImage:', err);
        res.status(500).json({ success: false, message: err.message || 'Upload failed' });
    }
};
