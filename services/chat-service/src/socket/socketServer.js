const messageHandler = require('./handlers/messageHandler');
const presenceHandler = require('./handlers/presenceHandler');
const authHandler = require('./handlers/authHandler');
const mongoService = require('../services/mongoService');

class SocketServer {
  init(io) {
    this.io = io;
    
    // Initialize MongoDB connection
    mongoService.connect();
    
    // Authentication middleware (allows connection, auth happens via event)
    io.use(authHandler.authenticate);
    
    io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);
      
      // Handle authentication event (our enhanced method)
      socket.on('authenticate', (data) => {
        authHandler.handleAuthenticate(socket, data);
        
        // After successful authentication, join user to their personal room
        if (socket.userId) {
          socket.join(`user:${socket.userId}`);
          presenceHandler.handleConnection(socket, io);
          console.log(`User authenticated and joined personal room: ${socket.userId} (${socket.userRole}) - ${socket.userName}`);
        }
      });

      // Enhanced message handlers
      socket.on('join-room', (data) => {
        if (!socket.userId) {
          socket.emit('error', { 
            type: 'AUTHENTICATION_REQUIRED',
            message: 'Please authenticate first' 
          });
          return;
        }
        messageHandler.handleJoinRoom(socket, data);
      });

      socket.on('leave-room', (data) => {
        if (!socket.userId) return;
        messageHandler.handleLeaveRoom(socket, data);
      });

      socket.on('send-message', (data) => {
        if (!socket.userId) {
          socket.emit('error', { 
            type: 'AUTHENTICATION_REQUIRED',
            message: 'Please authenticate first' 
          });
          return;
        }
        messageHandler.handleSendMessage(socket, io, data);
      });
      
      // Typing indicators
      socket.on('typing-start', (data) => {
        if (!socket.userId) return;
        messageHandler.handleTypingStart(socket, data);
      });

      socket.on('typing-stop', (data) => {
        if (!socket.userId) return;
        messageHandler.handleTypingStop(socket, data);
      });
      
      // Message reactions (new)
      socket.on('add-reaction', (data) => {
        if (!socket.userId) return;
        messageHandler.handleAddReaction(socket, io, data);
      });

      socket.on('remove-reaction', (data) => {
        if (!socket.userId) return;
        messageHandler.handleRemoveReaction(socket, io, data);
      });
      
      // Message editing and deletion (new)
      socket.on('edit-message', (data) => {
        if (!socket.userId) return;
        messageHandler.handleEditMessage(socket, io, data);
      });

      socket.on('delete-message', (data) => {
        if (!socket.userId) return;
        messageHandler.handleDeleteMessage(socket, io, data);
      });
      
      // Admin-specific handlers
      socket.on('admin-broadcast', (data) => {
        if (!socket.userId || socket.userRole !== 'admin') {
          socket.emit('error', { 
            type: 'PERMISSION_DENIED',
            message: 'Admin privileges required' 
          });
          return;
        }
        messageHandler.handleAdminBroadcast(socket, io, data);
      });

      socket.on('admin-room-create', (data) => {
        if (!socket.userId || socket.userRole !== 'admin') return;
        this.handleAdminRoomCreate(socket, data);
      });

      socket.on('admin-user-ban', (data) => {
        if (!socket.userId || socket.userRole !== 'admin') return;
        this.handleAdminUserBan(socket, io, data);
      });
      
      // Voice/Video call handlers (for future implementation)
      socket.on('call-initiate', (data) => {
        if (!socket.userId) return;
        this.handleCallInitiate(socket, io, data);
      });

      socket.on('call-accept', (data) => {
        if (!socket.userId) return;
        this.handleCallAccept(socket, io, data);
      });

      socket.on('call-decline', (data) => {
        if (!socket.userId) return;
        this.handleCallDecline(socket, io, data);
      });

      socket.on('call-end', (data) => {
        if (!socket.userId) return;
        this.handleCallEnd(socket, io, data);
      });
      
      // File sharing handlers
      socket.on('file-share-request', (data) => {
        if (!socket.userId) return;
        this.handleFileShare(socket, io, data);
      });
      
      // Read receipts
      socket.on('mark-as-read', (data) => {
        if (!socket.userId) return;
        this.handleMarkAsRead(socket, io, data);
      });
      
      // User status updates
      socket.on('update-status', (data) => {
        if (!socket.userId) return;
        this.handleStatusUpdate(socket, io, data);
      });
      
      // Room management
      socket.on('create-room', (data) => {
        if (!socket.userId) return;
        this.handleCreateRoom(socket, data);
      });

      socket.on('leave-room-permanently', (data) => {
        if (!socket.userId) return;
        this.handleLeaveRoomPermanently(socket, io, data);
      });
      
