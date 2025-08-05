// MongoDB service for chat history storage
// In development, we'll use an in-memory implementation
// In production, replace with actual MongoDB client

class MongoService {
  constructor() {
    this.messages = new Map();
    this.rooms = new Map();
    this.userRooms = new Map();
  }

  // Room management
  async createRoom(roomData) {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const room = {
      id: roomId,
      ...roomData,
      createdAt: new Date(),
      lastActivity: new Date()
    };
    
    this.rooms.set(roomId, room);
    
    // Add room to each participant's room list
    roomData.participants.forEach(userId => {
      if (!this.userRooms.has(userId)) {
        this.userRooms.set(userId, []);
      }
      this.userRooms.get(userId).push(roomId);
    });
    
    console.log(`Room created: ${roomId}`);
    return room;
  }

  async getUserRooms(userId) {
    const roomIds = this.userRooms.get(userId) || [];
    const rooms = roomIds.map(roomId => this.rooms.get(roomId)).filter(Boolean);
    return rooms;
  }

  async verifyRoomAccess(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    
    return room.participants.includes(userId);
  }

  // Message management
  async saveMessage(messageData) {
    const messageId = messageData.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const message = {
      ...messageData,
      id: messageId,
      createdAt: new Date()
    };
    
    if (!this.messages.has(messageData.roomId)) {
      this.messages.set(messageData.roomId, []);
    }
    
    this.messages.get(messageData.roomId).push(message);
    
    // Update room's last activity
    if (this.rooms.has(messageData.roomId)) {
      this.rooms.get(messageData.roomId).lastActivity = new Date();
    }
    
    console.log(`Message saved: ${messageId} in room ${messageData.roomId}`);
    return message;
  }

  async getRoomMessages(roomId, options = {}) {
    const { page = 1, limit = 50 } = options;
    const messages = this.messages.get(roomId) || [];
    
    // Sort by timestamp (newest first)
    const sortedMessages = messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedMessages = sortedMessages.slice(start, end);
    
    return {
      messages: paginatedMessages.reverse(), // Return oldest first for chat display
      totalCount: messages.length,
      page,
      limit,
      hasMore: end < messages.length
    };
  }

  async updateMessage(messageId, updates) {
    // Find and update message across all rooms
    for (const [roomId, messages] of this.messages.entries()) {
      const messageIndex = messages.findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        messages[messageIndex] = {
          ...messages[messageIndex],
          ...updates,
          edited: true,
          editedAt: new Date()
        };
        console.log(`Message updated: ${messageId}`);
        return messages[messageIndex];
      }
    }
    return null;
  }

  async deleteMessage(messageId) {
    // Find and delete message across all rooms
    for (const [roomId, messages] of this.messages.entries()) {
      const messageIndex = messages.findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        const deletedMessage = messages.splice(messageIndex, 1)[0];
        console.log(`Message deleted: ${messageId}`);
        return deletedMessage;
      }
    }
    return null;
  }

  // Search functionality
  async searchMessages(query, userId, options = {}) {
    const { roomId, limit = 20 } = options;
    const results = [];
    
    const searchInRoom = (roomId, messages) => {
      return messages.filter(msg => 
        msg.message.toLowerCase().includes(query.toLowerCase()) &&
        this.verifyRoomAccess(roomId, userId)
      );
    };
    
    if (roomId) {
      // Search in specific room
      const messages = this.messages.get(roomId) || [];
      results.push(...searchInRoom(roomId, messages));
    } else {
      // Search across all accessible rooms
      for (const [rId, messages] of this.messages.entries()) {
        results.push(...searchInRoom(rId, messages));
      }
    }
    
    return results
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }
}

module.exports = new MongoService();