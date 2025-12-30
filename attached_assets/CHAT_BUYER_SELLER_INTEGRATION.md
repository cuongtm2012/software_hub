# 💬 CHAT BUYER-SELLER INTEGRATION GUIDE

## 📋 Tổng quan

Hệ thống chat đã được mở rộng để hỗ trợ **chat trực tiếp giữa Buyer và Seller**, bên cạnh chức năng **chatbot customer support** hiện có.

## ✅ Các tính năng đã triển khai

### 1. **useChat Hook** (`client/src/hooks/use-chat.ts`)
Hook React kết nối với chat service qua Socket.IO:
- ✅ Real-time messaging với WebSocket
- ✅ Room management (danh sách cuộc trò chuyện)
- ✅ Typing indicators (hiển thị khi đang gõ)
- ✅ Read receipts (đánh dấu đã đọc)
- ✅ Message history loading
- ✅ Automatic reconnection
- ✅ Authentication với user credentials

### 2. **FloatingChatButton Component** (Nâng cấp)
Widget chat floating với 2 chế độ:

#### **Mode 1: Customer Support (Chatbot)**
- Câu hỏi thường gặp (FAQs)
- Quick actions (Thanh toán, Đơn hàng, License key)
- Hỗ trợ tức thì từ team support

#### **Mode 2: Buyer-Seller Conversations**
- Danh sách cuộc trò chuyện (Room list)
- Chat realtime với seller
- Typing indicators
- Unread message badges
- Message timestamps
- Product/Order context trong metadata

### 3. **Chat Service Backend** (Đã có sẵn)
Service hoàn chỉnh tại `services/chat-service/`:
- ✅ Socket.IO server
- ✅ MongoDB integration (lưu messages)
- ✅ Redis integration (caching - optional)
- ✅ Room management API
- ✅ Message persistence
- ✅ File sharing support
- ✅ WebRTC signaling (voice/video calls)
- ✅ Admin controls

## 🚀 Cách sử dụng

### **1. Khởi động Chat Service**

```bash
cd services/chat-service
npm install
npm start
# Chat service chạy tại: http://localhost:3002
```

### **2. Cấu hình Environment Variables**

Thêm vào `.env` của client:
```env
VITE_CHAT_SERVICE_URL=http://localhost:3002
```

### **3. Sử dụng Chat Widget**

**Cho Buyer:**
1. Click vào floating chat button (góc phải dưới)
2. Chọn tab "Cuộc trò chuyện"
3. Click vào seller/conversation để bắt đầu chat
4. Gửi tin nhắn realtime

**Cho Seller:**
1. Tương tự buyer
2. Nhận tin nhắn từ buyers
3. Phản hồi trực tiếp trong chat widget

### **4. Tạo Chat Room mới (từ Product Page)**

Bạn có thể thêm nút "Chat với Seller" trên product detail page:

```tsx
import { useChat } from '@/hooks/use-chat';

const { createRoom } = useChat();

const handleChatWithSeller = async () => {
  const room = await createRoom(
    [user.id, product.sellerId], // participants
    {
      name: `Chat về ${product.name}`,
      productId: product.id,
      sellerName: product.seller?.name,
      buyerName: user.name
    }
  );
  
  if (room) {
    // Mở chat widget và join room
    // Logic sẽ được implement
  }
};

<Button onClick={handleChatWithSeller}>
  <MessageCircle className="w-4 h-4 mr-2" />
  Chat với Seller
</Button>
```

## 📊 Luồng hoạt động (Flow)

```
┌─────────────────────────────────────────────────────┐
│  1. User mở FloatingChatButton                      │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  2. useChat hook kết nối Socket.IO                  │
│     - Authenticate với user credentials             │
│     - Load danh sách rooms                          │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  3. Chọn mode:                                      │
│     ├─ Support: Chatbot FAQs                        │
│     └─ Conversations: Buyer-Seller Chat             │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼ (Chọn Conversations)
┌─────────────────────────────────────────────────────┐
│  4. Hiển thị danh sách rooms                        │
│     - Unread count badges                           │
│     - Last message preview                          │
│     - Product/Order context                         │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼ (Click vào room)
┌─────────────────────────────────────────────────────┐
│  5. Join room & Load messages                       │
│     - socket.emit('join-room')                      │
│     - Fetch message history                         │
│     - Mark as read                                  │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  6. Real-time messaging                             │
│     ├─ Send message → socket.emit('send-message')   │
│     ├─ Receive → socket.on('new-message')           │
│     ├─ Typing → socket.emit('typing-start/stop')    │
│     └─ Read receipts → socket.emit('mark-as-read')  │
└─────────────────────────────────────────────────────┘
```

## 🔧 API Endpoints

