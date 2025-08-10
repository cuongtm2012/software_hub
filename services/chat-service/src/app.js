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

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5000",
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'chat-service' });
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

server.listen(PORT, () => {
  console.log(`Chat service running on port ${PORT}`);
});

module.exports = { app, server, io };