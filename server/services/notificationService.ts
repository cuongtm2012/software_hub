import { Request, Response } from 'express';

// Microservice client for notification service
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost';

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
}

interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class NotificationService {
  
  constructor() {
    console.log(`NotificationService initialized in MICROSERVICE mode - will proxy to ${NOTIFICATION_SERVICE_URL}`);
  }

  // Helper method to call notification microservice
  private async callNotificationService(endpoint: string, data: any, method: string = 'POST'): Promise<any> {
    try {
      // Fix: Route through nginx API gateway
      const response = await fetch(`${NOTIFICATION_SERVICE_URL}/api/notifications${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method !== 'GET' ? JSON.stringify(data) : undefined
      });
      
      if (!response.ok) {
        throw new Error(`Notification service call failed: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Failed to call notification service ${endpoint}:`, error);
      throw error;
    }
  }
  
  // Send push notification to single user
  async sendNotification(payload: NotificationPayload, target: NotificationTarget): Promise<NotificationResult> {
    try {
      const result = await this.callNotificationService('/send', {
        userId: target.userId,
        title: payload.title,
        body: payload.body,
        data: payload.data
      });
      
      return {
        success: result.success || true,
        messageId: result.messageId,
        error: result.error
      };
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
      const userIds = targets.map(t => t.userId).filter(Boolean);
      const result = await this.callNotificationService('/send-bulk', {
        userIds,
        title: payload.title,
        body: payload.body,
        data: payload.data
      });
      
      return {
        success: result.success || true,
        messageId: result.messageId || 'bulk',
        error: result.error
      };
    } catch (error) {
      console.error('Bulk notification send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // User Activity Alerts
  async sendNewMessageNotification(userId: number, senderName: string, messagePreview: string): Promise<NotificationResult> {
    return this.sendNotification(
      {
        title: `New message from ${senderName}`,
        body: messagePreview,
        clickAction: '/chat'
      },
      { userId }
    );
  }

  async sendCommentNotification(userId: number, commenterName: string, contentTitle: string): Promise<NotificationResult> {
    return this.sendNotification(
      {
        title: `New comment on ${contentTitle}`,
        body: `${commenterName} commented on your content`,
        clickAction: '/notifications'
      },
      { userId }
    );
  }

  // System Notifications
  async sendMaintenanceAlert(title: string, message: string): Promise<NotificationResult> {
    try {
      const result = await this.callNotificationService('/test-maintenance-alert', {
        maintenanceTime: title,
        details: message
      });
      
      return {
        success: result.success || true,
        messageId: result.messageId,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendSystemUpdate(version: string, features: string): Promise<NotificationResult> {
    try {
      const result = await this.callNotificationService('/test-system-update', {
        version,
        features
      });
      
      return {
        success: result.success || true,
        messageId: result.messageId,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Business Notifications
  async sendOrderConfirmation(userId: number, orderId: string, amount: string): Promise<NotificationResult> {
    try {
      const result = await this.callNotificationService('/test-order-confirmation', {
        userId,
        orderId,
        amount
      });
      
      return {
        success: result.success || true,
        messageId: result.messageId,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendPaymentFailure(userId: number, orderId: string, reason: string): Promise<NotificationResult> {
    try {
      const result = await this.callNotificationService('/test-payment-failure', {
        userId,
        orderId,
        reason
      });
      
      return {
        success: result.success || true,
        messageId: result.messageId,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default new NotificationService();