const emailWorker = require('./workers/emailWorker');
const notificationWorker = require('./workers/notificationWorker');
const chatWorker = require('./workers/chatWorker');
const redisService = require('./services/redisService');

class WorkerService {
  constructor() {
    this.workers = [];
    this.isRunning = false;
    this.healthCheckInterval = null;
  }

  async start() {
    console.log('Starting Worker Service...');
    
    try {
      // Initialize Redis connection with retry logic
      await this.initializeRedisWithRetry();
      
      // Wait for external services to be ready
      await this.waitForExternalServices();
      
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
          console.log(`Worker ${worker.name || worker.constructor.name} started successfully`);
        } catch (error) {
          console.error(`Failed to start worker ${worker.name || worker.constructor.name}:`, error);
          // Continue with other workers instead of failing completely
        }
      }
      
      this.isRunning = true;
      console.log('Worker service started successfully');
      
      // Start health check monitoring
      this.startHealthMonitoring();
      
      // Graceful shutdown handling
      process.on('SIGINT', () => this.shutdown());
      process.on('SIGTERM', () => this.shutdown());
      
    } catch (error) {
      console.error('Failed to start Worker Service:', error);
      process.exit(1);
    }
  }

  async initializeRedisWithRetry(maxRetries = 5, delay = 2000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`Attempting to connect to Redis (attempt ${i + 1}/${maxRetries})...`);
        await redisService.connect();
        console.log('Redis connection established');
        return;
      } catch (error) {
        console.error(`Redis connection attempt ${i + 1} failed:`, error.message);
        if (i === maxRetries - 1) {
          throw new Error(`Failed to connect to Redis after ${maxRetries} attempts`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async waitForExternalServices(timeout = 60000) {
    console.log('Waiting for external services to be ready...');
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
            timeout: 5000 
          });
          
          if (!response.ok) {
            allServicesReady = false;
            console.log(`${service.name} not ready (HTTP ${response.status})`);
            break;
          }
          
          const health = await response.json();
          if (health.status !== 'ok') {
            allServicesReady = false;
            console.log(`${service.name} not ready (status: ${health.status})`);
            break;
          }
          
        } catch (error) {
          allServicesReady = false;
          console.log(`${service.name} not ready: ${error.message}`);
          break;
        }
      }
      
      if (allServicesReady) {
        console.log('All external services are ready');
        return;
      }
      
      console.log('Waiting for services to be ready...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    console.warn('Some external services may not be ready, but continuing startup...');
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
      
      // Check Redis connection
      const redisStatus = await redisService.isConnected();
      
      console.log('Health check:', {
        timestamp: new Date().toISOString(),
        workers: workerStatus,
        redis: redisStatus ? 'connected' : 'disconnected'
      });
      
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }

  async shutdown() {
    if (!this.isRunning) return;
    
    console.log('Shutting down Worker Service...');
    
    try {
      // Stop health monitoring
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      
      // Stop all workers
      for (const worker of this.workers) {
        try {
          if (worker.stop) {
            await worker.stop();
            console.log(`Worker ${worker.name || worker.constructor.name} stopped`);
          }
        } catch (error) {
          console.error(`Error stopping worker ${worker.name || worker.constructor.name}:`, error);
        }
      }
      
      // Close Redis connection
      await redisService.disconnect();
      
      this.isRunning = false;
      console.log('Worker Service shut down successfully');
      process.exit(0);
      
    } catch (error) {
      console.error('Error during shutdown:', error);
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
      redis: redisService.isConnected ? redisService.isConnected() : false
    };
  }
}

const workerService = new WorkerService();

// Start the service
workerService.start().catch(error => {
  console.error('Failed to start worker service:', error);
  process.exit(1);
});

module.exports = workerService;