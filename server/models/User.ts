import { Schema, model, models, Document } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: string;
  emailVerified: boolean;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = models.User || model<IUser>('User', userSchema); 