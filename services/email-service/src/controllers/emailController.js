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

  // Test email methods for all scenarios

  // 1. User Registration / Account Activation
  async testWelcomeEmail(req, res) {
    try {
      const { userEmail, userName } = req.body;

      if (!userEmail || !userName) {
        return res.status(400).json({
          error: 'Missing required fields: userEmail, userName'
        });
      }

      const emailContent = {
        to: userEmail,
        from: process.env.FROM_EMAIL || 'noreply@softwarehub.com',
        subject: 'Welcome to SoftwareHub! Please activate your account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to SoftwareHub, ${userName}!</h2>
            <p>Thank you for joining our software discovery and management platform.</p>
            <p>To get started, please click the button below to activate your account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/activate?email=${encodeURIComponent(userEmail)}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Activate Account
              </a>
            </div>
            <p>If the button doesn't work, copy and paste this link:</p>
            <p style="word-break: break-all; color: #6b7280;">${process.env.FRONTEND_URL || 'http://localhost:5000'}/activate?email=${encodeURIComponent(userEmail)}</p>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Best regards,<br>
              The SoftwareHub Team
            </p>
          </div>
        `
      };

      const result = await retryUtil.withRetry(
        () => sendGridService.sendEmail(emailContent),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Welcome email sent successfully'
      });

    } catch (error) {
      console.error('Welcome email test error:', error);
      res.status(500).json({
        error: 'Failed to send welcome email test',
        message: error.message
      });
    }
  }

  async testActivationEmail(req, res) {
    try {
      const { userEmail, userName, activationToken } = req.body;

      if (!userEmail || !userName) {
        return res.status(400).json({
          error: 'Missing required fields: userEmail, userName'
        });
      }

      const token = activationToken || 'test_activation_token_' + Date.now();
      const emailContent = {
        to: userEmail,
        from: process.env.FROM_EMAIL || 'noreply@softwarehub.com',
        subject: 'Activate Your SoftwareHub Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Account Activation Required</h2>
            <p>Hi ${userName},</p>
            <p>Please click the link below to activate your SoftwareHub account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/activate/${token}" 
                 style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Activate Now
              </a>
            </div>
            <p style="color: #dc2626; font-weight: bold;">This link expires in 24 hours.</p>
          </div>
        `
      };

      const result = await retryUtil.withRetry(
        () => sendGridService.sendEmail(emailContent),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Activation email sent successfully'
      });

    } catch (error) {
      console.error('Activation email test error:', error);
      res.status(500).json({
        error: 'Failed to send activation email test',
        message: error.message
      });
    }
  }

  // 2. Password Reset / Recovery
  async testPasswordResetEmail(req, res) {
    try {
      const { userEmail, userName, resetToken } = req.body;

      if (!userEmail) {
        return res.status(400).json({
          error: 'Missing required field: userEmail'
        });
      }

      const token = resetToken || 'test_reset_token_' + Date.now();
      const emailContent = {
        to: userEmail,
        from: process.env.FROM_EMAIL || 'noreply@softwarehub.com',
        subject: 'Reset Your SoftwareHub Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Password Reset Request</h2>
            <p>Hi ${userName || 'User'},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password/${token}" 
                 style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #f59e0b; font-weight: bold;">This link expires in 1 hour for security.</p>
            <p style="color: #6b7280; font-size: 14px;">
              If you didn't request this, please ignore this email.
            </p>
          </div>
        `
      };

      const result = await retryUtil.withRetry(
        () => sendGridService.sendEmail(emailContent),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Password reset email sent successfully'
      });

    } catch (error) {
      console.error('Password reset email test error:', error);
      res.status(500).json({
        error: 'Failed to send password reset email test',
        message: error.message
      });
    }
  }

  // 3. Order Confirmation / Receipts
  async testOrderConfirmationEmail(req, res) {
    try {
      const { userEmail, userName, orderDetails } = req.body;

      if (!userEmail || !orderDetails) {
        return res.status(400).json({
          error: 'Missing required fields: userEmail, orderDetails'
        });
      }

      const order = {
        id: orderDetails.orderId || 'ORDER-' + Date.now(),
        amount: orderDetails.amount || '$99.99',
        items: orderDetails.items || ['Premium Software Package'],
        date: new Date().toLocaleDateString(),
        ...orderDetails
      };

      const emailContent = {
        to: userEmail,
        from: process.env.FROM_EMAIL || 'noreply@softwarehub.com',
        subject: `Order Confirmation - ${order.id}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">✅ Order Confirmed!</h2>
            <p>Hi ${userName || 'Customer'},</p>
            <p>Thank you for your purchase. Your order has been confirmed:</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0; color: #374151;">Order Details</h3>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Date:</strong> ${order.date}</p>
              <p><strong>Total:</strong> ${order.amount}</p>
              <p><strong>Items:</strong></p>
              <ul>
                ${order.items.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/orders/${order.id}" 
                 style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Order
              </a>
            </div>
          </div>
        `
      };

      const result = await retryUtil.withRetry(
        () => sendGridService.sendEmail(emailContent),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Order confirmation email sent successfully'
      });

    } catch (error) {
      console.error('Order confirmation email test error:', error);
      res.status(500).json({
        error: 'Failed to send order confirmation email test',
        message: error.message
      });
    }
  }

  // 4. Project Notifications
  async testProjectNotificationEmail(req, res) {
    try {
      const { userEmail, userName, projectDetails } = req.body;

      if (!userEmail || !projectDetails) {
        return res.status(400).json({
          error: 'Missing required fields: userEmail, projectDetails'
        });
      }

      const project = {
        name: projectDetails.projectName || 'Test Project',
        status: projectDetails.status || 'In Progress',
        message: projectDetails.message || 'Your project has been updated',
        ...projectDetails
      };

      const emailContent = {
        to: userEmail,
        from: process.env.FROM_EMAIL || 'noreply@softwarehub.com',
        subject: `Project Update: ${project.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">📋 Project Update</h2>
            <p>Hi ${userName || 'User'},</p>
            <p>We have an update regarding your project:</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-left: 4px solid #7c3aed; margin: 20px 0;">
              <h3 style="margin: 0; color: #374151;">${project.name}</h3>
              <p><strong>Status:</strong> ${project.status}</p>
              <p>${project.message}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/projects" 
                 style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Project
              </a>
            </div>
          </div>
        `
      };

      const result = await retryUtil.withRetry(
        () => sendGridService.sendEmail(emailContent),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Project notification email sent successfully'
      });

    } catch (error) {
      console.error('Project notification email test error:', error);
      res.status(500).json({
        error: 'Failed to send project notification email test',
        message: error.message
      });
    }
  }

  // 5. Newsletter Subscription
  async testNewsletterConfirmationEmail(req, res) {
    try {
      const { userEmail, userName } = req.body;

      if (!userEmail) {
        return res.status(400).json({
          error: 'Missing required field: userEmail'
        });
      }

      const emailContent = {
        to: userEmail,
        from: process.env.FROM_EMAIL || 'noreply@softwarehub.com',
        subject: 'Newsletter Subscription Confirmed',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0891b2;">📧 Newsletter Subscription Confirmed</h2>
            <p>Hi ${userName || 'Subscriber'},</p>
            <p>Welcome to the SoftwareHub newsletter! You'll now receive:</p>
            
            <ul style="margin: 20px 0;">
              <li>Latest software releases and updates</li>
              <li>Industry insights and trends</li>
              <li>Exclusive offers and promotions</li>
              <li>Development tips and best practices</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/newsletter" 
                 style="background-color: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Manage Preferences
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              You can unsubscribe at any time by clicking the link in our emails.
            </p>
          </div>
        `
      };

      const result = await retryUtil.withRetry(
        () => sendGridService.sendEmail(emailContent),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Newsletter confirmation email sent successfully'
      });

    } catch (error) {
      console.error('Newsletter confirmation email test error:', error);
      res.status(500).json({
        error: 'Failed to send newsletter confirmation email test',
        message: error.message
      });
    }
  }

  // 6. Account Deactivation
  async testAccountDeactivationEmail(req, res) {
    try {
      const { userEmail, userName } = req.body;

      if (!userEmail) {
        return res.status(400).json({
          error: 'Missing required field: userEmail'
        });
      }

      const emailContent = {
        to: userEmail,
        from: process.env.FROM_EMAIL || 'noreply@softwarehub.com',
        subject: 'Account Deactivation Confirmation',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">⚠️ Account Deactivated</h2>
            <p>Hi ${userName || 'User'},</p>
            <p>Your SoftwareHub account has been successfully deactivated as requested.</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-left: 4px solid #dc2626; margin: 20px 0;">
              <p><strong>What happens next:</strong></p>
              <ul>
                <li>You will no longer receive notifications</li>
                <li>Your data will be securely stored for 90 days</li>
                <li>You can reactivate anytime within this period</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/reactivate" 
                 style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reactivate Account
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              We're sorry to see you go! If you have feedback, please let us know.
            </p>
          </div>
        `
      };

      const result = await retryUtil.withRetry(
        () => sendGridService.sendEmail(emailContent),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Account deactivation email sent successfully'
      });

    } catch (error) {
      console.error('Account deactivation email test error:', error);
      res.status(500).json({
        error: 'Failed to send account deactivation email test',
        message: error.message
      });
    }
  }

  // 7. Account Reactivation
  async testAccountReactivationEmail(req, res) {
    try {
      const { userEmail, userName } = req.body;

      if (!userEmail) {
        return res.status(400).json({
          error: 'Missing required field: userEmail'
        });
      }

      const emailContent = {
        to: userEmail,
        from: process.env.FROM_EMAIL || 'noreply@softwarehub.com',
        subject: 'Welcome Back! Account Reactivated',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">🎉 Welcome Back!</h2>
            <p>Hi ${userName || 'User'},</p>
            <p>Great news! Your SoftwareHub account has been successfully reactivated.</p>
            
            <div style="background-color: #f0fdf4; padding: 20px; border-left: 4px solid #059669; margin: 20px 0;">
              <p><strong>Your account is now active with:</strong></p>
              <ul>
                <li>Full access to all features</li>
                <li>All your previous data restored</li>
                <li>Notifications re-enabled</li>
                <li>Premium features (if applicable)</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/dashboard" 
                 style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              Thank you for coming back! We're excited to have you with us again.
            </p>
          </div>
        `
      };

      const result = await retryUtil.withRetry(
        () => sendGridService.sendEmail(emailContent),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Account reactivation email sent successfully'
      });

    } catch (error) {
      console.error('Account reactivation email test error:', error);
      res.status(500).json({
        error: 'Failed to send account reactivation email test',
        message: error.message
      });
    }
  }

  // 8. Marketing / Promotional Emails
  async testMarketingEmail(req, res) {
    try {
      const { userEmail, userName, campaignData } = req.body;

      if (!userEmail) {
        return res.status(400).json({
          error: 'Missing required field: userEmail'
        });
      }

      const campaign = {
        title: campaignData?.title || 'Special Offer - 50% Off Premium Plans',
        content: campaignData?.content || 'Limited time offer on all premium software packages!',
        ctaText: campaignData?.ctaText || 'Claim Offer',
        ctaUrl: campaignData?.ctaUrl || `${process.env.FRONTEND_URL || 'http://localhost:5000'}/offers`,
        validUntil: campaignData?.validUntil || 'March 31, 2025',
        ...campaignData
      };

      const emailContent = {
        to: userEmail,
        from: process.env.FROM_EMAIL || 'noreply@softwarehub.com',
        subject: campaign.title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #db2777;">🎁 ${campaign.title}</h2>
            <p>Hi ${userName || 'Valued Customer'},</p>
            <p>${campaign.content}</p>
            
            <div style="background: linear-gradient(135deg, #db2777, #be185d); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
              <h3 style="color: white; margin: 0 0 20px 0;">Don't Miss Out!</h3>
              <a href="${campaign.ctaUrl}" 
                 style="background-color: white; color: #db2777; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                ${campaign.ctaText}
              </a>
            </div>
            
            <p style="color: #f59e0b; font-weight: bold; text-align: center;">
              ⏰ Offer valid until ${campaign.validUntil}
            </p>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/unsubscribe" style="color: #6b7280;">
                Unsubscribe from marketing emails
              </a>
            </p>
          </div>
        `
      };

      const result = await retryUtil.withRetry(
        () => sendGridService.sendEmail(emailContent),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Marketing email sent successfully'
      });

    } catch (error) {
      console.error('Marketing email test error:', error);
      res.status(500).json({
        error: 'Failed to send marketing email test',
        message: error.message
      });
    }
  }

  // 9. Support / Contact Form
  async testSupportNotificationEmail(req, res) {
    try {
      const { supportEmail, userEmail, subject, message } = req.body;

      if (!supportEmail || !userEmail || !subject || !message) {
        return res.status(400).json({
          error: 'Missing required fields: supportEmail, userEmail, subject, message'
        });
      }

      const emailContent = {
        to: supportEmail,
        from: process.env.FROM_EMAIL || 'noreply@softwarehub.com',
        subject: `Support Request: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">🎧 New Support Request</h2>
            
            <div style="background-color: #fef2f2; padding: 20px; border-left: 4px solid #dc2626; margin: 20px 0;">
              <p><strong>From:</strong> ${userEmail}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #374151;">Message:</h3>
              <p style="margin: 0; line-height: 1.6;">${message}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:${userEmail}?subject=Re: ${encodeURIComponent(subject)}" 
                 style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reply to Customer
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated notification from the SoftwareHub support system.
            </p>
          </div>
        `
      };

      const result = await retryUtil.withRetry(
        () => sendGridService.sendEmail(emailContent),
        3,
        1000
      );

      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Support notification email sent successfully'
      });

    } catch (error) {
      console.error('Support notification email test error:', error);
      res.status(500).json({
        error: 'Failed to send support notification email test',
        message: error.message
      });
    }
  }

  // Bulk email testing
  async testBulkEmails(req, res) {
    try {
      const { emails, subject, content, emailType } = req.body;

      if (!emails || !Array.isArray(emails) || !subject || !content) {
        return res.status(400).json({
          error: 'Missing required fields: emails (array), subject, content'
        });
      }

      const messages = emails.map(email => ({
        to: email,
        from: process.env.FROM_EMAIL || 'noreply@softwarehub.com',
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">📢 ${subject}</h2>
            <div style="margin: 20px 0; line-height: 1.6;">
              ${content}
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              This is a bulk email test from SoftwareHub (${emailType || 'general'}).
            </p>
          </div>
        `
      }));

      const result = await retryUtil.withRetry(
        () => sendGridService.sendMultiple(messages),
        2,
        500
      );

      res.json({
        success: true,
        count: emails.length,
        message: `Bulk emails sent successfully to ${emails.length} recipients`
      });

    } catch (error) {
      console.error('Bulk email test error:', error);
      res.status(500).json({
        error: 'Failed to send bulk email test',
        message: error.message
      });
    }
  }
}

module.exports = new EmailController();