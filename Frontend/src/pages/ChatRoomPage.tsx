import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { RoomHeader } from '../components/RoomHeader';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { EmptyState } from '../components/EmptyState';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper function to get or generate a persistent userId
function getOrCreateUserId(): string {
  const STORAGE_KEY = 'chat_user_id';
  let myUserId = localStorage.getItem(STORAGE_KEY);
  
  if (!myUserId) {
    // Generate a short random ID
    myUserId = `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    localStorage.setItem(STORAGE_KEY, myUserId);
  }
  
  return myUserId;
}

type Message = {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  isSelf: boolean;
  author: string; // Persistent userId for comparison
};

export function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string; }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [username] = useState(`Guest_${Math.floor(Math.random() * 1000)}`);
  // Persistent userId that survives page refresh
  const [myUserId] = useState(() => getOrCreateUserId());
  const [onlineCount, setOnlineCount] = useState(0);
  const [roomCapacity, setRoomCapacity] = useState(0);
  const [roomFull, setRoomFull] = useState(false);
  const [roomNotFound, setRoomNotFound] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false); // Security check state
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Track current room capacity for reconnection
  const currentCapacityRef = useRef<number>(0);
  // Track if we've successfully joined a room
  const hasJoinedRef = useRef<boolean>(false);
  // Track if we're in room creation mode (trust the creator)
  const isCreatingRef = useRef<boolean>(false);

  // Initialize Socket.io connection
  useEffect(() => {
    // 1. Connect to backend
    socketRef.current = io(API_URL);
    const socket = socketRef.current;

    // 2. Validate and Join Logic
    const initializeRoom = async () => {
      if (!roomId) return;

      // Get capacity from URL
      const urlCapacityStr = searchParams.get('capacity');
      const urlCapacity = urlCapacityStr ? parseInt(urlCapacityStr) : null;

      try {
        // CHECK DATABASE FIRST
        const response = await fetch(`${API_URL}/api/room/${roomId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          // --- CASE 1: ROOM ALREADY EXISTS ---
          const dbCapacity = data.room.capacity;
          
          // SECURITY CHECK: Does URL capacity match Database capacity?
          // If URL capacity is missing OR it doesn't match the DB -> BLOCK
          if (!urlCapacity || urlCapacity !== dbCapacity) {
            console.log("Security Alert: URL capacity doesn't match DB");
            setInvalidLink(true); // Show "Invalid Link" screen
            setTimeout(() => navigate('/'), 3000);
            return;
          }

          // If we are here, the Link is VALID. Join the room.
          setRoomCapacity(dbCapacity);
          currentCapacityRef.current = dbCapacity;
          hasJoinedRef.current = true;
          socket.emit('join_room', { room: roomId, username, myUserId, capacity: dbCapacity });

        } else if (response.status === 404) {
          // --- CASE 2: ROOM DOES NOT EXIST ---
          
          // Only create if the URL has a valid capacity (2-100)
          if (urlCapacity && urlCapacity >= 2 && urlCapacity <= 100) {
            console.log("Creating new room...");
            setRoomCapacity(urlCapacity);
            currentCapacityRef.current = urlCapacity;
            hasJoinedRef.current = true;
            isCreatingRef.current = true; // Trust the creator, skip room_not_found errors
            socket.emit('create_room', { 
              room: roomId, 
              username,
              myUserId,
              capacity: urlCapacity
            });
          } else {
            // URL is junk (no capacity) and room doesn't exist
            setRoomNotFound(true);
            setTimeout(() => navigate('/'), 3000);
          }
        } else {
          // Server error or other issue
          setRoomNotFound(true);
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (err) {
        console.error("Connection Error:", err);
        setRoomNotFound(true);
        setTimeout(() => navigate('/'), 3000);
      }
    };

    initializeRoom();

    // --- HANDLE RECONNECTION (Mobile screen off/on) ---
    socket.on('connect', () => {
      console.log('Socket connected/reconnected');
      // If we had previously joined a room, re-join to sync messages
      if (hasJoinedRef.current && roomId && currentCapacityRef.current > 0) {
        console.log('Reconnecting to room:', roomId);
        socket.emit('join_room', { 
          room: roomId, 
          username, 
          myUserId,
          capacity: currentCapacityRef.current,
          isReconnect: true // Flag to let server know this is a reconnection
        });
      }
    });

    // --- SOCKET EVENT LISTENERS ---

    socket.on('room_not_found', () => {
      // Skip this error if we're in creation mode (trust the creator)
      if (isCreatingRef.current) {
        console.log('Ignoring room_not_found during room creation');
        return;
      }
      setRoomNotFound(true);
      setTimeout(() => navigate('/'), 3000);
    });

    socket.on('invalid_invite', () => {
      setInvalidLink(true);
      setTimeout(() => navigate('/'), 3000);
    });

    socket.on('room_full', () => {
      setRoomFull(true);
      setTimeout(() => navigate('/'), 2000);
    });

    socket.on('room_created', (data: any) => {
      console.log(`🏠 Room created: ${data.roomId}`);
    });

    socket.on('room_info', (data: any) => {
      setOnlineCount(data.currentUsers || 0);
      // We rely on our initial fetch for capacity security, 
      // but this keeps UI in sync if it changes dynamically
      if (data.capacity) setRoomCapacity(data.capacity); 
    });

    socket.on('load_messages', (loadedMessages: any[]) => {
      const formattedMessages = loadedMessages.map((msg: any) => {
        // WhatsApp Rule: Compare persistent ID to determine ownership
        // Check userId first (new format), then author (current format)
        const messageOwnerId = msg.userId || msg.author;
        const isMine = messageOwnerId === myUserId;
        return {
          id: msg._id || msg.id,
          text: msg.message,
          username: msg.displayName || msg.author, // Use displayName for UI, fallback to author
          timestamp: msg.time,
          author: messageOwnerId, // Persistent userId for comparison
          isSelf: isMine, // TRUE = Right side (mine), FALSE = Left side (others)
        };
      });
      setMessages(formattedMessages);
    });

    socket.on('receive_message', (data: any) => {
      // WhatsApp Rule: Compare persistent ID to determine ownership
      const messageOwnerId = data.userId || data.author;
      const isMine = messageOwnerId === myUserId;
      const newMessage: Message = {
        id: data.id || Date.now().toString(),
        text: data.message,
        username: data.displayName || data.author, // Use displayName for UI, fallback to author
        timestamp: data.time,
        author: messageOwnerId, // Persistent userId for comparison
        isSelf: isMine, // TRUE = Right side (mine), FALSE = Left side (others)
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on('user_joined', (data: any) => {
      const systemMessage: Message = {
        id: Date.now().toString(),
        text: data.message,
        username: data.username,
        timestamp: data.time,
        author: 'system',
        isSelf: false,
      };
      setMessages((prev) => [...prev, systemMessage]);
    });

    socket.on('user_left', (data: any) => {
      const systemMessage: Message = {
        id: Date.now().toString(),
        text: data.message,
        username: data.username,
        timestamp: data.time,
        author: 'system',
        isSelf: false,
      };
      setMessages((prev) => [...prev, systemMessage]);
    });

    socket.on('user_typing', (data: { username: string }) => {
      if (data.username !== username) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.username)) return [...prev, data.username];
          return prev;
        });
      }
    });

    socket.on('user_stop_typing', (data: { username: string }) => {
      setTypingUsers((prev) => prev.filter((user) => user !== data.username));
    });

    return () => {
      hasJoinedRef.current = false;
      if (roomId) {
        socket.emit('leave_room', { room: roomId, username });
      }
      socket.disconnect();
    };
  }, [roomId, username, myUserId, searchParams, navigate]); // Dependencies updated

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (!socketRef.current || !roomId) return;

    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    socketRef.current.emit('stop_typing', { room: roomId, username });
    socketRef.current.emit('send_message', {
      room: roomId,
      author: myUserId, // Use persistent myUserId as author for ownership
      displayName: username, // Display name for UI
      message: text,
      time: time,
    });
  };

  const handleTyping = () => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('typing', { room: roomId, username });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { room: roomId, username });
    }, 2000);
  };

  // --- RENDER STATES ---

  if (invalidLink) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-bg">
        <div className="text-center bg-dark-card p-8 rounded-3xl border border-dark-border">
          <div className="w-16 h-16 rounded-full bg-accent-error/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-dark-text mb-2">Invalid Invite Link</h2>
          <p className="text-dark-text-secondary">
            This invite link does not match the room's security settings.
          </p>
          <p className="text-sm text-dark-text-muted mt-4">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (roomNotFound) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-bg">
        <div className="text-center bg-dark-card p-8 rounded-3xl border border-dark-border">
          <div className="w-16 h-16 rounded-full bg-accent-error/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <h2 className="text-2xl font-bold text-dark-text mb-2">Room Not Found</h2>
          <p className="text-dark-text-secondary">
            This room code doesn't exist, and the link is missing creation details.
          </p>
          <p className="text-sm text-dark-text-muted mt-4">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (roomFull) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-bg">
        <div className="text-center bg-dark-card p-8 rounded-3xl border border-dark-border">
          <div className="w-16 h-16 rounded-full bg-accent-error/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😔</span>
          </div>
          <h2 className="text-2xl font-bold text-dark-text mb-2">Room Full</h2>
          <p className="text-dark-text-secondary">The room is at max capacity.</p>
          <p className="text-sm text-dark-text-muted mt-4">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-dark-bg">
      <RoomHeader
        roomId={roomId || 'UNKNOWN'}
        onlineCount={onlineCount}
        capacity={roomCapacity}
      />

      <main className="flex-1 overflow-y-auto p-2 sm:p-4 scrollbar-hide">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex-1 py-4">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg.text}
                  username={msg.username}
                  timestamp={msg.timestamp}
                  isSelf={msg.isSelf}
                />
              ))}
              <div ref={messagesEndRef} />
              
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 text-dark-text-muted text-sm">
                   {/* Typing animation dots */}
                   <div className="flex gap-1">
                    <span className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="italic">
                    {typingUsers.length === 1 ? `${typingUsers[0]} is typing...` : `${typingUsers.length} people are typing...`}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
}