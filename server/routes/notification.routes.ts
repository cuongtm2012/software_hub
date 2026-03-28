import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { isAuthenticated } from "../middleware/auth.middleware";
import { enqueuePushNotificationJob } from "../lib/monolith-queue.js";

const router = Router();

// Microservice client helper
async function callMicroservice(endpoint: string, data: any, method: string = 'POST') {
  try {
    const gateweaverUrl = process.env.NGINX_URL || 'http://gateweaver:8080';
    const finalUrl = `${gateweaverUrl}${endpoint}`;

    console.log(`🔄 Calling notification service: ${finalUrl}`);

    const response = await fetch(finalUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': 'softwarehub-app'
      },
      body: method !== 'GET' ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Service call failed: ${response.status} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return { success: true, message: await response.text() };
    }
  } catch (error) {
    console.error(`❌ Failed to call notification service:`, error);
    throw error;
  }
}

// Send push notification
router.post("/push", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id, title, body, data } = req.body;

    if (!user_id || !title || !body) {
      return res.status(400).json({ message: "User ID, title, and body are required" });
    }

    const result = await callMicroservice('/api/notifications/push', {
      user_id,
      title,
      body,
      data
    });

    res.json(result);
  } catch (error) {
    console.error('Push notification error:', error);
    res.status(500).json({ message: "Failed to send push notification" });
  }
});

// Send notification to multiple users
router.post("/broadcast", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_ids, title, body, data } = req.body;

    if (!user_ids || !Array.isArray(user_ids) || !title || !body) {
      return res.status(400).json({ message: "User IDs (array), title, and body are required" });
    }

    const result = await callMicroservice('/api/notifications/broadcast', {
      user_ids,
      title,
      body,
      data
    });

    res.json(result);
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({ message: "Failed to send broadcast notification" });
  }
});

// Subscribe to topic
router.post("/subscribe", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fcm_token, topic } = req.body;

    if (!fcm_token || !topic) {
      return res.status(400).json({ message: "FCM token and topic are required" });
    }

    const result = await callMicroservice('/api/notifications/subscribe', {
      fcm_token,
      topic
    });

    res.json(result);
  } catch (error) {
    console.error('Subscribe to topic error:', error);
    res.status(500).json({ message: "Failed to subscribe to topic" });
  }
});

// Send topic notification
router.post("/topic", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { topic, title, body, data } = req.body;

    if (!topic || !title || !body) {
      return res.status(400).json({ message: "Topic, title, and body are required" });
    }

    const result = await callMicroservice('/api/notifications/topic', {
      topic,
      title,
      body,
      data
    });

    res.json(result);
  } catch (error) {
    console.error('Topic notification error:', error);
    res.status(500).json({ message: "Failed to send topic notification" });
  }
});

// Register FCM token for push notifications
router.post("/register-token", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, userId } = req.body;

    if (!token) {
      return res.status(400).json({ message: "FCM token is required" });
    }

    // Use userId from request body or from session
    const targetUserId = userId || (req.user as any)?.id;

    if (!targetUserId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Save token to database
    const { storage } = await import("../storage");
    await storage.saveFCMToken(targetUserId, token, 'web');

    console.log(`✅ Registered FCM token for user ${targetUserId}`);

    res.json({
      success: true,
      message: "FCM token registered successfully"
    });
  } catch (error) {
    console.error('FCM token registration error:', error);
    res.status(500).json({ message: "Failed to register FCM token" });
  }
});

// Send push notification to specific user
router.post("/send-push", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, title, body, data } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ message: "userId, title, and body are required" });
    }

    const jobId = await enqueuePushNotificationJob({
      userId: Number(userId),
      title,
      body,
      data: data || {}
    });

    res.status(202).json({
      success: true,
      queued: true,
      jobId,
      message: "Push notification queued for delivery"
    });
  } catch (error: any) {
    console.error('Send push notification error:', error);
    res.status(500).json({
      message: "Failed to send push notification",
      error: error.message
    });
  }
});

// Test push notification endpoint
router.post("/test-push/:userId", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const { storage } = await import("../storage");
    const { sendPushNotificationToMultiple } = await import("../lib/firebase-admin");

    // Get user's FCM tokens
    const tokens = await storage.getUserFCMTokens(userId);

    if (tokens.length === 0) {
      return res.status(404).json({
        message: "No FCM tokens found for user. User needs to enable notifications first."
      });
    }

    // Send test push notification
    const result = await sendPushNotificationToMultiple(
      tokens,
      {
        title: "🔔 Test Notification",
        body: "This is a test push notification from SoftwareHub!"
      },
      {
        type: 'test',
        click_action: '/notifications'
      }
    );

    // Cleanup invalid tokens
    if (result.invalidTokens.length > 0) {
      await storage.cleanupInvalidTokens(result.invalidTokens);
    }

    console.log(`✅ Sent test push notification to user ${userId}: ${result.successCount}/${tokens.length} delivered`);

    res.json({
      success: true,
      delivered: result.successCount,
      failed: result.failureCount,
      totalTokens: tokens.length,
      message: `Test notification sent to ${result.successCount} device(s)`
    });
  } catch (error: any) {
    console.error('Test push notification error:', error);
    res.status(500).json({
      message: "Failed to send test push notification",
      error: error.message
    });
  }
});

export default router;
