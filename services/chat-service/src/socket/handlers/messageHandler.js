const mongoService = require('../../services/mongoService');
const redisService = require('../../services/redisService');

class MessageHandler {
  async handleJoinRoom(socket, data) {
    try {
      const { roomId } = data;
      
      // Verify user has access to the room
      const hasAccess = await mongoService.verifyRoomAccess(roomId, socket.userId);
      if (!hasAccess) {
        socket.emit('error', { 
          type: 'ROOM_ACCESS_DENIED',
          message: 'Access denied to room',
          roomId 
        });
        return;
      }
      
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room ${roomId}`);
      
      // Mark user as active in room and update presence
      await mongoService.updateUserPresence(socket.userId, 'online', roomId);
      
      // Get recent messages for the user
      const recentMessages = await mongoService.getRoomMessages(roomId, { limit: 50 });
      socket.emit('room-joined', {
        roomId,
        success: true,
        recentMessages: recentMessages.messages,
        timestamp: new Date()
      });
      
      // Notify others in the room about user joining
      socket.to(roomId).emit('user-joined', {
        userId: socket.userId,
        userName: socket.userName,
        userAvatar: socket.userAvatar || '',
        timestamp: new Date()
      });
      
      // Get and emit current typing users in the room
      const typingUsers = await this.getTypingUsers(roomId);
      if (typingUsers.length > 0) {
        socket.emit('typing-users-update', { roomId, typingUsers });
      }
      
    } catch (error) {
      console.error('Join room error:', error);
      socket.emit('error', { 
        type: 'JOIN_ROOM_ERROR',
        message: 'Failed to join room',
        roomId 
      });
    }
  }

  async handleLeaveRoom(socket, data) {
    try {
      const { roomId } = data;
      socket.leave(roomId);
      
      // Update presence to indicate user left the room
      await mongoService.updateUserPresence(socket.userId, 'away');
      
      // Stop typing if user was typing
      await mongoService.setTypingStatus(socket.userId, roomId, false);
      
      // Notify others in the room
      socket.to(roomId).emit('user-left', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });
      
      // Update typing users list for the room
      const typingUsers = await this.getTypingUsers(roomId);
      socket.to(roomId).emit('typing-users-update', { roomId, typingUsers });
      
      socket.emit('room-left', { roomId, success: true });
      
    } catch (error) {
      console.error('Leave room error:', error);
      socket.emit('error', { 
        type: 'LEAVE_ROOM_ERROR',
        message: 'Failed to leave room',
        roomId: data.roomId 
      });
    }
  }

  async handleSendMessage(socket, io, data) {
    try {
      const { 
        roomId, 
        message, 
        type = 'text',
        replyTo = null,
        mentions = [],
        attachments = []
      } = data;
      
      // Input validation
      if (!roomId || !message || message.trim().length === 0) {
        socket.emit('error', { 
          type: 'INVALID_MESSAGE',
          message: 'Room ID and message content are required' 
        });
        return;
      }
      
      if (message.length > 4000) {
        socket.emit('error', { 
          type: 'MESSAGE_TOO_LONG',
          message: 'Message cannot exceed 4000 characters' 
        });
        return;
      }
      
      // Verify user has access to the room
      const hasAccess = await mongoService.verifyRoomAccess(roomId, socket.userId);
      if (!hasAccess) {
        socket.emit('error', { 
          type: 'ROOM_ACCESS_DENIED',
          message: 'Access denied to room',
          roomId 
        });
        return;
      }
      
      // Extract URLs and hashtags from message
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const hashtagRegex = /#(\w+)/g;
      const urls = message.match(urlRegex) || [];
      const hashtags = message.match(hashtagRegex) || [];
      
      // Create enhanced message object
      const messageObj = {
        roomId,
        senderId: socket.userId,
        senderName: socket.userName,
        senderAvatar: socket.userAvatar || '',
        message: message.trim(),
        type,
        mentions,
        hashtags: hashtags.map(tag => tag.substring(1)), // Remove # symbol
        urls,
        attachments,
        replyTo,
        timestamp: new Date()
      };
      
      // Save message to database
      const savedMessage = await mongoService.saveMessage(messageObj);
      
      // Stop typing indicator for the sender
      await mongoService.setTypingStatus(socket.userId, roomId, false);
      
      // Publish to Redis for scaling across instances
      await redisService.publishMessage(roomId, savedMessage);
      
      // Emit to room participants
      io.to(roomId).emit('new-message', savedMessage);
      
      // Send delivery confirmation to sender
      socket.emit('message-sent', {
        tempId: data.tempId, // Client-side temporary ID for optimistic updates
        messageId: savedMessage._id,
        timestamp: savedMessage.timestamp,
        success: true
      });
      
      // Update typing users (remove sender)
      const typingUsers = await this.getTypingUsers(roomId);
      io.to(roomId).emit('typing-users-update', { roomId, typingUsers });
      
      // Send push notifications to offline users (if needed)
      await this.sendPushNotifications(roomId, savedMessage, socket.userId);
      
      console.log(`Enhanced message sent in room ${roomId} by user ${socket.userId}`);
      
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { 
        type: 'SEND_MESSAGE_ERROR',
        message: 'Failed to send message',
        tempId: data.tempId 
      });
    }
  }

  async handleTypingStart(socket, data) {
    try {
      const { roomId } = data;
      
      if (!roomId) {
        return;
      }
      
      // Verify room access
      const hasAccess = await mongoService.verifyRoomAccess(roomId, socket.userId);
      if (!hasAccess) {
        return;
      }
      
      // Update typing status in database
      await mongoService.setTypingStatus(socket.userId, roomId, true);
      
      // Notify others in the room
      socket.to(roomId).emit('typing-start', {
        userId: socket.userId,
        userName: socket.userName,
        roomId,
        timestamp: new Date()
      });
      
      // Auto-stop typing after 3 seconds if no stop event received
      if (socket.typingTimeout) {
        clearTimeout(socket.typingTimeout);
      }
      
      socket.typingTimeout = setTimeout(async () => {
        await this.handleTypingStop(socket, { roomId });
      }, 3000);
      
    } catch (error) {
      console.error('Typing start error:', error);
    }
  }

  async handleTypingStop(socket, data) {
    try {
      const { roomId } = data;
      
      if (!roomId) {
        return;
      }
      
      // Clear typing timeout
      if (socket.typingTimeout) {
        clearTimeout(socket.typingTimeout);
        socket.typingTimeout = null;
      }
      
      // Update typing status in database
      await mongoService.setTypingStatus(socket.userId, roomId, false);
      
      // Notify others in the room
      socket.to(roomId).emit('typing-stop', {
        userId: socket.userId,
        userName: socket.userName,
        roomId,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('Typing stop error:', error);
    }
  }

  // Enhanced message reactions
  async handleAddReaction(socket, io, data) {
    try {
      const { messageId, reaction, roomId } = data;
      
      if (!messageId || !reaction || !roomId) {
        socket.emit('error', { 
          type: 'INVALID_REACTION',
          message: 'Message ID, reaction, and room ID are required' 
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
      
      // Validate reaction
      const allowedReactions = ['👍', '👎', '❤️', '😂', '😮', '😢', '😡', '👏', '🔥', '✅'];
      if (!allowedReactions.includes(reaction)) {
        socket.emit('error', { 
          type: 'INVALID_REACTION',
          message: 'Invalid reaction type' 
        });
        return;
      }
      
      // Add reaction to database
      await mongoService.addReaction(messageId, socket.userId, reaction);
      
      // Notify room participants
      io.to(roomId).emit('reaction-added', {
        messageId,
        reaction,
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });
      
      console.log(`Reaction ${reaction} added by ${socket.userId} to message ${messageId}`);
      
    } catch (error) {
      console.error('Add reaction error:', error);
      socket.emit('error', { 
        type: 'ADD_REACTION_ERROR',
        message: 'Failed to add reaction' 
      });
    }
  }

  async handleRemoveReaction(socket, io, data) {
    try {
      const { messageId, reaction, roomId } = data;
      
      // Remove reaction from database
      await mongoService.removeReaction(messageId, socket.userId, reaction);
      
      // Notify room participants
      io.to(roomId).emit('reaction-removed', {
        messageId,
        reaction,
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });
      
      console.log(`Reaction ${reaction} removed by ${socket.userId} from message ${messageId}`);
      
    } catch (error) {
      console.error('Remove reaction error:', error);
      socket.emit('error', { 
        type: 'REMOVE_REACTION_ERROR',
        message: 'Failed to remove reaction' 
      });
    }
  }

  // Enhanced admin broadcast with rich features
  async handleAdminBroadcast(socket, io, data) {
    try {
      if (socket.userRole !== 'admin') {
        socket.emit('error', { 
          type: 'PERMISSION_DENIED',
          message: 'Admin privileges required for broadcast' 
        });
        return;
      }
      
      const { 
        message, 
        targetUsers = 'all',
        priority = 'normal',
        expiresAt = null
      } = data;
      
      if (!message || message.trim().length === 0) {
        socket.emit('error', { 
          type: 'INVALID_BROADCAST',
          message: 'Broadcast message is required' 
        });
        return;
      }
      
      const broadcastMessage = {
        id: `broadcast_${Date.now()}`,
        type: 'admin-broadcast',
        senderId: socket.userId,
        senderName: socket.userName,
        senderRole: socket.userRole,
        message: message.trim(),
        priority, // 'low', 'normal', 'high', 'urgent'
        expiresAt,
        timestamp: new Date()
      };
      
      // Save broadcast to database for persistence
      const broadcastRoom = 'system-broadcasts';
      await mongoService.saveMessage({
        ...broadcastMessage,
        roomId: broadcastRoom
      });
      
      if (targetUsers === 'all') {
        // Broadcast to all connected users
        io.emit('admin-broadcast', broadcastMessage);
        console.log(`Admin broadcast sent to all users by ${socket.userId}`);
      } else if (Array.isArray(targetUsers)) {
        // Broadcast to specific users
        let deliveredCount = 0;
        targetUsers.forEach(userId => {
          const userSockets = io.sockets.adapter.rooms.get(`user:${userId}`);
          if (userSockets && userSockets.size > 0) {
            io.to(`user:${userId}`).emit('admin-broadcast', broadcastMessage);
            deliveredCount++;
          }
        });
        console.log(`Admin broadcast sent to ${deliveredCount}/${targetUsers.length} users by ${socket.userId}`);
        
        socket.emit('broadcast-status', {
          broadcastId: broadcastMessage.id,
          targetCount: targetUsers.length,
          deliveredCount,
          timestamp: new Date()
        });
      }
      
    } catch (error) {
      console.error('Admin broadcast error:', error);
      socket.emit('error', { 
        type: 'BROADCAST_ERROR',
        message: 'Failed to send broadcast' 
      });
    }
  }

  // Helper method to get current typing users
  async getTypingUsers(roomId) {
    try {
      // This would typically query the database for current typing users
      // For now, returning empty array - implement based on your storage
      return [];
    } catch (error) {
      console.error('Error getting typing users:', error);
      return [];
    }
  }

  // Helper method to send push notifications to offline users
  async sendPushNotifications(roomId, message, senderId) {
    try {
      // This would integrate with your notification service
      // to send push notifications to offline users
      console.log(`Push notification triggered for room ${roomId}`);
    } catch (error) {
      console.error('Push notification error:', error);
    }
  }

  // Message editing (new feature)
  async handleEditMessage(socket, io, data) {
    try {
      const { messageId, newMessage, roomId } = data;
      
      if (!messageId || !newMessage || !roomId) {
        socket.emit('error', { 
          type: 'INVALID_EDIT',
          message: 'Message ID, new content, and room ID are required' 
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
      
      // Update message in database (implement in mongoService)
      const updatedMessage = await mongoService.updateMessage(messageId, {
        message: newMessage.trim(),
        isEdited: true,
        editedAt: new Date()
      });
      
      if (updatedMessage) {
        // Notify room participants
        io.to(roomId).emit('message-edited', {
          messageId,
          newMessage: newMessage.trim(),
          editedAt: new Date(),
          editedBy: socket.userId
        });
        
        socket.emit('edit-success', { messageId, success: true });
      } else {
        socket.emit('error', { 
          type: 'EDIT_FAILED',
          message: 'Message not found or you cannot edit this message' 
        });
      }
      
    } catch (error) {
      console.error('Edit message error:', error);
      socket.emit('error', { 
        type: 'EDIT_MESSAGE_ERROR',
        message: 'Failed to edit message' 
      });
    }
  }

  // Message deletion (new feature)
  async handleDeleteMessage(socket, io, data) {
    try {
      const { messageId, roomId } = data;
      
      if (!messageId || !roomId) {
        socket.emit('error', { 
          type: 'INVALID_DELETE',
          message: 'Message ID and room ID are required' 
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
      
      // Delete message from database
      const deletedMessage = await mongoService.deleteMessage(messageId);
      
      if (deletedMessage) {
        // Notify room participants
        io.to(roomId).emit('message-deleted', {
          messageId,
          deletedAt: new Date(),
          deletedBy: socket.userId
        });
        
        socket.emit('delete-success', { messageId, success: true });
      } else {
        socket.emit('error', { 
          type: 'DELETE_FAILED',
          message: 'Message not found or you cannot delete this message' 
        });
      }
      
    } catch (error) {
      console.error('Delete message error:', error);
      socket.emit('error', { 
        type: 'DELETE_MESSAGE_ERROR',
        message: 'Failed to delete message' 
      });
    }
  }
}

module.exports = new MessageHandler();