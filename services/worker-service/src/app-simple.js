require('dotenv').config();

const express = require('express');
const cors = require('cors');

class WorkerService {
  constructor() {
    this.isRunning = false;
    this.app = express();
    this.server = null;
    
    // Setup Express middleware
    this.app.use(cors());
    this.app.use(express.json());
    
    // Setup routes
    this.setupRoutes();
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: this.isRunning ? 'ok' : 'not_running',
        service: 'worker-service',
        timestamp: new Date().toISOString()
      });
    });

    // Queue processing endpoint for other services
    this.app.post('/api/queue/process', async (req, res) => {
      try {
        const { queueName, messageData } = req.body;
        
        if (!queueName || !messageData) {
          return res.status(400).json({
            success: false,
            error: 'queueName and messageData are required'
          });
        }

        // Process the queue message immediately (simplified)
        console.log(`📤 Processing ${queueName} queue:`, messageData.type);
        
        if (queueName === 'notification-queue' && messageData.type === 'chat-notification') {
          // Forward to notification service
          await this.forwardToNotificationService(messageData.data);
        } else if (queueName === 'chat-queue') {
          // Process chat-related tasks
          await this.processChatTask(messageData);
        }

        res.json({ success: true, messageId: Date.now().toString() });
        
      } catch (error) {
        console.error('❌ Queue processing API error:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Queue statistics endpoint
    this.app.get('/api/queue/stats', async (req, res) => {
      res.json({
        queues: {
          'notification-queue': { pending: 0, processing: 0 },
          'chat-queue': { pending: 0, processing: 0 }
        }
      });
    });
  }

  async forwardToNotificationService(notificationData) {
    try {
      const axios = require('axios');
      const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003';
      
      const response = await axios.post(`${notificationServiceUrl}/api/notifications/send`, {
        type: 'chat',
        recipientId: notificationData.recipientId,
        title: `New message from ${notificationData.senderName}`,
        message: notificationData.messagePreview,
        data: {
          chatId: notificationData.chatId,
          senderId: notificationData.senderId
        }
      }, { timeout: 5000 });

      console.log(`📱 Chat notification forwarded to notification service for user ${notificationData.recipientId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to forward notification:`, error.message);
      // Don't throw - just log the error so the queue doesn't fail
    }
  }

  async processChatTask(messageData) {
    switch (messageData.type) {
      case 'message-analytics':
        console.log(`📊 Processing message analytics for room ${messageData.data.roomId}`);
        // Add analytics processing logic here
        break;
      case 'content-moderation':
        console.log(`🔍 Processing content moderation for message ${messageData.data.messageId}`);
        // Add content moderation logic here
        break;
      default:
        console.log(`❓ Unknown chat task type: ${messageData.type}`);
    }
  }

  async start() {
    console.log('🚀 Starting Worker Service (Simplified Mode)...');
    
    try {
      // Start HTTP server
      const PORT = process.env.PORT || 3005;
      this.server = this.app.listen(PORT, () => {
        console.log(`🌐 Worker Service HTTP API listening on port ${PORT}`);
      });
      
      this.isRunning = true;
      console.log('🎉 Worker service started successfully');
      
      // Graceful shutdown handling
      process.on('SIGINT', () => this.shutdown());
      process.on('SIGTERM', () => this.shutdown());
      
    } catch (error) {
      console.error('💥 Failed to start Worker Service:', error);
      process.exit(1);
    }
  }

  async shutdown() {
    if (!this.isRunning) return;
    
    console.log('🛑 Shutting down Worker Service...');
    
    try {
      if (this.server) {
        this.server.close();
        console.log('🛑 HTTP server stopped');
      }
      
      this.isRunning = false;
      console.log('✅ Worker Service shut down successfully');
      process.exit(0);
      
    } catch (error) {
      console.error('💥 Error during shutdown:', error);
      process.exit(1);
    }
  }
}

const workerService = new WorkerService();

// Start the service
workerService.start().catch(error => {
  console.error('💥 Failed to start worker service:', error);
  process.exit(1);
});

module.exports = workerService;