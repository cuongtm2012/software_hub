require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const chatController = require('./controllers/chatController');
const socketServer = require('./socket/socketServer');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3002;

// Initialize Redis and MongoDB connections
let redisClient;
let mongoClient;

async function initializeRedis() {
  try {
    const redis = require('redis');
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
    
    await redisClient.connect();
    console.log('Connected to Redis successfully');
    
    // Make Redis client available globally
    global.redisClient = redisClient;
    
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
}

async function initializeMongoDB() {
  try {
    const { MongoClient } = require('mongodb');
    const mongoUrl = process.env.MONGODB_URL || 'mongodb://admin:password@localhost:27017/softwarehub-chat?authSource=admin';
    
    mongoClient = new MongoClient(mongoUrl);
    await mongoClient.connect();
    
    // Test connection
    await mongoClient.db().admin().ping();
    console.log('Connected to MongoDB successfully');
    
    // Make MongoDB client available globally
    global.mongoClient = mongoClient;
    
    return mongoClient;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5000",
  credentials: true
}));
app.use(express.json());

// Health check endpoint with dependency status
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    service: 'chat-service',
    timestamp: new Date().toISOString(),
    dependencies: {
      redis: redisClient ? (redisClient.isOpen ? 'connected' : 'disconnected') : 'not_configured',
      mongodb: mongoClient ? 'connected' : 'not_configured',
      socketio: io ? 'initialized' : 'not_initialized'
    }
  };
  
  res.json(health);
});

// REST API routes for chat history
app.get('/api/chat/rooms/:userId', chatController.getUserRooms);
app.get('/api/chat/messages/:roomId', chatController.getRoomMessages);
app.post('/api/chat/room', chatController.createRoom);

// Initialize socket handlers
socketServer.init(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Chat service error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Graceful shutdown handler
async function gracefulShutdown() {
  console.log('Shutting down chat service gracefully...');
  
  try {
    // Close Socket.IO server
    if (io) {
      io.close();
      console.log('Socket.IO server closed');
    }
    
    // Close Redis connection
    if (redisClient) {
      await redisClient.quit();
      console.log('Redis connection closed');
    }
    
    // Close MongoDB connection
    if (mongoClient) {
      await mongoClient.close();
      console.log('MongoDB connection closed');
    }
    
    // Close HTTP server
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Initialize and start server
async function startServer() {
  try {
    console.log('Initializing chat service...');
    
    // Initialize Redis
    await initializeRedis();
    
    // Initialize MongoDB
    await initializeMongoDB();
    
    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`Chat service running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:5000'}`);
      console.log('Socket.IO server initialized');
    });
    
  } catch (error) {
    console.error('Failed to start chat service:', error);
    process.exit(1);
  }
}

// Start the service
startServer();

module.exports = { app, server, io };