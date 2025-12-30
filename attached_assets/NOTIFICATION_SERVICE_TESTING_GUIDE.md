# Notification Service Testing Guide

## Overview
The notification service provides Firebase Cloud Messaging (FCM) push notifications, with comprehensive testing endpoints for all notification types supported by SoftwareHub.

## Service Status Check
```bash
curl http://localhost:3003/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "notification-service",
  "timestamp": "2025-08-22T02:50:XX.XXXZ",
  "dependencies": {
    "redis": "not_available",
    "postgresql": "connected",
    "firebase": "configured"
  }
}
```

## 1. Basic Notification Testing

### Send Custom Notification
```bash
curl -X POST http://localhost:3003/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "title": "Test Notification",
    "body": "This is a test notification",
    "data": {"type": "test"}
  }'
```

### Send Bulk Notifications
```bash
curl -X POST http://localhost:3003/api/notifications/send-bulk \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": [1, 2, 3],
    "title": "Bulk Notification",
    "body": "This notification goes to multiple users"
  }'
```

## 2. Notification Type Testing

The service provides dedicated test endpoints for all notification scenarios:

### User Activity Notifications
```bash
# New message notification
curl -X POST http://localhost:3003/api/notifications/test-new-message \
  -H "Content-Type: application/json" \
  -d '{"userId": 2}'

# Comment notification
curl -X POST http://localhost:3003/api/notifications/test-comment \
  -H "Content-Type: application/json" \
  -d '{"userId": 2}'
```

### System Notifications
```bash
# Maintenance alert
curl -X POST http://localhost:3003/api/notifications/test-maintenance-alert \
  -H "Content-Type: application/json" \
  -d '{"userId": 2}'

# System update notification
curl -X POST http://localhost:3003/api/notifications/test-system-update \
  -H "Content-Type: application/json" \
  -d '{"userId": 2}'
```

### E-commerce Notifications
```bash
# Order confirmation
curl -X POST http://localhost:3003/api/notifications/test-order-confirmation \
  -H "Content-Type: application/json" \
  -d '{"userId": 2}'

# Payment failure
curl -X POST http://localhost:3003/api/notifications/test-payment-failure \
  -H "Content-Type: application/json" \
  -d '{"userId": 2}'
```

### Event Notifications
```bash
# Event reminder
curl -X POST http://localhost:3003/api/notifications/test-event-reminder \
  -H "Content-Type: application/json" \
  -d '{"userId": 2}'

# Subscription renewal
curl -X POST http://localhost:3003/api/notifications/test-subscription-renewal \
  -H "Content-Type: application/json" \
  -d '{"userId": 2}'
```

### Marketing Notifications
```bash
# Promotional offer
curl -X POST http://localhost:3003/api/notifications/test-promotional-offer \
  -H "Content-Type: application/json" \
  -d '{"userId": 2}'
```

### Security Notifications
```bash
# Unusual login alert
curl -X POST http://localhost:3003/api/notifications/test-unusual-login \
  -H "Content-Type: application/json" \
  -d '{"userId": 2}'

# Password change confirmation
curl -X POST http://localhost:3003/api/notifications/test-password-change \
  -H "Content-Type: application/json" \
  -d '{"userId": 2}'
```

### Bulk Testing
```bash
# Test multiple notification types
curl -X POST http://localhost:3003/api/notifications/test-bulk \
  -H "Content-Type: application/json" \
  -d '{"userIds": [1, 2, 3]}'
```

## 3. Notification Management

### Get User Notifications
```bash
curl http://localhost:3003/api/notifications/user/2
```

### Mark Notification as Read
```bash
curl -X PUT http://localhost:3003/api/notifications/123/read
```

### Delete Notification
```bash
curl -X DELETE http://localhost:3003/api/notifications/123
```

## 4. FCM Token Management

### Subscribe to Notifications
```bash
curl -X POST http://localhost:3003/api/notifications/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "fcmToken": "FCM_TOKEN_HERE",
    "deviceType": "web"
  }'
```

