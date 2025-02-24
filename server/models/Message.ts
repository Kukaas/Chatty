import { Schema, model, models, Document } from 'mongoose';

interface IMessage extends Document {
  content: string;
  sender: Schema.Types.ObjectId;
  recipient: Schema.Types.ObjectId;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Message = models.Message || model<IMessage>('Message', messageSchema); 