const redis = require('redis');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('Redis max retries reached');
              return new Error('Redis max retries reached');
            }
            return retries * 100;
          }
        }
      });

      this.client.on('error', (err) => {
        console.error('Redis client error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.warn('⚠️ Redis disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  // ==========================================
  // ONLINE STATUS MANAGEMENT
  // ==========================================

  /**
   * Set user as online
   * @param {string} userId - User ID
   * @param {object} userData - User metadata (name, role, avatar, etc.)
   */
  async setUserOnline(userId, userData = {}) {
    if (!this.isConnected) return false;

    try {
      const userKey = `user:online:${userId}`;
      const onlineSetKey = 'users:online';

      // Store user metadata with TTL (30 minutes)
      await this.client.setEx(
        userKey,
        1800, // 30 minutes
        JSON.stringify({
          userId,
          userName: userData.userName || 'Unknown',
          userRole: userData.userRole || 'user',
          userAvatar: userData.userAvatar || '',
          connectedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        })
      );

      // Add to online users set
      await this.client.sAdd(onlineSetKey, userId);

      console.log(`✅ User ${userId} set as online`);
      return true;
    } catch (error) {
      console.error('Failed to set user online:', error);
      return false;
    }
  }

  /**
   * Set user as offline
   * @param {string} userId - User ID
   */
  async setUserOffline(userId) {
    if (!this.isConnected) return false;

    try {
      const userKey = `user:online:${userId}`;
      const onlineSetKey = 'users:online';

      // Remove user metadata
      await this.client.del(userKey);

      // Remove from online users set
      await this.client.sRem(onlineSetKey, userId);

      console.log(`✅ User ${userId} set as offline`);
      return true;
    } catch (error) {
      console.error('Failed to set user offline:', error);
      return false;
    }
  }

  /**
   * Check if user is online
   * @param {string} userId - User ID
   */
  async isUserOnline(userId) {
    if (!this.isConnected) return false;

    try {
      const onlineSetKey = 'users:online';
      return await this.client.sIsMember(onlineSetKey, userId);
    } catch (error) {
      console.error('Failed to check user online status:', error);
      return false;
    }
  }

  /**
   * Get all online user IDs
   */
  async getOnlineUserIds() {
    if (!this.isConnected) return [];

    try {
      const onlineSetKey = 'users:online';
      return await this.client.sMembers(onlineSetKey);
    } catch (error) {
      console.error('Failed to get online users:', error);
      return [];
    }
  }

  /**
   * Get all online users with metadata
   */
  async getOnlineUsers() {
    if (!this.isConnected) return [];

    try {
      const userIds = await this.getOnlineUserIds();
      const users = [];

      for (const userId of userIds) {
        const userKey = `user:online:${userId}`;
        const userData = await this.client.get(userKey);
        
        if (userData) {
          try {
            users.push(JSON.parse(userData));
          } catch (e) {
            console.error(`Failed to parse user data for ${userId}`);
          }
        }
      }

      return users;
    } catch (error) {
      console.error('Failed to get online users with metadata:', error);
      return [];
    }
  }

  /**
   * Update user last activity
   * @param {string} userId - User ID
   */
  async updateUserActivity(userId) {
    if (!this.isConnected) return false;

    try {
      const userKey = `user:online:${userId}`;
      const userData = await this.client.get(userKey);

      if (userData) {
        const parsed = JSON.parse(userData);
        parsed.lastActivity = new Date().toISOString();
        
        await this.client.setEx(userKey, 1800, JSON.stringify(parsed));
      }

      return true;
    } catch (error) {
      console.error('Failed to update user activity:', error);
      return false;
    }
  }

  // ==========================================
  // USER LIST CACHING
  // ==========================================

  /**
   * Cache user list from main app
   * @param {Array} users - Array of user objects
   */
  async cacheUserList(users) {
    if (!this.isConnected) return false;

    try {
      const cacheKey = 'cache:users:all';
      
      // Store with 5 minute TTL
      await this.client.setEx(
        cacheKey,
        300, // 5 minutes
        JSON.stringify(users)
      );

      console.log(`✅ Cached ${users.length} users`);
      return true;
    } catch (error) {
      console.error('Failed to cache user list:', error);
      return false;
    }
  }

  /**
   * Get cached user list
   */
  async getCachedUserList() {
    if (!this.isConnected) return null;

    try {
      const cacheKey = 'cache:users:all';
      const data = await this.client.get(cacheKey);
      
      if (data) {
        return JSON.parse(data);
      }

      return null;
    } catch (error) {
      console.error('Failed to get cached user list:', error);
      return null;
    }
  }

  /**
   * Get user list with online status
   * @param {string} currentUserId - Current user ID to exclude
   */
  async getUserListWithStatus(currentUserId) {
    try {
      // Get cached user list
      let users = await this.getCachedUserList();
      
      if (!users) {
        console.log('⚠️ No cached user list, need to fetch from main app');
        return null;
      }

      // Get online user IDs
      const onlineUserIds = await this.getOnlineUserIds();
      const onlineSet = new Set(onlineUserIds);

      // Enrich users with online status
      const enrichedUsers = users
        .filter(u => u.id.toString() !== currentUserId.toString())
        .map(user => ({
          ...user,
          isOnline: onlineSet.has(user.id.toString()),
          status: onlineSet.has(user.id.toString()) ? 'online' : 'offline'
        }))
        // Sort: online users first
        .sort((a, b) => {
          if (a.isOnline && !b.isOnline) return -1;
          if (!a.isOnline && b.isOnline) return 1;
          return a.name.localeCompare(b.name);
        });

      return enrichedUsers;
    } catch (error) {
      console.error('Failed to get user list with status:', error);
      return null;
    }
  }

  // ==========================================
  // CLEANUP & UTILITIES
  // ==========================================

  /**
   * Clear all online users (for cleanup/restart)
   */
  async clearOnlineUsers() {
    if (!this.isConnected) return false;

    try {
      const onlineSetKey = 'users:online';
      const userIds = await this.client.sMembers(onlineSetKey);

      // Delete all user keys
      for (const userId of userIds) {
        await this.client.del(`user:online:${userId}`);
      }

      // Clear the set
      await this.client.del(onlineSetKey);

      console.log('✅ Cleared all online users');
      return true;
    } catch (error) {
      console.error('Failed to clear online users:', error);
      return false;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      console.log('Redis disconnected');
    }
  }
}

module.exports = new RedisService();