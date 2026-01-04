import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomId: string;
  capacity: number;
  currentUsers: number;
  users: string[];
  createdAt: Date;
}

const RoomSchema: Schema = new Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 2,
      max: 100,
    },
    currentUsers: {
      type: Number,
      default: 0,
    },
    users: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Auto-delete rooms after 24 hours of inactivity
RoomSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

export const Room = mongoose.model<IRoom>('Room', RoomSchema);
