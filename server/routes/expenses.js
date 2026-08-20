import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { list, create, update, remove, listAll } from '../controllers/expenseController.js';
import { validObjectId } from '../middleware/validateMiddleware.js';
const router = Router(); router.use(authMiddleware);
router.get('/all', listAll);
router.get('/:groupId', validObjectId('groupId'), list); router.post('/', create); router.put('/:id', validObjectId(), update); router.delete('/:id', validObjectId(), remove);
export default router;
