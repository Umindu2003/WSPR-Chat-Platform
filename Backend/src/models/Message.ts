import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  room: string;
  author: string;
  message: string;
  time: string;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    room: {
      type: String,
      required: true,
      index: true,
    },
    author: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying by room
MessageSchema.index({ room: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
