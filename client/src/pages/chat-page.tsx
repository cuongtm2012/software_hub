import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  MessageCircle,
  Send,
  Users,
  ArrowLeft,
  Plus,
  Phone,
  Video,
  MoreVertical,
  Circle,
  Search,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  X
} from 'lucide-react';
import io, { Socket } from 'socket.io-client';
import { cn } from '@/lib/utils';
import { NotificationBanner } from '@/components/NotificationBanner';

// Chat service configuration
const CHAT_SERVICE_URL = 'http://localhost:3002';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface ChatRoom {
  _id: string;
  participants: string[];
  type: 'direct' | 'group' | 'channel';
  name?: string;
  description?: string;
  createdAt: string;
  lastActivity: string;
  lastMessage?: {
    _id: string;
    message: string;
    senderName: string;
    timestamp: string;
  };
  unreadCount?: number;
}

interface ChatMessage {
  _id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  type: 'text' | 'image' | 'file';
  timestamp: string;
  metadata?: {
    reactions?: Record<string, Record<string, string>>;
    isEdited?: boolean;
    editedAt?: string;
    readBy?: Record<string, string>;
    deliveredTo?: Record<string, string>;
  };
}

export default function ChatPage() {
  const [, navigate] = useLocation();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // NEW: State for users and rooms from WebSocket
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Get current user from main app (keep this)
  const { data: currentUser, isLoading: currentUserLoading } = useQuery<User>({
    queryKey: ['/api/user'],
    enabled: true,
  });

  // Initialize socket connection to chat service
  useEffect(() => {
    if (!currentUser) return;

    console.log('🔌 Connecting to chat service at:', CHAT_SERVICE_URL);
    setConnectionStatus('connecting');

    const newSocket = io(CHAT_SERVICE_URL, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      withCredentials: true, // Important: send cookies
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to chat service');
      setConnectionStatus('connected');

      // Authenticate with the chat service
      console.log('🔐 Sending authenticate event...');
      newSocket.emit('authenticate', {
        userId: currentUser.id.toString(),
        userName: currentUser.name,
        userRole: currentUser.role,
        userAvatar: currentUser.avatar || '',
      });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from chat service');
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Chat connection error:', error);
      setConnectionStatus('error');
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to chat service.',
        variant: 'destructive',
      });
    });

    // ==========================================
    // AUTHENTICATION EVENTS
    // ==========================================

    newSocket.on('authenticated', (data) => {
      console.log('🔐 Authentication result:', data);

      if (data.success) {
        toast({
          title: 'Connected',
          description: 'Successfully connected to chat service',
        });

        // Request user list via WebSocket
        console.log('📥 Requesting user list via WebSocket...');
        newSocket.emit('get-user-list', { forceRefresh: true });
      } else {
        toast({
          title: 'Authentication Failed',
          description: data.error || 'Failed to authenticate',
          variant: 'destructive',
        });
      }
    });

    // ==========================================
    // USER LIST EVENTS
    // ==========================================

    newSocket.on('user-list', (data) => {
      console.log('👥 Received user list:', data);

      if (data.success && data.users) {
        setUsers(data.users);
        setIsLoadingUsers(false);
        console.log(`✅ Loaded ${data.users.length} users (${data.onlineCount} online)`);
      }
    });

    newSocket.on('user-list-error', (data) => {
      console.error('❌ User list error:', data);
      setIsLoadingUsers(false);
      toast({
        title: 'Failed to load users',
        description: data.error,
        variant: 'destructive',
      });
    });

    // ==========================================
    // ONLINE STATUS EVENTS
    // ==========================================

    newSocket.on('online-users-list', (data) => {
      console.log('📡 Received online users list:', data);
      setOnlineUsers(new Set(data.users));
    });

    newSocket.on('user-online', (data) => {
      console.log('✅ User came online:', data.userId);
      setOnlineUsers(prev => new Set(prev).add(data.userId));
    });

    newSocket.on('user-offline', (data) => {
      console.log('❌ User went offline:', data.userId);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    // ==========================================
    // MESSAGING EVENTS
    // ==========================================

    newSocket.on('room-joined', (data) => {
      console.log('🚪 Joined room:', data);
    });

    newSocket.on('new-message', (message: ChatMessage) => {
      console.log('💬 Received new message:', message);

      // Update messages if in the same room
      if (message.roomId === selectedRoom) {
        setMessages(prev => {
          const exists = prev.some(m => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
        scrollToBottom();
      }
    });

    newSocket.on('typing-start', (data) => {
      setTypingUsers(prev => new Set(prev).add(data.userId));
    });

    newSocket.on('typing-stop', (data) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    newSocket.on('error', (data) => {
      console.error('❌ Chat service error:', data);
      toast({
        title: 'Chat Error',
        description: data.message || 'An error occurred',
        variant: 'destructive',
      });
    });

    setSocket(newSocket);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      newSocket.disconnect();
    };
  }, [currentUser, toast]);

  // Request user list when authenticated
  useEffect(() => {
    if (socket && connectionStatus === 'connected') {
      setIsLoadingUsers(true);
      console.log('📥 Requesting user list...');
      socket.emit('get-user-list', { forceRefresh: false });
    }
  }, [socket, connectionStatus]);

  // Fetch user's chat rooms
  useEffect(() => {
    const fetchRooms = async () => {
      if (!currentUser) return;

      setIsLoadingRooms(true);
      try {
        console.log('📥 Fetching chat rooms for user:', currentUser.id);
        const response = await fetch(`/api/chat/rooms/${currentUser.id}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch rooms: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Received chat rooms:', data);

        if (data.success && data.rooms) {
          setRooms(data.rooms);
          console.log(`📋 Loaded ${data.rooms.length} chat rooms`);
        }
      } catch (error) {
        console.error('❌ Error fetching chat rooms:', error);
        toast({
          title: 'Failed to load conversations',
          description: 'Could not load your chat history.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [currentUser, toast]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isUserOnline = (userId: string | number): boolean => {
    return onlineUsers.has(userId.toString());
  };

  // FLOWCHART STEP: Sort Users by Online Status (Online on Top)
  const sortedUsers = useMemo(() => {
    if (!users || users.length === 0) return [];

    // Filter out current user and sort by online status
    return users
      .filter(user => user.id !== currentUser?.id)
      .sort((a, b) => {
        const aOnline = isUserOnline(a.id);
        const bOnline = isUserOnline(b.id);

        // Online users first
        if (aOnline && !bOnline) return -1;
        if (!aOnline && bOnline) return 1;

        // Then sort by name
        return a.name.localeCompare(b.name);
      });
  }, [users, onlineUsers, currentUser]);

  const filteredUsers = sortedUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRooms = rooms.filter(room =>
    getRoomDisplayName(room).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper functions
  const getRoomDisplayName = (room: ChatRoom): string => {
    if (!room) return 'Unknown Chat';

    if (room.type === 'group' || room.type === 'channel') {
      return room.name || 'Group Chat';
    }

    const otherParticipant = room.participants?.find(p => p !== currentUser?.id.toString());
    const otherUser = users.find(u => u.id.toString() === otherParticipant);
    return otherUser?.name || 'Direct Message';
  };

  const getOtherUser = (room: ChatRoom): User | null => {
    if (!room || room.type !== 'direct') return null;
    const otherParticipant = room.participants?.find(p => p !== currentUser?.id.toString());
    return users.find(u => u.id.toString() === otherParticipant) || null;
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getMessageStatus = (message: ChatMessage) => {
    if (message.senderId !== currentUser?.id.toString()) return null;
    return 'sent';
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!socket || !selectedRoom || isTyping || connectionStatus !== 'connected') return;

    setIsTyping(true);
    socket.emit('typing-start', { roomId: selectedRoom });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket && selectedRoom) {
        socket.emit('typing-stop', { roomId: selectedRoom });
      }
    }, 2000);
  };

  // Send message via socket
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom || !socket || connectionStatus !== 'connected') return;

    socket.emit('send-message', {
      roomId: selectedRoom,
      message: newMessage.trim(),
      type: 'text',
    });

    setNewMessage('');

    if (isTyping) {
      setIsTyping(false);
      socket.emit('typing-stop', { roomId: selectedRoom });
    }
  };

  // Create new chat room with a user
  const handleStartChat = (targetUserId: number) => {
    if (!socket || connectionStatus !== 'connected') {
      toast({
        title: 'Not Connected',
        description: 'Please wait for connection to chat service',
        variant: 'destructive',
      });
      return;
    }

    // Request to create room via socket
    socket.emit('create-room', {
      participants: [currentUser!.id.toString(), targetUserId.toString()],
      type: 'direct',
    });
  };

  // Listen for room creation
  useEffect(() => {
    if (!socket) return;

    socket.on('room-created', (data) => {
      console.log('🎉 Room created:', data);
      setRooms(prev => [...prev, data.room]);
      setSelectedRoom(data.room._id);
      toast({
        title: 'Chat Started',
        description: 'Direct chat room created successfully',
      });
    });

    return () => {
      socket.off('room-created');
    };
  }, [socket, toast]);

  // Join room when selected
  useEffect(() => {
    if (socket && selectedRoom && connectionStatus === 'connected') {
      console.log('🚪 Joining room:', selectedRoom);
      socket.emit('join-room', { roomId: selectedRoom });
      // Load messages for this room
      setMessages([]); // Clear previous messages
    }
  }, [socket, selectedRoom, connectionStatus]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Welcome to Chat</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to start messaging</p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold">Messages</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Circle className={`h-2 w-2 ${getConnectionStatusColor()}`} fill="currentColor" />
              <span className={`text-sm ${getConnectionStatusColor()}`}>
                {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
              </span>
            </div>


            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className={cn(
          "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300",
          isSidebarCollapsed ? "w-16" : "w-80",
          "lg:flex hidden"
        )}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            {!isSidebarCollapsed && (
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 dark:bg-gray-700 border-none"
                />
              </div>
            )}
          </div>

          <ScrollArea className="flex-1">
            {!isSidebarCollapsed && (
              <div className="p-2">
                {isLoadingRooms ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                ) : filteredRooms.length > 0 ? (
                  <div className="space-y-1">
                    {filteredRooms.map((room) => {
                      const otherUser = getOtherUser(room);
                      return (
                        <Button
                          key={room._id}
                          variant={selectedRoom === room._id ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start h-auto p-3 text-left",
                            selectedRoom === room._id && "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500"
                          )}
                          onClick={() => setSelectedRoom(room._id)}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={otherUser?.avatar} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                                  {room.type === 'group' ? (
                                    <Users className="h-5 w-5" />
                                  ) : (
                                    getRoomDisplayName(room).charAt(0).toUpperCase()
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              {room.type === 'direct' && isUserOnline(otherUser?.id || '') && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm truncate">
                                  {getRoomDisplayName(room)}
                                </p>
                                {room.lastMessage && (
                                  <span className="text-xs text-gray-500">
                                    {new Date(room.lastMessage.timestamp).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500 truncate">
                                  {room.lastMessage ? room.lastMessage.message : 'No messages yet'}
                                </p>
                                {(room.unreadCount ?? 0) > 0 && (
                                  <Badge variant="destructive" className="text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                    {(room.unreadCount ?? 0) > 9 ? '9+' : room.unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations yet</p>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Available Users */}
                <div className="space-y-1">
                  <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 px-3 py-2 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Start New Chat
                  </h3>

                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <Button
                        key={user.id}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3"
                        onClick={() => handleStartChat(user.id)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs">
                                {user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {isUserOnline(user.id) && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border border-white dark:border-gray-800 rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium">{user.name}</p>
                            <Badge
                              variant={user.role === 'admin' ? 'default' : 'secondary'}
                              className="text-xs h-4"
                            >
                              {user.role}
                            </Badge>
                          </div>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">No users available</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area - keeping existing implementation */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          {selectedRoom ? (
            <>
              <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const room = rooms.find(r => r._id === selectedRoom);
                      const otherUser = room ? getOtherUser(room) : null;
                      return (
                        <>
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={otherUser?.avatar} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                                {room ? getRoomDisplayName(room).charAt(0).toUpperCase() : '?'}
                              </AvatarFallback>
                            </Avatar>
                            {room?.type === 'direct' && isUserOnline(otherUser?.id || '') && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {room ? getRoomDisplayName(room) : 'Chat Room'}
                            </h3>
                            {room?.type === 'direct' && otherUser && (
                              <p className={cn(
                                "text-sm flex items-center gap-1",
                                isUserOnline(otherUser.id) ? "text-green-600 dark:text-green-400" : "text-gray-500"
                              )}>
                                <Circle className="h-2 w-2" fill="currentColor" />
                                {isUserOnline(otherUser.id) ? 'Online' : 'Offline'}
                              </p>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const isOwn = message.senderId === currentUser.id.toString();
                      const showAvatar = !isOwn && (index === 0 || messages[index - 1].senderId !== message.senderId);
                      const status = getMessageStatus(message);

                      return (
                        <div
                          key={message._id}
                          className={cn(
                            "flex gap-2 max-w-[85%]",
                            isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
                          )}
                        >
                          {!isOwn && (
                            <Avatar className={cn("h-7 w-7 mt-auto", !showAvatar && "invisible")}>
                              <AvatarImage src={message.senderAvatar} />
                              <AvatarFallback className="text-xs bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                                {message.senderName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div className={cn("flex flex-col", isOwn && "items-end")}>
                            {showAvatar && !isOwn && (
                              <span className="text-xs text-gray-500 mb-1 px-3">
                                {message.senderName}
                              </span>
                            )}
                            <div
                              className={cn(
                                "rounded-2xl px-4 py-2 max-w-sm break-words",
                                isOwn
                                  ? "bg-blue-500 text-white rounded-br-md"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md"
                              )}
                            >
                              <p className="text-sm leading-relaxed">{message.message}</p>
                            </div>
                            <div className={cn(
                              "flex items-center gap-1 mt-1 px-1",
                              isOwn ? "justify-end" : "justify-start"
                            )}>
                              <span className="text-xs text-gray-500">
                                {new Date(message.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {isOwn && status && (
                                <div className="text-gray-400">
                                  {status === 'sent' && <Check className="h-3 w-3" />}
                                  {status === 'delivered' && <CheckCheck className="h-3 w-3" />}
                                  {status === 'read' && <CheckCheck className="h-3 w-3 text-blue-500" />}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {typingUsers.size > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 px-3">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">...</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                          </div>
                          <span className="text-xs">typing...</span>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                    <p className="text-sm text-center">Start the conversation with a friendly hello!</p>
                  </div>
                )}
              </ScrollArea>

              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      placeholder={connectionStatus === 'connected' ? "Type your message..." : "Connecting..."}
                      className="pr-20 py-3 rounded-full border-gray-300 dark:border-gray-600 focus:border-blue-500"
                      disabled={connectionStatus !== 'connected'}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Button variant="ghost" size="sm" type="button" className="h-8 w-8 p-0">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" type="button" className="h-8 w-8 p-0">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newMessage.trim() || connectionStatus !== 'connected'}
                    className="h-10 w-10 p-0 rounded-full bg-blue-500 hover:bg-blue-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Welcome to Messages</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Select a conversation from the sidebar to start chatting, or create a new conversation.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => setIsSidebarCollapsed(false)}>
                    <Users className="h-4 w-4 mr-2" />
                    Browse Conversations
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Push Notification Banner */}
      {currentUser && <NotificationBanner userId={currentUser.id} />}
    </div>
  );
}