### **REST APIs** (Chat Service)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/rooms/:userId` | Lấy danh sách rooms của user |
| POST | `/api/chat/room` | Tạo room mới |
| GET | `/api/chat/messages/:roomId` | Lấy messages của room |
| PUT | `/api/chat/messages/:roomId/read` | Đánh dấu đã đọc |
| GET | `/api/chat/search` | Tìm kiếm messages |
| POST | `/api/chat/upload` | Upload file |

### **Socket Events**

**Client → Server:**
- `authenticate` - Xác thực user
- `join-room` - Join vào room
- `leave-room` - Rời khỏi room
- `send-message` - Gửi tin nhắn
- `typing-start` - Bắt đầu gõ
- `typing-stop` - Dừng gõ
- `mark-as-read` - Đánh dấu đã đọc
- `create-room` - Tạo room mới

**Server → Client:**
- `authenticated` - Xác thực thành công
- `new-message` - Tin nhắn mới
- `room-created` - Room được tạo
- `room-joined` - Join room thành công
- `typing-start` - User đang gõ
- `typing-stop` - User dừng gõ
- `message-read` - Tin nhắn đã đọc
- `error` - Lỗi

## 💾 Database Schema (MongoDB)

### **Rooms Collection**
```javascript
{
  _id: ObjectId,
  participants: [userId1, userId2],
  type: 'direct' | 'group' | 'channel',
  name: String,
  description: String,
  createdBy: userId,
  createdAt: Date,
  metadata: {
    productId: String,
    orderId: String,
    sellerName: String,
    buyerName: String
  },
  settings: {
    allowFileSharing: Boolean,
    allowVoiceCalls: Boolean,
    allowVideoCall: Boolean,
    isEncrypted: Boolean
  }
}
```

### **Messages Collection**
```javascript
{
  _id: ObjectId,
  roomId: ObjectId,
  senderId: String,
  senderName: String,
  message: String,
  type: 'text' | 'file' | 'system',
  timestamp: Date,
  readBy: [userId1, userId2],
  reactions: [
    { userId: String, emoji: String }
  ],
  attachments: [
    {
      fileName: String,
      fileSize: Number,
      fileType: String,
      fileUrl: String
    }
  ]
}
```

## 🎨 UI Components

### **FloatingChatButton States**

1. **Closed**: Floating button with unread badge
2. **Support Mode**: FAQs và quick actions
3. **Conversations Mode - List**: Danh sách rooms
4. **Conversations Mode - Chat**: Chat interface với messages

### **Responsive Design**

- **Desktop**: Widget 380px width, góc phải dưới
- **Mobile**: Full-width (trừ 20px margins)
- **Tự động ẩn**: Khi shopping cart sidebar mở

## 🔐 Bảo mật

- ✅ Authentication required để chat
- ✅ Chỉ participants mới thấy messages
- ✅ Room access verification
- ✅ Socket connection với credentials
- ✅ CORS protection

## 🧪 Testing

### **1. Test Local**

```bash
# Terminal 1: Start Chat Service
cd services/chat-service
npm start

# Terminal 2: Start Main App
npm run dev

# Mở 2 browsers khác nhau:
# - Browser 1: Login as Buyer
# - Browser 2: Login as Seller
# - Test chat realtime
```

### **2. Test Scenarios**

- ✅ Send/Receive messages realtime
- ✅ Typing indicators
- ✅ Unread count updates
- ✅ Room creation
- ✅ Multiple rooms navigation
- ✅ Reconnection after disconnect
- ✅ Mark as read functionality
- ✅ Message persistence

## 📝 TODO / Future Enhancements

1. **Thêm nút "Chat với Seller" trên Product Page**
2. **File upload support** (images, documents)
3. **Voice/Video calls** (WebRTC integration)
4. **Message search** trong conversations
5. **Push notifications** cho tin nhắn mới
6. **Online status** realtime
7. **Message reactions** (emoji)
8. **Message editing/deletion**
9. **Admin chat monitoring** panel
10. **Chat analytics** dashboard

## 🐛 Troubleshooting

### **Chat service không connect**
```bash
# Check if chat service is running
curl http://localhost:3002/health

# Check logs
cd services/chat-service
npm start
# Xem console logs
```

### **Messages không realtime**
- Kiểm tra Socket.IO connection
- Mở DevTools → Network → WS
- Verify WebSocket connection established

### **Rooms không load**
```bash
# Check MongoDB connection
# Verify API endpoint:
curl http://localhost:3002/api/chat/rooms/USER_ID
```

## 📞 Support

Nếu có vấn đề hoặc câu hỏi:
1. Check logs của chat service
2. Verify database connections (MongoDB)
3. Test Socket.IO connection
4. Review browser console for errors

---

**Status**: ✅ **Hoàn thành và sẵn sàng sử dụng**

**Version**: 1.0.0  
**Last Updated**: December 23, 2025
