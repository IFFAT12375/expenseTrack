import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { create, list } from '../controllers/settlementController.js';
import { validObjectId } from '../middleware/validateMiddleware.js';
const router = Router(); router.use(authMiddleware); router.post('/', create); router.get('/:groupId', validObjectId('groupId'), list); export default router;
