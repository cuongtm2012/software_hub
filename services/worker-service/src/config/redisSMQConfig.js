require('dotenv').config();

module.exports = {
  // Redis connection configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB) || 0,
    family: 4, // 4 (IPv4) or 6 (IPv6)
    keepAlive: true,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
    maxLoadingTimeout: 5000,
    // Connection pool settings
    connectTimeout: 10000,
    commandTimeout: 5000
  },

  // Redis SMQ specific configuration
  smq: {
    // Queue configuration
    queues: {
      'email-queue': {
        visibilityTimeout: 60000, // 1 minute
        deadLetterThreshold: 5,
        retryThreshold: 3,
        maxConcurrency: 10
      },
      'notification-queue': {
        visibilityTimeout: 30000, // 30 seconds
        deadLetterThreshold: 5,
        retryThreshold: 3,
        maxConcurrency: 5
      },
      'chat-queue': {
        visibilityTimeout: 45000, // 45 seconds
        deadLetterThreshold: 3,
        retryThreshold: 2,
        maxConcurrency: 8
      },
      'priority-queue': {
        visibilityTimeout: 15000, // 15 seconds
        deadLetterThreshold: 3,
        retryThreshold: 2,
        maxConcurrency: 15
      }
    },

    // Consumer configuration
    consumer: {
      messageConsumeTimeout: 2000,
      messageTTL: 3600000, // 1 hour
      visibilityTimeout: 60000, // 1 minute
      heartbeatInterval: 10000, // 10 seconds
      heartbeatThreshold: 3,
      retryThreshold: 3,
      retryDelay: 1000,
      maxRetryDelay: 60000,
      retryMultiplier: 2
    },

    // Producer configuration
    producer: {
      messageTTL: 3600000, // 1 hour
      messageRetentionPeriod: 86400000, // 24 hours
      defaultPriority: 0,
      enableMultiplexing: true
    },

    // Dead letter queue configuration
    deadLetter: {
      enabled: true,
      suffix: '.dlq',
      messageTTL: 604800000 // 7 days
    },

    // Monitoring and logging
    monitoring: {
      enabled: true,
      statsInterval: 30000, // 30 seconds
      logLevel: process.env.LOG_LEVEL || 'info'
    }
  },

  // Worker service specific settings
  worker: {
    // Health check configuration
    healthCheck: {
      interval: 30000, // 30 seconds
      timeout: 5000,
      retries: 3
    },

    // Service dependencies
    services: {
      email: {
        url: process.env.EMAIL_SERVICE_URL || 'http://email-service:3001',
        timeout: 10000,
        retries: 3
      },
      notification: {
        url: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3003',
        timeout: 8000,
        retries: 3
      },
      chat: {
        url: process.env.CHAT_SERVICE_URL || 'http://chat-service:3004',
        timeout: 5000,
        retries: 2
      }
    },

    // Graceful shutdown
    shutdown: {
      timeout: 30000, // 30 seconds
      forceKillTimeout: 10000 // 10 seconds
    }
  }
};