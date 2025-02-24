import { Router } from 'express';
import { login, signup, verifyEmail } from '../controllers/authController';

const router = Router();

// Auth routes
router.post('/login', login);
router.post('/signup', signup);
router.get('/verify-email', verifyEmail);

export default router; 