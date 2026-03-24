import { getRedisClient } from "./redis";
import type { RedisClientType } from "redis";

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
    console.log("✅ Queue Manager: Initialized");
  }

  async addJob<T>(queueName: string, data: T, options?: { priority?: number; delay?: number }): Promise<string> {
    if (!this.redis) await this.initialize();

    const jobId = `${queueName}:${Date.now()}:${Math.random().toString(36).slice(2, 11)}`;
    const job: QueueJob<T> = {
      id: jobId,
      type: queueName,
      data,
      priority: options?.priority || 0,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
    };

    const key = `queue:${queueName}`;
    if (options?.delay) {
      const processAt = Date.now() + options.delay;
      await this.redis!.zAdd(`${key}:delayed`, { score: processAt, value: JSON.stringify(job) });
    } else {
      await this.redis!.lPush(key, JSON.stringify(job));
    }

    return jobId;
  }

  registerProcessor(queueName: string, processor: (job: QueueJob) => Promise<void>): void {
    this.processors.set(queueName, processor);
    console.log(`✅ Queue: Registered processor for "${queueName}"`);
  }

  async startProcessing(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;
    console.log("🚀 Queue Manager: Started processing jobs");

    for (const [queueName] of this.processors) {
      this.processQueue(queueName);
    }
    this.processDelayedJobs();
  }

  private async processQueue(queueName: string): Promise<void> {
    const key = `queue:${queueName}`;
    const processor = this.processors.get(queueName);
    if (!processor) return;

    while (this.isProcessing) {
      try {
        if (!this.redis) await this.initialize();
        const result = await this.redis!.brPop(key, 1);

        if (!result) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
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
            console.log(`🔄 Retrying job ${job.id} (attempt ${job.attempts})`);
            await this.redis!.lPush(key, JSON.stringify(job));
          } else {
            console.log(`💀 Job ${job.id} moved to failed queue after ${job.attempts} attempts`);
            await this.redis!.lPush(`${key}:failed`, JSON.stringify(job));
          }
        }
      } catch (error) {
        console.error(`Queue processing error for ${queueName}:`, error);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  private async processDelayedJobs(): Promise<void> {
    while (this.isProcessing) {
      try {
        if (!this.redis) await this.initialize();

        for (const [queueName] of this.processors) {
          const delayedKey = `queue:${queueName}:delayed`;
          const jobs = await this.redis!.zRangeByScore(delayedKey, 0, Date.now());

          for (const jobStr of jobs) {
            const job: QueueJob = JSON.parse(jobStr);
            await this.redis!.lPush(`queue:${queueName}`, jobStr);
            await this.redis!.zRem(delayedKey, jobStr);
            console.log(`⏰ Delayed job ${job.id} moved to active queue`);
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        console.error("Delayed job processing error:", error);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  async stopProcessing(): Promise<void> {
    this.isProcessing = false;
    console.log("🛑 Queue Manager: Stopped processing jobs");
  }

  async getStats(queueName: string): Promise<{ pending: number; failed: number; delayed: number }> {
    if (!this.redis) await this.initialize();

    const [pending, failed, delayed] = await Promise.all([
      this.redis!.lLen(`queue:${queueName}`),
      this.redis!.lLen(`queue:${queueName}:failed`),
      this.redis!.zCard(`queue:${queueName}:delayed`),
    ]);

    return { pending, failed, delayed };
  }

  getRegisteredQueues(): string[] {
    return Array.from(this.processors.keys());
  }

  async retryFailedJobs(queueName: string, limit = 50): Promise<number> {
    if (!this.redis) await this.initialize();

    let moved = 0;
    const failedKey = `queue:${queueName}:failed`;
    const activeKey = `queue:${queueName}`;

    while (moved < limit) {
      const jobStr = await this.redis!.rPop(failedKey);
      if (!jobStr) break;

      const job: QueueJob = JSON.parse(jobStr);
      job.attempts = 0;
      job.error = undefined;

      await this.redis!.lPush(activeKey, JSON.stringify(job));
      moved++;
    }

    return moved;
  }

  async clearFailedJobs(queueName: string): Promise<number> {
    if (!this.redis) await this.initialize();

    const failedKey = `queue:${queueName}:failed`;
    const count = await this.redis!.lLen(failedKey);
    await this.redis!.del(failedKey);
    return count;
  }

  async clearQueue(queueName: string): Promise<void> {
    if (!this.redis) await this.initialize();

    await Promise.all([
      this.redis!.del(`queue:${queueName}`),
      this.redis!.del(`queue:${queueName}:failed`),
      this.redis!.del(`queue:${queueName}:delayed`),
    ]);

    console.log(`🧹 Queue ${queueName} cleared`);
  }
}

export const queueManager = new QueueManager();
export const addJob = <T>(queueName: string, data: T, options?: { priority?: number; delay?: number }) =>
  queueManager.addJob(queueName, data, options);
export const registerProcessor = (queueName: string, processor: (job: QueueJob) => Promise<void>) =>
  queueManager.registerProcessor(queueName, processor);
