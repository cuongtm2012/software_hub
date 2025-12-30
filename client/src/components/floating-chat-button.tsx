import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Users, Headphones, Send, ArrowLeft, AlertCircle, RefreshCw, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useChat } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { geminiChatService } from "@/services/gemini-chat-service";
import { useToast } from "@/hooks/use-toast";

type ChatMode = 'support' | 'conversations';

interface BotMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
}

interface BufferedMessage {
  roomId: string;
  message: string;
  timestamp: Date;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export function FloatingChatButton() {
  const [isVisible, setIsVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('support');
  const [messageInput, setMessageInput] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // User list states
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Bot chat states
  const [botMessages, setBotMessages] = useState<BotMessage[]>([
    {
      id: '1',
      message: '👋 Xin chào! Tôi là trợ lý AI của Software Hub. Tôi có thể giúp gì cho bạn hôm nay?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Connection states
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Message buffering
  const [bufferedMessages, setBufferedMessages] = useState<BufferedMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isOpen: isCartOpen } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    socket,
    isConnected,
    rooms,
    currentRoom,
    messages,
    isTyping,
    sendMessage,
    joinRoom,
    leaveRoom,
    startTyping,
    stopTyping,
    markAsRead,
    loadRooms,
    onlineUsers
  } = useChat();

  // Hide chat button when cart sidebar is open
  useEffect(() => {
    if (isCartOpen) {
      setIsVisible(false);
    } else {
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isCartOpen]);

  // Monitor connection status
  useEffect(() => {
    if (chatMode === 'conversations' && user) {
      if (!isConnected && retryCount < 3) {
        setConnectionError(true);
      } else if (isConnected) {
        setConnectionError(false);
        setRetryCount(0);

        // Send buffered messages when connection is restored
        if (bufferedMessages.length > 0) {
          bufferedMessages.forEach(buffered => {
            sendMessage(buffered.roomId, buffered.message);
          });
          setBufferedMessages([]);
          toast({
            title: "Đã kết nối lại",
            description: `${bufferedMessages.length} tin nhắn đã được gửi`,
          });
        }
      }
    }
  }, [isConnected, chatMode, user, retryCount, bufferedMessages]);

  // Load rooms when chat opens in conversations mode
  useEffect(() => {
    if (isChatOpen && chatMode === 'conversations' && user && isConnected) {
      loadRooms();
    }
  }, [isChatOpen, chatMode, user, isConnected]);

  // Fetch user list and setup socket listeners
  useEffect(() => {
    if (!socket || !isConnected || chatMode !== 'conversations') return;

    // Request user list
    setIsLoadingUsers(true);
    console.log('📥 Requesting user list from chat service...');
    socket.emit('get-user-list', { forceRefresh: false });

    // Listen for user list
    const handleUserList = (data: any) => {
      console.log('👥 Received user list:', data);
      if (data.success && data.users) {
        setUsers(data.users);
        setIsLoadingUsers(false);
        console.log(`✅ Loaded ${data.users.length} users`);
      }
    };

    socket.on('user-list', handleUserList);
    socket.on('user-list-error', handleUserListError);

    return () => {
      socket.off('user-list', handleUserList);
      socket.off('user-list-error', handleUserListError);
    };
  }, [socket, isConnected, chatMode, toast]);

  // Join room when selected
  useEffect(() => {
    if (selectedRoomId && isConnected) {
      joinRoom(selectedRoomId);
      markAsRead(selectedRoomId);
    }
    return () => {
      if (selectedRoomId && isConnected) {
        leaveRoom(selectedRoomId);
      }
    };
  }, [selectedRoomId, isConnected]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [botMessages, messages]);

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen && user) {
      setChatMode('support');
    }
  };

  const handleRetryConnection = () => {
    if (isRetrying) return;

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    toast({
      title: "Đang kết nối lại...",
      description: "Vui lòng đợi trong giây lát",
    });

    // Simulate retry delay
    setTimeout(() => {
      setIsRetrying(false);
      if (!isConnected) {
        toast({
          title: "Không thể kết nối",
          description: "Vui lòng kiểm tra kết nối mạng và thử lại",
          variant: "destructive"
        });
      }
    }, 2000);
  };

  const handleSendBotMessage = async () => {
    if (!messageInput.trim()) return;

    const userMessage: BotMessage = {
      id: Date.now().toString(),
      message: messageInput,
      sender: 'user',
      timestamp: new Date()
    };

    setBotMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    setIsBotTyping(true);

    try {
      const response = await geminiChatService.sendMessage(messageInput);

      const botMessage: BotMessage = {
        id: (Date.now() + 1).toString(),
        message: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setBotMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: BotMessage = {
        id: (Date.now() + 1).toString(),
        message: '⚠️ Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc chuyển sang chat với nhân viên hỗ trợ.',
        sender: 'bot',
        timestamp: new Date()
      };
      setBotMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Lỗi kết nối AI",
        description: "Không thể kết nối với trợ lý AI. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedRoomId) return;

    if (!isConnected) {
      // Buffer message when offline
      const buffered: BufferedMessage = {
        roomId: selectedRoomId,
        message: messageInput,
        timestamp: new Date()
      };
      setBufferedMessages(prev => [...prev, buffered]);

      toast({
        title: "Tin nhắn đã được lưu",
        description: "Tin nhắn sẽ được gửi khi kết nối lại",
      });

      setMessageInput('');
      return;
    }

    sendMessage(selectedRoomId, messageInput);
    setMessageInput('');
    stopTyping(selectedRoomId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    if (selectedRoomId && e.target.value.trim() && isConnected) {
      startTyping(selectedRoomId);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (chatMode === 'support') {
        handleSendBotMessage();
      } else {
        handleSendMessage();
      }
    }
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  const handleBackToList = () => {
    setSelectedRoomId(null);
    if (currentRoom && isConnected) {
      leaveRoom(currentRoom._id);
    }
  };

  const handleStartChat = (targetUserId: number) => {
    if (!socket || !isConnected || !user) {
      toast({
        title: 'Not Connected',
        description: 'Please wait for connection to chat service',
        variant: 'destructive',
      });
      return;
    }

    console.log('🆕 Starting chat with user:', targetUserId);

    // Request to create room via socket
    socket.emit('create-room', {
      participants: [user.id.toString(), targetUserId.toString()],
      type: 'direct',
    });

    // Listen for room creation success
    socket.once('room-created', ({ room }: any) => {
      console.log('✅ Room created:', room);

      // Set room ID
      setSelectedRoomId(room._id);

      // Join the room to load messages
      if (socket && isConnected) {
        socket.emit('join-room', { roomId: room._id });
      }

      toast({
        title: 'Chat Started',
        description: 'You can now send messages',
      });
    });
  };


  const handleQuickAction = async (action: string) => {
    let quickMessage = '';
    switch (action) {
      case 'payment':
        quickMessage = 'Tôi cần hỗ trợ về thanh toán';
        break;
      case 'tracking':
        quickMessage = 'Tôi muốn theo dõi đơn hàng';
        break;
      case 'license':
        quickMessage = 'Tôi có vấn đề về license key';
        break;
      case 'other':
        quickMessage = 'Tôi có câu hỏi khác';
        break;
    }

    setMessageInput(quickMessage);
    setTimeout(() => handleSendBotMessage(), 100);
  };

  const getRoomDisplayName = (room: any) => {
    if (room.type === 'direct' && user) {
      // Find the other participant in metadata or participants list
      const otherParticipant = room.participants.find((p: string) => p !== user.id.toString());
      if (room.metadata?.sellerName && user.id.toString() !== room.metadata.sellerId?.toString()) {
        return room.metadata.sellerName;
      }
      if (room.metadata?.buyerName && user.id.toString() !== room.metadata.buyerId?.toString()) {
        return room.metadata.buyerName;
      }
      return room.name || `Chat with ${otherParticipant || 'User'}`;
    }
    return room.name || 'Group Chat';
  };

  const totalUnread = rooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0);

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={handleChatToggle}
        className={`fixed bottom-5 right-5 z-40 group transition-all duration-300 ${isChatOpen ? 'scale-0' : 'scale-100'
          }`}
        aria-label="Chat support"
        style={{
          width: '56px',
          height: '56px',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="relative flex items-center justify-center h-full">
          <MessageCircle className="w-7 h-7 text-white" />
        </div>

        {totalUnread > 0 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{totalUnread > 9 ? '9+' : totalUnread}</span>
          </div>
        )}

        <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20" />
      </button>

      {/* Chat Widget */}
      {isChatOpen && (
        <div
          className="fixed bottom-24 right-5 w-[380px] max-w-[calc(100vw-40px)] h-[450px] max-h-[calc(100vh-140px)] bg-white rounded-2xl shadow-2xl z-40 flex flex-col animate-in slide-in-from-bottom-4 duration-300"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                {chatMode === 'support' ? (
                  <Bot className="w-6 h-6 text-white" />
                ) : (
                  <Users className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  {chatMode === 'support' ? 'AI Assistant' : 'Tin nhắn'}
                </h3>
                <div className="flex items-center gap-1.5">
                  {chatMode === 'conversations' ? (
                    <>
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                      <span className="text-xs text-white/90">
                        {isConnected ? 'Online' : 'Offline'}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs text-white/90">Luôn sẵn sàng</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleChatToggle}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Mode Switcher */}
          {user && (
            <div className="flex border-b bg-gray-50">
              <button
                onClick={() => setChatMode('support')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${chatMode === 'support'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <Bot className="w-4 h-4 inline mr-2" />
                AI Hỗ trợ
              </button>
              <button
                onClick={() => setChatMode('conversations')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${chatMode === 'conversations'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Chat trực tiếp
                {totalUnread > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white px-1.5 py-0 text-xs">
                    {totalUnread}
                  </Badge>
                )}
              </button>
            </div>
          )}

          {/* Connection Error Banner */}
          {chatMode === 'conversations' && connectionError && (
            <div className="bg-red-50 border-b border-red-200 px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span>Không thể kết nối</span>
                </div>
                <Button
                  onClick={handleRetryConnection}
                  disabled={isRetrying}
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs text-red-700 hover:text-red-800 hover:bg-red-100"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Đang kết nối...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Thử lại
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Buffered Messages Notification */}
          {bufferedMessages.length > 0 && (
            <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
              <div className="flex items-center gap-2 text-sm text-yellow-700">
                <AlertCircle className="w-4 h-4" />
                <span>{bufferedMessages.length} tin nhắn đang chờ gửi</span>
              </div>
            </div>
          )}

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto bg-white">
            {/* Support Mode - Bot Chat */}
            {chatMode === 'support' && (
              <div className="p-4 space-y-3">
                {botMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <div className={`max-w-[75%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div
                        className={`rounded-2xl px-4 py-2 ${msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                          }`}
                      >
                        <p className="text-sm break-words whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 px-1">
                        {msg.timestamp.toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Bot Typing Indicator */}
                {isBotTyping && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-bl-none px-4 py-2 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions - Only show at start */}
                {botMessages.length <= 1 && (
                  <div className="space-y-2 mt-6">
                    <p className="text-xs text-gray-600 font-medium px-2">Câu hỏi thường gặp:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { icon: "💳", text: "Hỗ trợ thanh toán", action: "payment" },
                        { icon: "📦", text: "Theo dõi đơn hàng", action: "tracking" },
                        { icon: "🔑", text: "License key", action: "license" },
                        { icon: "❓", text: "Câu hỏi khác", action: "other" }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickAction(item.action)}
                          className="flex items-center gap-2 p-3 bg-white rounded-xl hover:bg-blue-50 hover:border-blue-200 border border-gray-200 transition-all text-left"
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-sm text-gray-700">{item.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Conversations Mode */}
            {chatMode === 'conversations' && (
              <>
                {/* Room List */}
                {!selectedRoomId && (
                  <div className="px-3 pt-3 pb-1 space-y-2">
                    {/* Search Bar */}
                    <input
                      type="text"
                      placeholder="Search conversations or users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />

                    {/* Existing Conversations */}
                    {rooms.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-1 px-0.5 tracking-wider">
                          Conversations
                        </h4>
                        <div className="space-y-1.5">
                          {rooms
                            .filter(room =>
                              !searchQuery ||
                              getRoomDisplayName(room).toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((room) => {
                              const displayName = getRoomDisplayName(room);
                              // For direct chats, check the other participant's online status
                              const otherParticipantId = room.type === 'direct'
                                ? room.participants.find((p: string) => p !== user?.id.toString())
                                : null;
                              const isOtherOnline = otherParticipantId ? onlineUsers.has(otherParticipantId) : false;

                              return (
                                <button
                                  key={room._id}
                                  onClick={() => handleSelectRoom(room._id)}
                                  className="w-full p-2 bg-white rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="relative flex-shrink-0">
                                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">
                                          {(displayName || 'C').charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                      {room.type === 'direct' && (
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOtherOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <h4 className="font-semibold text-sm truncate">{displayName}</h4>
                                          {isOtherOnline && room.type === 'direct' && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                          )}
                                        </div>
                                        {room.unreadCount! > 0 && (
                                          <Badge className="bg-red-500 text-white ml-2">
                                            {room.unreadCount}
                                          </Badge>
                                        )}
                                      </div>
                                      {room.lastMessage && (
                                        <p className="text-xs text-gray-600 truncate">
                                          {room.lastMessage.message}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* Separator */}
                    {rooms.length > 0 && users.length > 0 && (
                      <div className="border-t border-gray-200"></div>
                    )}

                    {/* Start New Chat - User List */}
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-1 px-0.5 tracking-wider">
                        Start New Chat
                      </h4>

                      {isLoadingUsers ? (
                        <div className="text-center py-6">
                          <RefreshCw className="w-6 h-6 text-gray-400 mx-auto mb-2 animate-spin" />
                          <p className="text-xs text-gray-500">Loading users...</p>
                        </div>
                      ) : users.length === 0 ? (
                        <div className="text-center py-6">
                          <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">No users available</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                          {users
                            .filter(u =>
                              u.id !== user?.id && // Don't show current user
                              (!searchQuery ||
                                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                u.email.toLowerCase().includes(searchQuery.toLowerCase())
                              )
                            )
                            .sort((a, b) => {
                              // Sort by online status first
                              const aOnline = onlineUsers.has(a.id.toString());
                              const bOnline = onlineUsers.has(b.id.toString());
                              if (aOnline && !bOnline) return -1;
                              if (!aOnline && bOnline) return 1;
                              return a.name.localeCompare(b.name);
                            })
                            .map((u) => {
                              const isOnline = onlineUsers.has(u.id.toString());
                              return (
                                <button
                                  key={u.id}
                                  onClick={() => handleStartChat(u.id)}
                                  className="w-full p-2 bg-white rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold text-sm">
                                          {(u.name || 'U').charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                      {/* Online indicator */}
                                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'
                                        }`}></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-sm truncate">{u.name}</h4>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                          {u.role}
                                        </Badge>
                                        {isOnline && (
                                          <span className="text-xs text-green-600">Online</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Chat Room - Messages */}
                {selectedRoomId && currentRoom && (
                  <div className="flex flex-col h-full">
                    {/* Room Header */}
                    <div className="p-3 bg-white border-b flex items-center gap-2">
                      <button
                        onClick={handleBackToList}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {(getRoomDisplayName(currentRoom) || 'C').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{getRoomDisplayName(currentRoom)}</h4>
                        {currentRoom.metadata?.sellerName && (
                          <p className="text-xs text-gray-500">Seller</p>
                        )}
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.map((msg) => {
                        const isOwn = msg.senderId?.toString() === user?.id?.toString();
                        return (
                          <div
                            key={msg._id}
                            className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                          >
                            {!isOwn && (
                              <div className="w-7 h-7 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-gray-600">
                                  {(msg.senderName || 'User').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                              <div
                                className={`rounded-2xl px-4 py-2 ${isOwn
                                  ? 'bg-blue-600 text-white rounded-br-none'
                                  : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                                  }`}
                              >
                                <p className="text-sm break-words">{msg.message}</p>
                              </div>
                              <span className="text-xs text-gray-500 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Typing Indicator */}
                      {isTyping[selectedRoomId] && (
                        <div className="flex gap-2">
                          <div className="w-7 h-7 bg-gray-300 rounded-full"></div>
                          <div className="bg-white rounded-2xl rounded-bl-none px-4 py-2 border border-gray-200">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-3 bg-white border-t">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={handleInputChange}
                          onKeyPress={handleKeyPress}
                          placeholder={isConnected ? "Nhập tin nhắn..." : "Đang mất kết nối..."}
                          disabled={!isConnected && bufferedMessages.length >= 5}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100"
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!messageInput.trim()}
                          className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                          aria-label="Send message"
                        >
                          <Send className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Chat Input - Only for Support Mode */}
          {chatMode === 'support' && (
            <div className="p-4 bg-white border-t rounded-b-2xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập câu hỏi của bạn..."
                  disabled={isBotTyping}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100"
                />
                <button
                  onClick={handleSendBotMessage}
                  disabled={!messageInput.trim() || isBotTyping}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Được hỗ trợ bởi AI • Phản hồi tức thì
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mobile Optimization Styles */}
      <style>{`
        @media (max-width: 640px) {
          button[aria-label="Chat support"] {
            width: 60px !important;
            height: 60px !important;
            bottom: 20px !important;
            right: 20px !important;
          }

          .fixed.bottom-24.right-5 {
            bottom: 90px !important;
            right: 10px !important;
            left: 10px !important;
            width: calc(100vw - 20px) !important;
            max-height: calc(100vh - 120px) !important;
          }
        }
      `}</style>
    </>
  );
}
