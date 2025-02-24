import { Request, Response } from 'express';
import { Message } from '../models/Message';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { content, recipientId } = req.body;
    const senderId = req.user?.id;

    if (!senderId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const message = await Message.create({
      content,
      sender: senderId,
      recipient: recipientId,
    });

    await message.populate('sender recipient', 'name email avatar');

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { recipientId } = req.query;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId },
      ],
    })
    .sort({ createdAt: 1 })
    .populate('sender recipient', 'name email avatar')
    .lean()
    .exec();

    // Transform messages and ensure timestamp is in ISO format
    const transformedMessages = messages.map(msg => ({
      ...msg,
      isOwn: msg.sender._id.toString() === userId,
      timestamp: msg.createdAt.toISOString() // Convert to ISO string
    }));

    res.json(transformedMessages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Error getting messages' });
  }
}; 