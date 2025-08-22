const express = require('express');
const cors = require('cors');
const notificationController = require('./controllers/notificationController');

const app = express();
const PORT = process.env.PORT || 3003;

// Initialize Redis and PostgreSQL connections
let redisClient;
let pgPool;

async function initializeRedis() {
  try {
    const redis = require('redis');
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
    
    await redisClient.connect();
    console.log('Connected to Redis successfully');
    
    // Make Redis client available globally
    global.redisClient = redisClient;
    
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
}

async function initializePostgreSQL() {
  try {
    const { Pool } = require('pg');
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/softwarehub';
    
    pgPool = new Pool({
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    
    // Test connection
    const client = await pgPool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    console.log('Connected to PostgreSQL successfully');
    
    // Make PostgreSQL pool available globally
    global.pgPool = pgPool;
    
    return pgPool;
  } catch (error) {
    console.error('Failed to connect to PostgreSQL:', error);
    throw error;
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint with dependency status
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    service: 'notification-service',
    timestamp: new Date().toISOString(),
    dependencies: {
      redis: redisClient ? (redisClient.isOpen ? 'connected' : 'disconnected') : 'not_configured',
      postgresql: pgPool ? 'connected' : 'not_configured',
      firebase: process.env.FIREBASE_PROJECT_ID ? 'configured' : 'not_configured'
    }
  };
  
  res.json(health);
});

// Notification routes
app.post('/api/notifications/send', notificationController.sendNotification);
app.post('/api/notifications/send-bulk', notificationController.sendBulkNotifications);
app.get('/api/notifications/user/:userId', notificationController.getUserNotifications);
app.put('/api/notifications/:id/read', notificationController.markAsRead);
app.delete('/api/notifications/:id', notificationController.deleteNotification);

// Subscription management
app.post('/api/notifications/subscribe', notificationController.subscribe);
app.delete('/api/notifications/unsubscribe/:token', notificationController.unsubscribe);

// Testing endpoints for all notification scenarios
app.post('/api/notifications/test-new-message', notificationController.testNewMessage);
app.post('/api/notifications/test-comment', notificationController.testComment);
app.post('/api/notifications/test-maintenance-alert', notificationController.testMaintenanceAlert);
app.post('/api/notifications/test-system-update', notificationController.testSystemUpdate);
app.post('/api/notifications/test-order-confirmation', notificationController.testOrderConfirmation);
app.post('/api/notifications/test-payment-failure', notificationController.testPaymentFailure);
app.post('/api/notifications/test-event-reminder', notificationController.testEventReminder);
app.post('/api/notifications/test-subscription-renewal', notificationController.testSubscriptionRenewal);
app.post('/api/notifications/test-promotional-offer', notificationController.testPromotionalOffer);
app.post('/api/notifications/test-unusual-login', notificationController.testUnusualLogin);
app.post('/api/notifications/test-password-change', notificationController.testPasswordChange);
app.post('/api/notifications/test-bulk', notificationController.testBulkNotifications);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Notification service error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Graceful shutdown handler
async function gracefulShutdown() {
  console.log('Shutting down notification service gracefully...');
  
  try {
    // Close Redis connection
    if (redisClient) {
      await redisClient.quit();
      console.log('Redis connection closed');
    }
    
    // Close PostgreSQL pool
    if (pgPool) {
      await pgPool.end();
      console.log('PostgreSQL pool closed');
    }
    
    process.exit(0);
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
    console.log('Initializing notification service...');
    
    // Initialize Redis
    await initializeRedis();
    
    // Initialize PostgreSQL
    await initializePostgreSQL();
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`Notification service running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Firebase configured: ${!!process.env.FIREBASE_PROJECT_ID}`);
    });
    
  } catch (error) {
    console.error('Failed to start notification service:', error);
    process.exit(1);
  }
}

// Start the service
startServer();

module.exports = app;