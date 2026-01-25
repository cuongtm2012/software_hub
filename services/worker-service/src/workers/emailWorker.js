const redisSMQService = require('../services/redisSMQService');
const emailServiceClient = require('../services/emailServiceClient');

class EmailWorker {
  constructor() {
    this.name = 'EmailWorker';
    this.isRunning = false;
    this.queueName = 'email-queue';
  }

  async start() {
    console.log(`Starting ${this.name}...`);
    this.isRunning = true;
    
    // Start consuming messages from Redis SMQ
    await redisSMQService.startConsumer(
      this.queueName, 
      this.handleMessage.bind(this),
      { 
        concurrency: 3, // Process up to 3 messages concurrently
        retryThreshold: 3 
      }
    );
    
    console.log(`${this.name} started and consuming from ${this.queueName}`);
  }

  async stop() {
    console.log(`Stopping ${this.name}...`);
    this.isRunning = false;
    
    // Stop consuming messages
    await redisSMQService.stopConsumer(this.queueName);
    
    console.log(`${this.name} stopped`);
  }

  async handleMessage(message, messageId) {
    if (!this.isRunning) return;
    
    console.log(`${this.name} processing message:`, messageId);
    
    try {
      switch (message.type) {
        case 'welcome':
          await this.handleWelcomeEmail(message);
          break;
        case 'project-notification':
          await this.handleProjectNotification(message);
          break;
        case 'admin-notification':
          await this.handleAdminNotification(message);
          break;
        case 'password-reset':
          await this.handlePasswordReset(message);
          break;
        case 'custom':
          await this.handleCustomEmail(message);
          break;
        case 'bulk-email':
          await this.handleBulkEmail(message);
          break;
        case 'newsletter':
          await this.handleNewsletter(message);
          break;
        default:
          console.warn(`${this.name} unknown message type:`, message.type);
          throw new Error(`Unknown message type: ${message.type}`); // This will trigger reject with no requeue
      }
      
      // Success - Redis SMQ will automatically acknowledge via the callback
      console.log(`${this.name} completed message:`, messageId);
      
    } catch (error) {
      console.error(`${this.name} message processing error:`, error);
      throw error; // Let Redis SMQ handle the retry mechanism
    }
  }

  async handleWelcomeEmail(message) {
    const { userEmail, userName, userId } = message.data;
    
    const result = await emailServiceClient.sendEmail({
      to: userEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'welcome@softwarehub.com',
      subject: 'Welcome to SoftwareHub!',
      html: this.getWelcomeEmailTemplate(userName),
      metadata: {
        userId,
        emailType: 'welcome',
        timestamp: message.timestamp
      }
    });
    
    if (!result.success) {
      throw new Error(`Failed to send welcome email: ${result.error}`);
    }

    console.log(`Welcome email sent to ${userEmail} (User ID: ${userId})`);
  }

  async handleProjectNotification(message) {
    const { userEmail, userName, projectTitle, status, projectId } = message.data;
    
    const result = await emailServiceClient.sendEmail({
      to: userEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'projects@softwarehub.com',
      subject: `Project Update: ${projectTitle}`,
      html: this.getProjectNotificationTemplate(userName, projectTitle, status),
      metadata: {
        projectId,
        emailType: 'project-notification',
        status,
        timestamp: message.timestamp
      }
    });
    
    if (!result.success) {
      throw new Error(`Failed to send project notification: ${result.error}`);
    }

    console.log(`Project notification sent to ${userEmail} (Project: ${projectId})`);
  }

  async handleAdminNotification(message) {
    const { adminEmail, subject, messageContent, priority = 'normal' } = message.data;
    
    const result = await emailServiceClient.sendEmail({
      to: adminEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'system@softwarehub.com',
      subject: `[ADMIN${priority === 'urgent' ? ' - URGENT' : ''}] ${subject}`,
      html: this.getAdminNotificationTemplate(subject, messageContent, priority),
      metadata: {
        emailType: 'admin-notification',
        priority,
        timestamp: message.timestamp
      }
    });
    
    if (!result.success) {
      throw new Error(`Failed to send admin notification: ${result.error}`);
    }

    console.log(`Admin notification sent to ${adminEmail} (Priority: ${priority})`);
  }

