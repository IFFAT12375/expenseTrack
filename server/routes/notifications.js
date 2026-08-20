import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { list, markRead, clear } from '../controllers/notificationController.js';
import { validObjectId } from '../middleware/validateMiddleware.js';

const router = Router();
router.use(authMiddleware);
router.get('/', list);
router.patch('/:id/read', validObjectId(), markRead);
router.delete('/', clear);
export default router;
