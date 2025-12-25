const redisService = require('../../services/redisService');
const authService = require('../../services/authService');

class UserListHandler {
  constructor() {
    this.userListCache = null;
    this.lastFetchTime = 0;
    this.CACHE_TTL = 2 * 60 * 1000; // 2 minutes in-memory cache
  }

  /**
   * Handle 'get-user-list' event from client
   * Returns all users with real-time online status
   */
  async handleGetUserList(socket, data = {}) {
    console.log(`📥 get-user-list request from user ${socket.userId}`, {
      isAuthenticated: socket.isAuthenticated,
      forceRefresh: data.forceRefresh
    });

    try {
      if (!socket.isAuthenticated || !socket.userId) {
        console.warn(`⚠️ Unauthenticated user tried to get user list`);
        socket.emit('user-list-error', {
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { forceRefresh = false } = data;

      // Try to get from Redis cache first
      let users = await redisService.getUserListWithStatus(socket.userId);

      console.log(`🔍 Redis cache result:`, {
        hasUsers: !!users,
        userCount: users?.length || 0
      });

      // If not in Redis or force refresh, fetch from main app
      if (!users || forceRefresh) {
        console.log('⚡ Fetching fresh user list from main app...');
        const freshUsers = await authService.getUserList();
        
        if (freshUsers && freshUsers.length > 0) {
          // Cache in Redis for 5 minutes
          await redisService.cacheUserList(freshUsers);
          
          // Get enriched list with online status
          users = await redisService.getUserListWithStatus(socket.userId);
          
          console.log(`✅ Fresh users fetched and cached: ${freshUsers.length} users`);
        } else {
          console.error('❌ Failed to fetch users from main app');
        }
      }

      if (!users || users.length === 0) {
        console.warn('⚠️ No users available to send');
        socket.emit('user-list', {
          success: true,
          users: [],
          totalCount: 0,
          onlineCount: 0
        });
        return;
      }

      // Count online users
      const onlineCount = users.filter(u => u.isOnline).length;

      console.log(`✅ Sending ${users.length} users (${onlineCount} online) to user ${socket.userId}`);

      socket.emit('user-list', {
        success: true,
        users: users,
        totalCount: users.length,
        onlineCount: onlineCount
      });

    } catch (error) {
      console.error('❌ Failed to get user list:', error);
      socket.emit('user-list-error', {
        success: false,
        error: 'Failed to fetch user list'
      });
    }
  }

  /**
   * Handle 'search-users' event
   * Search users by name or email
   */
  async handleSearchUsers(socket, data) {
    try {
      if (!socket.isAuthenticated || !socket.userId) {
        socket.emit('search-users-result', {
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { query } = data;

      if (!query || query.trim().length < 2) {
        socket.emit('search-users-result', {
          success: false,
          error: 'Search query must be at least 2 characters'
        });
        return;
      }

      // Get full user list with status
      const users = await redisService.getUserListWithStatus(socket.userId);

      if (!users) {
        socket.emit('search-users-result', {
          success: true,
          users: [],
          totalCount: 0
        });
        return;
      }

      // Filter by query
      const searchLower = query.toLowerCase().trim();
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower)
      );

      socket.emit('search-users-result', {
        success: true,
        users: filtered,
        totalCount: filtered.length,
        query: query.trim()
      });

    } catch (error) {
      console.error('Failed to search users:', error);
      socket.emit('search-users-result', {
        success: false,
        error: 'Search failed'
      });
    }
  }

  /**
   * Broadcast user online status change to all connected clients
   */
  async broadcastUserOnline(io, userId, userData) {
    try {
      console.log(`📢 Broadcasting: User ${userId} is now online`);
      
      // Broadcast to all connected clients
      io.emit('user-online', {
        userId: userId.toString(),
        userName: userData.userName,
        userRole: userData.userRole,
        userAvatar: userData.userAvatar,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Failed to broadcast user online:', error);
    }
  }

  /**
   * Broadcast user offline status change to all connected clients
   */
  async broadcastUserOffline(io, userId) {
    try {
      console.log(`📢 Broadcasting: User ${userId} is now offline`);
      
      // Broadcast to all connected clients
      io.emit('user-offline', {
        userId: userId.toString(),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Failed to broadcast user offline:', error);
    }
  }

  /**
   * Send initial online users list to newly connected client
   */
  async sendOnlineUsersList(socket) {
    try {
      if (!socket.isAuthenticated || !socket.userId) {
        return;
      }

      const onlineUserIds = await redisService.getOnlineUserIds();
      
      // Filter out current user
      const filteredIds = onlineUserIds.filter(id => id !== socket.userId.toString());

      console.log(`📤 Sending online users list to ${socket.userId}: ${filteredIds.length} users online`);

      socket.emit('online-users-list', {
        users: filteredIds,
        totalCount: filteredIds.length
      });

    } catch (error) {
      console.error('Failed to send online users list:', error);
    }
  }

  /**
   * Get user details by ID
   */
  async handleGetUserDetails(socket, data) {
    try {
      if (!socket.isAuthenticated || !socket.userId) {
        socket.emit('user-details-error', {
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { userId } = data;

      if (!userId) {
        socket.emit('user-details-error', {
          success: false,
          error: 'User ID required'
        });
        return;
      }

      // Check if user is online
      const isOnline = await redisService.isUserOnline(userId);

      // Get user metadata from Redis if online
      let userMeta = null;
      if (isOnline) {
        const onlineUsers = await redisService.getOnlineUsers();
        userMeta = onlineUsers.find(u => u.userId === userId.toString());
      }

      socket.emit('user-details', {
        success: true,
        userId: userId,
        isOnline: isOnline,
        metadata: userMeta,
        lastSeen: userMeta?.lastActivity || null
      });

    } catch (error) {
      console.error('Failed to get user details:', error);
      socket.emit('user-details-error', {
        success: false,
        error: 'Failed to get user details'
      });
    }
  }
}

module.exports = new UserListHandler();
