import { MongoClient, Db } from 'mongodb';

class MongoDBManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnecting = false;

  async getClient(): Promise<MongoClient> {
    if (this.client) {
      return this.client;
    }

    if (this.isConnecting) {
      while (this.isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (this.client) {
        return this.client;
      }
    }

    return this.connect();
  }

  async getDatabase(dbName?: string): Promise<Db> {
    const client = await this.getClient();
    const name = dbName || 'softwarehub-chat';
    
    if (!this.db || this.db.databaseName !== name) {
      this.db = client.db(name);
    }
    
    return this.db;
  }

  async connect(): Promise<MongoClient> {
    if (this.client) {
      return this.client;
    }

    this.isConnecting = true;

    try {
      const mongoUrl = process.env.MONGODB_URL || 
        'mongodb://admin:password@localhost:27017/softwarehub-chat?authSource=admin';
      
      this.client = new MongoClient(mongoUrl, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        maxPoolSize: 10,
        minPoolSize: 2
      });

      await this.client.connect();
      
      // Test connection
      await this.client.db().admin().ping();
      
      console.log('✅ MongoDB: Connected successfully');
      
      this.isConnecting = false;
      return this.client;
      
    } catch (error) {
      this.isConnecting = false;
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('MongoDB: Disconnected');
    }
  }

  isConnected(): boolean {
    return this.client !== null;
  }
}

export const mongoManager = new MongoDBManager();
export const getMongoClient = () => mongoManager.getClient();
export const getMongoDatabase = (dbName?: string) => mongoManager.getDatabase(dbName);