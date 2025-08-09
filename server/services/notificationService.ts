import { Request, Response } from 'express';

// Mock FCM service for development environment
interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  clickAction?: string;
  badge?: number;
}

interface NotificationTarget {
  userId?: number;
  deviceToken?: string;
  topic?: string;
  condition?: string;
}

interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveredCount?: number;
  failedCount?: number;
}

class NotificationService {
  private isProduction: boolean;
  
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    console.log(`NotificationService initialized in ${this.isProduction ? 'production' : 'development'} mode`);
  }

  // Send push notification to single user
  async sendNotification(payload: NotificationPayload, target: NotificationTarget): Promise<NotificationResult> {
    try {
      if (this.isProduction) {
        // In production, integrate with FCM
        return this.sendFCMNotification(payload, target);
      } else {
        // In development, simulate notification sending
        return this.simulateNotification(payload, target);
      }
    } catch (error) {
      console.error('Notification send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send bulk notifications
  async sendBulkNotifications(payload: NotificationPayload, targets: NotificationTarget[]): Promise<NotificationResult> {
    try {
      let successCount = 0;
      let failedCount = 0;
      const results: NotificationResult[] = [];

      for (const target of targets) {
        const result = await this.sendNotification(payload, target);
        results.push(result);
        
        if (result.success) {
          successCount++;
        } else {
          failedCount++;
        }
      }

      return {
        success: successCount > 0,
        deliveredCount: successCount,
        failedCount: failedCount
      };
    } catch (error) {
      console.error('Bulk notification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Production FCM integration (placeholder)
  private async sendFCMNotification(payload: NotificationPayload, target: NotificationTarget): Promise<NotificationResult> {
    // This would integrate with Firebase Cloud Messaging in production
    // For now, return simulated result
    return this.simulateNotification(payload, target);
  }

  // Development simulation
  private async simulateNotification(payload: NotificationPayload, target: NotificationTarget): Promise<NotificationResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Enhanced logging for cross-user testing
    const targetDisplay = target.userId ? `User ${target.userId}` : 
                         target.topic === 'all_users' ? 'all_users' :
                         target.deviceToken || target.topic || 'Unknown';
    
    console.log(`📱 Push Notification Sent:
      Target: ${targetDisplay}
      Title: ${payload.title}
      Body: ${payload.body}
      Message ID: ${messageId}
      Click Action: ${payload.clickAction || 'None'}
    `);

    // For cross-user testing, show which specific user would receive this
    if (target.userId) {
      console.log(`   🎯 User ${target.userId} should see this notification in their browser/device`);
    }

    return {
      success: true,
      messageId
    };
  }

  // User Activity Alerts
  async sendNewMessageNotification(userId: number, senderName: string, messagePreview: string): Promise<NotificationResult> {
    return this.sendNotification({
      title: `New message from ${senderName}`,
      body: messagePreview,
      clickAction: '/chat',
      data: { type: 'new_message', userId: userId.toString() }
    }, { userId });
  }

  async sendCommentNotification(userId: number, commenterName: string, contentTitle: string): Promise<NotificationResult> {
    return this.sendNotification({
      title: `New comment on ${contentTitle}`,
      body: `${commenterName} commented on your post`,
      clickAction: '/comments',
      data: { type: 'comment', userId: userId.toString() }
    }, { userId });
  }

  // System Notifications  
  async sendMaintenanceAlert(maintenanceTime: string, details: string): Promise<NotificationResult> {
    return this.sendNotification({
      title: '🔧 Scheduled Maintenance Alert',
      body: `System maintenance on ${maintenanceTime}. ${details}`,
      clickAction: '/maintenance-info',
      data: { type: 'maintenance', time: maintenanceTime }
    }, { topic: 'all_users' });
  }

  async sendSystemUpdateNotification(version: string, features: string): Promise<NotificationResult> {
    return this.sendNotification({
      title: `🎉 New Update Available - v${version}`,
      body: `Check out the latest features: ${features}`,
      clickAction: '/updates',
      data: { type: 'system_update', version }
    }, { topic: 'all_users' });
  }

  // Transactional Notifications
  async sendOrderConfirmation(userId: number, orderId: string, amount: string): Promise<NotificationResult> {
    return this.sendNotification({
      title: '✅ Order Confirmed',
      body: `Your order #${orderId} for ${amount} has been confirmed`,
      clickAction: `/orders/${orderId}`,
      data: { type: 'order_confirmation', orderId, userId: userId.toString() }
    }, { userId });
  }

  async sendPaymentFailureNotification(userId: number, orderId: string, reason: string): Promise<NotificationResult> {
    return this.sendNotification({
      title: '❌ Payment Failed',
      body: `Payment for order #${orderId} failed: ${reason}`,
      clickAction: `/payment-retry/${orderId}`,
      data: { type: 'payment_failure', orderId, userId: userId.toString() }
    }, { userId });
  }

  // Reminders and Alerts
  async sendEventReminder(userId: number, eventName: string, eventTime: string): Promise<NotificationResult> {
    return this.sendNotification({
      title: `⏰ Event Reminder: ${eventName}`,
      body: `Starting at ${eventTime}`,
      clickAction: '/events',
      data: { type: 'event_reminder', eventName, userId: userId.toString() }
    }, { userId });
  }

  async sendSubscriptionRenewalReminder(userId: number, expiryDate: string): Promise<NotificationResult> {
    return this.sendNotification({
      title: '📅 Subscription Renewal Reminder',
      body: `Your subscription expires on ${expiryDate}. Renew now to continue enjoying our services.`,
      clickAction: '/subscription',
      data: { type: 'subscription_renewal', userId: userId.toString() }
    }, { userId });
  }

  // Marketing and Promotional
  async sendPromotionalOffer(offerTitle: string, offerDetails: string, validUntil: string): Promise<NotificationResult> {
    return this.sendNotification({
      title: `🎁 Special Offer: ${offerTitle}`,
      body: `${offerDetails} Valid until ${validUntil}`,
      clickAction: '/offers',
      data: { type: 'promotional_offer', offerTitle }
    }, { topic: 'marketing_subscribers' });
  }

  // Security Alerts
  async sendUnusualLoginNotification(userId: number, location: string, device: string): Promise<NotificationResult> {
    return this.sendNotification({
      title: '🔒 Unusual Login Detected',
      body: `New login from ${device} in ${location}. Was this you?`,
      clickAction: '/security-settings',
      data: { type: 'security_alert', userId: userId.toString(), location, device }
    }, { userId });
  }

  async sendPasswordChangeConfirmation(userId: number): Promise<NotificationResult> {
    return this.sendNotification({
      title: '🔐 Password Changed Successfully',
      body: 'Your password has been updated. If this wasn\'t you, please contact support immediately.',
      clickAction: '/account-settings',
      data: { type: 'password_change', userId: userId.toString() }
    }, { userId });
  }
}

export default new NotificationService();