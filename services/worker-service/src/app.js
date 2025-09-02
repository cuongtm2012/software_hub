require('dotenv').config();

const express = require('express');
const cors = require('cors');
const emailWorker = require('./workers/emailWorker');
const notificationWorker = require('./workers/notificationWorker');
const chatWorker = require('./workers/chatWorker');
const redisSMQService = require('./services/redisSMQService');

class WorkerService {
  constructor() {
    this.workers = [];
    this.isRunning = false;
    this.healthCheckInterval = null;
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
      const status = this.getStatus();
      res.json({
        status: this.isRunning ? 'ok' : 'not_running',
        service: 'worker-service',
        timestamp: new Date().toISOString(),
        ...status
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

        const result = await this.processQueue(queueName, messageData);
        res.json(result);
        
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
      try {
        const stats = await this.getQueueStatistics();
        res.json(stats);
      } catch (error) {
        console.error('❌ Queue stats API error:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Worker status endpoint
    this.app.get('/api/workers/status', (req, res) => {
      const status = this.getStatus();
      res.json(status);
    });
  }

  async start() {
    console.log('🚀 Starting Worker Service with Redis SMQ...');
    
    try {
      // Initialize Redis SMQ connection with retry logic
      await this.initializeRedisSMQWithRetry();
      
      // Wait for external services to be ready
      await this.waitForExternalServices();
      
      // Start HTTP server
      const PORT = process.env.PORT || 3005;
      this.server = this.app.listen(PORT, () => {
        console.log(`🌐 Worker Service HTTP API listening on port ${PORT}`);
      });
      
      // Start all workers
      this.workers = [
        emailWorker,
        notificationWorker,
        chatWorker
      ];
      
      // Start each worker with error handling
      for (const worker of this.workers) {
        try {
          await worker.start();
          console.log(`✅ Worker ${worker.name || worker.constructor.name} started successfully`);
        } catch (error) {
          console.error(`❌ Failed to start worker ${worker.name || worker.constructor.name}:`, error);
          // Continue with other workers instead of failing completely
        }
      }
      
      this.isRunning = true;
      console.log('🎉 Worker service started successfully with Redis SMQ');
      
      // Start health check monitoring
      this.startHealthMonitoring();
      
      // Graceful shutdown handling
      process.on('SIGINT', () => this.shutdown());
      process.on('SIGTERM', () => this.shutdown());
      
    } catch (error) {
      console.error('💥 Failed to start Worker Service:', error);
      process.exit(1);
    }
  }

  async initializeRedisSMQWithRetry(maxRetries = 5, delay = 2000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`🔄 Attempting to connect to Redis SMQ (attempt ${i + 1}/${maxRetries})...`);
        await redisSMQService.connect();
        
        // Initialize queues
        await redisSMQService.initializeQueues();
        
        console.log('✅ Redis SMQ connection established and queues initialized');
        return;
      } catch (error) {
        console.error(`❌ Redis SMQ connection attempt ${i + 1} failed:`, error.message);
        if (i === maxRetries - 1) {
          throw new Error(`Failed to connect to Redis SMQ after ${maxRetries} attempts: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async waitForExternalServices(timeout = 60000) {
    console.log('⏳ Waiting for external services to be ready...');
    const startTime = Date.now();
    
    const services = [
      { name: 'Email Service', url: process.env.EMAIL_SERVICE_URL || 'http://email-service:3001' },
      { name: 'Notification Service', url: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3003' }
    ];

    while (Date.now() - startTime < timeout) {
      let allServicesReady = true;
      
      for (const service of services) {
        try {
          const response = await fetch(`${service.url}/health`, { 
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          });
          
          if (!response.ok) {
            allServicesReady = false;
            console.log(`⏳ ${service.name} not ready (HTTP ${response.status})`);
            break;
          }
          
          const health = await response.json();
          if (health.status !== 'ok') {
            allServicesReady = false;
            console.log(`⏳ ${service.name} not ready (status: ${health.status})`);
            break;
          }
          
        } catch (error) {
          allServicesReady = false;
          console.log(`⏳ ${service.name} not ready: ${error.message}`);
          break;
        }
      }
      
      if (allServicesReady) {
        console.log('✅ All external services are ready');
        return;
      }
      
      console.log('⏳ Waiting for services to be ready...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    console.warn('⚠️ Some external services may not be ready, but continuing startup...');
  }

  startHealthMonitoring() {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Check every 30 seconds
  }

  async performHealthCheck() {
    try {
      const workerStatus = this.workers.map(worker => ({
        name: worker.name || worker.constructor.name,
        status: worker.getStatus ? worker.getStatus() : 'unknown'
      }));
      
      // Check Redis connection and stats
      const redisStatus = redisSMQService.isConnected;
      const queueStats = await redisSMQService.getQueueStats();
      
      const healthInfo = {
        timestamp: new Date().toISOString(),
        workers: workerStatus,
        redis: {
          connected: redisStatus,
          stats: queueStats
        }
      };
      
      console.log('💗 Health check:', JSON.stringify(healthInfo, null, 2));
      
    } catch (error) {
      console.error('💔 Health check failed:', error);
    }
  }

  async shutdown() {
    if (!this.isRunning) return;
    
    console.log('🛑 Shutting down Worker Service...');
    
    try {
      // Stop HTTP server
      if (this.server) {
        this.server.close();
        console.log('🛑 HTTP server stopped');
      }
      
      // Stop health monitoring
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      
      // Stop all workers
      for (const worker of this.workers) {
        try {
          if (worker.stop) {
            await worker.stop();
            console.log(`🛑 Worker ${worker.name || worker.constructor.name} stopped`);
          }
        } catch (error) {
          console.error(`❌ Error stopping worker ${worker.name || worker.constructor.name}:`, error);
        }
      }
      
      // Close Redis SMQ connection
      await redisSMQService.disconnect();
      console.log('🛑 Redis SMQ disconnected');
      
      this.isRunning = false;
      console.log('✅ Worker Service shut down successfully');
      process.exit(0);
      
    } catch (error) {
      console.error('💥 Error during shutdown:', error);
      process.exit(1);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      timestamp: new Date().toISOString(),
      workers: this.workers.map(worker => ({
        name: worker.name || worker.constructor.name,
        status: worker.getStatus ? worker.getStatus() : 'unknown'
      })),
      redis: {
        connected: redisSMQService.isConnected
      }
    };
  }

  // Method to manually trigger queue processing (useful for testing)
  async processQueue(queueName, messageData) {
    try {
      const messageId = await redisSMQService.addToQueue(queueName, messageData);
      console.log(`📤 Message added to queue ${queueName}:`, messageId);
      return { success: true, messageId };
    } catch (error) {
      console.error(`❌ Failed to add message to queue ${queueName}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Get queue statistics for monitoring
  async getQueueStatistics() {
    try {
      return await redisSMQService.getQueueStats();
    } catch (error) {
      console.error('❌ Failed to get queue statistics:', error);
      return { error: error.message };
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