  async handlePasswordReset(message) {
    const { userEmail, resetToken, userId } = message.data;
    
    const result = await emailServiceClient.sendEmail({
      to: userEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'security@softwarehub.com',
      subject: 'Password Reset Request - SoftwareHub',
      html: this.getPasswordResetTemplate(resetToken),
      metadata: {
        userId,
        emailType: 'password-reset',
        resetToken,
        timestamp: message.timestamp
      }
    });
    
    if (!result.success) {
      throw new Error(`Failed to send password reset email: ${result.error}`);
    }

    console.log(`Password reset email sent to ${userEmail} (User ID: ${userId})`);
  }

  async handleCustomEmail(message) {
    const { to, from, subject, html, text, metadata = {} } = message.data;
    
    const result = await emailServiceClient.sendEmail({
      to, 
      from: from || process.env.SENDGRID_FROM_EMAIL,
      subject, 
      html, 
      text,
      metadata: {
        ...metadata,
        emailType: 'custom',
        timestamp: message.timestamp
      }
    });
    
    if (!result.success) {
      throw new Error(`Failed to send custom email: ${result.error}`);
    }

    console.log(`Custom email sent to ${to}`);
  }

  async handleBulkEmail(message) {
    const { recipients, from, subject, html, text, batchId } = message.data;
    
    // Process recipients in batches to avoid overwhelming the email service
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }

    let successCount = 0;
    let failureCount = 0;

    for (const [batchIndex, batch] of batches.entries()) {
      console.log(`Processing bulk email batch ${batchIndex + 1}/${batches.length} (${batch.length} recipients)`);
      
      const batchPromises = batch.map(async (recipient) => {
        try {
          const result = await emailServiceClient.sendEmail({
            to: recipient.email,
            from: from || process.env.SENDGRID_FROM_EMAIL,
            subject,
            html: html.replace(/{{name}}/g, recipient.name || 'User'),
            text: text?.replace(/{{name}}/g, recipient.name || 'User'),
            metadata: {
              batchId,
              recipientId: recipient.id,
              emailType: 'bulk-email',
              timestamp: message.timestamp
            }
          });
          
          if (result.success) {
            successCount++;
          } else {
            failureCount++;
            console.error(`Failed to send bulk email to ${recipient.email}:`, result.error);
          }
        } catch (error) {
          failureCount++;
          console.error(`Error sending bulk email to ${recipient.email}:`, error);
        }
      });

      await Promise.allSettled(batchPromises);
      
      // Add delay between batches to respect rate limits
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Bulk email batch ${batchId} completed: ${successCount} sent, ${failureCount} failed`);
  }

  async handleNewsletter(message) {
    const { recipients, subject, html, text, newsletterId } = message.data;
    
    // Similar to bulk email but with newsletter-specific handling
    console.log(`Processing newsletter ${newsletterId} for ${recipients.length} recipients`);
    
    // Process in smaller batches for newsletters
    const batchSize = 25;
    let processedCount = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (recipient) => {
        try {
          // Personalize newsletter content
          const personalizedHtml = html
            .replace(/{{name}}/g, recipient.name || 'Subscriber')
            .replace(/{{unsubscribe_url}}/g, `${process.env.CLIENT_URL}/unsubscribe?token=${recipient.unsubscribeToken}`);

          const result = await emailServiceClient.sendEmail({
            to: recipient.email,
            from: process.env.SENDGRID_FROM_EMAIL || 'newsletter@softwarehub.com',
            subject,
            html: personalizedHtml,
            metadata: {
              newsletterId,
              subscriberId: recipient.id,
              emailType: 'newsletter',
              timestamp: message.timestamp
            }
          });
          
          if (result.success) {
            processedCount++;
          } else {
            console.error(`Failed to send newsletter to ${recipient.email}:`, result.error);
          }
        } catch (error) {
          console.error(`Error sending newsletter to ${recipient.email}:`, error);
        }
      });

      await Promise.allSettled(batchPromises);
      
      // Respect rate limits between batches
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`Newsletter ${newsletterId} sent to ${processedCount} subscribers`);
  }

  // Email Templates
  getWelcomeEmailTemplate(userName) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; font-size: 28px;">Welcome to SoftwareHub!</h1>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 24px;">Hello ${userName}! 👋</h2>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for joining our innovative platform!</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #2c3e50; margin-top: 0;">What you can do now:</h3>
          <ul style="color: #555; line-height: 1.6;">
            <li>🛍️ Browse and download premium software</li>
            <li>🚀 Request custom development projects</li>
            <li>👥 Connect with experienced developers</li>
            <li>💼 Access our exclusive marketplace</li>
            <li>📊 Track your projects and downloads</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/dashboard" 
             style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
            Get Started Now
          </a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #777;">
          <p>Need help? Contact our support team at support@softwarehub.com</p>
          <p style="font-size: 14px;">Best regards,<br>The SoftwareHub Team</p>
        </div>
      </div>
    `;
  }

