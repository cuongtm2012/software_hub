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
  Phone,
  Video,
  MoreVertical,
  Crown,
  User,
  Shield,
  Search,
  UserCheck,
  UserX
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
  created_at: string;
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

export default function AdminUsersChatPage() {
  const [, navigate] = useLocation();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user (admin)
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/user'],
    enabled: true,
  });

  // Get chat users for admin (filtered appropriately)
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery<{ users: User[] }>({
    queryKey: ['/api/chat/users'],
    enabled: !!currentUser && currentUser.role === 'admin',
    refetchOnWindowFocus: false, // Prevent duplicate fetches
    staleTime: 30000, // Cache for 30 seconds
    onError: (error) => {
      console.error('Failed to fetch chat users:', error);
    },
    onSuccess: (data) => {
      console.log('Chat users fetched:', data);
    }
  });

  // Get messages for selected room
  const { data: messagesData, isLoading: messagesLoading } = useQuery<{ messages: ChatMessage[] }>({
    queryKey: ['/api/chat/rooms', selectedRoom, 'messages'],
    enabled: !!selectedRoom && !!currentUser,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: { content: string }) => {
      if (socket && selectedRoom) {
        socket.emit('send_message', {
          roomId: selectedRoom,
          content: data.content,
          messageType: 'text'
        });
      }
      return Promise.resolve();
    },
    onSuccess: () => {
      setNewMessage('');
    },
  });

  // Create direct room mutation
  const createDirectRoomMutation = useMutation({
    mutationFn: async (userId: number) => {
      try {
        const response = await fetch('/api/chat/rooms/direct', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          credentials: 'include', // This is crucial for session authentication
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
      setSelectedUser(null); // Clear user selection when room is created
      queryClient.invalidateQueries({ queryKey: ['/api/chat/rooms'] });
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
      console.log('New message received:', message);
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
      socket.emit('join_room', { roomId: selectedRoom });
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

  const startChatWithUser = (user: User) => {
    setSelectedUser(user);
    // Create or get existing chat room
    createDirectRoomMutation.mutate(user.id);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'seller': return <Shield className="h-4 w-4" />;
      case 'buyer': return <User className="h-4 w-4" />;
      case 'developer': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'seller': return 'secondary';
      case 'buyer': return 'outline';
      case 'developer': return 'secondary';
      default: return 'outline';
    }
  };

  // Filter users based on search term and remove duplicates
  const allUsers = usersData?.users || [];
  const uniqueUsers = allUsers.filter((user, index, self) => 
    index === self.findIndex(u => u.id === user.id)
  );
  const filteredUsers = uniqueUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p>Access denied. Admin privileges required.</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">User Chat Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* User List Sidebar */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Users ({filteredUsers.length})
              </CardTitle>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            
            <CardContent className="p-3">
              <ScrollArea className="h-[500px]">
                {usersLoading ? (
                  <div className="text-center py-4">Loading users...</div>
                ) : usersError ? (
                  <div className="text-center py-4 text-red-500">
                    Error loading users. Please try again.
                    <br />
                    <small>{usersError.message}</small>
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <div className="space-y-2">
                    {filteredUsers.map((user: User) => (
                      <Button
                        key={`admin-user-${user.id}`}
                        variant={selectedUser?.id === user.id ? "default" : "ghost"}
                        className="w-full justify-start h-auto p-3"
                        onClick={() => startChatWithUser(user)}
                        disabled={createDirectRoomMutation.isPending}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {user.is_online && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm truncate">{user.name}</span>
                              {getRoleIcon(user.role)}
                            </div>
                            <div className="text-xs text-muted-foreground truncate mb-1">
                              {user.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                                {user.role}
                              </Badge>
                              {user.is_online ? (
                                <Badge variant="default" className="text-xs bg-green-500">
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Online
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  <UserX className="h-3 w-3 mr-1" />
                                  Offline
                                </Badge>
                              )}
                            </div>
                            {user.last_seen && !user.is_online && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Last seen: {new Date(user.last_seen).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No users found</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedUser && selectedRoom ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {selectedUser.name}
                        {getRoleIcon(selectedUser.role)}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant={getRoleBadgeVariant(selectedUser.role)} className="text-xs">
                          {selectedUser.role}
                        </Badge>
                        {selectedUser.is_online ? (
                          <span className="text-green-600">Online</span>
                        ) : (
                          <span>Offline</span>
                        )}
                      </div>
                    </div>
                  </div>
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
                      {messagesData?.messages?.map((message: ChatMessage) => (
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
                          <span>{selectedUser.name} is typing...</span>
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
                      placeholder={`Message ${selectedUser.name}...`}
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
                <h3 className="text-lg font-medium mb-2">Select a user to start chatting</h3>
                <p className="text-muted-foreground">
                  Choose a user from the list to begin a conversation
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}