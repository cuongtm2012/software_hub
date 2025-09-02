const { ObjectId } = require('mongodb');

class MongoService {
  constructor() {
    this.db = null;
    this.messages = null;
    this.rooms = null;
    this.users = null;
    this.userRooms = new Map();
    this.connected = false;
  }

  async connect() {
    try {
      if (global.mongoClient) {
        this.db = global.mongoClient.db('softwarehub-chat');
        this.messages = this.db.collection('messages');
        this.rooms = this.db.collection('rooms');
        this.users = this.db.collection('users');
        this.connected = true;
        
        // Create indexes for better performance
        await this.createIndexes();
        console.log('MongoDB service connected successfully');
        return true;
      } else {
        console.warn('MongoDB client not available, using in-memory storage');
        this.initializeInMemoryStorage();
        return false;
      }
    } catch (error) {
      console.warn('MongoDB connection failed, using in-memory storage:', error.message);
      this.initializeInMemoryStorage();
      return false;
    }
  }

  async createIndexes() {
    if (!this.connected) return;
    
    try {
      // Message indexes
      await this.messages.createIndex({ roomId: 1, timestamp: -1 });
      await this.messages.createIndex({ senderId: 1 });
      await this.messages.createIndex({ message: 'text' }); // For text search
      
      // Room indexes
      await this.rooms.createIndex({ participants: 1 });
      await this.rooms.createIndex({ type: 1 });
      await this.rooms.createIndex({ lastActivity: -1 });
      
      console.log('Database indexes created successfully');
    } catch (error) {
      console.warn('Failed to create indexes:', error.message);
    }
  }

  initializeInMemoryStorage() {
    // Fallback to in-memory storage if MongoDB is not available
    this.messages = new Map();
    this.rooms = new Map();
    this.userRooms = new Map();
    this.connected = false;
  }

  // Enhanced room management with better data structure
  async createRoom(roomData) {
    const roomId = new ObjectId().toString();
    const room = {
      _id: roomId,
      participants: roomData.participants,
      type: roomData.type || 'direct', // 'direct', 'group', 'channel'
      name: roomData.name,
      description: roomData.description || '',
      avatar: roomData.avatar || '',
      settings: {
        allowFileSharing: true,
        allowVoiceCalls: false,
        allowVideoCall: false,
        isEncrypted: false
      },
      metadata: {
        createdBy: roomData.createdBy,
        admins: roomData.admins || [roomData.createdBy],
        tags: roomData.tags || [],
        isArchived: false,
        isPinned: false
      },
      createdAt: new Date(),
      lastActivity: new Date(),
      lastMessage: null,
      unreadCount: {}
    };

    if (this.connected) {
      await this.rooms.insertOne(room);
    } else {
      this.rooms.set(roomId, room);
      // Update in-memory user rooms mapping
      room.participants.forEach(userId => {
        if (!this.userRooms.has(userId)) {
          this.userRooms.set(userId, []);
        }
        this.userRooms.get(userId).push(roomId);
      });
    }

    console.log(`Enhanced room created: ${roomId} (${room.type})`);
    return room;
  }

