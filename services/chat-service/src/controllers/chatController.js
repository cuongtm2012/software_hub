const mongoService = require('../services/mongoService');

class ChatController {
  async getUserRooms(req, res) {
    try {
      const { userId } = req.params;
      const rooms = await mongoService.getUserRooms(userId);
      res.json({ rooms });
    } catch (error) {
      console.error('Failed to get user rooms:', error);
      res.status(500).json({
        error: 'Failed to get user rooms',
        message: error.message
      });
    }
  }

  async getRoomMessages(req, res) {
    try {
      const { roomId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      
      const messages = await mongoService.getRoomMessages(roomId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });
      
      res.json({ messages });
    } catch (error) {
      console.error('Failed to get room messages:', error);
      res.status(500).json({
        error: 'Failed to get room messages',
        message: error.message
      });
    }
  }

  async createRoom(req, res) {
    try {
      const { participants, type = 'direct', name } = req.body;
      
      if (!participants || participants.length < 2) {
        return res.status(400).json({
          error: 'At least 2 participants required'
        });
      }

      const room = await mongoService.createRoom({
        participants,
        type,
        name,
        createdAt: new Date()
      });

      res.json({ room });
    } catch (error) {
      console.error('Failed to create room:', error);
      res.status(500).json({
        error: 'Failed to create room',
        message: error.message
      });
    }
  }
}

module.exports = new ChatController();