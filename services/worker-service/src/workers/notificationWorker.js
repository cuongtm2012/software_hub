const redisSMQService = require('../services/redisSMQService');
const notificationServiceClient = require('../services/notificationServiceClient');

class NotificationWorker {
  constructor() {
    this.name = 'NotificationWorker';
    this.isRunning = false;
    this.queueName = 'notification-queue';
  }

  async start() {
    console.log(`Starting ${this.name}...`);
    this.isRunning = true;
    
    // Start consuming messages from Redis SMQ
    await redisSMQService.startConsumer(
      this.queueName, 
      this.handleMessage.bind(this),
      { 
        concurrency: 5, // Process up to 5 notifications concurrently
        retryThreshold: 3 
      }
    );
    
    console.log(`${this.name} started and consuming from ${this.queueName}`);
  }

  async stop() {
    console.log(`Stopping ${this.name}...`);
    this.isRunning = false;
    
    // Stop consuming messages
    await redisSMQService.stopConsumer(this.queueName);
    
    console.log(`${this.name} stopped`);
  }

  async handleMessage(message, messageId) {
    if (!this.isRunning) return;
    
    console.log(`${this.name} processing message:`, messageId);
    
    try {
      switch (message.type) {
        case 'user-notification':
          await this.handleUserNotification(message);
          break;
        case 'bulk-notification':
          await this.handleBulkNotification(message);
          break;
        case 'admin-broadcast':
          await this.handleAdminBroadcast(message);
          break;
        case 'system-alert':
          await this.handleSystemAlert(message);
          break;
        case 'project-update':
          await this.handleProjectUpdate(message);
          break;
        case 'chat-notification':
          await this.handleChatNotification(message);
          break;
        case 'security-alert':
          await this.handleSecurityAlert(message);
          break;
        default:
          console.warn(`${this.name} unknown message type:`, message.type);
          await redisSMQService.rejectMessage(messageId, false); // Don't requeue unknown types
          return;
      }
      
      // Acknowledge successful processing
      await redisSMQService.acknowledgeMessage(messageId);
      console.log(`${this.name} completed message:`, messageId);
      
    } catch (error) {
      console.error(`${this.name} message processing error:`, error);
      
      // Reject message for retry (redis-smq will handle retry logic)
      await redisSMQService.rejectMessage(messageId, true);
      throw error; // Let redis-smq handle the retry mechanism
    }
  }

  async handleUserNotification(message) {
    const { userId, title, body, data = {}, notificationType = 'info', priority = 'normal' } = message.data;
    
    const result = await notificationServiceClient.sendNotification({
      userId,
      title,
      body,
      data: {
        ...data,
        messageId: message.id,
        timestamp: message.timestamp,
        priority
      },
      type: notificationType
    });
    
    if (!result.success) {
      throw new Error(`Failed to send user notification: ${result.error}`);
    }
    
    console.log(`📱 User notification sent to ${userId}: ${title}`);
  }

  async handleBulkNotification(message) {
    const { userIds, title, body, data = {}, notificationType = 'info', batchId } = message.data;
    
    // Process in batches to avoid overwhelming the notification service
    const batchSize = 100;
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      
      console.log(`📢 Processing bulk notification batch ${Math.floor(i/batchSize) + 1} (${batch.length} users)`);
      
      try {
        const result = await notificationServiceClient.sendBulkNotifications({
          userIds: batch,
          title,
          body,
          data: {
            ...data,
            batchId,
            messageId: message.id,
            timestamp: message.timestamp
          },
          type: notificationType
        });
        
        if (result.success) {
          successCount += batch.length;
        } else {
          failureCount += batch.length;
          console.error(`Failed to send bulk notification batch:`, result.error);
        }
      } catch (error) {
        failureCount += batch.length;
        console.error(`Error sending bulk notification batch:`, error);
      }
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < userIds.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`📢 Bulk notification completed: ${successCount} sent, ${failureCount} failed`);
    
