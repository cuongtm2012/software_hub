import sgMail from '@sendgrid/mail';

// Set up SendGrid with the same API key as the service
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Create the exact same email structure as our failing activation email
const emailContent = {
  to: 'cuongeurovnn@gmail.com',
  from: {
    email: 'cuongeurovnn@gmail.com',
    name: 'SoftwareHub Team'
  },
  replyTo: 'cuongeurovnn@gmail.com',
  subject: 'Welcome to SoftwareHub! Please activate your account',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to SoftwareHub!</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
        <h2 style="color: #333; margin-top: 0;">Hi Test User!</h2>
        <p style="color: #666; line-height: 1.6;">Thank you for joining our professional software discovery and management platform.</p>
        <p style="color: #666; line-height: 1.6;">To get started, please click the button below to activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:5000/activate?email=cuongeurovnn@gmail.com" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
            Activate Account
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link:</p>
        <p style="word-break: break-all; color: #667eea; font-size: 12px;">http://localhost:5000/activate?email=cuongeurovnn@gmail.com</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            Best regards,<br>
            <strong>The SoftwareHub Team</strong><br>
            <span style="color: #999; font-size: 12px;">Professional Software Solutions</span>
          </p>
        </div>
      </div>
    </div>
  `,
  headers: {
    'List-Unsubscribe': 'mailto:unsubscribe@softwarehub.com, http://localhost:5000/unsubscribe',
    'X-Priority': '3',
    'X-MSMail-Priority': 'Normal',
    'Importance': 'Normal'
  },
  categories: ['welcome', 'user-onboarding'],
  customArgs: {
    userId: 'test_user',
    campaignType: 'activation'
  }
};

console.log('Sending direct email with exact same content as failing service...');
sgMail.send(emailContent)
  .then((result) => {
    console.log('SUCCESS: Direct SendGrid API call worked!');
    console.log('Message ID:', result[0].headers['x-message-id']);
    console.log('Status Code:', result[0].statusCode);
  })
  .catch((error) => {
    console.error('FAILED: Direct SendGrid API call failed');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    if (error.response && error.response.body) {
      console.error('Response body:', JSON.stringify(error.response.body, null, 2));
    }
  });