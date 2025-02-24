import { Router } from 'express';
import { 
  sendFriendRequest, 
  respondToFriendRequest, 
  getFriends,
  getFriendRequests 
} from '../controllers/friendController';
import { authenticateToken } from '../middleware/auth';
import type { AuthRequest } from '../types/auth';
import { Response } from 'express';
import { Friend } from '../models/Friend';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Friend routes
router.get('/list', getFriends);
router.get('/requests', getFriendRequests);
router.post('/request', sendFriendRequest);
router.post('/respond', respondToFriendRequest);

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const friendId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const friendship = await Friend.findOne({
      $and: [
        {
          $or: [
            { requester: userId },
            { recipient: userId }
          ]
        },
        {
          $or: [
            { requester: friendId },
            { recipient: friendId }
          ]
        },
        { status: 'accepted' }
      ]
    })
    .populate('requester recipient', 'name email avatar')
    .lean();

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    res.json(friendship);
  } catch (error) {
    console.error('Get friend details error:', error);
    res.status(500).json({ message: 'Error getting friend details' });
  }
});

export default router; 