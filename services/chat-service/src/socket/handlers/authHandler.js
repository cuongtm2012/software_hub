const jwt = require('../utils/jwt');

class AuthHandler {
  authenticate(socket, next) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }
      
      // For development, we'll accept a simple user object
      // In production, verify JWT token properly
      const cleanToken = token.replace('Bearer ', '');
      
      try {
        // Try to parse as JWT first
        const decoded = jwt.verifyToken(cleanToken);
        socket.userId = decoded.userId;
        socket.userName = decoded.userName;
        socket.userRole = decoded.role;
      } catch (jwtError) {
        // Fallback for development - parse as JSON
        try {
          const userInfo = JSON.parse(cleanToken);
          socket.userId = userInfo.id;
          socket.userName = userInfo.name;
          socket.userRole = userInfo.role;
        } catch (parseError) {
          return next(new Error('Invalid authentication token'));
        }
      }
      
      console.log(`Socket authenticated: User ${socket.userId} (${socket.userRole})`);
      next();
      
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  }

  // Middleware to check if user is admin
  requireAdmin(socket, next) {
    if (socket.userRole !== 'admin') {
      return next(new Error('Admin access required'));
    }
    next();
  }

  // Middleware to check if user has access to specific room
  async checkRoomAccess(socket, roomId) {
    // This would typically check database for room permissions
    // For now, return true for authenticated users
    return socket.userId ? true : false;
  }
}

module.exports = new AuthHandler();