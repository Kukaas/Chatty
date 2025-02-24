import { Router } from 'express';
import { searchUsers } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Make sure the route matches the frontend request
router.get('/search', authenticateToken, searchUsers);

export default router;