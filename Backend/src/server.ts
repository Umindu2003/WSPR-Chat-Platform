import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import { saveMessage, getMessagesByRoom } from './controllers/chatController';
import { createRoom, addUserToRoom, removeUserFromRoom, getRoomInfo } from './controllers/roomController';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Configure CORS
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

// Initialize Socket.io with CORS
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Anonymous Chat Server Running' });
});

// REST API endpoint to get room messages
app.get('/api/messages/:room', async (req, res) => {
  try {
    const { room } = req.params;
    const messages = await getMessagesByRoom(room);
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

// REST API endpoint to get room info
app.get('/api/room/:room', async (req, res) => {
  try {
    const { room } = req.params;
    const roomInfo = await getRoomInfo(room);
    if (roomInfo) {
      res.json({
        success: true,
        room: {
          roomId: roomInfo.roomId,
          capacity: roomInfo.capacity,
          currentUsers: roomInfo.currentUsers,
        },
      });
    } else {
      res.status(404).json({ success: false, error: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch room info' });
  }
});

// Socket.io Connection Logic
io.on('connection', (socket: Socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Event: Create a new room (only for room creators)
  socket.on('create_room', async (data: { room: string; username: string; capacity: number }) => {
    const { room, username, capacity } = data;

    try {
      // Check if room already exists
      const existingRoom = await getRoomInfo(room);
      if (existingRoom) {
        // Room already exists, emit error
        socket.emit('room_exists', {
          message: 'Room already exists. Please try a different code.',
        });
        console.log(`❌ Room ${room} already exists, cannot create`);
        return;
      }

      // Create the new room
      const roomData = await createRoom(room, capacity);

      // Add creator to the room
      const joinResult = await addUserToRoom(room, socket.id);
      if (!joinResult.success) {
        socket.emit('error', { message: 'Failed to join created room' });
        return;
      }

      // Join the Socket.io room
      socket.join(room);
      console.log(`🏠 ${username || socket.id} created and joined room: ${room} (${joinResult.room?.currentUsers}/${joinResult.room?.capacity})`);

      // Send room info
      socket.emit('room_created', {
        roomId: room,
        capacity: roomData.capacity,
        currentUsers: joinResult.room?.currentUsers,
      });

      // Send room info to the creator
      socket.emit('room_info', {
        currentUsers: joinResult.room?.currentUsers,
        capacity: joinResult.room?.capacity,
      });

      // Send empty messages (new room)
      socket.emit('load_messages', []);
    } catch (error) {
      console.error('❌ Error creating room:', error);
      socket.emit('error', { message: 'Failed to create room' });
    }
  });

  // Event: User joins an existing room (strict validation - room must exist)
  socket.on('join_room', async (data: { room: string; username: string; myUserId?: string; capacity?: number; isReconnect?: boolean }) => {
    const { room, username, myUserId, capacity, isReconnect } = data;

    try {
      // STRICT VALIDATION: Check if room exists in database
      const roomData = await getRoomInfo(room);
      
      if (!roomData) {
        // Room doesn't exist - emit room_not_found event
        socket.emit('room_not_found', {
          message: 'Room not found. Please check the room code and try again.',
        });
        console.log(`❌ ${username} tried to join non-existent room: ${room}`);
        return;
      }

      // Optional: Validate invite capacity matches the room (prevents spoofed invites)
      if (typeof capacity === 'number' && capacity !== roomData.capacity) {
        socket.emit('invalid_invite', {
          message: "Invite link does not match room settings.",
        });
        console.log(
          `❌ ${username} provided invalid capacity for ${room}: got ${capacity}, expected ${roomData.capacity}`
        );
        return;
      }

      // Check if room is full
      if (roomData.currentUsers >= roomData.capacity) {
        socket.emit('room_full', {
          message: 'Room is full. Please try again later.',
        });
        console.log(`❌ ${username} cannot join ${room}: Room is full (${roomData.currentUsers}/${roomData.capacity})`);
        return;
      }

      // Add user to room
      const joinResult = await addUserToRoom(room, socket.id);
      if (!joinResult.success) {
        socket.emit('room_full', {
          message: joinResult.message || 'Cannot join room',
        });
        console.log(`❌ ${username} cannot join ${room}: ${joinResult.message}`);
        return;
      }

      // Join the Socket.io room
      socket.join(room);
      console.log(`👤 ${username || socket.id} joined room: ${room} (${joinResult.room?.currentUsers}/${joinResult.room?.capacity})`);

      // Send existing messages to the user
      const existingMessages = await getMessagesByRoom(room);
      socket.emit('load_messages', existingMessages);

      // Send room info to all users in the room
      io.to(room).emit('room_info', {
        currentUsers: joinResult.room?.currentUsers,
        capacity: joinResult.room?.capacity,
      });

      // Notify others in the room (skip notification if this is a reconnection)
      if (!isReconnect) {
        socket.to(room).emit('user_joined', {
          message: `${username || 'Someone'} joined the room`,
          username: 'System',
          time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        });
      } else {
        console.log(`🔄 ${username || socket.id} reconnected to room: ${room}`);
      }
    } catch (error) {
      console.error('❌ Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Event: User sends a message
  socket.on(
    'send_message',
    async (data: { room: string; author: string; displayName?: string; message: string; time: string }) => {
      const { room, author, displayName, message, time } = data;

      try {
        // Save message to database
        // author = myUserId (persistent ID for ownership)
        // displayName = username (for display in UI)
        const savedMessage = await saveMessage({
          room,
          author, // This is now the persistent myUserId
          displayName: displayName || author, // Store display name
          userId: author, // Store same value for backward compatibility
          message,
          time,
        });

        // Broadcast message to everyone in the room (including sender)
        io.to(room).emit('receive_message', {
          id: savedMessage._id,
          room,
          author, // Persistent myUserId for ownership comparison
          userId: author, // Also send as userId for consistency
          displayName: displayName || author, // Display name for UI
          message,
          time,
          createdAt: savedMessage.createdAt,
        });

        console.log(`📨 Message in room ${room} from ${displayName || author}: ${message}`);
      } catch (error) {
        console.error('❌ Error handling message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    }
  );

  // Event: User is typing
  socket.on('typing', (data: { room: string; username: string }) => {
    socket.to(data.room).emit('user_typing', {
      username: data.username,
    });
  });

  // Event: User stopped typing
  socket.on('stop_typing', (data: { room: string; username: string }) => {
    socket.to(data.room).emit('user_stop_typing', {
      username: data.username,
    });
  });

  // Event: User leaves room
  socket.on('leave_room', async (data: { room: string; username: string }) => {
    const { room, username } = data;
    socket.leave(room);
    
    // Remove user from room tracking
    await removeUserFromRoom(room, socket.id);
    const roomInfo = await getRoomInfo(room);
    
    console.log(`👋 ${username} left room: ${room}`);

    // Update room info for remaining users
    if (roomInfo) {
      io.to(room).emit('room_info', {
        currentUsers: roomInfo.currentUsers,
        capacity: roomInfo.capacity,
      });
    }

    socket.to(room).emit('user_left', {
      message: `${username || 'Someone'} left the room`,
      username: 'System',
      time: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  });

  // Event: User disconnects (using 'disconnecting' to access rooms before they are cleared)
  socket.on('disconnecting', async () => {
    console.log(`❌ User disconnecting: ${socket.id}`);
    
    // Remove user from all rooms they were in
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        await removeUserFromRoom(room, socket.id);
        const roomInfo = await getRoomInfo(room);
        
        if (roomInfo) {
          io.to(room).emit('room_info', {
            currentUsers: roomInfo.currentUsers,
            capacity: roomInfo.capacity,
          });
        }
      }
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
  console.log(`💬 Socket.io ready for connections`);
});
