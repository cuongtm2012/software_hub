require('dotenv').config();
const admin = require('firebase-admin');

class FCMService {
  constructor() {
    this.messaging = null;
    this.isInitialized = false;
    this.init();
  }

  async init() {
    try {
      // Check if Firebase is already initialized
      if (admin.apps.length > 0) {
        this.messaging = admin.messaging();
        this.isInitialized = true;
        console.log('FCM Service: Using existing Firebase app');
        return;
      }

      // Initialize Firebase Admin SDK
      const firebaseConfig = this.getFirebaseConfig();
      
      if (!firebaseConfig) {
        console.warn('FCM Service: Firebase not configured, running in simulation mode');
        this.isInitialized = false;
        return;
      }

      admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
        projectId: process.env.FIREBASE_PROJECT_ID
      });

      this.messaging = admin.messaging();
      this.isInitialized = true;
      console.log('FCM Service: Initialized successfully');

    } catch (error) {
      console.error('FCM Service: Initialization failed:', error.message);
      console.warn('FCM Service: Running in simulation mode');
      this.isInitialized = false;
    }
  }

  getFirebaseConfig() {
    // Method 1: Service Account Key file
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      try {
        return require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      } catch (error) {
        console.warn('Failed to load service account from file:', error.message);
      }
    }

    // Method 2: Environment variables
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      return {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
      };
    }

    // Method 3: Base64 encoded service account (for deployment)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      try {
        const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString();
        return JSON.parse(decoded);
      } catch (error) {
        console.warn('Failed to decode base64 service account:', error.message);
      }
    }

    return null;
  }

  async sendToUser(userId, notification) {
    try {
      if (!this.isInitialized) {
        return this.simulateNotification(userId, notification, 'user');
      }

      // Get user's FCM tokens from database
      const tokens = await this.getUserTokens(userId);
      
      if (!tokens || tokens.length === 0) {
        console.warn(`No FCM tokens found for user ${userId}`);
        return this.simulateNotification(userId, notification, 'user');
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.imageUrl && { imageUrl: notification.imageUrl })
        },
        data: {
          ...notification.data,
          userId: userId.toString(),
          timestamp: new Date().toISOString()
        },
        tokens: tokens
      };

      const response = await this.messaging.sendMulticast(message);
      
      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            console.error(`Failed to send to token ${tokens[idx]}: ${resp.error}`);
          }
        });
        
        // Remove invalid tokens from database
        await this.removeInvalidTokens(userId, failedTokens);
      }

      console.log(`FCM notification sent to user ${userId}: ${response.successCount}/${tokens.length} delivered`);
      
      return {
        success: true,
        messageId: response.responses[0]?.messageId || `fcm_${Date.now()}`,
        userId,
        deliveredCount: response.successCount,
        failedCount: response.failureCount,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('FCM send error:', error);
      return this.simulateNotification(userId, notification, 'user', error);
    }
  }

  async sendToMultipleUsers(userIds, notification) {
    try {
      const results = [];
      const batchSize = 500; // FCM batch limit

      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(
          batch.map(userId => this.sendToUser(userId, notification))
        );

        batchResults.forEach((result, index) => {
          const userId = batch[index];
          if (result.status === 'fulfilled') {
            results.push({ userId, ...result.value });
          } else {
            results.push({ 
              userId, 
              success: false, 
              error: result.reason?.message || 'Unknown error' 
            });
          }
        });
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      return {
        success: successCount > 0,
        results,
        successCount,
        failureCount,
        totalCount: results.length
      };

    } catch (error) {
      console.error('FCM bulk send error:', error);
      throw new Error(`FCM bulk send failed: ${error.message}`);
    }
  }

  async sendToTopic(topic, notification) {
    try {
      if (!this.isInitialized) {
        return this.simulateNotification(topic, notification, 'topic');
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.imageUrl && { imageUrl: notification.imageUrl })
        },
        data: {
          ...notification.data,
          topic: topic,
          timestamp: new Date().toISOString()
        },
        topic: topic
      };

      const messageId = await this.messaging.send(message);
      
      console.log(`FCM notification sent to topic ${topic}: ${messageId}`);

      return {
        success: true,
        messageId,
        topic,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('FCM topic send error:', error);
      return this.simulateNotification(topic, notification, 'topic', error);
    }
  }

  async getUserTokens(userId) {
    try {
      // Try to get tokens from database
      if (global.pgPool) {
        const client = await global.pgPool.connect();
        try {
          const result = await client.query(
            'SELECT token FROM fcm_tokens WHERE user_id = $1 AND active = true',
            [userId]
          );
          return result.rows.map(row => row.token);
        } finally {
          client.release();
        }
      }

      // Fallback: return empty array
      return [];
    } catch (error) {
      console.error('Error getting user tokens:', error);
      return [];
    }
  }

  async removeInvalidTokens(userId, invalidTokens) {
    try {
      if (!global.pgPool || !invalidTokens.length) return;

      const client = await global.pgPool.connect();
      try {
        await client.query(
          'UPDATE fcm_tokens SET active = false WHERE user_id = $1 AND token = ANY($2)',
          [userId, invalidTokens]
        );
        console.log(`Removed ${invalidTokens.length} invalid tokens for user ${userId}`);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error removing invalid tokens:', error);
    }
  }

  async subscribeToTopic(tokens, topic) {
    try {
      if (!this.isInitialized) {
        console.log(`[SIMULATION] Subscribing ${tokens.length} tokens to topic ${topic}`);
        return { success: true, topic, tokensCount: tokens.length };
      }

      const response = await this.messaging.subscribeToTopic(tokens, topic);
      
      console.log(`Subscribed ${tokens.length} tokens to topic ${topic}: ${response.successCount} successful`);

      return {
        success: true,
        topic,
        tokensCount: tokens.length,
        successCount: response.successCount,
        failureCount: response.failureCount
      };

    } catch (error) {
      console.error('FCM topic subscription error:', error);
      throw new Error(`FCM topic subscription failed: ${error.message}`);
    }
  }

  async unsubscribeFromTopic(tokens, topic) {
    try {
      if (!this.isInitialized) {
        console.log(`[SIMULATION] Unsubscribing ${tokens.length} tokens from topic ${topic}`);
        return { success: true, topic, tokensCount: tokens.length };
      }

      const response = await this.messaging.unsubscribeFromTopic(tokens, topic);
      
      console.log(`Unsubscribed ${tokens.length} tokens from topic ${topic}: ${response.successCount} successful`);

      return {
        success: true,
        topic,
        tokensCount: tokens.length,
        successCount: response.successCount,
        failureCount: response.failureCount
      };

    } catch (error) {
      console.error('FCM topic unsubscription error:', error);
      throw new Error(`FCM topic unsubscription failed: ${error.message}`);
    }
  }

  async validateToken(token) {
    try {
      if (!this.isInitialized) {
        console.log(`[SIMULATION] Validating token: ${token.substr(0, 20)}...`);
        return { valid: true, token };
      }

      // Send a test message to validate token
      const message = {
        data: { test: 'validation' },
        token: token
      };

      await this.messaging.send(message);
      
      return { valid: true, token };

    } catch (error) {
      console.error('FCM token validation error:', error);
      return {
        valid: false,
        token,
        error: error.message
      };
    }
  }

  simulateNotification(target, notification, type, error = null) {
    const result = {
      success: !error,
      messageId: `fcm_sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      simulation: true
    };

    if (type === 'user') {
      result.userId = target;
      console.log(`[FCM SIMULATION] Notification to user ${target}:`, notification);
    } else if (type === 'topic') {
      result.topic = target;
      console.log(`[FCM SIMULATION] Notification to topic ${target}:`, notification);
    }

    if (error) {
      result.error = error.message;
      console.error(`[FCM SIMULATION ERROR] ${error.message}`);
    }

    return result;
  }

  // Add method to register FCM token
  async registerToken(userId, token, deviceType = 'web') {
    try {
      if (!global.pgPool) {
        console.log(`[SIMULATION] Registering token for user ${userId}`);
        return { success: true, simulation: true };
      }

      const client = await global.pgPool.connect();
      try {
        // Insert or update token
        await client.query(`
          INSERT INTO fcm_tokens (user_id, token, device_type, created_at, updated_at, active)
          VALUES ($1, $2, $3, NOW(), NOW(), true)
          ON CONFLICT (user_id, token)
          DO UPDATE SET updated_at = NOW(), active = true
        `, [userId, token, deviceType]);

        console.log(`Registered FCM token for user ${userId}`);
        return { success: true };
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error registering FCM token:', error);
      throw error;
    }
  }

  // Get service status
  getStatus() {
    return {
      initialized: this.isInitialized,
      mode: this.isInitialized ? 'production' : 'simulation',
      hasFirebaseConfig: !!this.getFirebaseConfig(),
      projectId: process.env.FIREBASE_PROJECT_ID || 'not_configured'
    };
  }
}

module.exports = new FCMService();