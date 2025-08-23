const mongoService = require('../services/mongoService');

class ChatController {
  // Initialize MongoDB connection
  async initialize() {
    await mongoService.connect();
  }

  // Enhanced user rooms with rich metadata
  async getUserRooms(req, res) {
    try {
      const { userId } = req.params;
      const rooms = await mongoService.getUserRooms(userId);
      
      // Add online status for participants
      const enrichedRooms = await Promise.all(rooms.map(async room => {
        const participantsWithStatus = await Promise.all(
          room.participants.map(async participantId => {
            // In a real implementation, you'd fetch user details from main app
            return {
              id: participantId,
              isOnline: false, // This would be fetched from presence service
              lastSeen: new Date()
            };
          })
        );
        
        return {
          ...room,
          participantsWithStatus,
          unreadCount: room.unreadCount || 0,
          isUnread: (room.unreadCount || 0) > 0
        };
      }));
      
      res.json({ 
        success: true,
        rooms: enrichedRooms,
        totalCount: enrichedRooms.length
      });
    } catch (error) {
      console.error('Failed to get user rooms:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user rooms',
        message: error.message
      });
    }
  }

  // Enhanced message retrieval with pagination and filters
  async getRoomMessages(req, res) {
    try {
      const { roomId } = req.params;
      const { 
        page = 1, 
        limit = 50, 
        beforeTimestamp, 
        afterTimestamp,
        messageType 
      } = req.query;
      
      // Verify user has access to this room
      const userId = req.user?.id || req.headers['x-user-id'];
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
      }
      
      const hasAccess = await mongoService.verifyRoomAccess(roomId, userId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this room'
        });
      }
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        beforeTimestamp,
        afterTimestamp
      };
      
      if (messageType) {
        options.type = messageType;
      }
      
      const result = await mongoService.getRoomMessages(roomId, options);
      
      // Mark messages as read for this user
      await mongoService.markAsRead(roomId, userId);
      
      res.json({ 
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Failed to get room messages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get room messages',
        message: error.message
      });
    }
  }

  // Enhanced room creation with validation and rich features
  async createRoom(req, res) {
    try {
      const { 
        participants, 
        type = 'direct', 
        name, 
        description,
        avatar,
        settings = {},
        tags = []
      } = req.body;
      
      const createdBy = req.user?.id || req.headers['x-user-id'];
      
      if (!createdBy) {
        return res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
      }
      
      // Validation
      if (!participants || !Array.isArray(participants) || participants.length < 1) {
        return res.status(400).json({
          success: false,
          error: 'At least 1 participant required'
        });
      }
      
      // Add creator to participants if not already included
      if (!participants.includes(createdBy)) {
        participants.push(createdBy);
      }
      
      // Validate room type
      const validTypes = ['direct', 'group', 'channel'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid room type. Must be: direct, group, or channel'
        });
      }
      
      // For direct messages, ensure only 2 participants
      if (type === 'direct' && participants.length !== 2) {
        return res.status(400).json({
          success: false,
          error: 'Direct rooms must have exactly 2 participants'
        });
      }
      
      // Check if direct room already exists
      if (type === 'direct') {
        const existingRooms = await mongoService.getUserRooms(createdBy);
        const existingDirectRoom = existingRooms.find(room => 
          room.type === 'direct' && 
          room.participants.length === 2 &&
          room.participants.includes(participants.find(p => p !== createdBy))
        );
        
        if (existingDirectRoom) {
          return res.json({
            success: true,
            room: existingDirectRoom,
            isExisting: true,
            message: 'Direct room already exists'
          });
        }
      }

      const roomData = {
        participants,
        type,
        name: name || (type === 'direct' ? null : `${type.charAt(0).toUpperCase() + type.slice(1)} Chat`),
        description,
        avatar,
        createdBy,
        admins: [createdBy],
        tags: Array.isArray(tags) ? tags : [],
        settings: {
          allowFileSharing: true,
          allowVoiceCalls: false,
          allowVideoCall: false,
          isEncrypted: false,
          ...settings
        }
      };

      const room = await mongoService.createRoom(roomData);

      res.status(201).json({ 
        success: true,
        room,
        message: 'Room created successfully'
      });
    } catch (error) {
      console.error('Failed to create room:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create room',
        message: error.message
      });
    }
  }

  // Search messages across rooms
  async searchMessages(req, res) {
    try {
      const { q: query, roomId, type, dateFrom, dateTo, limit = 20 } = req.query;
      const userId = req.user?.id || req.headers['x-user-id'];
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
      }
      
      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Search query must be at least 2 characters'
        });
      }
      
      const options = {
        roomId,
        type,
        dateFrom,
        dateTo,
        limit: parseInt(limit)
      };
      
      const results = await mongoService.searchMessages(query.trim(), userId, options);
      
      res.json({
        success: true,
        results,
        query: query.trim(),
        totalCount: results.length
      });
    } catch (error) {
      console.error('Failed to search messages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search messages',
        message: error.message
      });
    }
  }

  // Mark room messages as read
  async markAsRead(req, res) {
    try {
      const { roomId } = req.params;
      const { messageId } = req.body;
      const userId = req.user?.id || req.headers['x-user-id'];
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
      }
      
      const hasAccess = await mongoService.verifyRoomAccess(roomId, userId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this room'
        });
      }
      
      await mongoService.markAsRead(roomId, userId, messageId);
      
      res.json({
        success: true,
        message: 'Messages marked as read'
      });
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark messages as read',
        message: error.message
      });
    }
  }

  // Add reaction to message
  async addReaction(req, res) {
    try {
      const { messageId } = req.params;
      const { reaction } = req.body;
      const userId = req.user?.id || req.headers['x-user-id'];
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
      }
      
      if (!reaction || typeof reaction !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Valid reaction required'
        });
      }
      
      // Validate reaction (emoji or allowed reactions)
      const allowedReactions = ['👍', '👎', '❤️', '😂', '😮', '😢', '😡', '👏', '🔥', '✅'];
      if (!allowedReactions.includes(reaction)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid reaction. Allowed reactions: ' + allowedReactions.join(', ')
        });
      }
      
      await mongoService.addReaction(messageId, userId, reaction);
      
      res.json({
        success: true,
        message: 'Reaction added successfully'
      });
    } catch (error) {
      console.error('Failed to add reaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add reaction',
        message: error.message
      });
    }
  }

  // Remove reaction from message
  async removeReaction(req, res) {
    try {
      const { messageId } = req.params;
      const { reaction } = req.body;
      const userId = req.user?.id || req.headers['x-user-id'];
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
      }
      
      await mongoService.removeReaction(messageId, userId, reaction);
      
      res.json({
        success: true,
        message: 'Reaction removed successfully'
      });
    } catch (error) {
      console.error('Failed to remove reaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove reaction',
        message: error.message
      });
    }
  }

  // Get room details with participants and settings
  async getRoomDetails(req, res) {
    try {
      const { roomId } = req.params;
      const userId = req.user?.id || req.headers['x-user-id'];
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
      }
      
      const hasAccess = await mongoService.verifyRoomAccess(roomId, userId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this room'
        });
      }
      
      // In a real implementation, you'd fetch the room details from MongoDB
      res.json({
        success: true,
        message: 'Room details endpoint - implement based on your needs'
      });
    } catch (error) {
      console.error('Failed to get room details:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get room details',
        message: error.message
      });
    }
  }

  // Update user presence
  async updatePresence(req, res) {
    try {
      const { status, roomId } = req.body;
      const userId = req.user?.id || req.headers['x-user-id'];
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
      }
      
      const validStatuses = ['online', 'away', 'busy', 'offline'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be: ' + validStatuses.join(', ')
        });
      }
      
      const presenceData = await mongoService.updateUserPresence(userId, status, roomId);
      
      res.json({
        success: true,
        presence: presenceData,
        message: 'Presence updated successfully'
      });
    } catch (error) {
      console.error('Failed to update presence:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update presence',
        message: error.message
      });
    }
  }
}

module.exports = new ChatController();