### Unsubscribe from Notifications
```bash
curl -X DELETE http://localhost:3003/api/notifications/unsubscribe/FCM_TOKEN_HERE
```

## 5. Integration with Main Application

### Admin Dashboard Integration
The notification service integrates with the main SoftwareHub admin dashboard:

```javascript
// In admin dashboard
const sendNotification = async (userId, title, body) => {
  const response = await fetch('http://localhost:3003/api/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, title, body })
  });
  return response.json();
};
```

### Real-time Integration
```javascript
// For real-time notifications in the main app
import { io } from 'socket.io-client';

const notificationSocket = io('http://localhost:3003');

notificationSocket.on('notification-sent', (data) => {
  // Handle real-time notification updates
  console.log('Notification sent:', data);
});
```

## 6. Firebase Configuration

### Environment Variables Required
```bash
# In services/notification-service/.env
FIREBASE_PROJECT_ID=softwarehub-f301a
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
```

### Testing Firebase Integration
The service uses Firebase Admin SDK for sending push notifications. In production:

1. Real FCM tokens are required for actual device notifications
2. Messages are sent to real Firebase project
3. Delivery receipts and analytics are available

## 7. Production Deployment Features

### With PostgreSQL (Full Functionality)
- Persistent notification storage
- Notification history and analytics
- User preference management
- Delivery status tracking

### With Redis (Enhanced Performance)
- Notification queue management
- Rate limiting and throttling
- Caching frequently accessed data
- Session management

### Docker Compose Integration
```yaml
notification-service:
  image: softwarehub/notification-service
  ports:
    - "3003:3003"
  depends_on:
    - redis
    - postgresql
  environment:
    - REDIS_URL=redis://redis:6379
    - DATABASE_URL=postgresql://postgres:password@postgres:5432/softwarehub
    - FIREBASE_PROJECT_ID=softwarehub-f301a
```

## 8. Performance Testing

### Load Testing with Artillery
```yaml
# artillery-notification-test.yml
config:
  target: 'http://localhost:3003'
  phases:
    - duration: 60
      arrivalRate: 5

scenarios:
  - name: "Notification load test"
    flow:
      - post:
          url: "/api/notifications/send"
          json:
            userId: "{{ $randomInt(1, 100) }}"
            title: "Load Test Notification"
            body: "Testing notification service performance"
```

## 9. Troubleshooting

### Common Issues

1. **Service Not Responding**
   ```bash
   # Check if service is running
   curl http://localhost:3003/health
   
   # Check logs
   tail -f /tmp/notification-service.log
   ```

2. **Firebase Errors**
   - Verify Firebase credentials in environment variables
   - Check Firebase project configuration
   - Ensure FCM is enabled in Firebase console

3. **Database Connection Issues**
   - Service runs without PostgreSQL but with limited functionality
   - Notification storage and history require database connection
   - Check DATABASE_URL environment variable

4. **Redis Connection Issues**
   - Service runs without Redis but with limited queue management
   - No persistent notification queuing
   - Rate limiting not available

## 10. Expected Test Results

### Successful Response Example
```json
{
  "success": true,
  "messageId": "fcm-message-id-12345",
  "notification": {
    "title": "Test Notification",
    "body": "This is a test notification",
    "userId": 2,
    "timestamp": "2025-08-22T02:50:00.000Z"
  }
}
```

### Error Response Example
```json
{
  "success": false,
  "error": "Invalid FCM token",
  "details": "The provided FCM token is not valid"
}
```

## Summary

The notification service provides:

✅ **Firebase FCM Integration**: Production-ready push notifications
✅ **12+ Notification Types**: Comprehensive coverage of all use cases
✅ **Bulk Notifications**: Efficient multi-user messaging
✅ **Testing Endpoints**: Complete API testing suite
✅ **Token Management**: FCM subscription/unsubscription
✅ **Graceful Degradation**: Works without Redis/PostgreSQL
✅ **Production Ready**: Full Docker Compose integration

The service demonstrates robust microservices architecture with comprehensive testing capabilities and production-ready features.