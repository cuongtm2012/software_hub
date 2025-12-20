import sgMail from '@sendgrid/mail';

// Initialize SendGrid
const initializeSendGrid = () => {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn('SENDGRID_API_KEY not set - email functionality will be disabled');
    return false;
  }
  
  if (!apiKey.startsWith('SG.')) {
    console.warn('Invalid SendGrid API key format - expected to start with "SG."');
  }
  
  sgMail.setApiKey(apiKey);
  console.log('SendGrid initialized successfully');
  return true;
};

const sendGridEnabled = initializeSendGrid();

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
  from: string | { email: string; name: string };
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  headers?: Record<string, string>;
  categories?: string[];
  customArgs?: Record<string, string>;
}): Promise<EmailResult> {
  if (!sendGridEnabled) {
    console.log('Email not sent (SendGrid disabled):', emailContent.subject);
    return { success: false, error: 'SendGrid not configured' };
  }

  try {
    const msg: any = {
      to: emailContent.to,
      from: emailContent.from,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text || emailContent.subject,
    };

    if (emailContent.replyTo) msg.replyTo = emailContent.replyTo;
    if (emailContent.headers) msg.headers = emailContent.headers;
    if (emailContent.categories) msg.categories = emailContent.categories;
    if (emailContent.customArgs) msg.customArgs = emailContent.customArgs;

    const result = await withRetry(() => sgMail.send(msg));
    
    return {
      success: true,
      messageId: result[0].headers['x-message-id'],
    };
  } catch (error: any) {
    console.error('SendGrid error:', error);
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
  const fromEmail = process.env.FROM_EMAIL || 'noreply@softwarehub.com';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';

  return sendEmail({
    to: userEmail,
    from: { email: fromEmail, name: 'SoftwareHub Team' },
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
    categories: ['welcome', 'transactional'],
    customArgs: { emailType: 'welcome' },
  });
}

export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  resetUrl: string
): Promise<EmailResult> {
  const fromEmail = process.env.FROM_EMAIL || 'noreply@softwarehub.com';

  return sendEmail({
    to: userEmail,
    from: { email: fromEmail, name: 'SoftwareHub Security' },
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
    categories: ['password-reset', 'security'],
    customArgs: { emailType: 'password-reset' },
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
  const fromEmail = process.env.FROM_EMAIL || 'noreply@softwarehub.com';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';

  return sendEmail({
    to: userEmail,
    from: { email: fromEmail, name: 'SoftwareHub Orders' },
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
    categories: ['order-confirmation', 'transactional'],
    customArgs: { 
      emailType: 'order-confirmation',
      orderId: orderDetails.orderId,
    },
  });
}

// Export the core function as well for custom emails
export { sendEmail };
