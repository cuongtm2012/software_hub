const jwt = require('../utils/jwt');

class AuthHandler {
  authenticate(socket, next) {
    try {
      // Handle authentication via query parameters or headers for development
      const authData = socket.handshake.auth || {};
      const headers = socket.handshake.headers || {};
      
      // Try to get user info from various sources
      let userId, userName, userRole, userAvatar;
      
      // Method 1: Direct auth data from client
      if (authData.userId || authData.userName) {
        userId = authData.userId;
        userName = authData.userName;
        userRole = authData.userRole || 'user';
        userAvatar = authData.userAvatar || '';
      }
      // Method 2: From headers (our enhanced method)
      else if (headers['x-user-id']) {
        userId = headers['x-user-id'];
        userName = headers['x-user-name'] || 'Unknown User';
        userRole = headers['x-user-role'] || 'user';
        userAvatar = headers['x-user-avatar'] || '';
      }
      // Method 3: JWT token (production method)
      else {
        const token = authData.token || headers.authorization;
        
        if (!token) {
          // For development, allow connection and wait for authenticate event
          console.log('No initial auth data, waiting for authenticate event...');
          socket.userId = null;
          socket.userName = null;
          socket.userRole = null;
          socket.userAvatar = null;
          return next();
        }
        
        const cleanToken = token.replace('Bearer ', '');
        
        try {
          // Try to parse as JWT first
          const jwt = require('../utils/jwt');
          const decoded = jwt.verifyToken(cleanToken);
          userId = decoded.userId;
          userName = decoded.userName;
          userRole = decoded.role;
          userAvatar = decoded.avatar || '';
        } catch (jwtError) {
          console.log('JWT verification failed, continuing without auth...');
          socket.userId = null;
          socket.userName = null;
          socket.userRole = null;
          socket.userAvatar = null;
          return next();
        }
      }
      
      // Set socket properties
      socket.userId = userId;
      socket.userName = userName;
      socket.userRole = userRole || 'user';
      socket.userAvatar = userAvatar || '';
      
      console.log(`Socket pre-authenticated: User ${socket.userId} (${socket.userRole}) - ${socket.userName}`);
      next();
      
    } catch (error) {
      console.error('Socket authentication error:', error);
      // Don't fail authentication in development, just log and continue
      socket.userId = null;
      socket.userName = null;
      socket.userRole = null;
      socket.userAvatar = null;
      next();
    }
  }

  // Handle explicit authenticate event from client
  handleAuthenticate(socket, data) {
    try {
      const { userId, userName, userRole, userAvatar } = data;
      
      if (!userId || !userName) {
        socket.emit('authenticated', {
          success: false,
          error: 'User ID and name are required'
        });
        return;
      }
      
      // Update socket properties
      socket.userId = userId;
      socket.userName = userName;
      socket.userRole = userRole || 'user';
      socket.userAvatar = userAvatar || '';
      
      console.log(`Socket authenticated via event: User ${socket.userId} (${socket.userRole}) - ${socket.userName}`);
      
      socket.emit('authenticated', {
        success: true,
        user: {
          id: socket.userId,
          name: socket.userName,
          role: socket.userRole,
          avatar: socket.userAvatar
        }
      });
      
    } catch (error) {
      console.error('Authenticate event error:', error);
      socket.emit('authenticated', {
        success: false,
        error: 'Authentication failed'
      });
    }
  }

  // Middleware to check if user is authenticated
  requireAuth(socket, next) {
    if (!socket.userId) {
      return next(new Error('Authentication required'));
    }
    next();
  }

  // Middleware to check if user is admin
  requireAdmin(socket, next) {
    if (!socket.userId) {
      return next(new Error('Authentication required'));
    }
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