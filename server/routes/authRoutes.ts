import { Router } from 'express';
import { login, signup, verifyEmail } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { User } from '../models/User';
import { AuthRequest } from '../types/auth';

const router = Router();

// Auth routes
router.post('/login', login);
router.post('/signup', signup);
router.get('/verify-email', verifyEmail);

// Protected route to get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId)
      .select('-password') // Exclude password from the response
      .lean(); // Convert to plain JavaScript object

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Error getting user details' });
  }
});

export default router; 