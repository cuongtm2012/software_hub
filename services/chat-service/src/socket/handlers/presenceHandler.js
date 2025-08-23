const redisService = require('../../services/redisService');

class PresenceHandler {
  async handleConnection(socket, io) {
    try {
      // Set user as online in Redis
      await redisService.setUserOnline(socket.userId, {
        socketId: socket.id,
        userName: socket.userName,
        userRole: socket.userRole,
        connectedAt: new Date()
      });
      
      // Get current online users to send to the newly connected user
      const onlineUsers = await redisService.getOnlineUsers();
      
      // Send current online users to the newly connected user
      socket.emit('online-users-list', {
        users: onlineUsers.map(user => user.userId)
      });
      
      // Broadcast user online status to relevant rooms/users
      socket.broadcast.emit('user-online', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });
      
      console.log(`User ${socket.userId} (${socket.userName}) is now online`);
      
    } catch (error) {
      console.error('Presence connection error:', error);
    }
  }

  async handleDisconnection(socket, io) {
    try {
      // Set user as offline in Redis
      await redisService.setUserOffline(socket.userId);
      
      // Broadcast user offline status
      socket.broadcast.emit('user-offline', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });
      
      console.log(`User ${socket.userId} (${socket.userName}) is now offline`);
      
    } catch (error) {
      console.error('Presence disconnection error:', error);
    }
  }

  async getOnlineUsers() {
    try {
      return await redisService.getOnlineUsers();
    } catch (error) {
      console.error('Get online users error:', error);
      return [];
    }
  }

  async isUserOnline(userId) {
    try {
      return await redisService.isUserOnline(userId);
    } catch (error) {
      console.error('Check user online error:', error);
      return false;
    }
  }
}

module.exports = new PresenceHandler();