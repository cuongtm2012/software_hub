// Firebase Cloud Messaging setup for client-side push notifications
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCIdFOcJlv4W7rjQx0275-zuy8iu4wUlpI",
  authDomain: "softwarehub-f301a.firebaseapp.com",
  projectId: "softwarehub-f301a",
  storageBucket: "softwarehub-f301a.firebasestorage.app",
  messagingSenderId: "634452204320",
  appId: "1:634452204320:web:e93f0ed57398db22a2d545",
  measurementId: "G-ZDBVWVQ4Y1"
};

// VAPID key for web push - Get this from Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificates
const VAPID_KEY = "BH8Q_C-z8QfQjOw4GpgGjQbHJ8CuDXJqL2QLZBjIYLOLqHY2gCfKXWVgMYyMdO9FHLOe5-2DvfDdGq7BhZLYrxQ";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let messaging: any = null;

try {
  messaging = getMessaging(app);
} catch (error) {
  console.warn('Firebase messaging not supported in this environment:', error);
}

// Request notification permission and get FCM token
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    if (!messaging) {
      console.warn('Firebase messaging not available');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Register service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered:', registration);
      }

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });

      if (token) {
        console.log('FCM Token obtained:', token);
        return token;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
}

// Listen for foreground messages
export function setupForegroundMessageListener() {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    
    // Show notification even when app is in foreground
    if (payload.notification) {
      new Notification(payload.notification.title || 'New notification', {
        body: payload.notification.body,
        icon: '/icon-192x192.svg',
        badge: '/badge-72x72.svg',
        tag: 'softwarehub-notification',
        requireInteraction: true,
        data: payload.data
      });
    }
  });
}

// Store FCM token on server
export async function storeFCMToken(token: string, userId: number): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications/register-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, userId }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error storing FCM token:', error);
    return false;
  }
}