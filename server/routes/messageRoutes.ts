import { Router } from 'express';
import { sendMessage, getMessages } from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', sendMessage);
router.get('/', getMessages);

export default router; 