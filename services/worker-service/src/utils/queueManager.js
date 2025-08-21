const redisSMQService = require('./services/redisSMQService');
const config = require('./config/redisSMQConfig');

class QueueManager {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    try {
      await redisSMQService.connect();
      await redisSMQService.initializeQueues();
      this.isConnected = true;
      console.log('✅ Queue Manager connected to Redis SMQ');
    } catch (error) {
      console.error('❌ Failed to connect Queue Manager:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await redisSMQService.disconnect();
      this.isConnected = false;
      console.log('🛑 Queue Manager disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting Queue Manager:', error);
    }
  }

  // Add test messages to queues
  async addTestMessages() {
    if (!this.isConnected) {
      throw new Error('Queue Manager not connected');
    }

    const testMessages = [
      {
        queue: 'email-queue',
        data: {
          type: 'welcome_email',
          recipient: 'test@example.com',
          subject: 'Welcome to SoftwareHub!',
          template: 'welcome',
          data: { username: 'testuser', activationLink: 'https://example.com/activate' }
        }
      },
      {
        queue: 'notification-queue',
        data: {
          type: 'push_notification',
          userId: 'user123',
          title: 'Test Notification',
          body: 'This is a test notification from Redis SMQ',
          data: { action: 'test', timestamp: Date.now() }
        }
      },
      {
        queue: 'chat-queue',
        data: {
          type: 'chat_message',
          roomId: 'room123',
          senderId: 'user456',
          message: 'Hello from Redis SMQ!',
          timestamp: Date.now()
        }
      }
    ];

    const results = [];
    for (const msg of testMessages) {
      try {
        const messageId = await redisSMQService.addToQueue(msg.queue, msg.data);
        results.push({ queue: msg.queue, messageId, status: 'success' });
        console.log(`📤 Test message added to ${msg.queue}: ${messageId}`);
      } catch (error) {
        results.push({ queue: msg.queue, error: error.message, status: 'failed' });
        console.error(`❌ Failed to add test message to ${msg.queue}:`, error);
      }
    }

    return results;
  }

  // Get comprehensive queue statistics
  async getDetailedStats() {
    if (!this.isConnected) {
      throw new Error('Queue Manager not connected');
    }

    try {
      const stats = await redisSMQService.getQueueStats();
      const queueNames = Object.keys(config.smq.queues);
      
      const detailedStats = {
        overview: stats,
        queues: {},
        timestamp: new Date().toISOString()
      };

      for (const queueName of queueNames) {
        try {
          const queueStats = await redisSMQService.getQueueSize(queueName);
          detailedStats.queues[queueName] = {
            size: queueStats,
            config: config.smq.queues[queueName]
          };
        } catch (error) {
          detailedStats.queues[queueName] = {
            error: error.message
          };
        }
      }

      return detailedStats;
    } catch (error) {
      console.error('❌ Failed to get detailed stats:', error);
      throw error;
    }
  }

  // Purge all queues (useful for testing)
  async purgeAllQueues() {
    if (!this.isConnected) {
      throw new Error('Queue Manager not connected');
    }

    const queueNames = Object.keys(config.smq.queues);
    const results = [];

    for (const queueName of queueNames) {
      try {
        await redisSMQService.purgeQueue(queueName);
        results.push({ queue: queueName, status: 'purged' });
        console.log(`🗑️ Queue ${queueName} purged`);
      } catch (error) {
        results.push({ queue: queueName, error: error.message, status: 'failed' });
        console.error(`❌ Failed to purge queue ${queueName}:`, error);
      }
    }

    return results;
  }

  // Monitor queue activity in real-time
  async startMonitoring(intervalMs = 10000) {
    if (!this.isConnected) {
      throw new Error('Queue Manager not connected');
    }

    console.log(`👀 Starting queue monitoring (interval: ${intervalMs}ms)`);
    
    const monitoringInterval = setInterval(async () => {
      try {
        const stats = await this.getDetailedStats();
        console.log('📊 Queue Monitoring Report:');
        console.log(JSON.stringify(stats, null, 2));
      } catch (error) {
        console.error('❌ Monitoring error:', error);
      }
    }, intervalMs);

    // Return a function to stop monitoring
    return () => {
      clearInterval(monitoringInterval);
      console.log('🛑 Queue monitoring stopped');
    };
  }

  // Health check for the queue system
  async healthCheck() {
    try {
      const isConnected = redisSMQService.isConnected();
      if (!isConnected) {
        return { status: 'unhealthy', reason: 'Not connected to Redis SMQ' };
      }

      const stats = await redisSMQService.getQueueStats();
      const queueCount = Object.keys(config.smq.queues).length;

      return {
        status: 'healthy',
        connected: true,
        queuesConfigured: queueCount,
        redisSMQVersion: require('redis-smq/package.json').version,
        stats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        reason: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = QueueManager;