const redisService = require('../services/redisService');
const emailServiceClient = require('../services/emailServiceClient');

class EmailWorker {
  constructor() {
    this.name = 'EmailWorker';
    this.isRunning = false;
    this.processInterval = null;
  }

  async start() {
    console.log(`Starting ${this.name}...`);
    this.isRunning = true;
    
    // Start processing queue
    this.processInterval = setInterval(() => {
      this.processQueue().catch(error => {
        console.error(`${this.name} processing error:`, error);
      });
    }, 1000); // Check queue every second
    
    console.log(`${this.name} started`);
  }

  async stop() {
    console.log(`Stopping ${this.name}...`);
    this.isRunning = false;
    
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }
    
    console.log(`${this.name} stopped`);
  }

  async processQueue() {
    if (!this.isRunning) return;
    
    try {
      const job = await redisService.popFromQueue('email-queue');
      if (!job) return;
      
      console.log(`${this.name} processing job:`, job.id);
      
      switch (job.type) {
        case 'welcome':
          await this.handleWelcomeEmail(job);
          break;
        case 'project-notification':
          await this.handleProjectNotification(job);
          break;
        case 'admin-notification':
          await this.handleAdminNotification(job);
          break;
        case 'password-reset':
          await this.handlePasswordReset(job);
          break;
        case 'custom':
          await this.handleCustomEmail(job);
          break;
        default:
          console.warn(`${this.name} unknown job type:`, job.type);
      }
      
      console.log(`${this.name} completed job:`, job.id);
      
    } catch (error) {
      console.error(`${this.name} job processing error:`, error);
      // In production, might want to retry or move to dead letter queue
    }
  }

  async handleWelcomeEmail(job) {
    const { userEmail, userName } = job.data;
    
    const result = await emailServiceClient.sendEmail({
      to: userEmail,
      from: 'welcome@softwarehub.com',
      subject: 'Welcome to SoftwareHub!',
      html: this.getWelcomeEmailTemplate(userName)
    });
    
    if (!result.success) {
      throw new Error(`Failed to send welcome email: ${result.error}`);
    }
  }

  async handleProjectNotification(job) {
    const { userEmail, userName, projectTitle, status } = job.data;
    
    const result = await emailServiceClient.sendEmail({
      to: userEmail,
      from: 'projects@softwarehub.com',
      subject: `Project Update: ${projectTitle}`,
      html: this.getProjectNotificationTemplate(userName, projectTitle, status)
    });
    
    if (!result.success) {
      throw new Error(`Failed to send project notification: ${result.error}`);
    }
  }

  async handleAdminNotification(job) {
    const { adminEmail, subject, message } = job.data;
    
    const result = await emailServiceClient.sendEmail({
      to: adminEmail,
      from: 'system@softwarehub.com',
      subject: `[ADMIN] ${subject}`,
      html: this.getAdminNotificationTemplate(subject, message)
    });
    
    if (!result.success) {
      throw new Error(`Failed to send admin notification: ${result.error}`);
    }
  }

  async handlePasswordReset(job) {
    const { userEmail, resetToken } = job.data;
    
    const result = await emailServiceClient.sendEmail({
      to: userEmail,
      from: 'security@softwarehub.com',
      subject: 'Password Reset Request',
      html: this.getPasswordResetTemplate(resetToken)
    });
    
    if (!result.success) {
      throw new Error(`Failed to send password reset email: ${result.error}`);
    }
  }

  async handleCustomEmail(job) {
    const { to, from, subject, html, text } = job.data;
    
    const result = await emailServiceClient.sendEmail({
      to, from, subject, html, text
    });
    
    if (!result.success) {
      throw new Error(`Failed to send custom email: ${result.error}`);
    }
  }

  // Email Templates
  getWelcomeEmailTemplate(userName) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to SoftwareHub, ${userName}!</h1>
        <p>Thank you for joining our platform. You can now:</p>
        <ul>
          <li>Browse and download software</li>
          <li>Request custom development projects</li>
          <li>Connect with developers</li>
          <li>Access our marketplace</li>
        </ul>
        <p>Get started by exploring our software catalog!</p>
        <p>Best regards,<br>The SoftwareHub Team</p>
      </div>
    `;
  }

  getProjectNotificationTemplate(userName, projectTitle, status) {
    const statusMessages = {
      'pending': 'Your project request has been received and is being reviewed.',
      'in_progress': 'Your project has been assigned to a developer and work has begun.',
      'completed': 'Your project has been completed! Please review the deliverables.',
      'cancelled': 'Your project has been cancelled. Please contact support for details.'
    };

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Project Status Update</h1>
        <p>Hello ${userName},</p>
        <p>Your project "<strong>${projectTitle}</strong>" status has been updated to: <strong>${status.toUpperCase()}</strong></p>
        <p>${statusMessages[status] || 'Status has been updated.'}</p>
        <p>You can view more details in your dashboard.</p>
        <p>Best regards,<br>The SoftwareHub Team</p>
      </div>
    `;
  }

  getAdminNotificationTemplate(subject, message) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #d73027;">Admin Notification</h1>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${message}
        </div>
        <p><em>This is an automated notification from SoftwareHub.</em></p>
      </div>
    `;
  }

  getPasswordResetTemplate(resetToken) {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>You requested a password reset for your SoftwareHub account.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The SoftwareHub Team</p>
      </div>
    `;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      hasProcessInterval: !!this.processInterval
    };
  }
}

module.exports = new EmailWorker();