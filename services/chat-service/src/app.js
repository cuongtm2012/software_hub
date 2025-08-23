require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const chatController = require('./controllers/chatController');
const socketServer = require('./socket/socketServer');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with enhanced CORS and configuration
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5000",
    methods: ["GET", "POST"],
    credentials: true
  },
  // Enhanced Socket.IO configuration
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  allowUpgrades: true,
  transports: ['websocket', 'polling'],
  // Enable compression for better performance
  compression: true,
  // Limit max HTTP buffer size
  maxHttpBufferSize: 1e6 // 1MB
});

const PORT = process.env.PORT || 3002;

// Initialize database connections
let redisClient;
let mongoClient;

async function initializeRedis() {
  try {
    let redis;
    try {
      redis = require('redis');
    } catch (redisError) {
      console.warn('Redis module not installed, skipping Redis connection');
      return null;
    }
    
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 5000,
        lazyConnect: true
      }
    });
    
    redisClient.on('error', (err) => {
      console.warn('Redis connection error (continuing without Redis):', err.message);
    });
    
    redisClient.on('connect', () => {
      console.log('Connected to Redis successfully');
    });
    
    redisClient.on('ready', () => {
      console.log('Redis client ready');
    });
    
    // Try to connect with timeout
    const connectPromise = redisClient.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Redis connection timeout')), 8000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    
    // Make Redis client available globally
    global.redisClient = redisClient;
    
    return redisClient;
  } catch (error) {
    console.warn('Failed to connect to Redis:', error.message);
    console.log('Chat service will run without Redis (basic functionality mode)');
    if (redisClient) {
      try {
        redisClient.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    }
    redisClient = null;
    return null;
  }
}

async function initializeMongoDB() {
  try {
    let mongodb;
    try {
      mongodb = require('mongodb');
    } catch (mongoError) {
      console.warn('MongoDB module not installed, skipping MongoDB connection');
      return null;
    }
    
    const mongoUrl = process.env.MONGODB_URL || 'mongodb://admin:password@localhost:27017/softwarehub-chat?authSource=admin';
    
    mongoClient = new mongodb.MongoClient(mongoUrl, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      maxPoolSize: 10,
      minPoolSize: 2
    });
    
    await mongoClient.connect();
    
    // Test connection
    await mongoClient.db().admin().ping();
    console.log('Connected to MongoDB successfully');
    
    // Make MongoDB client available globally
    global.mongoClient = mongoClient;
    
    return mongoClient;
  } catch (error) {
    console.warn('Failed to connect to MongoDB:', error.message);
    console.log('Chat service will run without MongoDB (basic functionality mode)');
    return null;
  }
}

// Enhanced middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increase JSON limit for file uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.url.startsWith('/api/')) {
      console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    }
  });
  
  next();
});

// Health check endpoint with enhanced status
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    service: 'chat-service',
    timestamp: new Date().toISOString(),
    dependencies: {
      redis: redisClient ? (redisClient.isOpen ? 'connected' : 'disconnected') : 'not_available',
      mongodb: mongoClient ? 'connected' : 'not_available',
      socketio: io ? 'initialized' : 'not_initialized'
    },
    features: [
      'real-time-messaging',
      'room-management', 
      'file-sharing',
      'message-reactions',
      'typing-indicators',
      'presence-tracking',
      'message-search',
      'admin-controls'
    ],
    stats: {
      connectedUsers: io.engine.clientsCount,
      activeRooms: io.sockets.adapter.rooms.size,
      uptime: process.uptime()
    }
  };
  
  res.json(health);
});

// Enhanced REST API routes for chat functionality

// Room management routes
app.get('/api/chat/rooms/:userId', chatController.getUserRooms);
app.post('/api/chat/room', chatController.createRoom);
app.get('/api/chat/room/:roomId/details', chatController.getRoomDetails);

// Message management routes
app.get('/api/chat/messages/:roomId', chatController.getRoomMessages);
app.put('/api/chat/messages/:roomId/read', chatController.markAsRead);

// Search functionality
app.get('/api/chat/search', chatController.searchMessages);

// Message reactions
app.post('/api/chat/reaction/:messageId', chatController.addReaction);
app.delete('/api/chat/reaction/:messageId', chatController.removeReaction);

// User presence
app.put('/api/chat/presence', chatController.updatePresence);