  // Enhanced message saving with rich content support
  async saveMessage(messageData) {
    const messageId = new ObjectId().toString();
    const message = {
      _id: messageId,
      roomId: messageData.roomId,
      senderId: messageData.senderId,
      senderName: messageData.senderName,
      senderAvatar: messageData.senderAvatar || '',
      message: messageData.message,
      type: messageData.type || 'text', // 'text', 'image', 'file', 'voice', 'video', 'system'
      metadata: {
        // Rich message content
        mentions: messageData.mentions || [],
        hashtags: messageData.hashtags || [],
        urls: messageData.urls || [],
        attachments: messageData.attachments || [],
        replyTo: messageData.replyTo || null,
        reactions: {},
        isEdited: false,
        isDeleted: false,
        readBy: {},
        deliveredTo: {}
      },
      timestamp: new Date(),
      editedAt: null,
      deletedAt: null
    };

    if (this.connected) {
      await this.messages.insertOne(message);
      // Update room's last message and activity
      await this.rooms.updateOne(
        { _id: messageData.roomId },
        { 
          $set: { 
            lastActivity: new Date(),
            lastMessage: {
              _id: messageId,
              message: message.message,
              senderId: message.senderId,
              senderName: message.senderName,
              timestamp: message.timestamp,
              type: message.type
            }
          },
          $inc: {
            [`unreadCount.${messageData.senderId}`]: 0 // Don't increment for sender
          }
        }
      );
      
      // Increment unread count for other participants
      const room = await this.rooms.findOne({ _id: messageData.roomId });
      if (room) {
        const otherParticipants = room.participants.filter(p => p !== messageData.senderId);
        const unreadUpdates = {};
        otherParticipants.forEach(participantId => {
          unreadUpdates[`unreadCount.${participantId}`] = 1;
        });
        
        if (Object.keys(unreadUpdates).length > 0) {
          await this.rooms.updateOne(
            { _id: messageData.roomId },
            { $inc: unreadUpdates }
          );
        }
      }
    } else {
      // In-memory storage
      if (!this.messages.has(messageData.roomId)) {
        this.messages.set(messageData.roomId, []);
      }
      this.messages.get(messageData.roomId).push(message);
      
      if (this.rooms.has(messageData.roomId)) {
        const room = this.rooms.get(messageData.roomId);
        room.lastActivity = new Date();
        room.lastMessage = {
          _id: messageId,
          message: message.message,
          senderId: message.senderId,
          senderName: message.senderName,
          timestamp: message.timestamp,
          type: message.type
        };
      }
    }

    console.log(`Enhanced message saved: ${messageId} in room ${messageData.roomId}`);
    return message;
  }

  // Enhanced user rooms with unread counts and last messages
  async getUserRooms(userId) {
    if (this.connected) {
      const rooms = await this.rooms.find({
        participants: userId,
        'metadata.isArchived': { $ne: true }
      }).sort({ lastActivity: -1 }).toArray();
      
      return rooms.map(room => ({
        ...room,
        unreadCount: room.unreadCount && room.unreadCount[userId] ? room.unreadCount[userId] : 0,
        isUnread: (room.unreadCount && room.unreadCount[userId] ? room.unreadCount[userId] : 0) > 0
      }));
    } else {
      // In-memory implementation - ensure userRooms exists
      if (!this.userRooms) {
        this.userRooms = new Map();
      }
      const roomIds = this.userRooms.get(userId) || [];
      const rooms = roomIds.map(roomId => {
        const room = this.rooms.get(roomId);
        return room;
      }).filter(Boolean);
      return rooms.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
    }
  }

  // Enhanced message retrieval with rich content
  async getRoomMessages(roomId, options = {}) {
    const { page = 1, limit = 50, beforeTimestamp, afterTimestamp } = options;
    
    if (this.connected) {
      const query = { 
        roomId,
        'metadata.isDeleted': { $ne: true }
      };
      
      if (beforeTimestamp) {
        query.timestamp = { $lt: new Date(beforeTimestamp) };
      }
      if (afterTimestamp) {
        query.timestamp = { $gt: new Date(afterTimestamp) };
      }
      
      const totalCount = await this.messages.countDocuments(query);
      const messages = await this.messages
        .find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();
      
      return {
        messages: messages.reverse(), // Oldest first for chat display
        totalCount,
        page,
        limit,
        hasMore: (page * limit) < totalCount
      };
    } else {
      // In-memory implementation (existing code)
      const messages = this.messages.get(roomId) || [];
      const sortedMessages = messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedMessages = sortedMessages.slice(start, end);
      
      return {
        messages: paginatedMessages.reverse(),
        totalCount: messages.length,
        page,
        limit,
        hasMore: end < messages.length
      };
    }
  }

  // Mark messages as read
  async markAsRead(roomId, userId, messageId = null) {
    if (this.connected) {
      // Reset unread count for this user in this room
      await this.rooms.updateOne(
        { _id: roomId },
        { $set: { [`unreadCount.${userId}`]: 0 } }
      );
      
      // Mark specific message as read if provided
      if (messageId) {
        await this.messages.updateOne(
          { _id: messageId, roomId },
          { $set: { [`metadata.readBy.${userId}`]: new Date() } }
        );
      } else {
        // Mark all messages in room as read for this user
        await this.messages.updateMany(
          { roomId },
          { $set: { [`metadata.readBy.${userId}`]: new Date() } }
        );
      }
    }
    
    console.log(`Messages marked as read for user ${userId} in room ${roomId}`);
  }

