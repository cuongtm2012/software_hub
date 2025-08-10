require('dotenv').config();

const express = require('express');
const cors = require('cors');
const emailController = require('./controllers/emailController');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'email-service' });
});

// Email routes
app.post('/api/send-email', emailController.sendEmail);
app.post('/api/send-template-email', emailController.sendTemplateEmail);
app.get('/api/email-status/:id', emailController.getEmailStatus);

// Test email endpoints for all scenarios
app.post('/api/test-welcome', emailController.testWelcomeEmail);
app.post('/api/test-activation', emailController.testActivationEmail);
app.post('/api/test-password-reset', emailController.testPasswordResetEmail);
app.post('/api/test-order-confirmation', emailController.testOrderConfirmationEmail);
app.post('/api/test-project-notification', emailController.testProjectNotificationEmail);
app.post('/api/test-newsletter-confirmation', emailController.testNewsletterConfirmationEmail);
app.post('/api/test-account-deactivation', emailController.testAccountDeactivationEmail);
app.post('/api/test-account-reactivation', emailController.testAccountReactivationEmail);
app.post('/api/test-marketing', emailController.testMarketingEmail);
app.post('/api/test-support-notification', emailController.testSupportNotificationEmail);
app.post('/api/test-bulk', emailController.testBulkEmails);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Email service error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`Email service running on port ${PORT}`);
});

module.exports = app;