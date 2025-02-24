import { Request, Response } from 'express';
import { User } from '../models/User';
import { Friend } from '../models/Friend';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find users matching the search query
    const users = await User.find({
      $and: [
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
          ],
        },
        { _id: { $ne: currentUserId } }, // Exclude current user
        { emailVerified: true }, // Only verified users
      ],
    }).select('name email avatar');

    // Get existing friend relationships
    const friendships = await Friend.find({
      $or: [
        { requester: currentUserId },
        { recipient: currentUserId },
      ],
    });

    // Filter out users who are already friends or have pending requests
    const filteredUsers = users.filter(user => {
      return !friendships.some(friendship => 
        (friendship.requester.toString() === user._id.toString() || 
         friendship.recipient.toString() === user._id.toString())
      );
    });

    // Check if any users were found after filtering
    if (filteredUsers.length === 0) {
      return res.status(404).json({ message: 'No users found matching your search' });
    }

    res.json(filteredUsers);
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
};