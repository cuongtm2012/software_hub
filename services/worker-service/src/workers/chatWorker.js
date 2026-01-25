const redisSMQService = require('../services/redisSMQService');

class ChatWorker {
  constructor() {
    this.name = 'ChatWorker';
    this.isRunning = false;
    this.queueName = 'chat-queue';
  }

  async start() {
    console.log(`Starting ${this.name}...`);
    this.isRunning = true;
    
    // Start consuming messages from Redis SMQ
    await redisSMQService.startConsumer(
      this.queueName, 
      this.handleMessage.bind(this),
      { 
        concurrency: 2, // Process up to 2 chat jobs concurrently
        retryThreshold: 3 
      }
    );
    
    console.log(`${this.name} started and consuming from ${this.queueName}`);
  }

  async stop() {
    console.log(`Stopping ${this.name}...`);
    this.isRunning = false;
    
    // Stop consuming messages
    await redisSMQService.stopConsumer(this.queueName);
    
    console.log(`${this.name} stopped`);
  }

  async handleMessage(message, messageId) {
    if (!this.isRunning) return;
    
    console.log(`${this.name} processing message:`, messageId);
    
    try {
      switch (message.type) {
        case 'message-analytics':
          await this.handleMessageAnalytics(message);
          break;
        case 'content-moderation':
          await this.handleContentModeration(message);
          break;
        case 'room-cleanup':
          await this.handleRoomCleanup(message);
          break;
        case 'user-activity':
          await this.handleUserActivity(message);
          break;
        default:
          console.warn(`${this.name} unknown message type:`, message.type);
          throw new Error(`Unknown message type: ${message.type}`);
      }
      
      // Success - Redis SMQ will automatically acknowledge via the callback
      console.log(`${this.name} completed message:`, messageId);
      
    } catch (error) {
      console.error(`${this.name} message processing error:`, error);
      throw error; // Let Redis SMQ handle the retry mechanism
    }
  }

  async handleMessageAnalytics(message) {
    const { roomId, messageId, messageData } = message.data;
    
    // Process message for analytics
    // - Word count
    // - Sentiment analysis
    // - User engagement metrics
    // - Peak activity times
    
    const analytics = {
      roomId,
      messageId,
      wordCount: messageData.message.split(' ').length,
      timestamp: new Date(),
      userId: messageData.senderId,
      messageType: messageData.type
    };
    
    // In production, save analytics to database
    console.log(`Message analytics processed for room ${roomId}:`, analytics);
  }

  async handleContentModeration(message) {
    const { messageId, messageData, roomId } = message.data;
    
    // Content moderation checks
    const moderationResult = {
      messageId,
      roomId,
      flags: [],
      score: 0,
      action: 'none'
    };
    
    // Basic profanity check (in production, use proper content moderation service)
    const profanityWords = ['spam', 'abuse', 'harmful'];
    const messageText = messageData.message.toLowerCase();
    
    for (const word of profanityWords) {
      if (messageText.includes(word)) {
        moderationResult.flags.push(`profanity:${word}`);
        moderationResult.score += 10;
      }
    }
    
    // Determine action based on score
    if (moderationResult.score >= 20) {
      moderationResult.action = 'block';
    } else if (moderationResult.score >= 10) {
      moderationResult.action = 'flag';
    }
    
    if (moderationResult.action !== 'none') {
      console.log(`Content moderation action (${moderationResult.action}) for message ${messageId}:`, moderationResult);
      // In production, take appropriate action (remove message, notify admins, etc.)
    }
  }

  async handleRoomCleanup(message) {
    const { roomId, cleanupType } = message.data;
    
    switch (cleanupType) {
      case 'old-messages':
        // Clean up messages older than retention period
        console.log(`Cleaning up old messages in room ${roomId}`);
        break;
      case 'inactive-users':
        // Remove inactive users from room
        console.log(`Removing inactive users from room ${roomId}`);
        break;
      case 'temporary-data':
        // Clean up temporary data (typing indicators, etc.)
        console.log(`Cleaning temporary data for room ${roomId}`);
        break;
      default:
        console.log(`Unknown cleanup type: ${cleanupType}`);
    }
  }

  async handleUserActivity(message) {
    const { userId, activityType, metadata } = message.data;
    
    // Track user activity for insights
    const activity = {
      userId,
      type: activityType,
      timestamp: new Date(),
      metadata
    };
    
    // Activities might include:
    // - message_sent
    // - room_joined
    // - room_left
    // - typing_started
    // - typing_stopped
    
    console.log(`User activity tracked:`, activity);
    
    // In production, save to analytics database
    // Update user engagement scores
    // Trigger notifications if needed
  }

  getStatus() {
    return {
      name: this.name,
      isRunning: this.isRunning,
      queueName: this.queueName,
      redisConnected: redisSMQService.isConnected
    };
  }
}

module.exports = new ChatWorker();