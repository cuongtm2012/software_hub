const redisService = require('../services/redisService');
const notificationServiceClient = require('../services/notificationServiceClient');

class NotificationWorker {
  constructor() {
    this.name = 'NotificationWorker';
    this.isRunning = false;
    this.processInterval = null;
  }

  async start() {
    console.log(`Starting ${this.name}...`);
    this.isRunning = true;
    
    // Start processing queue
    this.processInterval = setInterval(() => {
      this.processQueue().catch(error => {
        console.error(`${this.name} processing error:`, error);
      });
    }, 2000); // Check queue every 2 seconds
    
    console.log(`${this.name} started`);
  }

  async stop() {
    console.log(`Stopping ${this.name}...`);
    this.isRunning = false;
    
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }
    
    console.log(`${this.name} stopped`);
  }

  async processQueue() {
    if (!this.isRunning) return;
    
    try {
      const job = await redisService.popFromQueue('notification-queue');
      if (!job) return;
      
      console.log(`${this.name} processing job:`, job.id);
      
      switch (job.type) {
        case 'user-notification':
          await this.handleUserNotification(job);
          break;
        case 'bulk-notification':
          await this.handleBulkNotification(job);
          break;
        case 'admin-broadcast':
          await this.handleAdminBroadcast(job);
          break;
        case 'system-alert':
          await this.handleSystemAlert(job);
          break;
        default:
          console.warn(`${this.name} unknown job type:`, job.type);
      }
      
      console.log(`${this.name} completed job:`, job.id);
      
    } catch (error) {
      console.error(`${this.name} job processing error:`, error);
      // In production, might want to retry or move to dead letter queue
    }
  }

  async handleUserNotification(job) {
    const { userId, title, body, data, type } = job.data;
    
    const result = await notificationServiceClient.sendNotification({
      userId,
      title,
      body,
      data,
      type
    });
    
    if (!result.success) {
      throw new Error(`Failed to send user notification: ${result.error}`);
    }
    
    console.log(`User notification sent to ${userId}: ${title}`);
  }

  async handleBulkNotification(job) {
    const { userIds, title, body, data, type } = job.data;
    
    const result = await notificationServiceClient.sendBulkNotifications({
      userIds,
      title,
      body,
      data,
      type
    });
    
    if (!result.success) {
      throw new Error(`Failed to send bulk notification: ${result.error}`);
    }
    
    console.log(`Bulk notification sent to ${userIds.length} users: ${title}`);
  }

  async handleAdminBroadcast(job) {
    const { title, body, data, targetUsers } = job.data;
    
    // Get all users or specific target users
    let userIds = targetUsers;
    if (!userIds || userIds === 'all') {
      // In production, fetch all user IDs from database
      userIds = ['all']; // Placeholder for now
    }
    
    const result = await notificationServiceClient.sendBulkNotifications({
      userIds,
      title: `[ADMIN] ${title}`,
      body,
      data: {
        ...data,
        type: 'admin-broadcast'
      },
      type: 'admin'
    });
    
    if (!result.success) {
      throw new Error(`Failed to send admin broadcast: ${result.error}`);
    }
    
    console.log(`Admin broadcast sent: ${title}`);
  }

  async handleSystemAlert(job) {
    const { level, title, body, data } = job.data;
    
    // System alerts go to all admins
    // In production, fetch admin user IDs from database
    const adminUserIds = ['admin']; // Placeholder for now
    
    const result = await notificationServiceClient.sendBulkNotifications({
      userIds: adminUserIds,
      title: `[SYSTEM ${level.toUpperCase()}] ${title}`,
      body,
      data: {
        ...data,
        type: 'system-alert',
        level
      },
      type: 'system'
    });
    
    if (!result.success) {
      throw new Error(`Failed to send system alert: ${result.error}`);
    }
    
    console.log(`System alert sent (${level}): ${title}`);
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      hasProcessInterval: !!this.processInterval
    };
  }
}

module.exports = new NotificationWorker();