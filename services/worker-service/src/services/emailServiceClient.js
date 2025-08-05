const axios = require('axios');

class EmailServiceClient {
  constructor() {
    this.baseURL = process.env.EMAIL_SERVICE_URL || 'http://localhost:3001';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async sendEmail(emailData) {
    try {
      const response = await this.client.post('/api/send-email', emailData);
      return response.data;
    } catch (error) {
      console.error('Email service API error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async sendTemplateEmail(templateData) {
    try {
      const response = await this.client.post('/api/send-template-email', templateData);
      return response.data;
    } catch (error) {
      console.error('Email service template API error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async getEmailStatus(messageId) {
    try {
      const response = await this.client.get(`/api/email-status/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Email service status API error:', error.message);
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
      console.error('Email service health check error:', error.message);
      return {
        status: 'error',
        error: error.message
      };
    }
  }
}

module.exports = new EmailServiceClient();