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