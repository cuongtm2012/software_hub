import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { isAuthenticated } from "../middleware/auth.middleware";

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

export default router;
