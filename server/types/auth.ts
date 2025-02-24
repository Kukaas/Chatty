import { Request } from 'express';

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
} 