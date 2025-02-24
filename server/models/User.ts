import { Schema, model, models, Document } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: string;
  emailVerified: boolean;
  createdAt: Date;
  friends: Schema.Types.ObjectId[];
  friendRequests: Schema.Types.ObjectId[];
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
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for friends
userSchema.virtual('friends', {
  ref: 'Friend',
  localField: '_id',
  foreignField: 'requester',
  match: { status: 'accepted' }
});

userSchema.virtual('friendRequests', {
  ref: 'Friend',
  localField: '_id',
  foreignField: 'recipient',
  match: { status: 'pending' }
});

export const User = models.User || model<IUser>('User', userSchema); 