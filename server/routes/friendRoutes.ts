import { Router } from 'express';
import { 
  sendFriendRequest, 
  respondToFriendRequest, 
  getFriends,
  getFriendRequests 
} from '../controllers/friendController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Friend routes
router.post('/request', sendFriendRequest as any);
router.post('/respond', respondToFriendRequest as any);
router.get('/list', getFriends as any);
router.get('/requests', getFriendRequests as any);

export default router; 