  getProjectNotificationTemplate(userName, projectTitle, status) {
    const statusConfig = {
      'pending': { 
        color: '#ffc107', 
        icon: '⏳', 
        message: 'Your project request has been received and is being reviewed by our team.' 
      },
      'in_progress': { 
        color: '#007bff', 
        icon: '🚀', 
        message: 'Great news! Your project has been assigned to a developer and work has begun.' 
      },
      'completed': { 
        color: '#28a745', 
        icon: '✅', 
        message: 'Congratulations! Your project has been completed. Please review the deliverables.' 
      },
      'cancelled': { 
        color: '#dc3545', 
        icon: '❌', 
        message: 'Your project has been cancelled. Please contact support for details.' 
      }
    };

    const config = statusConfig[status] || { color: '#6c757d', icon: '📋', message: 'Status has been updated.' };

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50; text-align: center;">Project Status Update</h1>
        
        <div style="background: ${config.color}; color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
          <h2 style="margin: 0; font-size: 24px;">${config.icon} ${status.toUpperCase().replace('_', ' ')}</h2>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Hello ${userName},</strong></p>
          <p style="margin: 0 0 15px 0;">Your project "<strong>${projectTitle}</strong>" has been updated.</p>
          <p style="margin: 0; color: #555;">${config.message}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/dashboard/projects" 
             style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
            View Project Details
          </a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #777; font-size: 14px;">
          <p>Best regards,<br>The SoftwareHub Team</p>
        </div>
      </div>
    `;
  }

  getAdminNotificationTemplate(subject, messageContent, priority = 'normal') {
    const priorityConfig = {
      'urgent': { color: '#dc3545', icon: '🚨', bgColor: '#ffe6e6' },
      'high': { color: '#fd7e14', icon: '⚠️', bgColor: '#fff3e0' },
      'normal': { color: '#007bff', icon: '📋', bgColor: '#e3f2fd' }
    };

    const config = priorityConfig[priority] || priorityConfig.normal;

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: ${config.bgColor}; border-left: 4px solid ${config.color}; padding: 20px; margin-bottom: 20px;">
          <h1 style="color: ${config.color}; margin: 0; font-size: 24px;">${config.icon} Admin Notification</h1>
          <p style="margin: 10px 0 0 0; color: #666; font-weight: bold;">Priority: ${priority.toUpperCase()}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin-top: 0;">Subject: ${subject}</h2>
          <div style="color: #555; line-height: 1.6;">
            ${messageContent}
          </div>
        </div>
        
        <div style="background: #e9ecef; padding: 15px; border-radius: 5px; font-size: 14px; color: #6c757d;">
          <p style="margin: 0;"><em>📅 Timestamp: ${new Date().toLocaleString()}</em></p>
          <p style="margin: 5px 0 0 0;"><em>🤖 This is an automated notification from SoftwareHub.</em></p>
        </div>
      </div>
    `;
  }

  getPasswordResetTemplate(resetToken) {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50;">🔐 Password Reset Request</h1>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #856404;">
            <strong>Security Notice:</strong> You requested a password reset for your SoftwareHub account.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <p style="margin: 0 0 20px 0; font-size: 16px;">Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" 
               style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">
              🔑 Reset My Password
            </a>
          </div>
        </div>
        
        <div style="background: #f1f3f4; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 14px; color: #5f6368;">
            <strong>Important:</strong> This link will expire in 1 hour for security purposes.
          </p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; color: #777; font-size: 14px;">
          <p>If you didn't request this password reset, please ignore this email or contact our support team.</p>
          <p style="margin-bottom: 0;">Best regards,<br>The SoftwareHub Security Team</p>
        </div>
      </div>
    `;
  }

  getStatus() {
    return {
      name: this.name,
      isRunning: this.isRunning,
      queueName: this.queueName,
      redisConnected: redisSMQService.isConnected
    };
  }
}

module.exports = new EmailWorker();