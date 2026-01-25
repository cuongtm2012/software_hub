require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Firebase service for testing
const mockFirebaseService = {
  sendNotification: async (notification) => {
    console.log('📱 Sending notification:', notification);
    return {
      success: true,
      messageId: 'mock-fcm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      notification: notification
    };
  },
  
  sendBulkNotifications: async (notifications) => {
    console.log('📱 Sending bulk notifications:', notifications.length, 'notifications');
    return {
      success: true,
      results: notifications.map((notification, index) => ({
        messageId: 'mock-fcm-bulk-' + Date.now() + '-' + index,
        notification: notification
      }))
    };
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    service: 'notification-service-simple',
    timestamp: new Date().toISOString(),
    dependencies: {
      redis: 'not_available',
      postgresql: 'not_available',
      firebase: 'mock_mode'
    },
    features: ['push-notifications', 'bulk-notifications', 'test-endpoints'],
    note: 'Running in mock mode for testing without external dependencies'
  };
  
  res.json(health);
});

// Basic notification endpoints
app.post('/api/notifications/send', async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;
    
    if (!userId || !title || !body) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, title, body'
      });
    }
    
    const notification = {
      userId,
      title,
      body,
      data: data || {},
      timestamp: new Date().toISOString(),
      type: 'custom'
    };
    
    const result = await mockFirebaseService.sendNotification(notification);
    
    res.json({
      success: true,
      messageId: result.messageId,
      notification: result.notification,
      message: 'Notification sent successfully (mock mode)'
    });
    
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send notification',
      details: error.message
    });
  }
});

app.post('/api/notifications/send-bulk', async (req, res) => {
  try {
    const { userIds, title, body, data } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || !title || !body) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userIds (array), title, body'
      });
    }
    
    const notifications = userIds.map(userId => ({
      userId,
      title,
      body,
      data: data || {},
      timestamp: new Date().toISOString(),
      type: 'bulk'
    }));
    
    const result = await mockFirebaseService.sendBulkNotifications(notifications);
    
    res.json({
      success: true,
      count: notifications.length,
      results: result.results,
      message: 'Bulk notifications sent successfully (mock mode)'
    });
    
  } catch (error) {
    console.error('Send bulk notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send bulk notifications',
      details: error.message
    });
  }
});

// Test notification endpoints
const notificationTypes = {
  'test-new-message': {
    title: '💬 New Message',
    body: 'You have received a new message from John Doe',
    data: { type: 'message', senderId: 123 }
  },
  'test-comment': {
    title: '💭 New Comment',
    body: 'Someone commented on your post: "Great work!"',
    data: { type: 'comment', postId: 456 }
  },
  'test-maintenance-alert': {
    title: '🔧 System Maintenance',
    body: 'Scheduled maintenance will begin in 30 minutes',
    data: { type: 'maintenance', startTime: '2025-08-22T04:00:00Z' }
  },
  'test-system-update': {
    title: '🆙 System Update',
    body: 'New features and improvements are now available',
    data: { type: 'system_update', version: '2.1.0' }
  },
  'test-order-confirmation': {
    title: '✅ Order Confirmed',
    body: 'Your order #12345 has been confirmed and is being processed',
    data: { type: 'order', orderId: 12345, amount: 99.99 }
  },
  'test-payment-failure': {
    title: '❌ Payment Failed',
    body: 'We could not process your payment. Please update your payment method',
    data: { type: 'payment_failure', orderId: 12346 }
  },
  'test-event-reminder': {
    title: '📅 Event Reminder',
    body: 'SoftwareHub Developer Meetup starts in 1 hour',
    data: { type: 'event', eventId: 789, startTime: '2025-08-22T19:00:00Z' }
  },
  'test-subscription-renewal': {
    title: '🔄 Subscription Renewal',
    body: 'Your Pro subscription will renew in 3 days',
    data: { type: 'subscription', planType: 'pro', renewalDate: '2025-08-25' }
  },
  'test-promotional-offer': {
    title: '🎉 Special Offer',
    body: '50% off all premium features this weekend only!',
    data: { type: 'promotion', discount: 50, validUntil: '2025-08-24' }
  },
  'test-unusual-login': {
    title: '🔒 Security Alert',
    body: 'Unusual login detected from new device in New York',
    data: { type: 'security', location: 'New York', device: 'Chrome on Windows' }
  },
  'test-password-change': {
    title: '🔑 Password Changed',
    body: 'Your password has been successfully updated',
    data: { type: 'password_change', timestamp: new Date().toISOString() }
  }
};

// Create test endpoints for each notification type
Object.keys(notificationTypes).forEach(endpoint => {
  app.post(`/api/notifications/${endpoint}`, async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: userId'
        });
      }
      
      const template = notificationTypes[endpoint];
      const notification = {
        userId,
        title: template.title,
        body: template.body,
        data: template.data,
        timestamp: new Date().toISOString(),
        type: endpoint
      };
      
      const result = await mockFirebaseService.sendNotification(notification);
      
      res.json({
        success: true,
        messageId: result.messageId,
        notification: result.notification,
        message: `${endpoint} notification sent successfully (mock mode)`
      });
      
    } catch (error) {
      console.error(`${endpoint} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to send ${endpoint} notification`,
        details: error.message
      });
    }
  });
});

// Bulk test endpoint
app.post('/api/notifications/test-bulk', async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: userIds (array)'
      });
    }
    
    const testTypes = ['test-new-message', 'test-order-confirmation', 'test-event-reminder'];
    const notifications = userIds.map((userId, index) => {
      const typeKey = testTypes[index % testTypes.length];
      const template = notificationTypes[typeKey];
      
      return {
        userId,
        title: template.title,
        body: template.body,
        data: template.data,
        timestamp: new Date().toISOString(),
        type: typeKey
      };
    });
    
    const result = await mockFirebaseService.sendBulkNotifications(notifications);
    
    res.json({
      success: true,
      count: notifications.length,
      results: result.results,
      message: 'Bulk test notifications sent successfully (mock mode)'
    });
    
  } catch (error) {
    console.error('Bulk test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send bulk test notifications',
      details: error.message
    });
  }
});

// User notification management (mock responses)
app.get('/api/notifications/user/:userId', (req, res) => {
  const { userId } = req.params;
  
  res.json({
    success: false,
    message: 'Database not connected - notification history not available',
    userId: userId,
    notifications: []
  });
});

app.put('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: false,
    message: 'Database not connected - notification management not available',
    notificationId: id
  });
});

app.delete('/api/notifications/:id', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: false,
    message: 'Database not connected - notification deletion not available',
    notificationId: id
  });
});

// Subscription management
app.post('/api/notifications/subscribe', (req, res) => {
  const { userId, fcmToken, deviceType } = req.body;
  
  res.json({
    success: false,
    message: 'Database not connected - FCM token subscription not available',
    data: { userId, fcmToken, deviceType }
  });
});

app.delete('/api/notifications/unsubscribe/:token', (req, res) => {
  const { token } = req.params;
  
  res.json({
    success: false,
    message: 'Database not connected - FCM token unsubscription not available',
    token: token
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Notification service error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Notification service running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔥 Firebase: Mock mode (no external dependencies)`);
  console.log(`📱 Push notifications: Simulation mode`);
  console.log(`🧪 Test endpoints: 12+ notification types available`);
  console.log(`🚀 Ready for comprehensive notification testing`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down notification service...');
  process.exit(0);
});

module.exports = app;