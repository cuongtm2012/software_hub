// Database service for notification metadata storage
// In development, we'll use in-memory storage
// In production, replace with actual database connection

class DBService {
  constructor() {
    this.notifications = new Map();
    this.subscriptions = new Map();
    this.userTokens = new Map();
  }

  // Notification management
  async createNotification(notificationData) {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const notification = {
      id,
      ...notificationData,
      read: false,
      createdAt: new Date()
    };
    
    this.notifications.set(id, notification);
    console.log(`Notification created: ${id}`);
    return notification;
  }

  async getUserNotifications(userId, options = {}) {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    
    const allNotifications = Array.from(this.notifications.values())
      .filter(notif => {
        if (notif.userId !== userId) return false;
        if (unreadOnly && notif.read) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedNotifications = allNotifications.slice(start, end);
    
    return {
      notifications: paginatedNotifications,
      totalCount: allNotifications.length,
      page,
      limit,
      hasMore: end < allNotifications.length,
      unreadCount: allNotifications.filter(n => !n.read).length
    };
  }

  async markNotificationAsRead(notificationId, userId) {
    const notification = this.notifications.get(notificationId);
    
    if (!notification || notification.userId !== userId) {
      return null;
    }
    
    notification.read = true;
    notification.readAt = new Date();
    
    console.log(`Notification marked as read: ${notificationId}`);
    return notification;
  }

  async deleteNotification(notificationId, userId) {
    const notification = this.notifications.get(notificationId);
    
    if (!notification || notification.userId !== userId) {
      return false;
    }
    
    this.notifications.delete(notificationId);
    console.log(`Notification deleted: ${notificationId}`);
    return true;
  }

  async updateNotificationStatus(notificationId, status) {
    const notification = this.notifications.get(notificationId);
    
    if (!notification) {
      return null;
    }
    
    notification.status = status;
    notification.updatedAt = new Date();
    
    return notification;
  }

  // Subscription management
  async createSubscription(subscriptionData) {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const subscription = {
      id,
      ...subscriptionData,
      active: true,
      createdAt: new Date()
    };
    
    this.subscriptions.set(id, subscription);
    
    // Update user tokens map
    const { userId, token } = subscriptionData;
    if (!this.userTokens.has(userId)) {
      this.userTokens.set(userId, []);
    }
    
    // Avoid duplicate tokens
    const userTokensList = this.userTokens.get(userId);
    if (!userTokensList.includes(token)) {
      userTokensList.push(token);
    }
    
    console.log(`Subscription created: ${id} for user ${userId}`);
    return subscription;
  }

  async deleteSubscription(token) {
    // Find subscription by token
    const subscription = Array.from(this.subscriptions.values())
      .find(sub => sub.token === token);
    
    if (!subscription) {
      return false;
    }
    
    this.subscriptions.delete(subscription.id);
    
    // Remove from user tokens
    const userTokensList = this.userTokens.get(subscription.userId);
    if (userTokensList) {
      const tokenIndex = userTokensList.indexOf(token);
      if (tokenIndex > -1) {
        userTokensList.splice(tokenIndex, 1);
      }
    }
    
    console.log(`Subscription deleted: ${subscription.id}`);
    return true;
  }

  async getUserTokens(userId) {
    return this.userTokens.get(userId) || [];
  }

  async getUserSubscriptions(userId) {
    return Array.from(this.subscriptions.values())
      .filter(sub => sub.userId === userId && sub.active);
  }

  // Analytics and reporting
  async getNotificationStats(userId, dateRange = null) {
    const notifications = Array.from(this.notifications.values())
      .filter(notif => notif.userId === userId);
    
    const stats = {
      total: notifications.length,
      read: notifications.filter(n => n.read).length,
      unread: notifications.filter(n => !n.read).length,
      byType: {},
      byStatus: {}
    };
    
    notifications.forEach(notif => {
      // Count by type
      stats.byType[notif.type] = (stats.byType[notif.type] || 0) + 1;
      
      // Count by status
      stats.byStatus[notif.status] = (stats.byStatus[notif.status] || 0) + 1;
    });
    
    return stats;
  }

  // Cleanup old notifications
  async cleanupOldNotifications(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    let deletedCount = 0;
    
    for (const [id, notification] of this.notifications.entries()) {
      if (new Date(notification.createdAt) < cutoffDate) {
        this.notifications.delete(id);
        deletedCount++;
      }
    }
    
    console.log(`Cleaned up ${deletedCount} old notifications`);
    return deletedCount;
  }
}

module.exports = new DBService();