import { Router, Request, Response } from 'express';
import { signup, verifyEmail, login } from '../controllers/authController';

const router = Router();

// Signup route
router.post('/signup', (req: Request, res: Response) => signup(req, res));

// Verify email route
router.get('/verify-email', (req: Request, res: Response) => verifyEmail(req, res));

// Login route
router.post('/login', (req: Request, res: Response) => login(req, res));

export default router; 