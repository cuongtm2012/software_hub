// Firebase Service Worker for Push Notifications
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIdFOcJlv4W7rjQx0275-zuy8iu4wUlpI",
  authDomain: "softwarehub-f301a.firebaseapp.com",
  projectId: "softwarehub-f301a",
  storageBucket: "softwarehub-f301a.firebasestorage.app",
  messagingSenderId: "634452204320",
  appId: "1:634452204320:web:e93f0ed57398db22a2d545",
  measurementId: "G-ZDBVWVQ4Y1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.svg',
    badge: '/badge-72x72.svg',
    tag: 'softwarehub-notification',
    requireInteraction: true,
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  event.notification.close();
  
  // Handle click action
  const clickAction = event.notification.data?.click_action || '/';
  
  event.waitUntil(
    clients.openWindow(clickAction)
  );
});