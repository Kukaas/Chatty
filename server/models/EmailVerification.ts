import { Schema, model, models, Document } from 'mongoose';

interface IEmailVerification extends Document {
  userId: Schema.Types.ObjectId;
  token: string;
  expiresAt: Date;
}

const emailVerificationSchema = new Schema<IEmailVerification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  },
});

export const EmailVerification = models.EmailVerification || model<IEmailVerification>('EmailVerification', emailVerificationSchema); 