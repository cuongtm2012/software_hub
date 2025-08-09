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

  // Test notification methods for all scenarios

  // 1. User Activity Alerts
  async testNewMessage(req, res) {
    try {
      const { userId, senderName, messagePreview } = req.body;
      
      if (!userId || !senderName || !messagePreview) {
        return res.status(400).json({
          success: false,
          error: "userId, senderName, and messagePreview are required"
        });
      }

      const notification = {
        title: `New message from ${senderName}`,
        body: messagePreview,
        data: { 
          type: 'new_message', 
          userId: userId.toString(),
          clickAction: '/chat'
        }
      };

      const result = await retryUtil.withRetry(
        () => fcmService.sendToUser(parseInt(userId), notification),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'New message notification sent successfully'
      });

    } catch (error) {
      console.error('New message notification test error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to send new message notification test"
      });
    }
  }

  async testComment(req, res) {
    try {
      const { userId, commenterName, contentTitle } = req.body;
      
      if (!userId || !commenterName || !contentTitle) {
        return res.status(400).json({
          success: false,
          error: "userId, commenterName, and contentTitle are required"
        });
      }

      const notification = {
        title: `New comment on ${contentTitle}`,
        body: `${commenterName} commented on your post`,
        data: { 
          type: 'comment', 
          userId: userId.toString(),
          clickAction: '/comments'
        }
      };

      const result = await retryUtil.withRetry(
        () => fcmService.sendToUser(parseInt(userId), notification),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Comment notification sent successfully'
      });

    } catch (error) {
      console.error('Comment notification test error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to send comment notification test"
      });
    }
  }

  // 2. System Notifications
  async testMaintenanceAlert(req, res) {
    try {
      const { maintenanceTime, details } = req.body;
      
      if (!maintenanceTime || !details) {
        return res.status(400).json({
          success: false,
          error: "maintenanceTime and details are required"
        });
      }

      const notification = {
        title: '🔧 Scheduled Maintenance Alert',
        body: `System maintenance on ${maintenanceTime}. ${details}`,
        data: { 
          type: 'maintenance', 
          time: maintenanceTime,
          clickAction: '/maintenance-info'
        }
      };

      const result = await retryUtil.withRetry(
        () => fcmService.sendToTopic('all_users', notification),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Maintenance alert sent successfully'
      });

    } catch (error) {
      console.error('Maintenance alert test error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to send maintenance alert test"
      });
    }
  }

  async testSystemUpdate(req, res) {
    try {
      const { version, features } = req.body;
      
      if (!version || !features) {
        return res.status(400).json({
          success: false,
          error: "version and features are required"
        });
      }

      const notification = {
        title: `🎉 New Update Available - v${version}`,
        body: `Check out the latest features: ${features}`,
        data: { 
          type: 'system_update', 
          version: version,
          clickAction: '/updates'
        }
      };

      const result = await retryUtil.withRetry(
        () => fcmService.sendToTopic('all_users', notification),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'System update notification sent successfully'
      });

    } catch (error) {
      console.error('System update notification test error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to send system update notification test"
      });
    }
  }

  // 3. Transactional Notifications
  async testOrderConfirmation(req, res) {
    try {
      const { userId, orderId, amount } = req.body;
      
      if (!userId || !orderId || !amount) {
        return res.status(400).json({
          success: false,
          error: "userId, orderId, and amount are required"
        });
      }

      const notification = {
        title: '✅ Order Confirmed',
        body: `Your order #${orderId} for ${amount} has been confirmed`,
        data: { 
          type: 'order_confirmation', 
          orderId: orderId,
          userId: userId.toString(),
          clickAction: `/orders/${orderId}`
        }
      };

      const result = await retryUtil.withRetry(
        () => fcmService.sendToUser(parseInt(userId), notification),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Order confirmation notification sent successfully'
      });

    } catch (error) {
      console.error('Order confirmation notification test error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to send order confirmation notification test"
      });
    }
  }

  async testPaymentFailure(req, res) {
    try {
      const { userId, orderId, reason } = req.body;
      
      if (!userId || !orderId || !reason) {
        return res.status(400).json({
          success: false,
          error: "userId, orderId, and reason are required"
        });
      }

      const notification = {
        title: '❌ Payment Failed',
        body: `Payment for order #${orderId} failed: ${reason}`,
        data: { 
          type: 'payment_failure', 
          orderId: orderId,
          userId: userId.toString(),
          clickAction: `/payment-retry/${orderId}`
        }
      };

      const result = await retryUtil.withRetry(
        () => fcmService.sendToUser(parseInt(userId), notification),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Payment failure notification sent successfully'
      });

    } catch (error) {
      console.error('Payment failure notification test error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to send payment failure notification test"
      });
    }
  }

  // 4. Reminders and Alerts
  async testEventReminder(req, res) {
    try {
      const { userId, eventName, eventTime } = req.body;
      
      if (!userId || !eventName || !eventTime) {
        return res.status(400).json({
          success: false,
          error: "userId, eventName, and eventTime are required"
        });
      }

      const notification = {
        title: `⏰ Event Reminder: ${eventName}`,
        body: `Starting at ${eventTime}`,
        data: { 
          type: 'event_reminder', 
          eventName: eventName,
          userId: userId.toString(),
          clickAction: '/events'
        }
      };

      const result = await retryUtil.withRetry(
        () => fcmService.sendToUser(parseInt(userId), notification),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Event reminder notification sent successfully'
      });

    } catch (error) {
      console.error('Event reminder notification test error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to send event reminder notification test"
      });
    }
  }

  async testSubscriptionRenewal(req, res) {
    try {
      const { userId, expiryDate } = req.body;
      
      if (!userId || !expiryDate) {
        return res.status(400).json({
          success: false,
          error: "userId and expiryDate are required"
        });
      }

      const notification = {
        title: '📅 Subscription Renewal Reminder',
        body: `Your subscription expires on ${expiryDate}. Renew now to continue enjoying our services.`,
        data: { 
          type: 'subscription_renewal', 
          userId: userId.toString(),
          clickAction: '/subscription'
        }
      };

      const result = await retryUtil.withRetry(
        () => fcmService.sendToUser(parseInt(userId), notification),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Subscription renewal reminder sent successfully'
      });

    } catch (error) {
      console.error('Subscription renewal notification test error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to send subscription renewal notification test"
      });
    }
  }

  // 5. Marketing and Promotional
  async testPromotionalOffer(req, res) {
    try {
      const { offerTitle, offerDetails, validUntil } = req.body;
      
      if (!offerTitle || !offerDetails || !validUntil) {
        return res.status(400).json({
          success: false,
          error: "offerTitle, offerDetails, and validUntil are required"
        });
      }

      const notification = {
        title: `🎁 Special Offer: ${offerTitle}`,
        body: `${offerDetails} Valid until ${validUntil}`,
        data: { 
          type: 'promotional_offer', 
          offerTitle: offerTitle,
          clickAction: '/offers'
        }
      };

      const result = await retryUtil.withRetry(
        () => fcmService.sendToTopic('marketing_subscribers', notification),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Promotional offer notification sent successfully'
      });

    } catch (error) {
      console.error('Promotional offer notification test error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to send promotional offer notification test"
      });
    }
  }

  // 6. Security Alerts
  async testUnusualLogin(req, res) {
    try {
      const { userId, location, device } = req.body;
      
      if (!userId || !location || !device) {
        return res.status(400).json({
          success: false,
          error: "userId, location, and device are required"
        });
      }

      const notification = {
        title: '🔒 Unusual Login Detected',
        body: `New login from ${device} in ${location}. Was this you?`,
        data: { 
          type: 'security_alert', 
          userId: userId.toString(),
          location: location,
          device: device,
          clickAction: '/security-settings'
        }
      };

      const result = await retryUtil.withRetry(
        () => fcmService.sendToUser(parseInt(userId), notification),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Unusual login notification sent successfully'
      });

    } catch (error) {
      console.error('Unusual login notification test error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to send unusual login notification test"
      });
    }
  }

  async testPasswordChange(req, res) {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "userId is required"
        });
      }

      const notification = {
        title: '🔐 Password Changed Successfully',
        body: 'Your password has been updated. If this wasn\'t you, please contact support immediately.',
        data: { 
          type: 'password_change', 
          userId: userId.toString(),
          clickAction: '/account-settings'
        }
      };

      const result = await retryUtil.withRetry(
        () => fcmService.sendToUser(parseInt(userId), notification),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Password change notification sent successfully'
      });

    } catch (error) {
      console.error('Password change notification test error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to send password change notification test"
      });
    }
  }

  // Bulk test notifications
  async testBulkNotifications(req, res) {
    try {
      const { title, body, userIds, clickAction } = req.body;
      
      if (!title || !body || !userIds || !Array.isArray(userIds)) {
        return res.status(400).json({
          success: false,
          error: "title, body, and userIds array are required"
        });
      }

      const notification = {
        title: title,
        body: body,
        data: { 
          type: 'bulk_test',
          clickAction: clickAction || '/dashboard'
        }
      };

      let successCount = 0;
      let failedCount = 0;
      const results = [];

      for (const userId of userIds) {
        try {
          const result = await retryUtil.withRetry(
            () => fcmService.sendToUser(parseInt(userId), notification),
            2,
            500
          );
          successCount++;
          results.push({ userId, success: true, messageId: result.messageId });
        } catch (error) {
          failedCount++;
          results.push({ userId, success: false, error: error.message });
        }
      }

      res.json({
        success: successCount > 0,
        deliveredCount: successCount,
        failedCount: failedCount,
        results: results,
        message: `Sent ${successCount} notifications, ${failedCount} failed`
      });

    } catch (error) {
      console.error('Bulk notification test error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to send bulk notification test"
      });
    }
  }
}

module.exports = new NotificationController();