import { Router } from 'express';
import multer from 'multer';
import * as uploadController from '../controllers/uploadController';
import { requireAdmin } from '../middlewares/requireAdmin';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const router = Router();

router.post('/', requireAdmin, upload.single('file'), uploadController.uploadImage);

export default router;
