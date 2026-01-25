import { Resend } from 'resend';

// Initialize Resend
const initializeResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set - email functionality will be disabled');
    return null;
  }

  if (!apiKey.startsWith('re_')) {
    console.warn('Invalid Resend API key format - expected to start with "re_"');
  }

  console.log('✅ Resend initialized successfully');
  return new Resend(apiKey);
};

const resend = initializeResend();

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Retry utility
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.log(`Retry ${i + 1}/${maxRetries} failed:`, error);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Core email sending function
async function sendEmail(emailContent: {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}): Promise<EmailResult> {
  if (!resend) {
    console.log('📧 Email not sent (Resend disabled):', emailContent.subject);
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const result = await withRetry(() => resend.emails.send({
      from: emailContent.from,
      to: emailContent.to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      replyTo: emailContent.replyTo,
      tags: emailContent.tags,
    }));

    // Handle Resend response - check for error first
    if ('error' in result && result.error) {
      console.error('❌ Resend API error:', result.error);
      return {
        success: false,
        error: result.error.message || 'Failed to send email',
      };
    }

    // Success case - result.data contains the email ID
    const emailId = result.data?.id || 'unknown';
    console.log('✅ Email sent successfully:', emailId);

    return {
      success: true,
      messageId: emailId,
    };
  } catch (error: any) {
    console.error('❌ Resend error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

// Specific email templates
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
): Promise<EmailResult> {
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';

  return sendEmail({
    to: userEmail,
    from: fromEmail,
    replyTo: fromEmail,
    subject: 'Welcome to SoftwareHub!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to SoftwareHub!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName}!</h2>
          <p style="color: #666; line-height: 1.6;">Thank you for joining our professional software discovery and management platform.</p>
          <p style="color: #666; line-height: 1.6;">Your account has been created successfully. You can now:</p>
          <ul style="color: #666; line-height: 1.8;">
            <li>Browse our software catalog</li>
            <li>Create and manage projects</li>
            <li>Connect with developers</li>
            <li>Purchase premium software</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${frontendUrl}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong>The SoftwareHub Team</strong>
            </p>
          </div>
        </div>
      </div>
    `,
    tags: [
      { name: 'category', value: 'welcome' },
      { name: 'type', value: 'transactional' }
    ],
  });
}

export async function sendVerificationEmail(
  userEmail: string,
  verificationUrl: string
): Promise<EmailResult> {
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  return sendEmail({
    to: userEmail,
    from: fromEmail,
    replyTo: fromEmail,
    subject: 'Verify Your Email - Set Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #004080 0%, #002040 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to SoftwareHub!</h1>
        </div>
        <div style="padding: 40px 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-top: 0; font-size: 22px;">Verify Your Email & Set Your Password</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Thank you for registering with SoftwareHub! To complete your registration and access your account, 
            please verify your email address and set your password.
          </p>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Click the button below to set your password:
          </p>
          <div style="text-align: center; margin: 35px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #004080 0%, #003366 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 30px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,64,128,0.3);">
              Set Your Password
            </a>
          </div>
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>⏰ Important:</strong> This link will expire in 24 hours for security reasons.
            </p>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            If you didn't create an account with SoftwareHub, you can safely ignore this email.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong>The SoftwareHub Team</strong>
            </p>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p style="margin: 0;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #004080; word-break: break-all;">${verificationUrl}</a>
          </p>
        </div>
      </div>
    `,
    tags: [
      { name: 'category', value: 'verification' },
      { name: 'type', value: 'onboarding' }
    ],
  });
}


export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  resetUrl: string
): Promise<EmailResult> {
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  return sendEmail({
    to: userEmail,
    from: fromEmail,
    replyTo: fromEmail,
    subject: 'Reset Your SoftwareHub Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Password Reset Request</h2>
        <p>Hi ${userName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #f59e0b; font-weight: bold;">This link expires in 1 hour for security.</p>
        <p style="color: #6b7280; font-size: 14px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
    tags: [
      { name: 'category', value: 'password-reset' },
      { name: 'type', value: 'security' }
    ],
  });
}

export async function sendOrderConfirmationEmail(
  userEmail: string,
  userName: string,
  orderDetails: {
    orderId: string;
    amount: string;
    items: string[];
    date: string;
  }
): Promise<EmailResult> {
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';

  return sendEmail({
    to: userEmail,
    from: fromEmail,
    replyTo: fromEmail,
    subject: `Order Confirmation - ${orderDetails.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">✅ Order Confirmed!</h2>
        <p>Hi ${userName},</p>
        <p>Thank you for your purchase. Your order has been confirmed:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0; color: #374151;">Order Details</h3>
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          <p><strong>Date:</strong> ${orderDetails.date}</p>
          <p><strong>Total:</strong> ${orderDetails.amount}</p>
          <p><strong>Items:</strong></p>
          <ul>
            ${orderDetails.items.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}/orders/${orderDetails.orderId}" 
             style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Order
          </a>
        </div>
      </div>
    `,
    tags: [
      { name: 'category', value: 'order-confirmation' },
      { name: 'type', value: 'transactional' },
      { name: 'order_id', value: orderDetails.orderId }
    ],
  });
}

// Export the core function as well for custom emails
export { sendEmail };