      // Handle disconnection with cleanup
      socket.on('disconnect', () => {
        if (socket.userId) {
          console.log(`User disconnected: ${socket.userId}`);
          
          // Clear any typing timeouts
          if (socket.typingTimeout) {
            clearTimeout(socket.typingTimeout);
          }
          
          // Update presence status
          presenceHandler.handleDisconnection(socket, io);
          
          // Stop typing in all rooms
          this.stopTypingInAllRooms(socket, io);
        } else {
          console.log(`Unauthenticated socket disconnected: ${socket.id}`);
        }
      });
      
      // Error handling
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.userId || 'unauthenticated'} (${socket.id}):`, error);
        socket.emit('error', {
          type: 'SOCKET_ERROR',
          message: 'Connection error occurred',
          timestamp: new Date()
        });
      });
    });
    
    // Global error handler
    io.engine.on('connection_error', (err) => {
      console.error('Socket.IO connection error:', err);
    });
  }
  
  // Enhanced room creation with validation
  async handleCreateRoom(socket, data) {
    try {
      const { participants, type, name, description, settings } = data;
      
      if (!participants || !Array.isArray(participants) || participants.length < 1) {
        socket.emit('error', {
          type: 'INVALID_ROOM_DATA',
          message: 'Valid participants array is required'
        });
        return;
      }
      
      // Add creator to participants if not included
      if (!participants.includes(socket.userId)) {
        participants.push(socket.userId);
      }
      
      const roomData = {
        participants,
        type: type || 'group',
        name: name || `${socket.userName}'s Room`,
        description: description || '',
        createdBy: socket.userId,
        settings: {
          allowFileSharing: true,
          allowVoiceCalls: false,
          allowVideoCall: false,
          isEncrypted: false,
          ...settings
        }
      };
      
      const room = await mongoService.createRoom(roomData);
      
      // Join creator to the room
      socket.join(room._id);
      
      // Notify all participants about the new room
      participants.forEach(participantId => {
        this.io.to(`user:${participantId}`).emit('room-created', {
          room,
          createdBy: {
            id: socket.userId,
            name: socket.userName
          },
          timestamp: new Date()
        });
      });
      
      socket.emit('room-create-success', { room });
      
    } catch (error) {
      console.error('Create room error:', error);
      socket.emit('error', {
        type: 'CREATE_ROOM_ERROR',
        message: 'Failed to create room'
      });
    }
  }
  
  // Admin room creation with special privileges
  async handleAdminRoomCreate(socket, data) {
    try {
      const { type, name, description, isPublic = false, maxMembers = 100 } = data;
      
      const roomData = {
        participants: [socket.userId],
        type: type || 'channel',
        name: name || 'Admin Channel',
        description: description || 'Created by admin',
        createdBy: socket.userId,
        settings: {
          allowFileSharing: true,
          allowVoiceCalls: true,
          allowVideoCall: true,
          isEncrypted: false,
          isPublic,
          maxMembers
        }
      };
      
      const room = await mongoService.createRoom(roomData);
      socket.join(room._id);
      
      // Broadcast admin room creation to all users if public
      if (isPublic) {
        this.io.emit('public-room-created', {
          room,
          createdBy: {
            id: socket.userId,
            name: socket.userName,
            role: socket.userRole
          }
        });
      }
      
      socket.emit('admin-room-created', { room });
      
    } catch (error) {
      console.error('Admin create room error:', error);
      socket.emit('error', {
        type: 'ADMIN_CREATE_ROOM_ERROR',
        message: 'Failed to create admin room'
      });
    }
  }
  
  // Mark messages as read
  async handleMarkAsRead(socket, io, data) {
    try {
      const { roomId, messageId } = data;
      
      if (!roomId) {
        socket.emit('error', {
          type: 'INVALID_READ_DATA',
          message: 'Room ID is required'
        });
        return;
      }
      
      // Verify room access
      const hasAccess = await mongoService.verifyRoomAccess(roomId, socket.userId);
      if (!hasAccess) {
        socket.emit('error', {
          type: 'ROOM_ACCESS_DENIED',
          message: 'Access denied to room'
        });
        return;
      }
      
      await mongoService.markAsRead(roomId, socket.userId, messageId);
      
      // Notify other participants about read receipt
      socket.to(roomId).emit('message-read', {
        roomId,
        messageId,
        readBy: socket.userId,
        readAt: new Date()
      });
      
      socket.emit('mark-read-success', { roomId, messageId });
      
    } catch (error) {
      console.error('Mark as read error:', error);
      socket.emit('error', {
        type: 'MARK_READ_ERROR',
        message: 'Failed to mark as read'
      });
    }
  }
  
  // Update user status
  async handleStatusUpdate(socket, io, data) {
    try {
      const { status, customMessage } = data;
      
      const validStatuses = ['online', 'away', 'busy', 'offline'];
      if (!validStatuses.includes(status)) {
        socket.emit('error', {
          type: 'INVALID_STATUS',
          message: 'Invalid status. Must be: ' + validStatuses.join(', ')
        });
        return;
      }
      
      await mongoService.updateUserPresence(socket.userId, status);
      
      // Broadcast status update to contacts/friends
      socket.broadcast.emit('user-status-updated', {
        userId: socket.userId,
        userName: socket.userName,
        status,
        customMessage,
        timestamp: new Date()
      });
      
      socket.emit('status-update-success', { status, customMessage });
      
    } catch (error) {
      console.error('Status update error:', error);
      socket.emit('error', {
        type: 'STATUS_UPDATE_ERROR',
        message: 'Failed to update status'
      });
    }
  }
  
  // File sharing (basic implementation)
  async handleFileShare(socket, io, data) {
    try {
      const { roomId, fileName, fileSize, fileType, fileUrl } = data;
      
      if (!roomId || !fileName || !fileUrl) {
        socket.emit('error', {
          type: 'INVALID_FILE_DATA',
          message: 'Room ID, file name, and file URL are required'
        });
        return;
      }
      
      // Verify room access
      const hasAccess = await mongoService.verifyRoomAccess(roomId, socket.userId);
      if (!hasAccess) {
        socket.emit('error', {
          type: 'ROOM_ACCESS_DENIED',
          message: 'Access denied to room'
        });
        return;
      }
      
      // Create file message
      const fileMessage = {
        roomId,
        senderId: socket.userId,
        senderName: socket.userName,
        message: `📎 ${fileName}`,
        type: 'file',
        attachments: [{
          fileName,
          fileSize,
          fileType,
          fileUrl,
          uploadedAt: new Date()
        }],
        timestamp: new Date()
      };
      
      const savedMessage = await mongoService.saveMessage(fileMessage);
      
      // Emit to room participants
      io.to(roomId).emit('new-message', savedMessage);
      socket.emit('file-share-success', { messageId: savedMessage._id });
      
    } catch (error) {
      console.error('File share error:', error);
      socket.emit('error', {
        type: 'FILE_SHARE_ERROR',
        message: 'Failed to share file'
      });
    }
  }
  
  // Voice/Video call initiation (placeholder for future implementation)
  handleCallInitiate(socket, io, data) {
    const { targetUserId, callType } = data;
    
    if (!targetUserId || !['voice', 'video'].includes(callType)) {
      socket.emit('error', {
        type: 'INVALID_CALL_DATA',
        message: 'Target user ID and valid call type required'
      });
      return;
    }
    
    const callData = {
      callId: `call_${Date.now()}`,
      from: {
        id: socket.userId,
        name: socket.userName
      },
      to: targetUserId,
      type: callType,
      initiatedAt: new Date()
    };
    
    // Send call invitation to target user
    io.to(`user:${targetUserId}`).emit('call-incoming', callData);
    socket.emit('call-initiated', callData);
  }
  
  handleCallAccept(socket, io, data) {
    const { callId, fromUserId } = data;
    
    io.to(`user:${fromUserId}`).emit('call-accepted', {
      callId,
      acceptedBy: socket.userId,
      acceptedAt: new Date()
    });
  }
  
  handleCallDecline(socket, io, data) {
    const { callId, fromUserId } = data;
    
    io.to(`user:${fromUserId}`).emit('call-declined', {
      callId,
      declinedBy: socket.userId,
      declinedAt: new Date()
    });
  }
  
  handleCallEnd(socket, io, data) {
    const { callId, participantId } = data;
    
    if (participantId) {
      io.to(`user:${participantId}`).emit('call-ended', {
        callId,
        endedBy: socket.userId,
        endedAt: new Date()
      });
    }
  }
  
  // Admin user ban
  async handleAdminUserBan(socket, io, data) {
    try {
      const { userId, reason, duration } = data;
      
      if (!userId) {
        socket.emit('error', {
          type: 'INVALID_BAN_DATA',
          message: 'User ID is required'
        });
        return;
      }
      
      // Disconnect the banned user
      const targetSockets = io.sockets.adapter.rooms.get(`user:${userId}`);
      if (targetSockets) {
        targetSockets.forEach(socketId => {
          const targetSocket = io.sockets.sockets.get(socketId);
          if (targetSocket) {
            targetSocket.emit('user-banned', {
              reason: reason || 'Violation of community guidelines',
              duration,
              bannedBy: socket.userName,
              timestamp: new Date()
            });
            targetSocket.disconnect(true);
          }
        });
      }
      
      socket.emit('user-ban-success', { userId, reason, duration });
      
    } catch (error) {
      console.error('Admin user ban error:', error);
      socket.emit('error', {
        type: 'USER_BAN_ERROR',
        message: 'Failed to ban user'
      });
    }
  }
  
  // Helper method to stop typing in all rooms when user disconnects
  async stopTypingInAllRooms(socket, io) {
    try {
      // Get all rooms the user was in and stop typing
      const rooms = Array.from(socket.rooms);
      rooms.forEach(roomId => {
        if (roomId !== socket.id && roomId !== `user:${socket.userId}`) {
          socket.to(roomId).emit('typing-stop', {
            userId: socket.userId,
            userName: socket.userName,
            roomId,
            timestamp: new Date()
          });
        }
      });
    } catch (error) {
      console.error('Error stopping typing in rooms:', error);
    }
  }
}

module.exports = new SocketServer();