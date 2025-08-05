const mongoService = require('../../services/mongoService');
const redisService = require('../../services/redisService');

class MessageHandler {
  async handleJoinRoom(socket, data) {
    try {
      const { roomId } = data;
      
      // Verify user has access to the room
      const hasAccess = await mongoService.verifyRoomAccess(roomId, socket.userId);
      if (!hasAccess) {
        socket.emit('error', { message: 'Access denied to room' });
        return;
      }
      
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room ${roomId}`);
      
      // Notify others in the room
      socket.to(roomId).emit('user-joined', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('Join room error:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  handleLeaveRoom(socket, data) {
    const { roomId } = data;
    socket.leave(roomId);
    
    socket.to(roomId).emit('user-left', {
      userId: socket.userId,
      userName: socket.userName,
      timestamp: new Date()
    });
  }

  async handleSendMessage(socket, io, data) {
    try {
      const { roomId, message, type = 'text' } = data;
      
      // Verify user has access to the room
      const hasAccess = await mongoService.verifyRoomAccess(roomId, socket.userId);
      if (!hasAccess) {
        socket.emit('error', { message: 'Access denied to room' });
        return;
      }
      
      // Create message object
      const messageObj = {
        id: Date.now().toString(),
        roomId,
        senderId: socket.userId,
        senderName: socket.userName,
        senderRole: socket.userRole,
        message,
        type,
        timestamp: new Date(),
        edited: false,
        replies: []
      };
      
      // Save message to database
      await mongoService.saveMessage(messageObj);
      
      // Publish to Redis for scaling across instances
      await redisService.publishMessage(roomId, messageObj);
      
      // Emit to room participants
      io.to(roomId).emit('new-message', messageObj);
      
      console.log(`Message sent in room ${roomId} by user ${socket.userId}`);
      
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  handleTypingStart(socket, data) {
    const { roomId } = data;
    socket.to(roomId).emit('typing-start', {
      userId: socket.userId,
      userName: socket.userName
    });
  }

  handleTypingStop(socket, data) {
    const { roomId } = data;
    socket.to(roomId).emit('typing-stop', {
      userId: socket.userId,
      userName: socket.userName
    });
  }

  async handleAdminBroadcast(socket, io, data) {
    try {
      const { message, targetUsers = 'all' } = data;
      
      const broadcastMessage = {
        id: Date.now().toString(),
        type: 'admin-broadcast',
        senderId: socket.userId,
        senderName: socket.userName,
        message,
        timestamp: new Date()
      };
      
      if (targetUsers === 'all') {
        // Broadcast to all connected users
        io.emit('admin-broadcast', broadcastMessage);
      } else if (Array.isArray(targetUsers)) {
        // Broadcast to specific users
        targetUsers.forEach(userId => {
          io.to(`user:${userId}`).emit('admin-broadcast', broadcastMessage);
        });
      }
      
      console.log(`Admin broadcast sent by ${socket.userId}`);
      
    } catch (error) {
      console.error('Admin broadcast error:', error);
      socket.emit('error', { message: 'Failed to send broadcast' });
    }
  }
}

module.exports = new MessageHandler();