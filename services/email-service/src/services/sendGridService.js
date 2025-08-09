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
      console.error('Full error object:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // The response structure might be nested differently
      const response = error.response;
      if (response) {
        console.error('Response keys:', Object.keys(response));
        console.error('Response body:', response.body);
        
        // If body is an object with errors
        if (response.body && typeof response.body === 'object') {
          if (response.body.errors && Array.isArray(response.body.errors)) {
            console.error('SendGrid specific errors:');
            response.body.errors.forEach((err, index) => {
              console.error(`Error ${index + 1}:`, err);
              if (typeof err === 'object') {
                Object.keys(err).forEach(key => {
                  console.error(`  ${key}:`, err[key]);
                });
              }
            });
          }
        }
        
        // Also try to parse if it's a string
        if (typeof response.body === 'string') {
          try {
            const parsed = JSON.parse(response.body);
            console.error('Parsed response body:', parsed);
            if (parsed.errors) {
              console.error('Parsed errors:', parsed.errors);
            }
          } catch (e) {
            console.error('Could not parse response body as JSON');
          }
        }
      }
      
      console.error('Email content that failed:');
      console.error('TO:', emailContent.to);
      console.error('FROM:', emailContent.from);
      console.error('SUBJECT:', emailContent.subject);
      console.error('HEADERS:', emailContent.headers);
      console.error('CATEGORIES:', emailContent.categories);
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