require('dotenv').config();

const express = require('express');
const cors = require('cors');
const emailController = require('./controllers/emailController');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Redis connection
let redisClient;
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
    // Don't exit, continue without Redis for basic functionality
    return null;
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint with dependency status
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    service: 'email-service',
    timestamp: new Date().toISOString(),
    dependencies: {
      redis: redisClient ? (redisClient.isOpen ? 'connected' : 'disconnected') : 'not_configured'
    }
  };
  
  // Check if SendGrid is configured
  if (process.env.SENDGRID_API_KEY) {
    health.dependencies.sendgrid = 'configured';
  } else {
    health.dependencies.sendgrid = 'not_configured';
  }
  
  res.json(health);
});

// Email routes
app.post('/api/send-email', emailController.sendEmail);
app.post('/api/send-template-email', emailController.sendTemplateEmail);
app.get('/api/email-status/:id', emailController.getEmailStatus);

// Test email endpoints for all scenarios
app.post('/api/test-welcome', emailController.testWelcomeEmail);
app.post('/api/test-activation', emailController.testActivationEmail);
app.post('/api/test-password-reset', emailController.testPasswordResetEmail);
app.post('/api/test-order-confirmation', emailController.testOrderConfirmationEmail);
app.post('/api/test-project-notification', emailController.testProjectNotificationEmail);
app.post('/api/test-newsletter-confirmation', emailController.testNewsletterConfirmationEmail);
app.post('/api/test-account-deactivation', emailController.testAccountDeactivationEmail);
app.post('/api/test-account-reactivation', emailController.testAccountReactivationEmail);
app.post('/api/test-marketing', emailController.testMarketingEmail);
app.post('/api/test-support-notification', emailController.testSupportNotificationEmail);
app.post('/api/test-bulk', emailController.testBulkEmails);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Email service error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Graceful shutdown handler
async function gracefulShutdown() {
  console.log('Shutting down email service gracefully...');
  
  try {
    if (redisClient) {
      await redisClient.quit();
      console.log('Redis connection closed');
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
    console.log('Initializing email service...');
    
    // Initialize Redis
    await initializeRedis();
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`Email service running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`SendGrid configured: ${!!process.env.SENDGRID_API_KEY}`);
    });
    
  } catch (error) {
    console.error('Failed to start email service:', error);
    process.exit(1);
  }
}

// Start the service
startServer();

module.exports = app;