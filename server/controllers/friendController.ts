import { Request, Response } from 'express';
import { Friend } from '../models/Friend';
import { User } from '../models/User';
import mongoose from 'mongoose';
import { AuthRequest } from '../types/auth';

interface Friend {
  _id: string | mongoose.Types.ObjectId;
  requester: {
    _id: string | mongoose.Types.ObjectId;
    name: string;
    email: string;
    avatar: string;
  };
  recipient: {
    _id: string | mongoose.Types.ObjectId;
    name: string;
    email: string;
    avatar: string;
  };
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IFriend extends mongoose.Document {
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
  createdAt: Date;
  updatedAt: Date;
}

interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  avatar: string;
}

export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.body;
    const requesterId = req.user?.id;

    if (!requesterId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (requesterId === userId) {
      res.status(400).json({ message: 'Cannot send friend request to yourself' });
      return;
    }

    const existingRequest = await Friend.findOne({
      $or: [
        { requester: requesterId, recipient: userId },
        { requester: userId, recipient: requesterId }
      ]
    });

    if (existingRequest) {
      res.status(400).json({ message: 'Friend request already exists' });
      return;
    }

    await Friend.create({
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
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const friendRequest = await Friend.findOne({
      _id: requestId,
      recipient: userId,
      status: 'pending'
    });

    if (!friendRequest) {
      res.status(404).json({ message: 'Friend request not found' });
      return;
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

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const friends = await Friend.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted'
    }).populate('requester recipient', 'name email avatar');

    res.json(friends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Error getting friends list' });
  }
};

export const getFriendRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
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

export const getFriend = async (req: AuthRequest, res: Response) => {
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
    .lean() as unknown as Friend;

    if (!friendship) {
      // If no friendship found, try to get the user details
      const user = await User.findById(friendId)
        .select('name email avatar')
        .lean() as unknown as IUser;

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return user details in a friendship-like structure
      return res.json({
        _id: user._id,
        requester: user,
        recipient: user,
        status: 'none'
      });
    }

    res.json(friendship);
  } catch (error) {
    console.error('Get friend details error:', error);
    res.status(500).json({ message: 'Error getting friend details' });
  }
}; 