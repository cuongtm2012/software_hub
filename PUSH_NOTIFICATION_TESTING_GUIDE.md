# Push Notification Service Testing Guide

## 🚀 Quick Start

### 1. Install Dependencies (Already Done)
```bash
cd services/notification-service
npm install firebase-admin
```

### 2. Database Setup (Already Done)
The FCM tokens and notifications tables have been created in PostgreSQL.

### 3. Firebase Configuration

#### Option A: For Testing (Current Mode)
The service runs in **simulation mode** without Firebase - perfect for development and testing the API endpoints.

#### Option B: For Production Push Notifications
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Go to Project Settings > Service Accounts
4. Generate a new private key (downloads JSON file)
5. Configure environment variables in `.env`:

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your Firebase credentials
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
# ... other Firebase fields
```

## 🧪 Test Notification Endpoints

### Check Service Status
```bash
curl http://localhost:3003/api/notifications/status
```

### Test New Message Notification
```bash
curl -X POST http://localhost:3003/api/notifications/test-new-message \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "senderName": "John Doe",
    "messagePreview": "Hey, how are you doing?"
  }'
```

### Test Order Confirmation
```bash
curl -X POST http://localhost:3003/api/notifications/test-order-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "orderId": "ORD-12345",
    "amount": "$99.99"
  }'
```

### Test System Maintenance Alert
```bash
curl -X POST http://localhost:3003/api/notifications/test-maintenance-alert \
  -H "Content-Type: application/json" \
  -d '{
    "maintenanceTime": "2025-01-25 02:00 AM",
    "details": "Database optimization and security updates"
  }'
```

### Test Security Alert
```bash
curl -X POST http://localhost:3003/api/notifications/test-unusual-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "location": "New York, USA",
    "device": "iPhone 15 Pro"
  }'
```

### Test Bulk Notifications
```bash
curl -X POST http://localhost:3003/api/notifications/test-bulk \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🎉 Welcome to Software Hub!",
    "body": "Thank you for joining our platform. Explore amazing features!",
    "userIds": [1, 2, 3],
    "clickAction": "/dashboard"
  }'
```

## 📱 Client-Side Integration

### Register FCM Token (Web/Mobile)
```bash
curl -X POST http://localhost:3003/api/notifications/register-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "token": "your-fcm-token-from-client",
    "deviceType": "web"
  }'
```

### Send Custom Notification
```bash
curl -X POST http://localhost:3003/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "Custom Notification",
    "body": "This is a custom notification message",
    "data": {
      "type": "custom",
      "clickAction": "/custom-page"
    }
  }'
```

## 🔧 Features Implemented

✅ **Firebase Admin SDK Integration** - Real push notifications  
✅ **Simulation Mode** - Testing without Firebase setup  
✅ **Token Management** - FCM token registration and cleanup  
✅ **Bulk Notifications** - Send to multiple users efficiently  
✅ **Topic Subscriptions** - Broadcast notifications  
✅ **Retry Logic** - Automatic retry on failures  
✅ **Database Storage** - Notification history and user tokens  
✅ **Multiple Test Scenarios** - 10+ notification types  
✅ **Error Handling** - Graceful failure handling  
✅ **Status Monitoring** - Service health checks  

## 🎯 Integration with Your Apps

### Chat Service Integration
```javascript
// When a new message is received
await fetch('http://localhost:3003/api/notifications/test-new-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: recipientId,
    senderName: senderName,
    messagePreview: message.substr(0, 100)
  })
});
```

### Main App Integration
```javascript
// Register user's FCM token
await fetch('http://localhost:3003/api/notifications/register-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: currentUser.id,
    token: fcmToken,
    deviceType: 'web'
  })
});
```

## 🚨 Current Status
- ✅ Service is running in **simulation mode** 
- ✅ All API endpoints are functional
- ✅ Database tables created
- ✅ Ready for Firebase configuration
- ⚠️ Configure Firebase for real push notifications

The notification service is now fully functional and ready to send real push notifications once you configure Firebase!