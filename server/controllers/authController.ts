import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User';
import { EmailVerification } from '../models/EmailVerification';
import { sendVerificationEmail } from '../services/emailService';
import { SignupData, LoginData } from '../types/auth';
import jwt from 'jsonwebtoken';

// Define the request types
interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface SignupRequest extends Request {
  body: {
    name: string;
    email: string;
    password: string;
  };
}

interface VerifyEmailRequest extends Request {
  query: {
    token?: string;
  };
}

export const signup = async (req: SignupRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Create verification token
    const token = crypto.randomBytes(32).toString('hex');
    await EmailVerification.create({
      userId: user._id,
      token,
    });

    // Send verification email
    await sendVerificationEmail(email, name, token);

    res.status(201).json({ message: 'Please check your email to verify your account' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating account' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Log for debugging
    console.log('Verifying token:', token);

    // Find the verification record
    const verification = await EmailVerification.findOne({ token });

    if (!verification) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Check if token is expired
    if (verification.expiresAt < new Date()) {
      await EmailVerification.deleteOne({ _id: verification._id });
      return res.status(400).json({ message: 'Verification token has expired' });
    }

    // Update user
    const updateResult = await User.updateOne(
      { _id: verification.userId },
      { $set: { emailVerified: true } }
    );

    if (!updateResult.matchedCount) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the verification record
    await EmailVerification.deleteOne({ _id: verification._id });

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ message: 'Error verifying email' });
  }
};

export const login = async (req: LoginRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Check if email is verified
    if (!user.emailVerified) {
      res.status(400).json({ message: 'Please verify your email first' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
}; 