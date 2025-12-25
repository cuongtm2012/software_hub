const authService = require('../../services/authService');
const redisService = require('../../services/redisService');

class AuthHandler {
  /**
   * Socket.IO middleware for initial authentication
   * Extracts session token from cookies
   */
  authenticate(socket, next) {
    try {
      // Extract session token from cookie
      const cookieString = socket.handshake.headers.cookie;
      const sessionToken = authService.extractSessionToken(cookieString);
      
      if (sessionToken) {
        // Store token for later verification
        socket.pendingToken = sessionToken;
        console.log(`Token extracted from cookie: ${sessionToken.substring(0, 8)}...`);
      } else {
        console.log('No session token in cookie, will require manual auth');
      }
      
      socket.isAuthenticated = false;
      next();
      
    } catch (error) {
      console.error('Socket authentication middleware error:', error);
      socket.isAuthenticated = false;
      next();
    }
  }

  /**
   * Handle authenticate event from client
   * Verifies token with Main App API
   */
  async handleAuthenticate(socket, data) {
    try {
      const { userId, userName, userRole, userAvatar, token } = data;
      
      // Priority 1: Verify token with Main App
      const authToken = token || socket.pendingToken;
      
      if (authToken) {
        console.log('🔐 Verifying session token with Main App...');
        const user = await authService.verifyToken(authToken);
        
        if (user) {
          // Token valid - authenticate user
          await this.setUserAuthenticated(socket, {
            userId: user.id.toString(),
            userName: user.name,
            userRole: user.role,
            userAvatar: user.avatar || ''
          });
          
          socket.emit('authenticated', {
            success: true,
            user: {
              id: user.id,
              name: user.name,
              role: user.role,
              avatar: user.avatar
            },
            message: 'Authenticated with Main App'
          });
          
          return;
        } else {
          console.log('❌ Token verification failed with Main App');
          socket.emit('authenticated', {
            success: false,
            error: 'Invalid or expired session. Please log in again.'
          });
          return;
        }
      }
      
      // Priority 2: Manual auth data (development/testing only)
      if (userId && userName) {
        console.log('⚠️ Manual authentication (development mode)');
        
        // Verify user exists in Main App
        const user = await authService.getUserById(userId);
        if (!user) {
          socket.emit('authenticated', {
            success: false,
            error: 'User not found in Main App'
          });
          return;
        }
        
        await this.setUserAuthenticated(socket, {
          userId: userId.toString(),
          userName: user.name,
          userRole: user.role,
          userAvatar: user.avatar || ''
        });
        
        socket.emit('authenticated', {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            role: user.role,
            avatar: user.avatar
          },
          message: 'Authenticated (development mode)'
        });
        
        return;
      }
      
      // No valid auth method
      socket.emit('authenticated', {
        success: false,
        error: 'Authentication required. Please provide valid session token.'
      });
      
    } catch (error) {
      console.error('❌ Authenticate event error:', error);
      socket.emit('authenticated', {
        success: false,
        error: 'Authentication failed: ' + error.message
      });
    }
  }

  /**
   * Set user as authenticated and update Redis
   * @private
   */
  async setUserAuthenticated(socket, userData) {
    const { userId, userName, userRole, userAvatar } = userData;
    
    // Set socket properties
    socket.userId = userId;
    socket.userName = userName;
    socket.userRole = userRole;
    socket.userAvatar = userAvatar;
    socket.isAuthenticated = true;
    
    // Set user as online in Redis
    await redisService.setUserOnline(userId, {
      userName,
      userRole,
      userAvatar
    });
    
    // Join personal room for notifications
    socket.join(`user:${userId}`);
    
    console.log(`✅ User authenticated: ${userId} (${userRole}) - ${userName}`);
  }

  /**
   * Handle user disconnect
   */
  async handleDisconnect(socket) {
    if (socket.userId) {
      // Set user as offline in Redis
      await redisService.setUserOffline(socket.userId);
      console.log(`User ${socket.userId} set as offline`);
    }
  }

  /**
   * Middleware to check if user is authenticated
   */
  requireAuth(socket, next) {
    if (!socket.isAuthenticated || !socket.userId) {
      return next(new Error('Authentication required'));
    }
    next();
  }

  /**
   * Middleware to check if user is admin
   */
  requireAdmin(socket, next) {
    if (!socket.isAuthenticated || !socket.userId) {
      return next(new Error('Authentication required'));
    }
    if (socket.userRole !== 'admin') {
      return next(new Error('Admin access required'));
    }
    next();
  }

  /**
   * Check if user has access to specific room
   */
  async checkRoomAccess(socket, roomId) {
    if (!socket.isAuthenticated) {
      return false;
    }
    
    // TODO: Check MongoDB for room participants
    // For now, allow access if authenticated
    return true;
  }
}

module.exports = new AuthHandler();