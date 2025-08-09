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
      console.error('=== SENDGRID ERROR DEBUG ===');
      
      // Force print the full error object
      console.error('Full error (stringified):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      // Try direct access to response body
      if (error.response && error.response.body) {
        const body = error.response.body;
        console.error('Direct body access:', body);
        
        if (body.errors) {
          console.error('SENDGRID ERRORS FOUND:');
          body.errors.forEach((err, i) => {
            console.error(`[${i}] Message:`, err.message || 'No message');
            console.error(`[${i}] Field:`, err.field || 'No field');
            console.error(`[${i}] Help:`, err.help || 'No help');
            console.error(`[${i}] Full error:`, JSON.stringify(err, null, 2));
          });
        }
      }
      
      // Also check if the error has additional properties
      console.error('Error properties:', Object.getOwnPropertyNames(error));
      
      console.error('Email that failed - FROM:', emailContent.from);
      console.error('Email that failed - TO:', emailContent.to);
      console.error('=== END SENDGRID ERROR DEBUG ===');
      
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