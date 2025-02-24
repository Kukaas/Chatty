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
import { User } from '../models/User';
import mongoose from 'mongoose';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Friend routes
router.get('/list', getFriends as any);
router.get('/requests', getFriendRequests as any);
router.post('/request', sendFriendRequest as any);
router.post('/respond', respondToFriendRequest as any);

// Define interfaces
interface PopulatedFriend {
  _id: mongoose.Types.ObjectId;
  requester: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    avatar: string;
  };
  recipient: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    avatar: string;
  };
  status: string;
}

interface UserDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  avatar?: string;
}

router.get('/:id', (async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const friendId = req.params.id;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const friendObjectId = new mongoose.Types.ObjectId(friendId);

    const friendship = await Friend.findOne({
      status: 'accepted',
      $or: [
        { requester: userObjectId, recipient: friendObjectId },
        { requester: friendObjectId, recipient: userObjectId }
      ]
    })
    .populate('requester recipient', 'name email avatar')
    .lean() as PopulatedFriend | null;

    if (!friendship) {
      const user = await User.findById(friendObjectId)
        .select('name email avatar')
        .lean() as unknown as UserDocument;

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json({
        _id: friendId,
        requester: {
          _id: userId,
          name: user.name,
          email: user.email,
          avatar: user.avatar || ''
        },
        recipient: {
          _id: friendId,
          name: user.name,
          email: user.email,
          avatar: user.avatar || ''
        },
        status: 'none'
      });
      return;
    }

    res.json(friendship);
  } catch (error) {
    console.error('Get friend details error:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Error getting friend details',
      details: error instanceof Error ? error.stack : undefined
    });
  }
}) as any);

export default router; 