    if (failureCount > 0 && successCount === 0) {
      throw new Error(`All bulk notifications failed`);
    }
  }

  async handleAdminBroadcast(message) {
    const { title, body, data = {}, targetUsers = 'all', urgency = 'normal' } = message.data;
    
    // Get admin user IDs (in production, fetch from database)
    let adminUserIds = targetUsers;
    if (targetUsers === 'all') {
      // Placeholder - in production, fetch all admin user IDs
      adminUserIds = await this.getAdminUserIds();
    }
    
    const result = await notificationServiceClient.sendBulkNotifications({
      userIds: adminUserIds,
      title: `🔔 [ADMIN] ${title}`,
      body,
      data: {
        ...data,
        type: 'admin-broadcast',
        urgency,
        messageId: message.id,
        timestamp: message.timestamp
      },
      type: 'admin'
    });
    
    if (!result.success) {
      throw new Error(`Failed to send admin broadcast: ${result.error}`);
    }
    
    console.log(`📢 Admin broadcast sent to ${adminUserIds.length} admins: ${title}`);
  }

  async handleSystemAlert(message) {
    const { level, title, body, data = {}, component, affectedServices = [] } = message.data;
    
    // System alerts go to all admins and system operators
    const adminUserIds = await this.getAdminUserIds();
    const systemUserIds = await this.getSystemOperatorIds();
    const allTargetUsers = [...new Set([...adminUserIds, ...systemUserIds])];
    
    const alertTitle = `🚨 [SYSTEM ${level.toUpperCase()}] ${title}`;
    const alertData = {
      ...data,
      type: 'system-alert',
      level,
      component,
      affectedServices,
      messageId: message.id,
      timestamp: message.timestamp,
      requiresAction: level === 'critical' || level === 'error'
    };
    
    const result = await notificationServiceClient.sendBulkNotifications({
      userIds: allTargetUsers,
      title: alertTitle,
      body,
      data: alertData,
      type: 'system'
    });
    
    if (!result.success) {
      throw new Error(`Failed to send system alert: ${result.error}`);
    }
    
    console.log(`🚨 System alert sent (${level}) to ${allTargetUsers.length} operators: ${title}`);
    
    // For critical alerts, also log to external monitoring
    if (level === 'critical') {
      console.error(`CRITICAL SYSTEM ALERT: ${title} - ${body}`);
    }
  }

  async handleProjectUpdate(message) {
    const { userId, projectId, projectTitle, status, developerName, updateMessage } = message.data;
    
    const statusEmojis = {
      'pending': '⏳',
      'in_progress': '🚀',
      'completed': '✅',
      'cancelled': '❌',
      'on_hold': '⏸️'
    };
    
    const emoji = statusEmojis[status] || '📋';
    const title = `${emoji} Project Update: ${projectTitle}`;
    
    const result = await notificationServiceClient.sendNotification({
      userId,
      title,
      body: updateMessage || `Your project status has been updated to: ${status.replace('_', ' ')}`,
      data: {
        projectId,
        status,
        developerName,
        type: 'project-update',
        messageId: message.id,
        timestamp: message.timestamp,
        actionUrl: `/dashboard/projects/${projectId}`
      },
      type: 'project'
    });
    
    if (!result.success) {
      throw new Error(`Failed to send project update notification: ${result.error}`);
    }
    
    console.log(`📋 Project update notification sent to user ${userId} for project ${projectId}`);
  }

  async handleChatNotification(message) {
    const { recipientId, senderName, messagePreview, chatId, chatType = 'direct' } = message.data;
    
    const title = `💬 New message from ${senderName}`;
    const body = messagePreview.length > 50 ? 
      `${messagePreview.substring(0, 47)}...` : 
      messagePreview;
    
    const result = await notificationServiceClient.sendNotification({
      userId: recipientId,
      title,
      body,
      data: {
        chatId,
        chatType,
        senderId: message.data.senderId,
        senderName,
        type: 'chat-message',
        messageId: message.id,
        timestamp: message.timestamp,
        actionUrl: `/chat/${chatId}`
      },
      type: 'chat'
    });
    
    if (!result.success) {
      throw new Error(`Failed to send chat notification: ${result.error}`);
    }
    
    console.log(`💬 Chat notification sent to user ${recipientId} from ${senderName}`);
  }

  async handleSecurityAlert(message) {
    const { userId, alertType, description, ipAddress, location, riskLevel = 'medium' } = message.data;
    
    const alertTitles = {
      'login_attempt': '🔐 Unusual login attempt detected',
      'password_change': '🔑 Password changed',
      'account_access': '👤 Account accessed from new device',
      'suspicious_activity': '⚠️ Suspicious activity detected',
      'data_breach': '🚨 Security alert'
    };
    
    const title = alertTitles[alertType] || '🔒 Security Alert';
    const urgentAlert = riskLevel === 'high' || riskLevel === 'critical';
    
    const result = await notificationServiceClient.sendNotification({
      userId,
      title: urgentAlert ? `🚨 URGENT: ${title}` : title,
      body: description,
      data: {
        alertType,
        ipAddress,
        location,
        riskLevel,
        type: 'security-alert',
        messageId: message.id,
        timestamp: message.timestamp,
        requiresAction: urgentAlert,
        actionUrl: '/dashboard/security'
      },
      type: 'security'
    });
    
    if (!result.success) {
      throw new Error(`Failed to send security alert: ${result.error}`);
    }
    
    console.log(`🔒 Security alert sent to user ${userId}: ${alertType} (Risk: ${riskLevel})`);
  }

  // Helper methods to get user IDs (placeholder implementations)
  async getAdminUserIds() {
    // In production, fetch from database
    // For now, return placeholder admin IDs
    return ['admin1', 'admin2', 'admin3'];
  }

  async getSystemOperatorIds() {
    // In production, fetch from database
    // For now, return placeholder system operator IDs
    return ['sysop1', 'sysop2'];
  }

  getStatus() {
    return {
      name: this.name,
      isRunning: this.isRunning,
      queueName: this.queueName,
      smqConnected: redisSMQService.isConnected()
    };
  }
}

module.exports = new NotificationWorker();