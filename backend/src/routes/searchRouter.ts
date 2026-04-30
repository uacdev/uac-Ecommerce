import { Router } from 'express';
import * as searchController from '../controllers/searchController';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.use(requireAdmin);
router.get('/', searchController.search);

export default router;
