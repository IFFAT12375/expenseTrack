import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { listGroups, listUsers, createGroup, getOne, invite, leave, balances } from '../controllers/groupController.js';
import { validObjectId } from '../middleware/validateMiddleware.js';
const router = Router();
router.use(authMiddleware);
router.get('/', listGroups); router.get('/users', listUsers); router.post('/', createGroup); router.get('/:id', validObjectId(), getOne); router.get('/:id/balances', validObjectId(), balances); router.post('/:id/invite', validObjectId(), invite); router.post('/:id/leave', validObjectId(), leave); router.delete('/:id/leave', validObjectId(), leave);
export default router;
