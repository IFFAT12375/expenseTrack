import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { register, login, me } from '../controllers/authController.js';
const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);
export default router;
