const sendGridService = require('../services/sendGridService');
const retryUtil = require('../utils/retry');

class EmailController {
  async sendEmail(req, res) {
    try {
      const { to, from, subject, text, html } = req.body;

      // Validation
      if (!to || !from || !subject || (!text && !html)) {
        return res.status(400).json({
          error: 'Missing required fields: to, from, subject, and text or html'
        });
      }

      // Send email with retry mechanism
      const result = await retryUtil.withRetry(
        () => sendGridService.sendEmail({ to, from, subject, text, html }),
        3, // max retries
        1000 // delay in ms
      );

      console.log('Email sent successfully:', { to, subject, messageId: result.messageId });

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully'
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      res.status(500).json({
        error: 'Failed to send email',
        message: error.message
      });
    }
  }

  async sendTemplateEmail(req, res) {
    try {
      const { to, from, templateId, dynamicTemplateData } = req.body;

      if (!to || !from || !templateId) {
        return res.status(400).json({
          error: 'Missing required fields: to, from, templateId'
        });
      }

      const result = await retryUtil.withRetry(
        () => sendGridService.sendTemplateEmail({ to, from, templateId, dynamicTemplateData }),
        3,
        1000
      );

      console.log('Template email sent successfully:', { to, templateId, messageId: result.messageId });

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Template email sent successfully'
      });
    } catch (error) {
      console.error('Failed to send template email:', error);
      res.status(500).json({
        error: 'Failed to send template email',
        message: error.message
      });
    }
  }

  async getEmailStatus(req, res) {
    try {
      const { id } = req.params;
      
      // This would typically query a database for email status
      // For now, return a simple response
      res.json({
        id,
        status: 'delivered', // This would come from SendGrid webhooks in production
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to get email status:', error);
      res.status(500).json({
        error: 'Failed to get email status',
        message: error.message
      });
    }
  }
}

module.exports = new EmailController();