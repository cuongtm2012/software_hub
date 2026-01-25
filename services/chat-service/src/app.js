require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const chatController = require('./controllers/chatController');
const socketServer = require('./socket/socketServer');
const redisService = require('./services/redisService');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5000",
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
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

// Health check endpoint ONLY
app.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    service: 'chat-service',
    timestamp: new Date().toISOString(),
    dependencies: {
      redis: redisService.isConnected ? 'connected' : 'disconnected',
      socketio: io ? 'initialized' : 'not_initialized'
    },
    stats: {
      connectedUsers: io.engine.clientsCount,
      uptime: process.uptime()
    }
  });
});

// Get user's chat rooms (REST API for compatibility)
app.get('/api/chat/rooms/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const mongoService = require('./services/mongoService');

    console.log('📥 REST API: Get rooms for user:', userId);

    const rooms = await mongoService.getUserRooms(userId);

    console.log(`✅ REST API: Returning ${rooms.length} rooms`);

    res.json({
      success: true,
      rooms,
      totalCount: rooms.length
    });
  } catch (error) {
    console.error('❌ REST API: Failed to get rooms:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user rooms',
      message: error.message
    });
  }
});

// ==========================================
// NO REST API ROUTES - WEBSOCKET ONLY
// ==========================================
// All chat functionality is handled via WebSocket events:
// - get-user-list: Get users with online status
// - create-room: Create chat room
// - join-room: Join room and get messages
// - send-message: Send message
// - typing-start/stop: Typing indicators
// - user-online/offline: Presence updates
// ==========================================

// Error handling
app.use((err, req, res, next) => {
  console.error('Chat service error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Graceful shutdown
async function gracefulShutdown() {
  console.log('Shutting down chat service...');

  try {
    if (io) {
      io.close();
      console.log('Socket.IO server closed');
    }

    await redisService.disconnect();

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

// Start server
async function startServer() {
  try {
    console.log('🚀 Starting chat service...');

    // Initialize Redis
    await redisService.connect();

    // Initialize MongoDB
    await chatController.initialize();

    // Initialize Socket.IO handlers
    await socketServer.init(io);

    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`✅ Chat service running on port ${PORT}`);
      console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5000'}`);
      console.log(`⚡ Redis: ${redisService.isConnected ? 'Connected' : 'Disconnected'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Failed to start chat service:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, server, io };