const emailWorker = require('./workers/emailWorker');
const notificationWorker = require('./workers/notificationWorker');
const chatWorker = require('./workers/chatWorker');
const redisService = require('./services/redisService');

class WorkerService {
  constructor() {
    this.workers = [];
    this.isRunning = false;
  }

  async start() {
    console.log('Starting Worker Service...');
    
    try {
      // Initialize Redis connection
      await redisService.connect();
      
      // Start all workers
      this.workers = [
        emailWorker,
        notificationWorker,
        chatWorker
      ];
      
      // Start each worker
      for (const worker of this.workers) {
        await worker.start();
      }
      
      this.isRunning = true;
      console.log('All workers started successfully');
      
      // Graceful shutdown handling
      process.on('SIGINT', () => this.shutdown());
      process.on('SIGTERM', () => this.shutdown());
      
    } catch (error) {
      console.error('Failed to start Worker Service:', error);
      process.exit(1);
    }
  }

  async shutdown() {
    if (!this.isRunning) return;
    
    console.log('Shutting down Worker Service...');
    
    try {
      // Stop all workers
      for (const worker of this.workers) {
        await worker.stop();
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
      workers: this.workers.map(worker => ({
        name: worker.name,
        status: worker.getStatus()
      }))
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