const redis = require('redis');

class RedisSMQService {
  constructor() {
    this.redisClient = null;
    this.consumers = new Map();
    this.isConnected = false;
    this.processingIntervals = new Map();
    
    this.queueNames = [
      'email-queue',
      'notification-queue', 
      'chat-queue',
      'file-processing-queue'
    ];
  }

  async connect() {
    try {
      console.log('🔄 Connecting to Redis for queue management...');
      
      // Create Redis client
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 10000,
          lazyConnect: true
        }
      });

      // Setup error handling
      this.redisClient.on('error', (error) => {
        console.error('🚨 Redis client error:', error);
      });

      this.redisClient.on('connect', () => {
        console.log('✅ Redis client connected');
      });

      // Connect to Redis
      await this.redisClient.connect();
      
      this.isConnected = true;
      console.log('✅ Redis queue service connected successfully');
      
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async initializeQueues() {
    try {
      console.log('📋 Initializing queues...');
      
      // Initialize each queue (Redis lists)
      for (const queueName of this.queueNames) {
        // Ensure queue exists (Redis lists are created automatically)
        const queueLength = await this.redisClient.lLen(queueName);
        console.log(`📋 Queue ready: ${queueName} (length: ${queueLength})`);
      }
      
      console.log('✅ All queues initialized');
    } catch (error) {
      console.error('❌ Error initializing queues:', error);
      throw error;
    }
  }

  async addToQueue(queueName, data, options = {}) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: data.type || 'unknown',
        data,
        timestamp: new Date().toISOString(),
        attempts: 0,
        maxAttempts: options.maxAttempts || 3,
        ...options
      };

      // Push message to Redis list (LPUSH for FIFO with BRPOP)
      await this.redisClient.lPush(queueName, JSON.stringify(message));
      console.log(`📤 Message added to ${queueName}: ${message.id}`);
      return message.id;
    } catch (error) {
      console.error(`❌ Failed to add message to ${queueName}:`, error);
      throw error;
    }
  }

  async startConsumer(queueName, messageHandler, options = {}) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      console.log(`🔄 Starting consumer for ${queueName}...`);
      
      // Create a processing interval for this queue
      const processQueue = async () => {
        try {
          // Block and wait for messages (BRPOP with 1 second timeout)
          const result = await this.redisClient.brPop(queueName, 1);
          
          if (result) {
            const messageData = JSON.parse(result.element);
            console.log(`📥 Processing message from ${queueName}:`, messageData.id);
            
            try {
              // Call the message handler
              await messageHandler(messageData, messageData.id);
              console.log(`✅ Message processed successfully: ${messageData.id}`);
            } catch (error) {
              console.error(`❌ Error processing message ${messageData.id}:`, error);
              
              // Handle retries
              messageData.attempts = (messageData.attempts || 0) + 1;
              
              if (messageData.attempts < messageData.maxAttempts) {
                // Requeue for retry with delay
                console.log(`🔄 Requeuing message ${messageData.id} (attempt ${messageData.attempts}/${messageData.maxAttempts})`);
                setTimeout(async () => {
                  await this.redisClient.lPush(queueName, JSON.stringify(messageData));
                }, 1000 * messageData.attempts); // Exponential backoff
              } else {
                // Move to dead letter queue
                console.log(`💀 Moving message ${messageData.id} to dead letter queue`);
                await this.redisClient.lPush(`${queueName}:dlq`, JSON.stringify(messageData));
              }
            }
          }
        } catch (error) {
          if (error.message.includes('BRPOP')) {
            // Timeout is expected, continue processing
            return;
          }
          console.error(`❌ Consumer error for ${queueName}:`, error);
        }
      };

      // Start continuous processing
      const startProcessing = () => {
        const interval = setInterval(processQueue, 100); // Check every 100ms
        this.processingIntervals.set(queueName, interval);
        return interval;
      };

      startProcessing();
      this.consumers.set(queueName, { queueName, isActive: true });
      console.log(`🔄 Consumer started for queue: ${queueName}`);
      
    } catch (error) {
      console.error(`❌ Failed to start consumer for ${queueName}:`, error);
      throw error;
    }
  }

  async stopConsumer(queueName) {
    try {
      if (this.processingIntervals.has(queueName)) {
        clearInterval(this.processingIntervals.get(queueName));
        this.processingIntervals.delete(queueName);
      }
      
      if (this.consumers.has(queueName)) {
        this.consumers.delete(queueName);
        console.log(`⏹️ Consumer stopped for queue: ${queueName}`);
      }
    } catch (error) {
      console.error(`❌ Failed to stop consumer for ${queueName}:`, error);
      throw error;
    }
  }

  async getQueueStats() {
    try {
      const stats = {};
      for (const queueName of this.queueNames) {
        const length = await this.redisClient.lLen(queueName);
        const dlqLength = await this.redisClient.lLen(`${queueName}:dlq`);
        
        stats[queueName] = {
          name: queueName,
          length: length,
          dlqLength: dlqLength,
          status: 'active',
          consumers: this.consumers.has(queueName) ? 1 : 0
        };
      }
      return stats;
    } catch (error) {
      console.error('❌ Failed to get queue stats:', error);
      return {};
    }
  }

  async getHealthStatus() {
    try {
      return {
        connected: this.isConnected,
        timestamp: new Date().toISOString(),
        queues: this.queueNames,
        activeConsumers: Array.from(this.consumers.keys()),
        stats: await this.getQueueStats(),
        config: {
          redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379
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

  async disconnect() {
    try {
      console.log('🔄 Disconnecting Redis queue service...');
      
      // Stop all consumers
      for (const queueName of this.consumers.keys()) {
        await this.stopConsumer(queueName);
      }
      
      // Clear all processing intervals
      for (const interval of this.processingIntervals.values()) {
        clearInterval(interval);
      }
      this.processingIntervals.clear();
      
      // Disconnect Redis client
      if (this.redisClient) {
        await this.redisClient.disconnect();
        console.log('✅ Redis client disconnected');
      }
      
      this.isConnected = false;
      console.log('✅ Redis queue service disconnected successfully');
    } catch (error) {
      console.error('❌ Error during Redis disconnect:', error);
      throw error;
    }
  }

  isConnected() {
    return this.isConnected;
  }

  getAvailableQueues() {
    return this.queueNames;
  }
}

module.exports = new RedisSMQService();