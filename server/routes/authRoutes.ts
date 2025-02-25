import { Router } from 'express';
import { Request, Response } from 'express';
import { login, signup, verifyEmail } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { User } from '../models/User';
import { AuthRequest } from '../types/auth';

const router = Router();

// Auth routes
router.post('/login', login);
router.post('/signup', signup);
router.get('/verify-email', verifyEmail as any);

// Protected route to get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId)
      .select('-password')
      .lean();

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Error getting user details' });
  }
});

export default router; 