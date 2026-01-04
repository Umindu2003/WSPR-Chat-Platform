import { Room, IRoom } from '../models/Room';

/**
 * Create or get a room with capacity
 */
export const createRoom = async (roomId: string, capacity: number): Promise<IRoom> => {
  try {
    let room = await Room.findOne({ roomId });

    if (!room) {
      room = new Room({
        roomId,
        capacity,
        currentUsers: 0,
        users: [],
      });
      await room.save();
      console.log(`🏠 Room created: ${roomId} with capacity ${capacity}`);
    }

    return room;
  } catch (error) {
    console.error('❌ Error creating room:', error);
    throw error;
  }
};

/**
 * Add user to room
 */
export const addUserToRoom = async (
  roomId: string,
  socketId: string
): Promise<{ success: boolean; message?: string; room?: IRoom }> => {
  try {
    const room = await Room.findOne({ roomId });

    if (!room) {
      return { success: false, message: 'Room not found' };
    }

    if (room.currentUsers >= room.capacity) {
      return { success: false, message: 'Room is full' };
    }

    if (!room.users.includes(socketId)) {
      room.users.push(socketId);
      room.currentUsers = room.users.length;
      await room.save();
    }

    return { success: true, room };
  } catch (error) {
    console.error('❌ Error adding user to room:', error);
    return { success: false, message: 'Server error' };
  }
};

/**
 * Remove user from room
 */
export const removeUserFromRoom = async (roomId: string, socketId: string): Promise<void> => {
  try {
    const room = await Room.findOne({ roomId });

    if (room) {
      room.users = room.users.filter((id) => id !== socketId);
      room.currentUsers = room.users.length;
      await room.save();
      console.log(`👤 User removed from room ${roomId}. Current: ${room.currentUsers}/${room.capacity}`);
    }
  } catch (error) {
    console.error('❌ Error removing user from room:', error);
  }
};

/**
 * Get room info
 */
export const getRoomInfo = async (roomId: string): Promise<IRoom | null> => {
  try {
    return await Room.findOne({ roomId });
  } catch (error) {
    console.error('❌ Error getting room info:', error);
    return null;
  }
};
