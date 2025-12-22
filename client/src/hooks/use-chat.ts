import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface Message {
  _id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  message: string;
  type: 'text' | 'file' | 'system';
  timestamp: Date;
  reactions?: any[];
  readBy?: string[];
  attachments?: any[];
}

interface Room {
  _id: string;
  participants: string[];
  type: 'direct' | 'group' | 'channel';
  name: string;
  description?: string;
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: Date;
  metadata?: {
    productId?: string;
    orderId?: string;
    sellerName?: string;
    buyerName?: string;
  };
}

interface UseChatReturn {
  socket: Socket | null;
  isConnected: boolean;
  rooms: Room[];
  currentRoom: Room | null;
  messages: Message[];
  isTyping: { [key: string]: boolean };
  sendMessage: (roomId: string, message: string) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  createRoom: (participants: string[], metadata?: any) => Promise<Room | null>;
  startTyping: (roomId: string) => void;
  stopTyping: (roomId: string) => void;
  markAsRead: (roomId: string, messageId?: string) => void;
  loadRooms: () => void;
  loadMessages: (roomId: string) => void;
}

export function useChat(): UseChatReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<{ [key: string]: boolean }>({});
  
  const typingTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const CHAT_SERVICE_URL = import.meta.env.VITE_CHAT_SERVICE_URL || 'http://localhost:3002';
    
    const newSocket = io(CHAT_SERVICE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Connected to chat service');
      setIsConnected(true);
      
      // Authenticate
      newSocket.emit('authenticate', {
        userId: user.id,
        userName: user.name || user.username,
        userRole: user.role || 'user'
      });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from chat service');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Chat connection error:', error);
      toast({
        title: 'Connection Error',
        description: 'Unable to connect to chat service',
        variant: 'destructive'
      });
    });

    // Authentication response
    newSocket.on('authenticated', (data) => {
      console.log('✅ Authenticated:', data);
      loadUserRooms(newSocket);
    });

    newSocket.on('authentication-failed', (data) => {
      console.error('❌ Authentication failed:', data);
      toast({
        title: 'Authentication Failed',
        description: 'Failed to authenticate with chat service',
        variant: 'destructive'
      });
    });

    // Message events
    newSocket.on('new-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
      
      // Update room's last message
      setRooms((prev) =>
        prev.map((room) =>
          room._id === message.roomId
            ? { ...room, lastMessage: message, unreadCount: (room.unreadCount || 0) + 1 }
            : room
        )
      );

      // Show notification if not in current room
      if (currentRoom?._id !== message.roomId && message.senderId !== user.id) {
        toast({
          title: 'New Message',
          description: `${message.senderName}: ${message.message.substring(0, 50)}...`
        });
      }
    });

    // Room events
    newSocket.on('room-created', ({ room }) => {
      setRooms((prev) => [room, ...prev]);
    });

    newSocket.on('room-joined', ({ room, messages: roomMessages }) => {
      setCurrentRoom(room);
      setMessages(roomMessages || []);
    });

    // Typing events
    newSocket.on('typing-start', ({ userId, userName, roomId }) => {
      if (userId !== user.id) {
        setIsTyping((prev) => ({ ...prev, [roomId]: true }));
      }
    });

    newSocket.on('typing-stop', ({ userId, roomId }) => {
      if (userId !== user.id) {
        setIsTyping((prev) => ({ ...prev, [roomId]: false }));
      }
    });

    // Error handling
    newSocket.on('error', (error) => {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive'
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  // Load user's rooms
  const loadUserRooms = async (socketInstance: Socket) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/chat/rooms/${user.id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error('Failed to load rooms:', error);
    }
  };

  const loadRooms = useCallback(() => {
    if (socket) {
      loadUserRooms(socket);
    }
  }, [socket, user]);

  // Load messages for a room
  const loadMessages = useCallback(async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${roomId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, []);

  // Send message
  const sendMessage = useCallback((roomId: string, message: string) => {
    if (!socket || !isConnected || !message.trim()) return;

    socket.emit('send-message', {
      roomId,
      message: message.trim(),
      type: 'text'
    });
  }, [socket, isConnected]);

  // Join room
  const joinRoom = useCallback((roomId: string) => {
    if (!socket || !isConnected) return;

    socket.emit('join-room', { roomId });
  }, [socket, isConnected]);

  // Leave room
  const leaveRoom = useCallback((roomId: string) => {
    if (!socket || !isConnected) return;

    socket.emit('leave-room', { roomId });
    setCurrentRoom(null);
    setMessages([]);
  }, [socket, isConnected]);

  // Create room
  const createRoom = useCallback(async (participants: string[], metadata?: any): Promise<Room | null> => {
    if (!socket || !isConnected) return null;

    return new Promise((resolve) => {
      socket.emit('create-room', {
        participants,
        type: participants.length === 2 ? 'direct' : 'group',
        name: metadata?.name || 'Chat Room',
        description: metadata?.description || '',
        metadata
      });

      socket.once('room-create-success', ({ room }) => {
        setRooms((prev) => [room, ...prev]);
        resolve(room);
      });

      socket.once('error', () => {
        resolve(null);
      });
    });
  }, [socket, isConnected]);

  // Typing indicators
  const startTyping = useCallback((roomId: string) => {
    if (!socket || !isConnected) return;

    socket.emit('typing-start', { roomId });

    // Auto-stop typing after 3 seconds
    if (typingTimeoutRef.current[roomId]) {
      clearTimeout(typingTimeoutRef.current[roomId]);
    }
    
    typingTimeoutRef.current[roomId] = setTimeout(() => {
      stopTyping(roomId);
    }, 3000);
  }, [socket, isConnected]);

  const stopTyping = useCallback((roomId: string) => {
    if (!socket || !isConnected) return;

    socket.emit('typing-stop', { roomId });
    
    if (typingTimeoutRef.current[roomId]) {
      clearTimeout(typingTimeoutRef.current[roomId]);
      delete typingTimeoutRef.current[roomId];
    }
  }, [socket, isConnected]);

  // Mark as read
  const markAsRead = useCallback((roomId: string, messageId?: string) => {
    if (!socket || !isConnected) return;

    socket.emit('mark-as-read', { roomId, messageId });
    
    // Update local state
    setRooms((prev) =>
      prev.map((room) =>
        room._id === roomId ? { ...room, unreadCount: 0 } : room
      )
    );
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    rooms,
    currentRoom,
    messages,
    isTyping,
    sendMessage,
    joinRoom,
    leaveRoom,
    createRoom,
    startTyping,
    stopTyping,
    markAsRead,
    loadRooms,
    loadMessages
  };
}
