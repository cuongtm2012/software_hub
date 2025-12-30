const messageHandler = require('./handlers/messageHandler');
const presenceHandler = require('./handlers/presenceHandler');
const authHandler = require('./handlers/authHandler');
const userListHandler = require('./handlers/userListHandler');
const mongoService = require('../services/mongoService');
const redisService = require('../services/redisService');
const authService = require('../services/authService');

class SocketServer {
  async init(io) {
    this.io = io;

    // Initialize services
    console.log('🚀 Initializing chat service...');

    // Connect to Redis
    await redisService.connect();

    // Connect to MongoDB
    await mongoService.connect();

    // Fetch and cache user list from main app
    await this.refreshUserListCache();

    // Set up periodic user list refresh (every 5 minutes)
    setInterval(() => {
      this.refreshUserListCache();
    }, 5 * 60 * 1000);

    // Authentication middleware
    io.use(authHandler.authenticate);

    io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // ==========================================
      // AUTHENTICATION & USER MANAGEMENT
      // ==========================================

      socket.on('authenticate', async (data) => {
        await authHandler.handleAuthenticate(socket, data);

        // After successful authentication
        if (socket.isAuthenticated && socket.userId) {
          // Broadcast user online to all clients
          await userListHandler.broadcastUserOnline(io, socket.userId, {
            userName: socket.userName,
            userRole: socket.userRole,
            userAvatar: socket.userAvatar
          });

          // Send online users list to newly connected user
          await userListHandler.sendOnlineUsersList(socket);

          console.log(`User ${socket.userId} (${socket.userName}) is now online`);
        }
      });

      // Get user list with online status
      socket.on('get-user-list', (data) => {
        userListHandler.handleGetUserList(socket, data);
      });

      // Search users
      socket.on('search-users', (data) => {
        userListHandler.handleSearchUsers(socket, data);
      });

      // Get user details
      socket.on('get-user-details', (data) => {
        userListHandler.handleGetUserDetails(socket, data);
      });

      // ==========================================
      // CHAT ROOM & MESSAGING
      // ==========================================

      socket.on('join-room', (data) => {
        if (!socket.isAuthenticated) {
          socket.emit('error', {
            type: 'AUTHENTICATION_REQUIRED',
            message: 'Please authenticate first'
          });
          return;
        }
        messageHandler.handleJoinRoom(socket, data);
      });

      socket.on('leave-room', (data) => {
        if (!socket.isAuthenticated) return;
        messageHandler.handleLeaveRoom(socket, data);
      });

      socket.on('create-room', async (data) => {
        if (!socket.isAuthenticated) {
          socket.emit('error', {
            type: 'AUTHENTICATION_REQUIRED',
            message: 'Please authenticate first'
          });
          return;
        }

        try {
          const { participants, type = 'direct', name, metadata } = data;

          console.log('📥 create-room request:', {
            userId: socket.userId,
            participants,
            type
          });

          // Validate participants
          if (!participants || !Array.isArray(participants) || participants.length < 1) {
            socket.emit('error', {
              type: 'INVALID_PARTICIPANTS',
              message: 'At least 1 participant required'
            });
            return;
          }

          // Add creator to participants if not already included
          if (!participants.includes(socket.userId)) {
            participants.push(socket.userId);
          }

          // For direct messages, ensure only 2 participants
          if (type === 'direct' && participants.length !== 2) {
            socket.emit('error', {
              type: 'INVALID_PARTICIPANTS',
              message: 'Direct rooms must have exactly 2 participants'
            });
            return;
          }

          // Check if direct room already exists
          if (type === 'direct') {
            const existingRooms = await mongoService.getUserRooms(socket.userId);
            const existingDirectRoom = existingRooms.find(room =>
              room.type === 'direct' &&
              room.participants.length === 2 &&
              room.participants.includes(participants.find(p => p !== socket.userId))
            );

            if (existingDirectRoom) {
              console.log('✅ Direct room already exists:', existingDirectRoom._id);
              socket.emit('room-created', { room: existingDirectRoom });
              return;
            }
          }

          // Create room in MongoDB
          const roomData = {
            participants,
            type,
            name: name || (type === 'direct' ? 'Direct Chat' : `${type.charAt(0).toUpperCase() + type.slice(1)} Chat`),
            createdBy: socket.userId,
            metadata: metadata || {}
          };

          const room = await mongoService.createRoom(roomData);
          console.log('✅ Room created:', room._id);

          // Emit to creator
          socket.emit('room-created', { room });

          // Emit to all participants
          participants.forEach(participantId => {
            if (participantId !== socket.userId) {
              io.to(`user:${participantId}`).emit('room-created', { room });
            }
          });

        } catch (error) {
          console.error('Failed to create room:', error);
          socket.emit('error', {
            type: 'ROOM_CREATION_FAILED',
            message: error.message
          });
        }
      });

      socket.on('send-message', (data) => {
        if (!socket.isAuthenticated) {
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
        if (!socket.isAuthenticated) return;
        messageHandler.handleTypingStart(socket, data);
      });

      socket.on('typing-stop', (data) => {
        if (!socket.isAuthenticated) return;
        messageHandler.handleTypingStop(socket, data);
      });

      // ==========================================
      // DISCONNECT HANDLING
      // ==========================================

      socket.on('disconnect', async () => {
        if (socket.isAuthenticated && socket.userId) {
          console.log(`User disconnected: ${socket.userId}`);

          // Handle auth disconnect (sets user offline in Redis)
          await authHandler.handleDisconnect(socket);

          // Broadcast user offline to all clients
          await userListHandler.broadcastUserOffline(io, socket.userId);

          // Update presence
          presenceHandler.handleDisconnection(socket, io);
        } else {
          console.log(`Unauthenticated socket disconnected: ${socket.id}`);
        }
      });

      // Error handling
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.userId || 'unauthenticated'} (${socket.id}):`, error);
      });
    });

    console.log('✅ Socket server initialized successfully');
  }

  /**
   * Refresh user list cache from main app
   */
  async refreshUserListCache() {
    try {
      console.log('🔄 Refreshing user list cache from main app...');
      const users = await authService.getUserList();

      if (users && users.length > 0) {
        await redisService.cacheUserList(users);
        console.log(`✅ Cached ${users.length} users in Redis`);
      } else {
        console.warn('⚠️ No users fetched from main app');
      }
    } catch (error) {
      console.error('❌ Failed to refresh user list cache:', error);
    }
  }
}

module.exports = new SocketServer();