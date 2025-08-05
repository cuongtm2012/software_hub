const sgMail = require('@sendgrid/mail');

class SendGridService {
  constructor() {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY environment variable is required');
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('SendGrid service initialized');
  }

  async sendEmail({ to, from, subject, text, html }) {
    try {
      const msg = {
        to,
        from,
        subject,
        text,
        html
      };

      const result = await sgMail.send(msg);
      
      return {
        success: true,
        messageId: result[0].headers['x-message-id'],
        statusCode: result[0].statusCode
      };
    } catch (error) {
      console.error('SendGrid error:', error);
      throw new Error(`SendGrid send failed: ${error.message}`);
    }
  }

  async sendTemplateEmail({ to, from, templateId, dynamicTemplateData }) {
    try {
      const msg = {
        to,
        from,
        templateId,
        dynamicTemplateData: dynamicTemplateData || {}
      };

      const result = await sgMail.send(msg);
      
      return {
        success: true,
        messageId: result[0].headers['x-message-id'],
        statusCode: result[0].statusCode
      };
    } catch (error) {
      console.error('SendGrid template error:', error);
      throw new Error(`SendGrid template send failed: ${error.message}`);
    }
  }

  async sendMultiple(messages) {
    try {
      const result = await sgMail.sendMultiple(messages);
      return {
        success: true,
        results: result
      };
    } catch (error) {
      console.error('SendGrid multiple send error:', error);
      throw new Error(`SendGrid multiple send failed: ${error.message}`);
    }
  }
}

module.exports = new SendGridService();