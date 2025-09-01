const { RedisSMQ } = require('redis-smq');

class RedisSMQService {
  constructor() {
    this.producer = null;
    this.consumer = null;
    this.isConnected = false;
    this.config = {
      namespace: 'softwarehub',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || null,
        db: parseInt(process.env.REDIS_DB) || 0,
      },
      messages: {
        store: true, // Store messages for reliability
        expire: 3600 // Message expiration in seconds (1 hour)
      },
      queues: {
        'email-queue': {
          rateLimit: 100, // Max 100 messages per minute
          priority: 10,
          retry: {
            enabled: true,
            attempts: 3,
            delay: 1000,
            backoff: 'exponential'
          }
        },
        'notification-queue': {
          rateLimit: 200,
          priority: 8,
          retry: {
            enabled: true,
            attempts: 3,
            delay: 1000,
            backoff: 'exponential'
          }
        },
        'chat-queue': {
          rateLimit: 500,
          priority: 15,
          retry: {
            enabled: true,
            attempts: 2,
            delay: 500,
            backoff: 'linear'
          }
        },
        'file-processing-queue': {
          rateLimit: 50,
          priority: 5,
          retry: {
            enabled: true,
            attempts: 5,
            delay: 2000,
            backoff: 'exponential'
          }
        }
      }
    };
  }

  async connect() {
    try {
      console.log('🔄 Connecting to Redis SMQ...');
      
      // Initialize producer
      this.producer = new RedisSMQ.Producer(this.config);
      await this.producer.run();
      
      // Initialize consumer
      this.consumer = new RedisSMQ.Consumer(this.config);
      
      // Setup queue configurations
      await this.setupQueues();
      
      this.isConnected = true;
      console.log('✅ Redis SMQ connected successfully');
      
      // Setup error handlers
      this.setupErrorHandlers();
      
    } catch (error) {
      console.error('❌ Failed to connect to Redis SMQ:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async setupQueues() {
    try {
      for (const [queueName, queueConfig] of Object.entries(this.config.queues)) {
        await this.producer.createQueue(queueName, {
          rateLimit: queueConfig.rateLimit,
          priority: queueConfig.priority,
          retry: queueConfig.retry
        });
        console.log(`📋 Queue configured: ${queueName}`);
      }
    } catch (error) {
      console.error('❌ Error setting up queues:', error);
      throw error;
    }
  }

  setupErrorHandlers() {
    // Producer error handling
    this.producer.on('error', (error) => {
      console.error('🚨 Redis SMQ Producer error:', error);
    });

    // Consumer error handling
    this.consumer.on('error', (error) => {
      console.error('🚨 Redis SMQ Consumer error:', error);
    });

    // Message processing error handling
    this.consumer.on('message.error', (error, messageId) => {
      console.error(`🚨 Message processing error for ${messageId}:`, error);
    });

    // Dead letter queue handling
    this.consumer.on('message.dead_letter', (messageId, queueName) => {
      console.warn(`💀 Message ${messageId} moved to dead letter queue from ${queueName}`);
    });
  }

  // Producer methods
  async publishMessage(queueName, messageType, data, options = {}) {
    if (!this.isConnected) {
      throw new Error('Redis SMQ not connected');
    }

    try {
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: messageType,
        data,
        timestamp: new Date().toISOString(),
        ...options
      };

      const messageId = await this.producer.produce(queueName, message, {
        priority: options.priority || 0,
        delay: options.delay || 0,
        ttl: options.ttl || this.config.messages.expire
      });

      console.log(`📤 Message published to ${queueName}: ${messageId}`);
      return messageId;
    } catch (error) {
      console.error(`❌ Failed to publish message to ${queueName}:`, error);
      throw error;
    }
  }

  // Consumer methods
  async startConsumer(queueName, messageHandler, options = {}) {
    if (!this.isConnected) {
      throw new Error('Redis SMQ not connected');
    }

    try {
      await this.consumer.consume(queueName, messageHandler, {
        concurrency: options.concurrency || 1,
        messageRetryThreshold: options.retryThreshold || 3
      });

      console.log(`🔄 Consumer started for queue: ${queueName}`);
    } catch (error) {
      console.error(`❌ Failed to start consumer for ${queueName}:`, error);
      throw error;
    }
  }

  async stopConsumer(queueName) {
    try {
      await this.consumer.cancel(queueName);
      console.log(`⏹️ Consumer stopped for queue: ${queueName}`);
    } catch (error) {
      console.error(`❌ Failed to stop consumer for ${queueName}:`, error);
      throw error;
    }
  }

  // Message acknowledgment
  async acknowledgeMessage(messageId) {
    try {
      await this.consumer.acknowledge(messageId);
      console.log(`✅ Message acknowledged: ${messageId}`);
    } catch (error) {
      console.error(`❌ Failed to acknowledge message ${messageId}:`, error);
      throw error;
    }
  }

  async rejectMessage(messageId, requeue = true) {
    try {
      await this.consumer.reject(messageId, requeue);
      console.log(`❌ Message rejected: ${messageId} (requeue: ${requeue})`);
    } catch (error) {
      console.error(`❌ Failed to reject message ${messageId}:`, error);
      throw error;
    }
  }

  // Queue management
  async getQueueStats(queueName) {
    try {
      const stats = await this.producer.getQueueStats(queueName);
      return stats;
    } catch (error) {
      console.error(`❌ Failed to get stats for queue ${queueName}:`, error);
      throw error;
    }
  }

  async purgeQueue(queueName) {
    try {
      await this.producer.purgeQueue(queueName);
      console.log(`🗑️ Queue purged: ${queueName}`);
    } catch (error) {
      console.error(`❌ Failed to purge queue ${queueName}:`, error);
      throw error;
    }
  }

  async deleteQueue(queueName) {
    try {
      await this.producer.deleteQueue(queueName);
      console.log(`🗑️ Queue deleted: ${queueName}`);
    } catch (error) {
      console.error(`❌ Failed to delete queue ${queueName}:`, error);
      throw error;
    }
  }

  // Monitoring and health checks
  async getHealthStatus() {
    try {
      const queuesStats = {};
      for (const queueName of Object.keys(this.config.queues)) {
        queuesStats[queueName] = await this.getQueueStats(queueName);
      }

      return {
        connected: this.isConnected,
        timestamp: new Date().toISOString(),
        queues: queuesStats,
        config: {
          namespace: this.config.namespace,
          redis: {
            host: this.config.redis.host,
            port: this.config.redis.port,
            db: this.config.redis.db
          }
        }
      };
    } catch (error) {
      console.error('❌ Failed to get health status:', error);
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Graceful shutdown
  async disconnect() {
    try {
      console.log('🔄 Disconnecting Redis SMQ...');
      
      if (this.consumer) {
        await this.consumer.quit();
        console.log('✅ Consumer disconnected');
      }
      
      if (this.producer) {
        await this.producer.quit();
        console.log('✅ Producer disconnected');
      }
      
      this.isConnected = false;
      console.log('✅ Redis SMQ disconnected successfully');
    } catch (error) {
      console.error('❌ Error during Redis SMQ disconnect:', error);
      throw error;
    }
  }

  // Utility methods
  isConnected() {
    return this.isConnected;
  }

  getAvailableQueues() {
    return Object.keys(this.config.queues);
  }
}

module.exports = new RedisSMQService();