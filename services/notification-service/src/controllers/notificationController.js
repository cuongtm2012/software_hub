const fcmService = require('../services/fcmService');
const dbService = require('../services/dbService');
const retryUtil = require('../utils/retry');

class NotificationController {
  async sendNotification(req, res) {
    try {
      const { userId, title, body, data, type = 'general' } = req.body;

      if (!userId || !title || !body) {
        return res.status(400).json({
          error: 'Missing required fields: userId, title, body'
        });
      }

      // Get user's FCM tokens
      const tokens = await dbService.getUserTokens(userId);
      
      if (tokens.length === 0) {
        return res.status(404).json({
          error: 'No FCM tokens found for user'
        });
      }

      // Create notification record
      const notification = await dbService.createNotification({
        userId,
        title,
        body,
        data: data || {},
        type,
        status: 'pending',
        createdAt: new Date()
      });

      // Send notification with retry
      const result = await retryUtil.withRetry(
        () => fcmService.sendToUser(userId, { title, body, data }),
        3,
        1000
      );

      // Update notification status
      await dbService.updateNotificationStatus(notification.id, 'sent');

      res.json({
        success: true,
        notificationId: notification.id,
        result,
        message: 'Notification sent successfully'
      });

    } catch (error) {
      console.error('Failed to send notification:', error);
      res.status(500).json({
        error: 'Failed to send notification',
        message: error.message
      });
    }
  }

  async sendBulkNotifications(req, res) {
    try {
      const { userIds, title, body, data, type = 'general' } = req.body;

      if (!userIds || !Array.isArray(userIds) || !title || !body) {
        return res.status(400).json({
          error: 'Missing required fields: userIds (array), title, body'
        });
      }

      const results = [];
      const errors = [];

      for (const userId of userIds) {
        try {
          const notification = await dbService.createNotification({
            userId,
            title,
            body,
            data: data || {},
            type,
            status: 'pending',
            createdAt: new Date()
          });

          const result = await retryUtil.withRetry(
            () => fcmService.sendToUser(userId, { title, body, data }),
            2, // Fewer retries for bulk
            500
          );

          await dbService.updateNotificationStatus(notification.id, 'sent');
          results.push({ userId, notificationId: notification.id, success: true });

        } catch (error) {
          console.error(`Failed to send notification to user ${userId}:`, error);
          errors.push({ userId, error: error.message });
        }
      }

      res.json({
        success: true,
        results,
        errors,
        message: `Sent ${results.length} notifications, ${errors.length} failed`
      });

    } catch (error) {
      console.error('Failed to send bulk notifications:', error);
      res.status(500).json({
        error: 'Failed to send bulk notifications',
        message: error.message
      });
    }
  }

  async getUserNotifications(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;

      const notifications = await dbService.getUserNotifications(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        unreadOnly: unreadOnly === 'true'
      });

      res.json({ notifications });

    } catch (error) {
      console.error('Failed to get user notifications:', error);
      res.status(500).json({
        error: 'Failed to get user notifications',
        message: error.message
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const notification = await dbService.markNotificationAsRead(id, userId);
      
      if (!notification) {
        return res.status(404).json({
          error: 'Notification not found'
        });
      }

      res.json({
        success: true,
        notification,
        message: 'Notification marked as read'
      });

    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      res.status(500).json({
        error: 'Failed to mark notification as read',
        message: error.message
      });
    }
  }

  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const deleted = await dbService.deleteNotification(id, userId);
      
      if (!deleted) {
        return res.status(404).json({
          error: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });

    } catch (error) {
      console.error('Failed to delete notification:', error);
      res.status(500).json({
        error: 'Failed to delete notification',
        message: error.message
      });
    }
  }

  async subscribe(req, res) {
    try {
      const { userId, token, deviceType = 'web' } = req.body;

      if (!userId || !token) {
        return res.status(400).json({
          error: 'Missing required fields: userId, token'
        });
      }

      const subscription = await dbService.createSubscription({
        userId,
        token,
        deviceType,
        createdAt: new Date()
      });

      res.json({
        success: true,
        subscription,
        message: 'Subscription created successfully'
      });

    } catch (error) {
      console.error('Failed to create subscription:', error);
      res.status(500).json({
        error: 'Failed to create subscription',
        message: error.message
      });
    }
  }

  async unsubscribe(req, res) {
    try {
      const { token } = req.params;

      const deleted = await dbService.deleteSubscription(token);
      
      if (!deleted) {
        return res.status(404).json({
          error: 'Subscription not found'
        });
      }

      res.json({
        success: true,
        message: 'Unsubscribed successfully'
      });

    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      res.status(500).json({
        error: 'Failed to unsubscribe',
        message: error.message
      });
    }
  }
}

module.exports = new NotificationController();