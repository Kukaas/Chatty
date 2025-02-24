import { Request, Response } from 'express';
import { Friend } from '../models/Friend';
import { User } from '../models/User';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.body;
    const requesterId = req.user?.id;
    console.log('Friend request from:', requesterId, 'to:', userId);

    if (!requesterId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Prevent self-friending
    if (requesterId === userId) {
      console.log('Attempted self-friend request');
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if recipient user exists
    const recipientUser = await User.findById(userId);
    if (!recipientUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if friend request already exists
    const existingRequest = await Friend.findOne({
      $or: [
        { requester: requesterId, recipient: userId },
        { requester: userId, recipient: requesterId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    // Create new friend request
    const friendRequest = await Friend.create({
      requester: requesterId,
      recipient: userId,
      status: 'pending'
    });

    res.status(201).json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Error sending friend request' });
  }
};

export const respondToFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId, status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const friendRequest = await Friend.findOne({
      _id: requestId,
      recipient: userId,
      status: 'pending',
    });

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    friendRequest.status = status;
    await friendRequest.save();

    res.json(friendRequest);
  } catch (error) {
    console.error('Respond to friend request error:', error);
    res.status(500).json({ message: 'Error responding to friend request' });
  }
};

export const getFriends = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    console.log('Getting friends for user:', userId);

    if (!userId) {
      console.log('No user ID found in request');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const friends = await Friend.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted',
    })
    .populate('requester recipient', 'name email avatar')
    .lean();

    console.log('Found friends:', JSON.stringify(friends, null, 2));
    
    // Filter out any self-referential friendships
    const validFriends = friends.filter(friend => {
      const isSelfFriend = friend.requester._id.toString() === friend.recipient._id.toString();
      if (isSelfFriend) {
        console.log('Found self-friend, filtering out:', friend);
      }
      return !isSelfFriend;
    });

    console.log('Filtered friends:', JSON.stringify(validFriends, null, 2));
    res.json(validFriends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Error getting friends' });
  }
};

export const getFriendRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const requests = await Friend.find({
      recipient: userId,
      status: 'pending',
    }).populate('requester', 'name email avatar');

    res.json(requests);
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Error getting friend requests' });
  }
}; 