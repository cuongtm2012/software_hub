const sgMail = require('@sendgrid/mail');

class SendGridService {
  constructor() {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY environment variable is required');
    }
    
    const apiKey = process.env.SENDGRID_API_KEY;
    
    // Validate SendGrid API key format
    if (!apiKey.startsWith('SG.')) {
      console.warn('API key does not start with "SG." - this might indicate an invalid SendGrid API key');
      console.warn('Expected format: SG.xxxxxxxxxxxxxxxxxxxxxxx');
      console.warn('Please check your SendGrid API key configuration');
    }
    
    sgMail.setApiKey(apiKey);
    console.log('SendGrid service initialized with API key format:', apiKey.startsWith('SG.') ? 'Valid (SG.*)' : 'Invalid (not SG.*)');
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
      console.error('SendGrid response body:', error.response?.body);
      console.error('SendGrid status code:', error.code);
      
      // More specific error messages
      let errorMessage = 'SendGrid send failed';
      if (error.code === 403) {
        errorMessage = 'SendGrid Forbidden - Check sender verification and API key permissions';
      } else if (error.code === 401) {
        errorMessage = 'SendGrid Unauthorized - Invalid API key';
      } else if (error.response?.body?.errors) {
        errorMessage = `SendGrid error: ${JSON.stringify(error.response.body.errors)}`;
      }
      
      throw new Error(`${errorMessage}: ${error.message}`);
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