import { Request, Response } from 'express';
import { Friend } from '../models/Friend';
import { User } from '../models/User';
import mongoose from 'mongoose';
import { AuthRequest } from '../types/auth';
import { io, onlineUsers } from '../index';

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
    const { userId, email } = req.body;
    const requesterId = req.user?.id;

    if (!requesterId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!userId && !email) {
      return res.status(400).json({ message: 'Either userId or email is required' });
    }

    let recipientId = userId;

    // If email is provided instead of userId, find the user by email
    if (email) {
      const recipient = await User.findOne({ email });
      if (!recipient) {
        return res.status(404).json({ message: 'User not found' });
      }
      recipientId = recipient._id;
    }

    if (requesterId === recipientId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const existingRequest = await Friend.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: 'Friend request already exists',
        status: existingRequest.status 
      });
    }

    const newRequest = await Friend.create({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending'
    });

    const populatedRequest = await Friend.findById(newRequest._id)
      .populate('requester', 'name email avatar')
      .lean();
    
    const recipientSocketId = onlineUsers.get(recipientId.toString());
    console.log('Recipient socket ID:', recipientSocketId);
    if (recipientSocketId) {
      console.log('Emitting friend request to recipient');
      io.to(recipientSocketId).emit('friend_request_received', populatedRequest);
    }

    res.status(201).json({ 
      message: 'Friend request sent successfully',
      request: newRequest
    });
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

    const requesterSocketId = onlineUsers.get(friendRequest.requester.toString());
    console.log('Requester socket ID:', requesterSocketId);
    if (requesterSocketId) {
      console.log('Emitting friend request update to requester');
      io.to(requesterSocketId).emit('friend_request_updated', requestId);
    }

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