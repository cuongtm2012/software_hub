import { createClient, RedisClientType } from 'redis';

class RedisManager {
  private client: RedisClientType | null = null;
  private isConnecting = false;

  async getClient(): Promise<RedisClientType> {
    if (this.client && this.client.isOpen) {
      return this.client;
    }

    if (this.isConnecting) {
      // Wait for connection to complete
      while (this.isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (this.client && this.client.isOpen) {
        return this.client;
      }
    }

    return this.connect();
  }

  async connect(): Promise<RedisClientType> {
    if (this.client && this.client.isOpen) {
      return this.client;
    }

    this.isConnecting = true;

    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.client = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('Redis: Max reconnection attempts reached');
              return new Error('Redis connection failed');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      this.client.on('connect', () => {
        console.log('✅ Redis: Connected successfully');
      });

      this.client.on('ready', () => {
        console.log('✅ Redis: Client ready');
      });

      this.client.on('reconnecting', () => {
        console.log('🔄 Redis: Reconnecting...');
      });

      await this.client.connect();
      
      this.isConnecting = false;
      return this.client;
      
    } catch (error) {
      this.isConnecting = false;
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      console.log('Redis: Disconnected');
    }
  }

  isConnected(): boolean {
    return this.client ? this.client.isOpen : false;
  }
}

export const redisManager = new RedisManager();
export const getRedisClient = () => redisManager.getClient();