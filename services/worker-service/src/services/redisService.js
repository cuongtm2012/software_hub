// Redis service for queue management and pub/sub
// In development, we'll use an in-memory implementation
// In production, replace with actual Redis client

class RedisService {
  constructor() {
    this.connected = false;
    this.queues = new Map();
    this.subscribers = new Map();
    this.onlineUsers = new Map();
  }

  async connect() {
    console.log('Connecting to Redis (development mode - in-memory)...');
    this.connected = true;
    console.log('Redis connected successfully');
  }

  async disconnect() {
    console.log('Disconnecting from Redis...');
    this.connected = false;
    this.queues.clear();
    this.subscribers.clear();
    this.onlineUsers.clear();
    console.log('Redis disconnected');
  }

  // Queue operations
  async pushToQueue(queueName, job) {
    if (!this.connected) {
      throw new Error('Redis not connected');
    }

    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
    }

    const jobWithId = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: job.type,
      data: job.data,
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3
    };

    this.queues.get(queueName).push(jobWithId);
    console.log(`Job pushed to queue ${queueName}:`, jobWithId.id);
    return jobWithId;
  }

  async popFromQueue(queueName) {
    if (!this.connected) {
      throw new Error('Redis not connected');
    }

    if (!this.queues.has(queueName)) {
      return null;
    }

    const queue = this.queues.get(queueName);
    const job = queue.shift();
    
    if (job) {
      console.log(`Job popped from queue ${queueName}:`, job.id);
    }
    
    return job;
  }

  async getQueueLength(queueName) {
    if (!this.queues.has(queueName)) {
      return 0;
    }
    return this.queues.get(queueName).length;
  }

  async requeueJob(queueName, job) {
    if (!this.connected) {
      throw new Error('Redis not connected');
    }

    job.attempts++;
    
    if (job.attempts >= job.maxAttempts) {
      console.log(`Job ${job.id} exceeded max attempts, moving to dead letter queue`);
      return this.pushToDeadLetterQueue(job);
    }

    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
    }

    this.queues.get(queueName).unshift(job); // Add to front for retry
    console.log(`Job requeued: ${job.id}, attempt ${job.attempts}`);
    return job;
  }

  async pushToDeadLetterQueue(job) {
    const dlqName = 'dead-letter-queue';
    if (!this.queues.has(dlqName)) {
      this.queues.set(dlqName, []);
    }
    
    job.failedAt = new Date();
    this.queues.get(dlqName).push(job);
    console.log(`Job moved to dead letter queue: ${job.id}`);
    return job;
  }

  // Pub/Sub operations
  async publish(channel, message) {
    if (!this.connected) {
      throw new Error('Redis not connected');
    }

    if (this.subscribers.has(channel)) {
      const callbacks = this.subscribers.get(channel);
      callbacks.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error(`Error in subscriber callback for channel ${channel}:`, error);
        }
      });
    }

    console.log(`Message published to channel ${channel}`);
  }

  async subscribe(channel, callback) {
    if (!this.connected) {
      throw new Error('Redis not connected');
    }

    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, []);
    }

    this.subscribers.get(channel).push(callback);
    console.log(`Subscribed to channel ${channel}`);
  }

  async unsubscribe(channel, callback) {
    if (!this.subscribers.has(channel)) {
      return;
    }

    const callbacks = this.subscribers.get(channel);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
      console.log(`Unsubscribed from channel ${channel}`);
    }
  }

  // Cache operations
  async set(key, value, ttlSeconds = null) {
    if (!this.connected) {
      throw new Error('Redis not connected');
    }

    // In production, implement actual Redis SET with TTL
    console.log(`Cache set: ${key}`);
    
    if (ttlSeconds) {
      setTimeout(() => {
        console.log(`Cache expired: ${key}`);
      }, ttlSeconds * 1000);
    }
  }

  async get(key) {
    if (!this.connected) {
      throw new Error('Redis not connected');
    }

    // In production, implement actual Redis GET
    console.log(`Cache get: ${key}`);
    return null;
  }

  async del(key) {
    if (!this.connected) {
      throw new Error('Redis not connected');
    }

    // In production, implement actual Redis DEL
    console.log(`Cache delete: ${key}`);
  }

  // Presence management
  async setUserOnline(userId, userData) {
    this.onlineUsers.set(userId, {
      ...userData,
      lastSeen: new Date()
    });
    console.log(`User ${userId} set as online`);
  }

  async setUserOffline(userId) {
    if (this.onlineUsers.has(userId)) {
      const userData = this.onlineUsers.get(userId);
      userData.lastSeen = new Date();
      this.onlineUsers.delete(userId);
      console.log(`User ${userId} set as offline`);
    }
  }

  async isUserOnline(userId) {
    return this.onlineUsers.has(userId);
  }

  async getOnlineUsers() {
    return Array.from(this.onlineUsers.entries()).map(([userId, userData]) => ({
      userId,
      ...userData
    }));
  }

  // Statistics
  getStats() {
    const queueStats = {};
    for (const [queueName, queue] of this.queues.entries()) {
      queueStats[queueName] = queue.length;
    }

    return {
      connected: this.connected,
      queues: queueStats,
      subscribers: Array.from(this.subscribers.keys()),
      onlineUsers: this.onlineUsers.size
    };
  }
}

module.exports = new RedisService();