  // Enhanced message reactions
  async addReaction(messageId, userId, reaction) {
    const update = {
      $set: { [`metadata.reactions.${reaction}.${userId}`]: new Date() }
    };
    
    if (this.connected) {
      await this.messages.updateOne({ _id: messageId }, update);
    } else {
      // Find and update in memory
      for (const [roomId, messages] of this.messages.entries()) {
        const message = messages.find(msg => msg._id === messageId);
        if (message) {
          if (!message.metadata.reactions[reaction]) {
            message.metadata.reactions[reaction] = {};
          }
          message.metadata.reactions[reaction][userId] = new Date();
          break;
        }
      }
    }
    
    console.log(`Reaction ${reaction} added by user ${userId} to message ${messageId}`);
  }

  async removeReaction(messageId, userId, reaction) {
    const update = {
      $unset: { [`metadata.reactions.${reaction}.${userId}`]: "" }
    };
    
    if (this.connected) {
      await this.messages.updateOne({ _id: messageId }, update);
    }
    
    console.log(`Reaction ${reaction} removed by user ${userId} from message ${messageId}`);
  }

  // Enhanced search with filters
  async searchMessages(query, userId, options = {}) {
    const { roomId, limit = 20, type, dateFrom, dateTo } = options;
    
    if (this.connected) {
      const searchQuery = {
        $text: { $search: query },
        'metadata.isDeleted': { $ne: true }
      };
      
      if (roomId) {
        searchQuery.roomId = roomId;
      }
      
      if (type) {
        searchQuery.type = type;
      }
      
      if (dateFrom || dateTo) {
        searchQuery.timestamp = {};
        if (dateFrom) searchQuery.timestamp.$gte = new Date(dateFrom);
        if (dateTo) searchQuery.timestamp.$lte = new Date(dateTo);
      }
      
      // Only search in rooms where user is a participant
      const userRooms = await this.getUserRooms(userId);
      const roomIds = userRooms.map(room => room._id);
      searchQuery.roomId = { $in: roomIds };
      
      const results = await this.messages
        .find(searchQuery)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
      
      return results;
    } else {
      // In-memory search (existing implementation)
      const results = [];
      const searchInRoom = (roomId, messages) => {
        return messages.filter(msg => 
          msg.message.toLowerCase().includes(query.toLowerCase()) &&
          this.verifyRoomAccess(roomId, userId)
        );
      };
      
      if (roomId) {
        const messages = this.messages.get(roomId) || [];
        results.push(...searchInRoom(roomId, messages));
      } else {
        for (const [rId, messages] of this.messages.entries()) {
          results.push(...searchInRoom(rId, messages));
        }
      }
      
      return results
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    }
  }

  // User presence and typing indicators
  async updateUserPresence(userId, status, roomId = null) {
    const presenceData = {
      userId,
      status, // 'online', 'away', 'busy', 'offline'
      lastSeen: new Date(),
      roomId
    };
    
    if (this.connected) {
      await this.users.updateOne(
        { _id: userId },
        { $set: { presence: presenceData } },
        { upsert: true }
      );
    }
    
    return presenceData;
  }

  async setTypingStatus(userId, roomId, isTyping) {
    const typingData = {
      userId,
      roomId,
      isTyping,
      timestamp: new Date()
    };
    
    if (this.connected) {
      if (isTyping) {
        await this.users.updateOne(
          { _id: userId },
          { $set: { [`typing.${roomId}`]: typingData } },
          { upsert: true }
        );
      } else {
        await this.users.updateOne(
          { _id: userId },
          { $unset: { [`typing.${roomId}`]: "" } }
        );
      }
    }
    
    return typingData;
  }

  // Verify room access (existing method enhanced)
  async verifyRoomAccess(roomId, userId) {
    if (this.connected) {
      const room = await this.rooms.findOne({
        _id: roomId,
        participants: userId
      });
      return !!room;
    } else {
      const room = this.rooms.get(roomId);
      return room && room.participants.includes(userId);
    }
  }

  // Get room details by ID
  async getRoom(roomId) {
    if (this.connected) {
      const room = await this.rooms.findOne({ _id: roomId });
      return room;
    } else {
      return this.rooms.get(roomId);
    }
  }
}

module.exports = new MongoService();