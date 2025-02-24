import { Router } from 'express';
import { searchUsers, getSuggestedUsers } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Make sure the route matches the frontend request
router.get('/search', authenticateToken, searchUsers as any);
router.get('/suggested', authenticateToken, getSuggestedUsers as any);

export default router;