// File upload endpoint (basic implementation)
app.post('/api/chat/upload', async (req, res) => {
  try {
    // This is a placeholder for file upload handling
    // In a real implementation, you'd integrate with cloud storage (AWS S3, Cloudinary, etc.)
    const { fileName, fileType, fileData } = req.body;
    
    if (!fileName || !fileType || !fileData) {
      return res.status(400).json({
        success: false,
        error: 'File name, type, and data are required'
      });
    }
    
    // Simulate file upload
    const fileUrl = `https://files.softwarehub.com/uploads/${Date.now()}_${fileName}`;
    
    res.json({
      success: true,
      fileUrl,
      fileName,
      fileType,
      uploadedAt: new Date(),
      message: 'File uploaded successfully (simulated)'
    });
    
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file',
      message: error.message
    });
  }
});

// Chat analytics endpoint (for admin)
app.get('/api/chat/analytics', async (req, res) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    const userRole = req.user?.role || req.headers['x-user-role'];
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin privileges required'
      });
    }
    
    // Basic analytics data
    const analytics = {
      totalConnectedUsers: io.engine.clientsCount,
      totalActiveRooms: io.sockets.adapter.rooms.size,
      serverUptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date()
    };
    
    res.json({
      success: true,
      analytics
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics',
      message: error.message
    });
  }
});

// WebRTC signaling endpoints (for voice/video calls)
app.post('/api/chat/webrtc/offer', (req, res) => {
  const { targetUserId, offer, callId } = req.body;
  
  // Forward WebRTC offer to target user via Socket.IO
  io.to(`user:${targetUserId}`).emit('webrtc-offer', {
    callId,
    offer,
    from: req.user?.id || req.headers['x-user-id']
  });
  
  res.json({ success: true, message: 'Offer sent' });
});

app.post('/api/chat/webrtc/answer', (req, res) => {
  const { targetUserId, answer, callId } = req.body;
  
  // Forward WebRTC answer to caller
  io.to(`user:${targetUserId}`).emit('webrtc-answer', {
    callId,
    answer,
    from: req.user?.id || req.headers['x-user-id']
  });
  
  res.json({ success: true, message: 'Answer sent' });
});

app.post('/api/chat/webrtc/ice-candidate', (req, res) => {
  const { targetUserId, candidate, callId } = req.body;
  
  // Forward ICE candidate
  io.to(`user:${targetUserId}`).emit('webrtc-ice-candidate', {
    callId,
    candidate,
    from: req.user?.id || req.headers['x-user-id']
  });
  
  res.json({ success: true, message: 'ICE candidate sent' });
});

// Initialize socket handlers
socketServer.init(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Chat service error:', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `${req.method} ${req.url} is not a valid endpoint`,
    availableEndpoints: [
      'GET /health',
      'GET /api/chat/rooms/:userId',
      'POST /api/chat/room',
      'GET /api/chat/messages/:roomId',
      'GET /api/chat/search',
      'POST /api/chat/upload',
      'PUT /api/chat/presence'
    ]
  });
});

// Graceful shutdown handler
async function gracefulShutdown() {
  console.log('Shutting down chat service gracefully...');
  
  try {
    // Close Socket.IO server
    if (io) {
      io.close((err) => {
        if (err) {
          console.error('Error closing Socket.IO server:', err);
        } else {
          console.log('Socket.IO server closed');
        }
      });
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
    console.log('🚀 Initializing enhanced chat service...');
    
    // Initialize chat controller and MongoDB connection
    await chatController.initialize();
    
    // Initialize Redis (optional) - continue without it if it fails
    await initializeRedis();
    
    // Initialize MongoDB (optional) - continue without it if it fails
    await initializeMongoDB();
    
    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`✅ Enhanced chat service running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5000'}`);
      console.log(`📡 Socket.IO server initialized with advanced features`);
      console.log(`🗄️  Database: ${mongoClient ? 'MongoDB Connected' : 'In-Memory Mode'}`);
      console.log(`⚡ Cache: ${redisClient ? 'Redis Connected' : 'No Cache'}`);
      console.log('');
      console.log('🎯 Available Features:');
      console.log('  • Real-time messaging with Socket.IO');
      console.log('  • Room management (direct, group, channels)');
      console.log('  • Message reactions and editing');
      console.log('  • Typing indicators and presence');
      console.log('  • File sharing capabilities');
      console.log('  • Message search and history');
      console.log('  • Admin controls and broadcasts');
      console.log('  • WebRTC signaling for voice/video calls');
      console.log('  • Read receipts and delivery status');
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Failed to start chat service:', error);
    process.exit(1);
  }
}

// Start the enhanced chat service
startServer();

module.exports = { app, server, io };