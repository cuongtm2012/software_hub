import { Router, Request, Response } from 'express';
import { emailService, type EmailContent } from './service';

const router = Router();

// Send basic email
router.post('/send-email', async (req: Request, res: Response) => {
  try {
    const { to, from, subject, text, html } = req.body;

    if (!to || !from || !subject || (!text && !html)) {
      return res.status(400).json({
        error: 'Missing required fields: to, from, subject, and text or html'
      });
    }

    const result = await emailService.withRetry(
      () => emailService.sendEmail({ to, from, subject, text, html }),
      3,
      1000
    );

    console.log('Email sent successfully:', { to, subject, messageId: result.messageId });

    res.json({
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully'
    });
  } catch (error: any) {
    console.error('Failed to send email:', error);
    res.status(500).json({
      error: 'Failed to send email',
      message: error.message
    });
  }
});

// Send template email
router.post('/send-template-email', async (req: Request, res: Response) => {
  try {
    const { to, from, templateId, dynamicTemplateData } = req.body;

    if (!to || !from || !templateId) {
      return res.status(400).json({
        error: 'Missing required fields: to, from, templateId'
      });
    }

    const result = await emailService.withRetry(
      () => emailService.sendTemplateEmail({ to, from, templateId, dynamicTemplateData }),
      3,
      1000
    );

    res.json({
      success: true,
      messageId: result.messageId,
      message: 'Template email sent successfully'
    });
  } catch (error: any) {
    console.error('Failed to send template email:', error);
    res.status(500).json({
      error: 'Failed to send template email',
      message: error.message
    });
  }
});

// Get email status (placeholder)
router.get('/email-status/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    res.json({
      id,
      status: 'delivered',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Failed to get email status:', error);
    res.status(500).json({
      error: 'Failed to get email status',
      message: error.message
    });
  }
});

export default router;