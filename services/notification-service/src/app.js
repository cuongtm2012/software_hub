const express = require('express');
const cors = require('cors');
const notificationController = require('./controllers/notificationController');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service' });
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

app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});

module.exports = app;