import { Message, IMessage } from '../models/Message';

interface MessageData {
  room: string;
  author: string; // Persistent userId for ownership
  displayName?: string; // Display name for UI
  userId: string; // Persistent user identifier (same as author)
  message: string;
  time: string;
}

/**
 * Save a new message to the database
 */
export const saveMessage = async (messageData: MessageData): Promise<IMessage> => {
  try {
    const newMessage = new Message({
      room: messageData.room,
      author: messageData.author,
      displayName: messageData.displayName || messageData.author,
      userId: messageData.userId,
      message: messageData.message,
      time: messageData.time,
    });

    const savedMessage = await newMessage.save();
    console.log(`💾 Message saved to room: ${messageData.room}`);
    return savedMessage;
  } catch (error) {
    console.error('❌ Error saving message:', error);
    throw error;
  }
};

/**
 * Get all messages for a specific room
 */
export const getMessagesByRoom = async (room: string): Promise<IMessage[]> => {
  try {
    const messages = await Message.find({ room })
      .sort({ createdAt: 1 })
      .limit(100); // Limit to last 100 messages

    return messages;
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    throw error;
  }
};

/**
 * Delete old messages (optional cleanup function)
 */
export const deleteOldMessages = async (daysOld: number = 7): Promise<number> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Message.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    console.log(`🗑️  Deleted ${result.deletedCount} old messages`);
    return result.deletedCount;
  } catch (error) {
    console.error('❌ Error deleting old messages:', error);
    throw error;
  }
};
