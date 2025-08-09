import sgMail from '@sendgrid/mail';

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

interface TemplateEmailParams {
  to: string;
  from: string;
  templateId: string;
  dynamicTemplateData?: Record<string, any>;
}

class EmailService {
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SENDGRID_API_KEY not found. Email service will be disabled.');
      return;
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    this.initialized = true;
    console.log('EmailService initialized with SendGrid');
  }

  async sendEmail(params: EmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.initialized) {
      return { success: false, error: 'Email service not initialized' };
    }

    try {
      const msg: any = {
        to: params.to,
        from: params.from,
        subject: params.subject,
        text: params.text,
        html: params.html
      };

      const result = await sgMail.send(msg);
      
      console.log(`Email sent successfully to ${params.to}: ${params.subject}`);
      
      return {
        success: true,
        messageId: result[0].headers['x-message-id'] as string
      };
    } catch (error: any) {
      console.error('SendGrid email error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }
  }

  async sendTemplateEmail(params: TemplateEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.initialized) {
      return { success: false, error: 'Email service not initialized' };
    }

    try {
      const msg: any = {
        to: params.to,
        from: params.from,
        templateId: params.templateId,
        dynamicTemplateData: params.dynamicTemplateData || {}
      };

      const result = await sgMail.send(msg);
      
      console.log(`Template email sent successfully to ${params.to} using template ${params.templateId}`);
      
      return {
        success: true,
        messageId: result[0].headers['x-message-id'] as string
      };
    } catch (error: any) {
      console.error('SendGrid template email error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send template email'
      };
    }
  }

  // Predefined email templates for common use cases
  async sendWelcomeEmail(userEmail: string, userName: string) {
    // Check if email service is initialized
    if (!this.initialized) {
      console.error('Email service not initialized - SENDGRID_API_KEY missing');
      return { success: false, error: 'Email service not initialized' };
    }

    // Use a verified sender email - this is critical for SendGrid
    // For development, we'll try multiple potential verified senders
    const senderEmail = process.env.VERIFIED_SENDER_EMAIL || 'noreply@replit.dev';
    
    console.log(`Attempting to send welcome email from ${senderEmail} to ${userEmail}`);

    return this.sendEmail({
      to: userEmail,
      from: senderEmail,
      subject: 'Welcome to SoftwareHub!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to SoftwareHub!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${userName}!</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Thank you for joining SoftwareHub, the ultimate platform for software discovery and collaboration!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">What you can do with SoftwareHub:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li><strong>Discover Software:</strong> Browse our extensive catalog of free software</li>
                <li><strong>Request Projects:</strong> Get custom software developed by our expert developers</li>
                <li><strong>Join the Marketplace:</strong> Buy and sell software products</li>
                <li><strong>Collaborate:</strong> Connect with developers and clients worldwide</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Get Started Now
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
              Need help? Contact our support team
            </p>
          </div>
        </div>
      `,
      text: `Welcome to SoftwareHub, ${userName}!\n\nThank you for joining our platform. You can now browse software, request projects, and connect with developers.\n\nBest regards,\nThe SoftwareHub Team`
    });
  }

  async sendProjectNotification(userEmail: string, userName: string, projectTitle: string, status: string) {
    const statusMessages = {
      'pending': 'Your project request has been received and is being reviewed.',
      'in_progress': 'Your project has been assigned to a developer and work has begun.',
      'completed': 'Your project has been completed! Please review the deliverables.',
      'cancelled': 'Your project has been cancelled. Please contact support for details.'
    };

    return this.sendEmail({
      to: userEmail,
      from: 'projects@softwarehub.com',
      subject: `Project Update: ${projectTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Project Status Update</h1>
          <p>Hello ${userName},</p>
          <p>Your project "<strong>${projectTitle}</strong>" status has been updated to: <strong>${status.toUpperCase()}</strong></p>
          <p>${statusMessages[status as keyof typeof statusMessages] || 'Status has been updated.'}</p>
          <p>You can view more details in your dashboard.</p>
          <p>Best regards,<br>The SoftwareHub Team</p>
        </div>
      `
    });
  }

  async sendAdminNotification(adminEmail: string, subject: string, message: string) {
    return this.sendEmail({
      to: adminEmail,
      from: 'system@softwarehub.com',
      subject: `[ADMIN] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d73027;">Admin Notification</h1>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${message}
          </div>
          <p><em>This is an automated notification from SoftwareHub.</em></p>
        </div>
      `
    });
  }

  async sendPasswordResetEmail(userEmail: string, resetToken: string) {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
    
    return this.sendEmail({
      to: userEmail,
      from: process.env.VERIFIED_SENDER_EMAIL || 'noreply@replit.dev',
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #dc3545; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Password Reset Request</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px;">You requested a password reset for your SoftwareHub account.</p>
            <p style="color: #666;">Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #999; font-size: 14px;">This link will expire in 1 hour.</p>
            <p style="color: #999; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `,
      text: `Password Reset Request\n\nYou requested a password reset for your SoftwareHub account.\n\nClick this link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour. If you didn't request this, please ignore this email.`
    });
  }

  async sendAccountActivationEmail(userEmail: string, userName: string, activationToken: string) {
    const activationUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/activate-account?token=${activationToken}`;
    
    return this.sendEmail({
      to: userEmail,
      from: process.env.VERIFIED_SENDER_EMAIL || 'noreply@replit.dev',
      subject: 'Activate Your SoftwareHub Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #28a745; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Activate Your Account</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${userName}!</h2>
            <p style="color: #666; font-size: 16px;">Welcome to SoftwareHub! Please activate your account to get started.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${activationUrl}" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Activate Account
              </a>
            </div>
            <p style="color: #999; font-size: 14px;">This activation link will expire in 24 hours.</p>
          </div>
        </div>
      `,
      text: `Activate Your SoftwareHub Account\n\nHi ${userName}!\n\nWelcome to SoftwareHub! Please activate your account by clicking this link: ${activationUrl}\n\nThis link will expire in 24 hours.`
    });
  }

  async sendOrderConfirmationEmail(userEmail: string, userName: string, orderDetails: any) {
    return this.sendEmail({
      to: userEmail,
      from: process.env.VERIFIED_SENDER_EMAIL || 'noreply@replit.dev',
      subject: `Order Confirmation #${orderDetails.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #007bff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Order Confirmation</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Thank you, ${userName}!</h2>
            <p style="color: #666; font-size: 16px;">Your order has been confirmed and is being processed.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
              <p><strong>Order ID:</strong> #${orderDetails.orderId}</p>
              <p><strong>Product:</strong> ${orderDetails.productName}</p>
              <p><strong>Amount:</strong> $${orderDetails.amount}</p>
              <p><strong>Status:</strong> ${orderDetails.status}</p>
            </div>
            <p style="color: #666;">You can track your order in your dashboard.</p>
          </div>
        </div>
      `
    });
  }

  async sendSupportNotification(supportEmail: string, userEmail: string, subject: string, message: string) {
    return this.sendEmail({
      to: supportEmail,
      from: process.env.VERIFIED_SENDER_EMAIL || 'noreply@replit.dev',
      subject: `[SUPPORT REQUEST] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #ffc107; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #333; margin: 0;">Support Request</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h3 style="color: #333; margin-top: 0;">New Support Request</h3>
            <p><strong>From:</strong> ${userEmail}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
              <h4>Message:</h4>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 20px;">Please respond to this support request within 24 hours.</p>
          </div>
        </div>
      `
    });
  }

  async sendNewsletterSubscriptionConfirmation(userEmail: string, userName: string) {
    return this.sendEmail({
      to: userEmail,
      from: process.env.VERIFIED_SENDER_EMAIL || 'noreply@replit.dev',
      subject: 'Newsletter Subscription Confirmed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #6f42c1; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Newsletter Subscription</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Welcome to our newsletter, ${userName}!</h2>
            <p style="color: #666; font-size: 16px;">You'll now receive updates about new software releases, platform features, and exclusive offers.</p>
            <p style="color: #999; font-size: 14px;">You can unsubscribe at any time by clicking the unsubscribe link in our emails.</p>
          </div>
        </div>
      `
    });
  }

  async sendAccountDeactivationNotice(userEmail: string, userName: string) {
    return this.sendEmail({
      to: userEmail,
      from: process.env.VERIFIED_SENDER_EMAIL || 'noreply@replit.dev',
      subject: 'Account Deactivation Notice',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #6c757d; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Account Deactivated</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
            <p style="color: #666; font-size: 16px;">Your SoftwareHub account has been deactivated as requested.</p>
            <p style="color: #666;">Your data will be retained for 30 days in case you want to reactivate your account.</p>
            <p style="color: #999; font-size: 14px;">If you want to reactivate your account, please contact our support team.</p>
          </div>
        </div>
      `
    });
  }

  async sendAccountReactivationNotice(userEmail: string, userName: string) {
    return this.sendEmail({
      to: userEmail,
      from: process.env.VERIFIED_SENDER_EMAIL || 'noreply@replit.dev',
      subject: 'Welcome Back! Account Reactivated',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #28a745; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome Back!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
            <p style="color: #666; font-size: 16px;">Your SoftwareHub account has been successfully reactivated!</p>
            <p style="color: #666;">You can now access all features and continue where you left off.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/dashboard" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      `
    });
  }

  async sendMarketingEmail(userEmail: string, userName: string, campaignData: any) {
    const unsubscribeUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/unsubscribe?email=${encodeURIComponent(userEmail)}`;
    
    return this.sendEmail({
      to: userEmail,
      from: process.env.VERIFIED_SENDER_EMAIL || 'noreply@replit.dev',
      subject: campaignData.subject || 'Special Offer from SoftwareHub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">${campaignData.title || 'Special Offer'}</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
            <div style="color: #666; font-size: 16px; line-height: 1.6;">
              ${campaignData.content || '<p>Check out our latest offers and updates!</p>'}
            </div>
            ${campaignData.ctaText && campaignData.ctaUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${campaignData.ctaUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                ${campaignData.ctaText}
              </a>
            </div>
            ` : ''}
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              You received this email because you subscribed to our marketing communications.<br>
              <a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe</a> from future marketing emails.
            </p>
          </div>
        </div>
      `
    });
  }

  // Email validation utility
  validateEmail(email: string): { valid: boolean; error?: string } {
    if (!email) {
      return { valid: false, error: 'Email is required' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }
    
    return { valid: true };
  }

  // Check if user exists in database
  async checkUserExists(email: string): Promise<boolean> {
    try {
      // This would typically check your user database
      // For now, we'll simulate this check
      return email.includes('@test.com') || email.includes('@gmail.com');
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }
}

export default new EmailService();