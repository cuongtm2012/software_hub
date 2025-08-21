import admin from 'firebase-admin';

let firebaseApp: admin.app.App | null = null;

/**
 * Initialize Firebase Admin SDK for push notifications
 * This is used server-side to send FCM messages
 */
export function initializeFirebaseAdmin() {
  // Skip if already initialized
  if (firebaseApp) {
    console.log('✅ Firebase Admin already initialized');
    return firebaseApp;
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Check if credentials are available
    if (!projectId || !clientEmail || !privateKey) {
      console.warn('⚠️  Firebase Admin credentials not configured. Push notifications will not work.');
      console.warn('   Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env');
      return null;
    }

    // Initialize Firebase Admin
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
      }),
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log(`   Project ID: ${projectId}`);
    
    return firebaseApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    return null;
  }
}

/**
 * Get Firebase Admin instance
 */
export function getFirebaseAdmin(): admin.app.App | null {
  if (!firebaseApp) {
    return initializeFirebaseAdmin();
  }
  return firebaseApp;
}

/**
 * Send push notification to a specific FCM token
 */
export async function sendPushNotification(
  token: string,
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  },
  data?: Record<string, string>
): Promise<string> {
  const app = getFirebaseAdmin();
  
  if (!app) {
    throw new Error('Firebase Admin not initialized. Please configure Firebase credentials.');
  }

  try {
    const message: admin.messaging.Message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: data || {},
      webpush: {
        fcmOptions: {
          link: data?.click_action || '/',
        },
        notification: {
          icon: '/icon-192x192.svg',
          badge: '/badge-72x72.svg',
          requireInteraction: true,
        },
      },
    };

    const messageId = await admin.messaging().send(message);
    console.log('✅ Push notification sent successfully:', messageId);
    return messageId;
  } catch (error: any) {
    console.error('❌ Failed to send push notification:', error);
    
    // Handle invalid token errors
    if (error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered') {
      throw new Error('INVALID_TOKEN');
    }
    
    throw error;
  }
}

/**
 * Send push notification to multiple tokens
 */
export async function sendPushNotificationToMultiple(
  tokens: string[],
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  },
  data?: Record<string, string>
): Promise<{ successCount: number; failureCount: number; invalidTokens: string[] }> {
  const app = getFirebaseAdmin();
  
  if (!app) {
    throw new Error('Firebase Admin not initialized. Please configure Firebase credentials.');
  }

  if (tokens.length === 0) {
    return { successCount: 0, failureCount: 0, invalidTokens: [] };
  }

  try {
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: data || {},
      webpush: {
        fcmOptions: {
          link: data?.click_action || '/',
        },
        notification: {
          icon: '/icon-192x192.svg',
          badge: '/badge-72x72.svg',
          requireInteraction: true,
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    // Collect invalid tokens
    const invalidTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success && 
          (resp.error?.code === 'messaging/invalid-registration-token' ||
           resp.error?.code === 'messaging/registration-token-not-registered')) {
        invalidTokens.push(tokens[idx]);
      }
    });

    console.log(`✅ Sent ${response.successCount}/${tokens.length} notifications`);
    if (invalidTokens.length > 0) {
      console.log(`⚠️  Found ${invalidTokens.length} invalid tokens`);
    }

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      invalidTokens,
    };
  } catch (error) {
    console.error('❌ Failed to send multicast push notification:', error);
    throw error;
  }
}

/**
 * Send push notification to a topic
 */
export async function sendPushNotificationToTopic(
  topic: string,
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  },
  data?: Record<string, string>
): Promise<string> {
  const app = getFirebaseAdmin();
  
  if (!app) {
    throw new Error('Firebase Admin not initialized. Please configure Firebase credentials.');
  }

  try {
    const message: admin.messaging.Message = {
      topic,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: data || {},
      webpush: {
        fcmOptions: {
          link: data?.click_action || '/',
        },
        notification: {
          icon: '/icon-192x192.svg',
          badge: '/badge-72x72.svg',
          requireInteraction: true,
        },
      },
    };

    const messageId = await admin.messaging().send(message);
    console.log(`✅ Push notification sent to topic "${topic}":`, messageId);
    return messageId;
  } catch (error) {
    console.error(`❌ Failed to send push notification to topic "${topic}":`, error);
    throw error;
  }
}

/**
 * Subscribe tokens to a topic
 */
export async function subscribeToTopic(tokens: string[], topic: string): Promise<void> {
  const app = getFirebaseAdmin();
  
  if (!app) {
    throw new Error('Firebase Admin not initialized. Please configure Firebase credentials.');
  }

  try {
    await admin.messaging().subscribeToTopic(tokens, topic);
    console.log(`✅ Subscribed ${tokens.length} tokens to topic "${topic}"`);
  } catch (error) {
    console.error(`❌ Failed to subscribe to topic "${topic}":`, error);
    throw error;
  }
}

/**
 * Unsubscribe tokens from a topic
 */
export async function unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
  const app = getFirebaseAdmin();
  
  if (!app) {
    throw new Error('Firebase Admin not initialized. Please configure Firebase credentials.');
  }

  try {
    await admin.messaging().unsubscribeFromTopic(tokens, topic);
    console.log(`✅ Unsubscribed ${tokens.length} tokens from topic "${topic}"`);
  } catch (error) {
    console.error(`❌ Failed to unsubscribe from topic "${topic}":`, error);
    throw error;
  }
}
