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
router.get('/list', getFriends);
router.get('/requests', getFriendRequests);
router.post('/request', sendFriendRequest);
router.post('/respond', respondToFriendRequest);

// Define interface for populated Friend document
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

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const friendId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log('Looking for friendship between:', userId, 'and', friendId);

    // Convert string IDs to ObjectIds
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const friendObjectId = new mongoose.Types.ObjectId(friendId);

    // Find the friendship
    const friendship = await Friend.findOne({
      status: 'accepted',
      $or: [
        { 
          requester: userObjectId,
          recipient: friendObjectId
        },
        {
          requester: friendObjectId,
          recipient: userObjectId
        }
      ]
    })
    .populate('requester recipient', 'name email avatar')
    .lean() as PopulatedFriend | null;

    console.log('Friendship query result:', JSON.stringify(friendship, null, 2));

    if (!friendship) {
      // If no friendship found, try to get the user details
      const user = await User.findById(friendObjectId)
        .select('name email avatar')
        .lean();

      console.log('User lookup result:', JSON.stringify(user, null, 2));

      if (!user) {
        console.log('User not found for ID:', friendId);
        return res.status(404).json({ message: 'User not found' });
      }

      // Return user details in a friendship-like structure
      const response = {
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
      };

      console.log('Returning non-friend user details:', JSON.stringify(response, null, 2));
      return res.json(response);
    }

    console.log('Found friendship:', JSON.stringify({
      _id: friendship._id,
      requester: friendship.requester._id,
      recipient: friendship.recipient._id,
      status: friendship.status
    }, null, 2));

    res.json(friendship);
  } catch (error) {
    console.error('Get friend details error:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Error getting friend details',
      details: error instanceof Error ? error.stack : undefined
    });
  }
});

export default router; 