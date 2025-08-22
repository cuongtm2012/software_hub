# Chat Service Testing Guide

## Overview
The chat service provides real-time messaging functionality using Socket.IO and REST APIs for chat history management.

## Service Status
```bash
# Check if chat service is running
curl http://localhost:3002/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "chat-service",
  "timestamp": "2025-08-22T02:42:39.281Z",
  "dependencies": {
    "redis": "not_available",
    "mongodb": "not_available", 
    "socketio": "initialized"
  }
}
```

## 1. REST API Testing

### Create Chat Room
```bash
curl -X POST http://localhost:3002/api/chat/room \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Room",
    "participants": [1, 2],
    "type": "private"
  }'
```

### Get User Rooms
```bash
curl http://localhost:3002/api/chat/rooms/1
```

### Get Room Messages
```bash
curl http://localhost:3002/api/chat/messages/room123
```

**Note**: REST APIs require MongoDB connection for full functionality. Without MongoDB, APIs return graceful error messages.

## 2. Socket.IO Real-time Testing

### Browser Testing (Client-Side JavaScript)
```html
<!DOCTYPE html>
<html>
<head>
    <title>Chat Service Test</title>
    <script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
</head>
<body>
    <div id="messages"></div>
    <input id="messageInput" placeholder="Type a message..." />
    <button onclick="sendMessage()">Send</button>

    <script>
        const socket = io('http://localhost:3002');
        
        socket.on('connect', () => {
            console.log('Connected:', socket.id);
            document.getElementById('messages').innerHTML += '<p>Connected to chat service</p>';
            
            // Join a test room
            socket.emit('join-room', { roomId: 'test-room', userId: 1 });
        });
        
        socket.on('message-received', (data) => {
            console.log('Message received:', data);
            document.getElementById('messages').innerHTML += 
                `<p><strong>${data.userId}:</strong> ${data.message}</p>`;
        });
        
        socket.on('user-joined', (data) => {
            console.log('User joined:', data);
            document.getElementById('messages').innerHTML += 
                `<p><em>User ${data.userId} joined the room</em></p>`;
        });
        
        function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            
            if (message) {
                socket.emit('send-message', {
                    roomId: 'test-room',
                    userId: 1,
                    message: message,
                    timestamp: new Date().toISOString()
                });
                input.value = '';
            }
        }
        
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    </script>
</body>
</html>
```

### Node.js Socket.IO Testing
```javascript
// test-socket-client.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3002');

socket.on('connect', () => {
    console.log('✅ Connected to chat service:', socket.id);
    
    // Join a room
    socket.emit('join-room', { roomId: 'test-room', userId: 1 });
    
    // Send a test message
    setTimeout(() => {
        socket.emit('send-message', {
            roomId: 'test-room',
            userId: 1,
            message: 'Hello from Node.js client!',
            timestamp: new Date().toISOString()
        });
    }, 1000);
});

socket.on('message-received', (data) => {
    console.log('📨 Message received:', data);
});

socket.on('user-joined', (data) => {
    console.log('👤 User joined:', data);
});

socket.on('connect_error', (error) => {
    console.log('❌ Connection error:', error.message);
});
```

## 3. Multi-Client Testing

### Terminal 1 - Client 1
```bash
node -e "
const io = require('socket.io-client');
const socket = io('http://localhost:3002');
socket.on('connect', () => {
    console.log('Client 1 connected');
    socket.emit('join-room', { roomId: 'test-room', userId: 1 });
    setInterval(() => {
        socket.emit('send-message', {
            roomId: 'test-room', 
            userId: 1, 
            message: 'Hello from Client 1 at ' + new Date().toLocaleTimeString()
        });
    }, 5000);
});
socket.on('message-received', (data) => console.log('Client 1 received:', data.message));
"
```

### Terminal 2 - Client 2
```bash
node -e "
const io = require('socket.io-client');
const socket = io('http://localhost:3002');
socket.on('connect', () => {
    console.log('Client 2 connected');
    socket.emit('join-room', { roomId: 'test-room', userId: 2 });
    setInterval(() => {
        socket.emit('send-message', {
            roomId: 'test-room',
            userId: 2,
            message: 'Reply from Client 2 at ' + new Date().toLocaleTimeString()
        });
    }, 7000);
});
socket.on('message-received', (data) => console.log('Client 2 received:', data.message));
"
```

## 4. Socket.IO Events Supported

### Client to Server Events
- `join-room`: Join a chat room
- `leave-room`: Leave a chat room  
- `send-message`: Send a message to a room
- `typing-start`: Indicate user is typing
- `typing-stop`: Indicate user stopped typing

### Server to Client Events
- `message-received`: New message in room
- `user-joined`: User joined the room
- `user-left`: User left the room
- `typing-indicator`: Someone is typing
- `room-updated`: Room information changed

## 5. Integration with Main Application

The chat service integrates with the main SoftwareHub application through:

### Admin Chat Management
- Admins can monitor all chat rooms
- Real-time message moderation
- User activity tracking

### User Support Chat
- Direct messaging with support team
- Ticket-based chat rooms
- File sharing in chat

### Project Collaboration
- Developer-client communication
- Project milestone discussions
- Code review conversations

## 6. Production Deployment Features

### With MongoDB (Full Functionality)
- Persistent chat history
- Room management
- User presence tracking
- Message search and pagination

### With Redis (Enhanced Performance)
- Session management
- Message caching
- User presence caching
- Rate limiting

### Docker Compose Integration
```yaml
chat-service:
  image: softwarehub/chat-service
  ports:
    - "3002:3002"
  depends_on:
    - redis
    - mongodb
  environment:
    - REDIS_URL=redis://redis:6379
    - MONGODB_URL=mongodb://mongodb:27017/chat
```

## 7. Performance Testing

### Load Testing with Artillery
```yaml
# artillery-chat-test.yml
config:
  target: 'http://localhost:3002'
  phases:
    - duration: 60
      arrivalRate: 10
  socketio:
    transports: ['websocket']

scenarios:
  - name: "Chat load test"
    engine: socketio
    flow:
      - emit:
          channel: "join-room"
          data:
            roomId: "load-test-room"
            userId: "{{ $randomInt(1, 1000) }}"
      - think: 2
      - loop:
          - emit:
              channel: "send-message"
              data:
                roomId: "load-test-room"
                message: "Load test message {{ $randomInt(1, 10000) }}"
          - think: 5
        count: 10
```

```bash
# Run load test
npm install -g artillery
artillery run artillery-chat-test.yml
```

## 8. Troubleshooting

### Common Issues

1. **Socket.IO Connection Failed**
   ```bash
   # Check if service is running
   curl http://localhost:3002/health
   
   # Check logs
   tail -f /tmp/chat-service.log
   ```

2. **CORS Issues**
   - Ensure CLIENT_URL environment variable is set correctly
   - Check browser console for CORS errors

3. **MongoDB Connection Issues**
   - Service runs without MongoDB but with limited functionality
   - REST APIs return appropriate error messages
   - Socket.IO messaging still works

4. **Redis Connection Issues**
   - Service runs without Redis but with limited session management
   - No persistent user presence tracking

## Summary

The chat service is designed to be resilient and functional even without all dependencies:

✅ **Core Functionality**: Socket.IO real-time messaging works independently
✅ **Graceful Degradation**: Missing dependencies don't crash the service
✅ **Health Monitoring**: Comprehensive status reporting
✅ **Production Ready**: Full Docker Compose integration available

Start with Socket.IO testing for immediate functionality, then add MongoDB and Redis for enhanced features.