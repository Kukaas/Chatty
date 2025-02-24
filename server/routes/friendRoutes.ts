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
router.get('/list', getFriends);
router.get('/requests', getFriendRequests);
router.post('/request', sendFriendRequest);
router.post('/respond', respondToFriendRequest);

export default router; 