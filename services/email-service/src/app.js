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