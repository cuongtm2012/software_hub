const axios = require('axios');

class AuthService {
  constructor() {
    this.mainAppUrl = process.env.MAIN_APP_URL || 'http://localhost:5000';
    this.tokenCache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Verify token with main app and get user info
   * @param {string} token - Session token from cookie
   * @returns {object|null} User info or null if invalid
   */
  async verifyToken(token) {
    try {
      // Check cache first
      const cached = this.tokenCache.get(token);
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        console.log('✅ Token found in cache');
        return cached.user;
      }

      // Verify with main app
      console.log('🔐 Verifying token with main app...');
      const response = await axios.post(
        `${this.mainAppUrl}/api/auth/validate-token`,
        { token },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      if (response.status === 200 && response.data.valid && response.data.user) {
        const user = response.data.user;
        
        // Cache the result
        this.tokenCache.set(token, {
          user,
          timestamp: Date.now()
        });

        console.log(`✅ Token verified for user: ${user.email} (${user.role})`);
        return user;
      }

      return null;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.data?.valid === false) {
        console.log('❌ Token invalid or expired');
      } else {
        console.error('Token verification error:', error.message);
      }
      return null;
    }
  }

  /**
   * Get user list from main app
   * @returns {Array} List of users
   */
  async getUserList() {
    try {
      const url = `${this.mainAppUrl}/api/auth/users`;
      console.log('📥 Fetching user list from main app:', url);
      
      const response = await axios.get(url, {
        timeout: 5000,
        validateStatus: (status) => status < 500 // Don't throw on 4xx errors
      });

      console.log('📡 User list response:', {
        status: response.status,
        hasData: !!response.data,
        hasUsers: !!response.data?.users,
        userCount: response.data?.users?.length || 0
      });

      if (response.status === 200 && response.data?.users) {
        console.log(`✅ Fetched ${response.data.users.length} users from main app`);
        return response.data.users;
      }

      console.warn(`⚠️ Unexpected response from ${url}:`, response.status, response.data);
      return [];
    } catch (error) {
      console.error('❌ Failed to fetch user list from main app:', {
        message: error.message,
        code: error.code,
        response: error.response?.status,
        url: `${this.mainAppUrl}/api/auth/users`
      });
      return [];
    }
  }

  /**
   * Get user by ID from main app
   * @param {string|number} userId - User ID
   * @returns {object|null} User info or null
   */
  async getUserById(userId) {
    try {
      const response = await axios.get(`${this.mainAppUrl}/api/auth/users/${userId}`, {
        timeout: 5000
      });

      if (response.status === 200 && response.data?.user) {
        return response.data.user;
      }

      return null;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`User ${userId} not found in main app`);
      } else {
        console.error('User fetch error:', error.message);
      }
      return null;
    }
  }

  /**
   * Extract session token from cookie string
   * @param {string} cookieString - Cookie header value
   * @returns {string|null} Session token or null
   */
  extractSessionToken(cookieString) {
    if (!cookieString) return null;

    // Parse cookies
    const cookies = cookieString.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});

    // Look for connect.sid cookie (Express session)
    const sessionCookie = cookies['connect.sid'];
    if (!sessionCookie) return null;

    // Decode the session ID (remove s: prefix and signature)
    try {
      const decoded = decodeURIComponent(sessionCookie);
      // Express session format: s:sessionId.signature
      const sessionId = decoded.split('.')[0].replace('s:', '');
      return sessionId;
    } catch (error) {
      console.error('Failed to parse session cookie:', error);
      return null;
    }
  }

  /**
   * Clear token cache
   */
  clearCache() {
    this.tokenCache.clear();
    console.log('Token cache cleared');
  }

  /**
   * Remove specific token from cache
   * @param {string} token - Token to remove
   */
  invalidateToken(token) {
    this.tokenCache.delete(token);
  }
}

module.exports = new AuthService();
