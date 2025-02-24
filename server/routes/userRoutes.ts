import { Router } from 'express';
import { searchUsers, getSuggestedUsers } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Make sure the route matches the frontend request
router.get('/search', authenticateToken, searchUsers);
router.get('/suggested', authenticateToken, getSuggestedUsers);

export default router;