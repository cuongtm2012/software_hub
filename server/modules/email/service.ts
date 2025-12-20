import sgMail from '@sendgrid/mail';

export interface EmailContent {
  to: string | string[];
  from: string | { email: string; name: string };
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  headers?: Record<string, string>;
  categories?: string[];
  customArgs?: Record<string, string>;
}

export interface TemplateEmailContent {
  to: string | string[];
  from: string | { email: string; name: string };
  templateId: string;
  dynamicTemplateData?: Record<string, any>;
}

class EmailService {
  private initialized = false;

  initialize() {
    if (this.initialized) return;

    const apiKey = process.env.SENDGRID_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️  SENDGRID_API_KEY not set - email functionality will be limited');
      return;
    }

    if (!apiKey.startsWith('SG.')) {
      console.warn('⚠️  SendGrid API key format invalid - expected format: SG.xxx');
    }

    sgMail.setApiKey(apiKey);
    this.initialized = true;
    console.log('✅ Email Service: SendGrid initialized');
  }

  async sendEmail(content: EmailContent): Promise<{ success: boolean; messageId?: string; statusCode?: number }> {
    this.initialize();

    if (!this.initialized) {
      throw new Error('Email service not properly initialized - check SENDGRID_API_KEY');
    }

    try {
      const msg: any = {
        to: content.to,
        from: content.from,
        subject: content.subject,
        text: content.text,
        html: content.html
      };

      if (content.replyTo) msg.replyTo = content.replyTo;
      if (content.headers) msg.headers = content.headers;
      if (content.categories) msg.categories = content.categories;
      if (content.customArgs) msg.customArgs = content.customArgs;

      const result = await sgMail.send(msg);

      return {
        success: true,
        messageId: result[0].headers['x-message-id'],
        statusCode: result[0].statusCode
      };
    } catch (error: any) {
      console.error('SendGrid error:', {
        code: error.code,
        message: error.message,
        response: error.response?.body
      });

      let errorMessage = 'Email send failed';
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

  async sendTemplateEmail(content: TemplateEmailContent): Promise<{ success: boolean; messageId?: string }> {
    this.initialize();

    if (!this.initialized) {
      throw new Error('Email service not properly initialized');
    }

    try {
      const msg: any = {
        to: content.to,
        from: content.from,
        templateId: content.templateId,
        dynamicTemplateData: content.dynamicTemplateData || {}
      };

      const result = await sgMail.send(msg);

      return {
        success: true,
        messageId: result[0].headers['x-message-id']
      };
    } catch (error: any) {
      console.error('SendGrid template error:', error);
      throw new Error(`Template email send failed: ${error.message}`);
    }
  }

  async sendMultiple(messages: EmailContent[]): Promise<{ success: boolean }> {
    this.initialize();

    if (!this.initialized) {
      throw new Error('Email service not properly initialized');
    }

    try {
      await sgMail.sendMultiple(messages as any);
      return { success: true };
    } catch (error: any) {
      console.error('SendGrid multiple send error:', error);
      throw new Error(`Multiple email send failed: ${error.message}`);
    }
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`Email attempt ${attempt}/${maxRetries} failed:`, error instanceof Error ? error.message : error);

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }

    throw lastError;
  }
}

export const emailService = new EmailService();

// Helper functions for common email types
export async function sendWelcomeEmail(to: string, userName: string): Promise<void> {
  const content: EmailContent = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@softwarehub.com',
    subject: 'Welcome to SoftwareHub!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome ${userName}!</h2>
        <p>Thank you for joining SoftwareHub.</p>
      </div>
    `,
    categories: ['welcome', 'transactional']
  };

  await emailService.withRetry(() => emailService.sendEmail(content));
}

export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password/${resetToken}`;
  
  const content: EmailContent = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@softwarehub.com',
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
        <p style="margin-top: 20px; color: #666;">This link expires in 1 hour.</p>
      </div>
    `,
    categories: ['password-reset', 'transactional']
  };

  await emailService.withRetry(() => emailService.sendEmail(content));
}