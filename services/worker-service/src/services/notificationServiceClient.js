const axios = require('axios');

class NotificationServiceClient {
  constructor() {
    this.baseURL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async sendNotification(notificationData) {
    try {
      const response = await this.client.post('/api/notifications/send', notificationData);
      return response.data;
    } catch (error) {
      console.error('Notification service API error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async sendBulkNotifications(bulkData) {
    try {
      const response = await this.client.post('/api/notifications/send-bulk', bulkData);
      return response.data;
    } catch (error) {
      console.error('Notification service bulk API error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async getUserNotifications(userId, options = {}) {
    try {
      const params = new URLSearchParams(options);
      const response = await this.client.get(`/api/notifications/user/${userId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Notification service get notifications error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const response = await this.client.put(`/api/notifications/${notificationId}/read`, { userId });
      return response.data;
    } catch (error) {
      console.error('Notification service mark read error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async deleteNotification(notificationId, userId) {
    try {
      const response = await this.client.delete(`/api/notifications/${notificationId}`, {
        data: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Notification service delete error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async subscribe(subscriptionData) {
    try {
      const response = await this.client.post('/api/notifications/subscribe', subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Notification service subscribe error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async unsubscribe(token) {
    try {
      const response = await this.client.delete(`/api/notifications/unsubscribe/${token}`);
      return response.data;
    } catch (error) {
      console.error('Notification service unsubscribe error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('Notification service health check error:', error.message);
      return {
        status: 'error',
        error: error.message
      };
    }
  }
}

module.exports = new NotificationServiceClient();