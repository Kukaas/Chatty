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

    // Add friendship status to each user
    const usersWithStatus = await Promise.all(users.map(async user => {
      const friendship = friendships.find(f => 
        (f.requester.toString() === user._id.toString() || 
         f.recipient.toString() === user._id.toString())
      );

      return {
        ...user.toObject(),
        friendshipStatus: friendship ? friendship.status : 'none',
        friendshipId: friendship ? friendship._id : null,
        isRequester: friendship ? friendship.requester.toString() === currentUserId : false
      };
    }));

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found matching your search' });
    }

    res.json(usersWithStatus);
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
};

export const getSuggestedUsers = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get existing friend relationships
    const friendships = await Friend.find({
      $or: [
        { requester: currentUserId },
        { recipient: currentUserId },
      ],
    });

    // Get IDs of users who are already friends or have pending requests
    const existingUserIds = friendships.map(f => 
      f.requester.toString() === currentUserId ? f.recipient : f.requester
    );
    existingUserIds.push(currentUserId); // Add current user to excluded list

    // Find random users who aren't connected
    const suggestedUsers = await User.find({
      _id: { $nin: existingUserIds },
      emailVerified: true,
    })
    .select('name email avatar')
    .limit(5)
    .sort({ createdAt: -1 }); // Get newest users first

    res.json(suggestedUsers.map(user => ({
      ...user.toObject(),
      friendshipStatus: 'none',
      friendshipId: null,
      isRequester: false
    })));
  } catch (error) {
    console.error('Get suggested users error:', error);
    res.status(500).json({ message: 'Error getting suggested users' });
  }
};