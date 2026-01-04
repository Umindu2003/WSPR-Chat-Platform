import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { RoomHeader } from '../components/RoomHeader';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { EmptyState } from '../components/EmptyState';

type Message = {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  isSelf: boolean;
};
export function ChatRoomPage() {
  const {
    roomId
  } = useParams<{
    roomId: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [username] = useState(`Guest_${Math.floor(Math.random() * 1000)}`);
  const [onlineCount, setOnlineCount] = useState(0);
  const [roomCapacity, setRoomCapacity] = useState(0);
  const [roomFull, setRoomFull] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Socket.io connection
  useEffect(() => {
    // Connect to backend
    socketRef.current = io('http://localhost:3001');
    const socket = socketRef.current;

    // Join room when component mounts
    if (roomId) {
      const capacity = searchParams.get('capacity');
      socket.emit('join_room', { 
        room: roomId, 
        username,
        capacity: capacity ? parseInt(capacity) : undefined
      });
    }

    // Listen for room full event
    socket.on('room_full', (data: any) => {
      setRoomFull(true);
      alert(data.message || 'This room is full!');
      setTimeout(() => navigate('/'), 2000);
    });

    // Listen for room info updates
    socket.on('room_info', (data: any) => {
      setOnlineCount(data.currentUsers || 0);
      setRoomCapacity(data.capacity || 0);
    });

    // Listen for message history
    socket.on('load_messages', (loadedMessages: any[]) => {
      const formattedMessages = loadedMessages.map((msg: any) => ({
        id: msg._id || msg.id,
        text: msg.message,
        username: msg.author,
        timestamp: msg.time,
        isSelf: msg.author === username,
      }));
      setMessages(formattedMessages);
    });

    // Listen for new messages
    socket.on('receive_message', (data: any) => {
      const newMessage: Message = {
        id: data.id || Date.now().toString(),
        text: data.message,
        username: data.author,
        timestamp: data.time,
        isSelf: data.author === username,
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    // Listen for user joined notifications
    socket.on('user_joined', (data: any) => {
      const systemMessage: Message = {
        id: Date.now().toString(),
        text: data.message,
        username: data.username,
        timestamp: data.time,
        isSelf: false,
      };
      setMessages((prev) => [...prev, systemMessage]);
    });

    // Listen for user left notifications
    socket.on('user_left', (data: any) => {
      const systemMessage: Message = {
        id: Date.now().toString(),
        text: data.message,
        username: data.username,
        timestamp: data.time,
        isSelf: false,
      };
      setMessages((prev) => [...prev, systemMessage]);
    });

    // Listen for typing events
    socket.on('user_typing', (data: { username: string }) => {
      if (data.username !== username) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.username)) {
            return [...prev, data.username];
          }
          return prev;
        });
      }
    });

    // Listen for stop typing events
    socket.on('user_stop_typing', (data: { username: string }) => {
      setTypingUsers((prev) => prev.filter((user) => user !== data.username));
    });

    // Cleanup on unmount
    return () => {
      if (roomId) {
        socket.emit('leave_room', { room: roomId, username });
      }
      socket.disconnect();
    };
  }, [roomId, username]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
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

    // Stop typing indicator when sending
    socketRef.current.emit('stop_typing', { room: roomId, username });

    // Emit message to server
    socketRef.current.emit('send_message', {
      room: roomId,
      author: username,
      message: text,
      time: time,
    });
  };

  const handleTyping = () => {
    if (!socketRef.current || !roomId) return;

    // Emit typing event
    socketRef.current.emit('typing', { room: roomId, username });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { room: roomId, username });
    }, 2000);
  };
  if (roomFull) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-bg">
        <div className="text-center bg-dark-card p-8 rounded-3xl border border-dark-border">
          <div className="w-16 h-16 rounded-full bg-accent-error/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😔</span>
          </div>
          <h2 className="text-2xl font-bold text-dark-text mb-2">Room Full</h2>
          <p className="text-dark-text-secondary">
            This room has reached its capacity.
          </p>
          <p className="text-sm text-dark-text-muted mt-4">
            Redirecting to home...
          </p>
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

      <main className="flex-1 overflow-y-auto p-4 scrollbar-hide">
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

              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 text-dark-text-muted text-sm">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-accent-primary rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-accent-primary rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-accent-primary rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    ></span>
                  </div>
                  <span className="italic">
                    {typingUsers.length === 1
                      ? `${typingUsers[0]} is typing...`
                      : `${typingUsers.length} people are typing...`}
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