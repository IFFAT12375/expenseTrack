import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { overall } from '../controllers/balanceController.js';

const router = Router();
router.get('/', authMiddleware, overall);
export default router;
