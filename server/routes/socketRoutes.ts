import express from 'express';
import { io, onlineUsers } from '../index';
import { Friend } from '../models/Friend';
import { AuthRequest } from '../types/auth';
import { Response } from 'express';
import mongoose from 'mongoose';

const router = express.Router();

interface FriendDocument {
  _id: mongoose.Types.ObjectId | string;
  requester: any;
  recipient: mongoose.Types.ObjectId | string | { _id: mongoose.Types.ObjectId | string };
  status: string;
}

router.post('/emit-friend-request', (async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.body;
    
    if (!requestId) {
      return res.status(400).json({ message: 'Request ID is required' });
    }
    
    const request = await Friend.findById(requestId)
      .populate('requester', 'name email avatar')
      .lean() as unknown as FriendDocument;
      
    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }
    
    // Emit to the recipient
    const recipientId = typeof request.recipient === 'object' 
      ? request.recipient._id.toString() 
      : request.recipient.toString();
    const recipientSocketId = onlineUsers.get(recipientId);
    
    if (recipientSocketId) {
      console.log('Emitting friend_request_received to:', recipientSocketId);
      console.log('Request data:', request);
      io.to(recipientSocketId).emit('friend_request_received', request);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Emit friend request error:', error);
    res.status(500).json({ message: 'Error emitting friend request' });
  }
}) as any);

router.post('/emit-friend-response', (async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.body;
    
    if (!requestId) {
      return res.status(400).json({ message: 'Request ID is required' });
    }
    
    const request = await Friend.findById(requestId) as unknown as FriendDocument;
    
    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }
    
    // Emit to the requester
    const requesterId = request.requester.toString();
    const requesterSocketId = onlineUsers.get(requesterId);
    
    if (requesterSocketId) {
      console.log('Emitting friend_request_updated to:', requesterSocketId);
      console.log('Request ID:', requestId);
      io.to(requesterSocketId).emit('friend_request_updated', requestId);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Emit friend response error:', error);
    res.status(500).json({ message: 'Error emitting friend response' });
  }
}) as any);

// Add this endpoint for testing
router.post('/test-friend-request', (async (req: AuthRequest, res: Response) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user?.id;
    
    if (!userId || !recipientId) {
      return res.status(400).json({ message: 'User ID and recipient ID are required' });
    }
    
    // Create a test request object
    const testRequest = {
      _id: new mongoose.Types.ObjectId().toString(),
      requester: {
        _id: userId,
        name: 'Test User',
        email: 'test@example.com',
        avatar: '',
      },
      recipient: recipientId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Get recipient's socket ID
    const recipientSocketId = onlineUsers.get(recipientId);
    console.log('TEST - Recipient socket ID:', recipientSocketId);
    
    if (recipientSocketId) {
      console.log('TEST - Emitting test friend request');
      io.to(recipientSocketId).emit('friend_request_received', testRequest);
      return res.json({ success: true });
    } else {
      return res.status(404).json({ message: 'Recipient not online' });
    }
  } catch (error) {
    console.error('Test friend request error:', error);
    return res.status(500).json({ message: 'Error sending test friend request' });
  }
}) as any);

export default router; 