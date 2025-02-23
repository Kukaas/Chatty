import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User';
import { EmailVerification } from '../models/EmailVerification';
import { sendVerificationEmail } from '../services/emailService';
import { SignupData, LoginData } from '../types/auth';

// Define request types
interface SignupRequest extends Request {
  body: SignupData;
}

interface LoginRequest extends Request {
  body: LoginData;
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
      return res.status(400).json({ message: 'Email already registered' });
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

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

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
    await User.updateOne(
      { _id: verification.userId },
      { emailVerified: true }
    );

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
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // TODO: Generate JWT token here

    res.json({
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