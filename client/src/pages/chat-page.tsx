import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  MoreVertical 
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import io, { Socket } from 'socket.io-client';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_online?: boolean;
  last_seen?: string;
}

interface ChatRoom {
  id: number;
  name?: string;
  type: 'direct' | 'group';
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: number;
  content: string;
  message_type: string;
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
  sender: User;
}

interface SocketEvents {
  connect: () => void;
  disconnect: () => void;
  authenticated: (data: { success: boolean }) => void;
  auth_error: (data: { message: string }) => void;
  joined_room: (data: { roomId: number }) => void;
  new_message: (message: ChatMessage) => void;
  user_typing: (data: { userId: number; isTyping: boolean }) => void;
  error: (data: { message: string }) => void;
}

export default function ChatPage() {
  const [, navigate] = useLocation();
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/user'],
    enabled: true,
  });

  // Get chat rooms
  const { data: roomsData, isLoading: roomsLoading, refetch: refetchRooms } = useQuery<{ rooms: ChatRoom[] }>({
    queryKey: ['/api/chat/rooms'],
    enabled: !!currentUser,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always refetch to avoid stale data
    cacheTime: 0, // Don't cache results
  });

  // Get messages for selected room
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useQuery<{ messages: ChatMessage[] }>({
    queryKey: ['/api/chat/rooms', selectedRoom, 'messages'],
    enabled: !!selectedRoom && !!currentUser,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always fetch fresh messages
  });

  // Get available users to chat with
  const { data: usersData, error: usersError } = useQuery<{ users: User[] }>({
    queryKey: ['/api/chat/users'],
    enabled: !!currentUser,
    refetchOnWindowFocus: false, // Prevent duplicate fetches
    staleTime: 30000, // Cache for 30 seconds
    onError: (error) => {
      console.error('Failed to fetch chat users:', error);
    },
    onSuccess: (data) => {
      console.log('Chat users fetched:', data);
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: { content: string }) => {
      return new Promise<void>((resolve, reject) => {
        if (!socket || !selectedRoom) {
          reject(new Error('Socket not connected or no room selected'));
          return;
        }
        
        console.log('Sending message via Socket.IO:', { roomId: selectedRoom, content: data.content });
        
        // Send the message via Socket.IO
        socket.emit('send_message', {
          roomId: selectedRoom,
          content: data.content,
          messageType: 'text'
        });
        
        // Resolve immediately since we don't wait for server confirmation
        resolve();
      });
    },
    onSuccess: () => {
      setNewMessage('');
      // Clear typing indicator
      if (socket && selectedRoom && isTyping) {
        socket.emit('typing', { roomId: selectedRoom, isTyping: false });
        setIsTyping(false);
      }
    },
    onError: (error: any) => {
      console.error('Message send error:', error);
      toast({
        title: 'Send Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    }
  });

  // Create direct room mutation
  const createDirectRoomMutation = useMutation({
    mutationFn: async (userId: number) => {
      try {
        const response = await fetch('/api/chat/rooms/direct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ user_id: userId })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Failed to create direct room:', error);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      setSelectedRoom(data.room.id);
      // Force refetch rooms data to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/chat/rooms'] });
      refetchRooms();
      toast({
        title: 'Chat Started',
        description: 'Direct chat room created successfully',
      });
    },
    onError: (error: any) => {
      console.error('Chat room creation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create chat room',
        variant: 'destructive',
      });
    },
  });

  // Initialize socket connection
  useEffect(() => {
    if (!currentUser) return;

    const newSocket = io({
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      newSocket.emit('authenticate', { userId: currentUser.id });
    });

    newSocket.on('authenticated', ({ success }) => {
      if (success) {
        console.log('Authenticated successfully');
      }
    });

    newSocket.on('auth_error', ({ message }) => {
      toast({
        title: 'Authentication Error',
        description: message,
        variant: 'destructive',
      });
    });

    newSocket.on('new_message', (message: ChatMessage) => {
      console.log('Seller received new message:', message);
      // Update messages for the specific room
      queryClient.setQueryData(
        ['/api/chat/rooms', message.room_id, 'messages'],
        (old: { messages: ChatMessage[] } | undefined) => {
          if (!old) return { messages: [message] };
          // Check if message already exists to avoid duplicates
          const exists = old.messages.some(m => m.id === message.id);
          if (exists) return old;
          return { messages: [...old.messages, message] };
        }
      );
      
      // Also invalidate queries to force refresh if needed
      queryClient.invalidateQueries({ 
        queryKey: ['/api/chat/rooms', message.room_id, 'messages'] 
      });
      
      scrollToBottom();
    });

    newSocket.on('user_typing', ({ userId, isTyping }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    });

    newSocket.on('error', ({ message }) => {
      toast({
        title: 'Chat Error',
        description: message,
        variant: 'destructive',
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser, toast, queryClient, selectedRoom]);

  // Join room when selected
  useEffect(() => {
    if (socket && selectedRoom) {
      console.log(`Seller joining room ${selectedRoom}`);
      socket.emit('join_room', { roomId: selectedRoom });
      
      // Listen for confirmation and fetch messages
      socket.on('joined_room', (data) => {
        console.log(`Seller successfully joined room ${data.roomId}`);
        // Fetch existing messages when room is joined
        refetchMessages();
      });
    }
  }, [socket, selectedRoom]);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesData]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!socket || !selectedRoom || isTyping) return;
    
    setIsTyping(true);
    socket.emit('typing', { roomId: selectedRoom, isTyping: true });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', { roomId: selectedRoom, isTyping: false });
    }, 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    sendMessageMutation.mutate({ content: newMessage.trim() });
  };

  const startDirectChat = (userId: number) => {
    createDirectRoomMutation.mutate(userId);
  };

  const getRoomDisplayName = (room: ChatRoom): string => {
    if (room.type === 'group') {
      return room.name || 'Group Chat';
    }
    return 'Direct Message'; // In a real implementation, this would show the other user's name
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p>Please log in to access chat.</p>
            <Button onClick={() => navigate('/auth')} className="mt-4">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Chat</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Sidebar - Rooms and Users */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <ScrollArea className="h-[400px]">
                {roomsLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : roomsData?.rooms?.length > 0 ? (
                  <div className="space-y-2">
                    {roomsData.rooms.map((room: ChatRoom) => (
                      <Button
                        key={room.id}
                        variant={selectedRoom === room.id ? "default" : "ghost"}
                        className="w-full justify-start h-auto p-3"
                        onClick={() => setSelectedRoom(room.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {room.type === 'group' ? <Users className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <div className="font-medium text-sm">
                              {getRoomDisplayName(room)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {room.type === 'group' ? 'Group' : 'Direct'}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations yet</p>
                  </div>
                )}
              </ScrollArea>

              <Separator className="my-4" />

              <div>
                <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Start New Chat
                </h3>
                <ScrollArea className="h-[200px]">
                  {(() => {
                    // Remove duplicate users based on ID
                    const allUsers = usersData?.users || [];
                    const uniqueUsers = allUsers.filter((user, index, self) => 
                      index === self.findIndex(u => u.id === user.id)
                    );
                    
                    if (usersError) {
                      return (
                        <div className="text-center py-4 text-red-500 text-sm">
                          Error loading users: {usersError.message}
                        </div>
                      );
                    }
                    
                    return uniqueUsers.map((user: User) => (
                      <Button
                        key={`chat-user-${user.id}`}
                        variant="ghost"
                        className="w-full justify-start h-auto p-2 mb-1"
                        onClick={() => createDirectRoomMutation.mutate(user.id)}
                        disabled={createDirectRoomMutation.isPending}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 text-left">
                            <div className="text-sm font-medium">{user.name}</div>
                            <div className="flex items-center gap-2">
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                                {user.role}
                              </Badge>
                              {user.is_online && (
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ));
                  })()}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          {selectedRoom ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Chat Room #{selectedRoom}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="text-center py-8">Loading messages...</div>
                  ) : messagesData?.messages && messagesData.messages.length > 0 ? (
                    <div className="space-y-4">
                      {messagesData.messages.map((message: ChatMessage) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.sender.id === currentUser.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.sender.id !== currentUser.id && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-sm">
                                {message.sender.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className={`max-w-[70%] ${message.sender.id === currentUser.id ? 'order-first' : ''}`}>
                            <div className={`rounded-lg px-3 py-2 ${
                              message.sender.id === currentUser.id
                                ? 'bg-primary text-primary-foreground ml-auto'
                                : 'bg-muted'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <div className={`text-xs text-muted-foreground mt-1 ${
                              message.sender.id === currentUser.id ? 'text-right' : 'text-left'
                            }`}>
                              {message.sender.id !== currentUser.id && (
                                <span className="font-medium">{message.sender.name} • </span>
                              )}
                              {new Date(message.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                          
                          {message.sender.id === currentUser.id && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-sm">
                                {message.sender.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}
                      
                      {typingUsers.size > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                          </div>
                          <span>Someone is typing...</span>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      placeholder="Type a message..."
                      className="flex-1"
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button 
                      type="submit" 
                      size="sm"
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">
                  Choose an existing conversation or start a new one
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}