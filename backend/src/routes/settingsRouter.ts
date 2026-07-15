import { Router } from 'express';
import * as settingsController from '../controllers/settingsController';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.get('/', settingsController.getSettings);
router.get('/:key', settingsController.getSettingByKey);
router.post('/', requireAdmin, settingsController.createSetting);
router.put('/:key', requireAdmin, settingsController.upsertSetting);
router.delete('/:key', requireAdmin, settingsController.deleteSetting);

export default router;
