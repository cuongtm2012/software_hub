const redisService = require('../services/redisService');

class ChatWorker {
  constructor() {
    this.name = 'ChatWorker';
    this.isRunning = false;
    this.processInterval = null;
  }

  async start() {
    console.log(`Starting ${this.name}...`);
    this.isRunning = true;
    
    // Start processing queue
    this.processInterval = setInterval(() => {
      this.processQueue().catch(error => {
        console.error(`${this.name} processing error:`, error);
      });
    }, 1500); // Check queue every 1.5 seconds
    
    console.log(`${this.name} started`);
  }

  async stop() {
    console.log(`Stopping ${this.name}...`);
    this.isRunning = false;
    
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }
    
    console.log(`${this.name} stopped`);
  }

  async processQueue() {
    if (!this.isRunning) return;
    
    try {
      const job = await redisService.popFromQueue('chat-queue');
      if (!job) return;
      
      console.log(`${this.name} processing job:`, job.id);
      
      switch (job.type) {
        case 'message-analytics':
          await this.handleMessageAnalytics(job);
          break;
        case 'content-moderation':
          await this.handleContentModeration(job);
          break;
        case 'room-cleanup':
          await this.handleRoomCleanup(job);
          break;
        case 'user-activity':
          await this.handleUserActivity(job);
          break;
        default:
          console.warn(`${this.name} unknown job type:`, job.type);
      }
      
      console.log(`${this.name} completed job:`, job.id);
      
    } catch (error) {
      console.error(`${this.name} job processing error:`, error);
      // In production, might want to retry or move to dead letter queue
    }
  }

  async handleMessageAnalytics(job) {
    const { roomId, messageId, messageData } = job.data;
    
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

  async handleContentModeration(job) {
    const { messageId, messageData, roomId } = job.data;
    
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

  async handleRoomCleanup(job) {
    const { roomId, cleanupType } = job.data;
    
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

  async handleUserActivity(job) {
    const { userId, activityType, metadata } = job.data;
    
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
      isRunning: this.isRunning,
      hasProcessInterval: !!this.processInterval
    };
  }
}

module.exports = new ChatWorker();