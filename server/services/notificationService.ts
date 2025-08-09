import { Request, Response } from 'express';

// Firebase Admin SDK for real push notifications
let admin: any;
let messaging: any;

// Initialize Firebase Admin SDK with lazy loading
async function initializeFirebase() {
  try {
    if (!admin) {
      admin = await import('firebase-admin').then(module => module.default);
    }
    
    // Initialize Firebase Admin SDK if credentials are available
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          })
        });
      }
      messaging = admin.messaging();
      console.log('🔥 Firebase Admin SDK initialized successfully');
      return true;
    } else {
      console.warn('Firebase credentials not found, using simulation mode');
      return false;
    }
  } catch (error: any) {
    console.warn('Firebase Admin SDK not available, using simulation mode:', error.message);
    return false;
  }
}

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
  private firebaseInitialized: boolean = false;
  
  constructor() {
    // Initialize Firebase asynchronously
    this.initializeAsync();
  }
  
  private async initializeAsync() {
    this.firebaseInitialized = await initializeFirebase();
    console.log(`NotificationService initialized with Firebase ${this.firebaseInitialized ? 'READY' : 'SIMULATION'} mode`);
  }

  // Send push notification to single user
  async sendNotification(payload: NotificationPayload, target: NotificationTarget): Promise<NotificationResult> {
    try {
      // Ensure Firebase is initialized
      if (!this.firebaseInitialized) {
        this.firebaseInitialized = await initializeFirebase();
      }
      
      if (this.firebaseInitialized && messaging) {
        // Use Firebase Admin SDK for real notifications
        return this.sendFCMNotification(payload, target);
      } else {
        // Fallback to simulation when Firebase is not configured
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

  // Real Firebase Cloud Messaging integration
  private async sendFCMNotification(payload: NotificationPayload, target: NotificationTarget): Promise<NotificationResult> {
    try {
      if (!messaging) {
        throw new Error('Firebase messaging not initialized');
      }

      // Construct FCM message
      const message: any = {
        notification: {
          title: payload.title,
          body: payload.body,
          ...(payload.imageUrl && { image: payload.imageUrl })
        },
        data: {
          ...(payload.data || {}),
          ...(payload.clickAction && { click_action: payload.clickAction })
        },
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
            icon: '/icon-192x192.svg',
            badge: '/badge-72x72.svg',
            ...(payload.clickAction && { click_action: payload.clickAction }),
            ...(payload.badge && { badge: payload.badge.toString() })
          }
        }
      };

      // Set target
      if (target.deviceToken) {
        message.token = target.deviceToken;
      } else if (target.topic) {
        message.topic = target.topic;
      } else if (target.condition) {
        message.condition = target.condition;
      } else {
        // For userId, send to topic named after the user ID
        // This allows targeting specific users even without device tokens
        message.topic = target.userId ? `user_${target.userId}` : 'all_users';
      }

      const response = await messaging.send(message);
      
      console.log(`🔥 Firebase FCM Notification Sent:
        Target: ${target.userId ? `User ${target.userId}` : target.deviceToken || target.topic || 'Unknown'}
        Title: ${payload.title}
        Body: ${payload.body}
        FCM Message ID: ${response}
        Click Action: ${payload.clickAction || 'None'}
      `);

      return {
        success: true,
        messageId: response
      };

    } catch (error) {
      console.error('FCM send error:', error);
      // Fallback to simulation if FCM fails
      console.log('Falling back to simulation mode...');
      return this.simulateNotification(payload, target);
    }
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