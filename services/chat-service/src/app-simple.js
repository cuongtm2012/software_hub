require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

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

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5000",
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    service: 'chat-service-simple',
    timestamp: new Date().toISOString(),
    dependencies: {
      redis: 'not_available',
      mongodb: 'not_available',
      socketio: 'initialized'
    },
    features: ['real-time-messaging', 'socket-io-api'],
    note: 'Running in basic mode without Redis/MongoDB for testing'
  };
  
  res.json(health);
});

// Basic REST API endpoints (mock responses without MongoDB)
app.get('/api/chat/rooms/:userId', (req, res) => {
  res.json({
    success: false,
    message: 'MongoDB not connected - use Socket.IO for real-time messaging',
    rooms: []
  });
});

app.get('/api/chat/messages/:roomId', (req, res) => {
  res.json({
    success: false,
    message: 'MongoDB not connected - use Socket.IO for real-time messaging',
    messages: []
  });
});

app.post('/api/chat/room', (req, res) => {
  res.json({
    success: false,
    message: 'MongoDB not connected - use Socket.IO for real-time messaging',
    roomId: 'mock-room-' + Date.now()
  });
});

// Socket.IO real-time functionality
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join room
  socket.on('join-room', (data) => {
    const { roomId, userId } = data;
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);
    
    // Notify others in the room
    socket.to(roomId).emit('user-joined', {
      userId,
      roomId,
      timestamp: new Date().toISOString()
    });
  });
  
  // Leave room
  socket.on('leave-room', (data) => {
    const { roomId, userId } = data;
    socket.leave(roomId);
    console.log(`User ${userId} left room ${roomId}`);
    
    // Notify others in the room
    socket.to(roomId).emit('user-left', {
      userId,
      roomId,
      timestamp: new Date().toISOString()
    });
  });
  
  // Send message
  socket.on('send-message', (data) => {
    const { roomId, userId, message, timestamp } = data;
    console.log(`Message from ${userId} in ${roomId}: ${message}`);
    
    // Broadcast message to all users in the room
    io.to(roomId).emit('message-received', {
      userId,
      message,
      roomId,
      timestamp: timestamp || new Date().toISOString(),
      messageId: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    });
  });
  
  // Typing indicators
  socket.on('typing-start', (data) => {
    const { roomId, userId } = data;
    socket.to(roomId).emit('typing-indicator', {
      userId,
      isTyping: true,
      roomId
    });
  });
  
  socket.on('typing-stop', (data) => {
    const { roomId, userId } = data;
    socket.to(roomId).emit('typing-indicator', {
      userId,
      isTyping: false,
      roomId
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Chat service error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start HTTP server
server.listen(PORT, () => {
  console.log(`✅ Chat service running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5000'}`);
  console.log(`📡 Socket.IO server initialized and ready`);
  console.log(`🚀 Ready for real-time messaging without external dependencies`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down chat service...');
  server.close(() => {
    console.log('Chat service shut down successfully');
    process.exit(0);
  });
});

module.exports = { app, server, io };