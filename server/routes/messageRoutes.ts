import { Router } from 'express';
import { sendMessage, getMessages } from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', sendMessage as any);
router.get('/', getMessages as any);

export default router; 