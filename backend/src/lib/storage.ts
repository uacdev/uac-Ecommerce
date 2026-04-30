import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

export type StoredFile = { url: string; filename: string; size: number; mime: string; provider: 'cloudinary' | 'local' };

const sanitizeExt = (originalName: string, mime: string): string => {
    const fromName = path.extname(originalName || '').toLowerCase().replace(/[^a-z0-9.]/g, '');
    if (fromName) return fromName;
    if (mime.startsWith('image/')) return '.' + mime.split('/')[1];
    return '';
};

const cloudinaryConfigured = (): boolean => {
    return !!(
        process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
        process.env.CLOUDINARY_API_KEY?.trim() &&
        process.env.CLOUDINARY_API_SECRET?.trim()
    );
};

let cloudinaryReady = false;
const ensureCloudinary = () => {
    if (cloudinaryReady) return;
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME!.trim(),
        api_key: process.env.CLOUDINARY_API_KEY!.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET!.trim(),
        secure: true,
    });
    cloudinaryReady = true;
};

const saveToCloudinary = (buffer: Buffer, mime: string): Promise<StoredFile> =>
    new Promise((resolve, reject) => {
        ensureCloudinary();
        const folder = (process.env.CLOUDINARY_FOLDER || 'uac-foods').trim();
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (err, result) => {
                if (err || !result) return reject(err || new Error('Cloudinary upload returned no result'));
                resolve({
                    url: result.secure_url,
                    filename: result.public_id,
                    size: result.bytes,
                    mime,
                    provider: 'cloudinary',
                });
            }
        );
        stream.end(buffer);
    });

const saveToLocal = async (buffer: Buffer, originalName: string, mime: string): Promise<StoredFile> => {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const ext = sanitizeExt(originalName, mime);
    const filename = `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    await fs.writeFile(filePath, buffer);
    const base = (process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 4000}`).replace(/\/$/, '');
    return {
        url: `${base}/uploads/${filename}`,
        filename,
        size: buffer.length,
        mime,
        provider: 'local',
    };
};

export const saveImage = async (
    buffer: Buffer,
    originalName: string,
    mime: string
): Promise<StoredFile> => {
    if (cloudinaryConfigured()) {
        return saveToCloudinary(buffer, mime);
    }
    return saveToLocal(buffer, originalName, mime);
};
