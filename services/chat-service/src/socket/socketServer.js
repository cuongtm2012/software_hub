const messageHandler = require('./handlers/messageHandler');
const presenceHandler = require('./handlers/presenceHandler');
const authHandler = require('./handlers/authHandler');

class SocketServer {
  init(io) {
    this.io = io;
    
    // Authentication middleware
    io.use(authHandler.authenticate);
    
    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId} (${socket.userRole})`);
      
      // Join user to their personal room
      socket.join(`user:${socket.userId}`);
      
      // Handle presence
      presenceHandler.handleConnection(socket, io);
      
      // Message handlers
      socket.on('join-room', (data) => messageHandler.handleJoinRoom(socket, data));
      socket.on('leave-room', (data) => messageHandler.handleLeaveRoom(socket, data));
      socket.on('send-message', (data) => messageHandler.handleSendMessage(socket, io, data));
      socket.on('typing-start', (data) => messageHandler.handleTypingStart(socket, data));
      socket.on('typing-stop', (data) => messageHandler.handleTypingStop(socket, data));
      
      // Admin-specific handlers
      if (socket.userRole === 'admin') {
        socket.on('admin-broadcast', (data) => messageHandler.handleAdminBroadcast(socket, io, data));
      }
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
        presenceHandler.handleDisconnection(socket, io);
      });
    });
  }
}

module.exports = new SocketServer();