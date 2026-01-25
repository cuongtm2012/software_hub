import { getRedisClient } from './redis';
import type { RedisClientType } from 'redis';

export interface QueueJob<T = any> {
  id: string;
  type: string;
  data: T;
  priority?: number;
  attempts?: number;
  maxAttempts?: number;
  createdAt: Date;
  processedAt?: Date;
  error?: string;
}

class QueueManager {
  private redis: RedisClientType | null = null;
  private processors: Map<string, (job: QueueJob) => Promise<void>> = new Map();
  private isProcessing = false;

  async initialize(): Promise<void> {
    this.redis = await getRedisClient();
    console.log('✅ Queue Manager: Initialized');
  }

  /**
   * Add a job to the queue
   */
  async addJob<T>(queueName: string, data: T, options?: { priority?: number; delay?: number }): Promise<string> {
    if (!this.redis) await this.initialize();

    const jobId = `${queueName}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const job: QueueJob<T> = {
      id: jobId,
      type: queueName,
      data,
      priority: options?.priority || 0,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date()
    };

    const key = `queue:${queueName}`;
    
    if (options?.delay) {
      // Delayed job
      const processAt = Date.now() + options.delay;
      await this.redis!.zAdd(`${key}:delayed`, { score: processAt, value: JSON.stringify(job) });
    } else {
      // Immediate job
      await this.redis!.lPush(key, JSON.stringify(job));
    }

    return jobId;
  }

  /**
   * Register a processor for a queue
   */
  registerProcessor(queueName: string, processor: (job: QueueJob) => Promise<void>): void {
    this.processors.set(queueName, processor);
    console.log(`✅ Queue: Registered processor for "${queueName}"`);
  }

  /**
   * Start processing jobs from all registered queues
   */
  async startProcessing(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    console.log('🚀 Queue Manager: Started processing jobs');

    // Process each queue
    for (const [queueName] of this.processors) {
      this.processQueue(queueName);
    }

    // Check delayed jobs every 5 seconds
    this.processDelayedJobs();
  }

  /**
   * Process jobs from a specific queue
   */
  private async processQueue(queueName: string): Promise<void> {
    const key = `queue:${queueName}`;
    const processor = this.processors.get(queueName);

    if (!processor) return;

    while (this.isProcessing) {
      try {
        if (!this.redis) await this.initialize();

        // Get job from queue (blocking pop with timeout)
        const result = await this.redis!.brPop(key, 1);
        
        if (!result) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        const job: QueueJob = JSON.parse(result.element);
        
        try {
          console.log(`📋 Processing job ${job.id} from queue ${queueName}`);
          await processor(job);
          console.log(`✅ Job ${job.id} completed successfully`);
        } catch (error) {
          console.error(`❌ Job ${job.id} failed:`, error);
          
          job.attempts = (job.attempts || 0) + 1;
          job.error = error instanceof Error ? error.message : String(error);

          if (job.attempts < (job.maxAttempts || 3)) {
            // Retry the job
            console.log(`🔄 Retrying job ${job.id} (attempt ${job.attempts})`);
            await this.redis!.lPush(key, JSON.stringify(job));
          } else {
            // Move to failed queue
            console.log(`💀 Job ${job.id} moved to failed queue after ${job.attempts} attempts`);
            await this.redis!.lPush(`${key}:failed`, JSON.stringify(job));
          }
        }
      } catch (error) {
        console.error(`Queue processing error for ${queueName}:`, error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  /**
   * Process delayed jobs
   */
  private async processDelayedJobs(): Promise<void> {
    while (this.isProcessing) {
      try {
        if (!this.redis) await this.initialize();

        for (const [queueName] of this.processors) {
          const delayedKey = `queue:${queueName}:delayed`;
          const now = Date.now();

          // Get jobs that are ready to process
          const jobs = await this.redis!.zRangeByScore(delayedKey, 0, now);

          for (const jobStr of jobs) {
            const job: QueueJob = JSON.parse(jobStr);
            
            // Move to active queue
            await this.redis!.lPush(`queue:${queueName}`, jobStr);
            await this.redis!.zRem(delayedKey, jobStr);
            
            console.log(`⏰ Delayed job ${job.id} moved to active queue`);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error('Delayed job processing error:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  /**
   * Stop processing jobs
   */
  async stopProcessing(): Promise<void> {
    this.isProcessing = false;
    console.log('🛑 Queue Manager: Stopped processing jobs');
  }

  /**
   * Get queue statistics
   */
  async getStats(queueName: string): Promise<{ pending: number; failed: number; delayed: number }> {
    if (!this.redis) await this.initialize();

    const [pending, failed, delayed] = await Promise.all([
      this.redis!.lLen(`queue:${queueName}`),
      this.redis!.lLen(`queue:${queueName}:failed`),
      this.redis!.zCard(`queue:${queueName}:delayed`)
    ]);

    return { pending, failed, delayed };
  }

  /**
   * Clear a queue
   */
  async clearQueue(queueName: string): Promise<void> {
    if (!this.redis) await this.initialize();

    await Promise.all([
      this.redis!.del(`queue:${queueName}`),
      this.redis!.del(`queue:${queueName}:failed`),
      this.redis!.del(`queue:${queueName}:delayed`)
    ]);

    console.log(`🧹 Queue ${queueName} cleared`);
  }
}

export const queueManager = new QueueManager();
export const addJob = <T>(queueName: string, data: T, options?: { priority?: number; delay?: number }) => 
  queueManager.addJob(queueName, data, options);
export const registerProcessor = (queueName: string, processor: (job: QueueJob) => Promise<void>) =>
  queueManager.registerProcessor(queueName, processor);