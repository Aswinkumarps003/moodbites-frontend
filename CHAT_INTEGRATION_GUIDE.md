# Chat Integration Guide

This guide explains how the chat system works between users and dieticians in the MoodBites application.

## 🔄 Chat Flow Overview

```
User clicks "Live Chat" → Navigate to /chat?dieticianId=xxx
                    ↓
            Connect to Socket.io
                    ↓
            Join user's personal room
                    ↓
            Send/receive messages in real-time
```

## 📱 User Side (Frontend)

### Chat Page (`/chat`)
- **Route**: `/chat?dieticianId=<dietician_id>`
- **File**: `frontend/src/pages/Chat.jsx`
- **Features**:
  - Real-time messaging with Socket.io
  - Message history from MongoDB
  - Typing indicators
  - Online/offline status
  - Auto-scroll to latest messages

### Key Components:
```jsx
// Socket connection
const socket = io('http://localhost:3005', {
  auth: { token: token }
});

// Join user's room
socket.emit('join-room', user._id);

// Send message
socket.emit('send-message', {
  senderId: user._id,
  receiverId: dieticianId,
  message: message,
  messageType: 'text'
});
```

## 👨‍⚕️ Dietician Side (Frontend)

### User Chat Panel
- **File**: `frontend/src/dietician/components/UserChatPanel.jsx`
- **Features**:
  - List of patients who have chatted
  - Real-time messaging
  - Message history
  - Patient selection

### Integration in Dashboard:
```jsx
// In DieticianDashboard.jsx
case 'chat':
  return <UserChatPanel />;
```

## 🔧 Backend Services

### Chat Service (`chat-service`)
- **Port**: 3005
- **Features**:
  - Socket.io server
  - MongoDB integration
  - Real-time messaging
  - Message persistence

### User Service (`user-service`)
- **Port**: 5000
- **Features**:
  - User authentication
  - Profile management
  - Active dieticians API

## 🛠️ API Endpoints

### Chat Service APIs
```http
GET  /health                           # Health check
GET  /api/conversations/:userId        # Get user's conversations
GET  /api/conversations/:id/messages   # Get conversation messages
```

### User Service APIs
```http
GET  /api/user/dieticians/active       # Get active dieticians
GET  /api/user/profile/:userId         # Get user profile
```

## 🔌 Socket.io Events

### Client → Server
```javascript
// Join personal room
socket.emit('join-room', userId);

// Send message
socket.emit('send-message', {
  senderId: 'user_id',
  receiverId: 'dietician_id',
  message: 'Hello!',
  messageType: 'text'
});

// Typing indicator
socket.emit('typing', {
  receiverId: 'dietician_id',
  senderId: 'user_id',
  isTyping: true
});
```

### Server → Client
```javascript
// Receive message
socket.on('receive-message', (data) => {
  // data: { message, senderId, receiverId, isRead, conversationId }
});

// Message sent confirmation
socket.on('message-sent', (data) => {
  // data: { message, senderId, receiverId, isRead, conversationId }
});

// Typing indicator
socket.on('user-typing', (data) => {
  // data: { senderId, isTyping }
});

// Message read status
socket.on('message-read', (data) => {
  // data: { messageId, conversationId }
});
```

## 🚀 Getting Started

### 1. Start All Services
```bash
# Terminal 1: Start Chat Service
cd chat-service
npm start

# Terminal 2: Start User Service
cd user-service
npm start

# Terminal 3: Start Frontend
cd frontend
npm run dev
```

### 2. Test the Integration
```bash
# Test services
node test-chat-integration.js
```

### 3. Manual Testing
1. **Create a dietician account** (role 2, active true)
2. **Create a user account** (role 1)
3. **Login as user** → Go to `/consult` → Click "Live Chat"
4. **Login as dietician** → Go to dietician dashboard → Click "Chat"
5. **Send messages** between user and dietician

## 📊 Database Schema

### Conversation Model
```javascript
{
  participants: [ObjectId], // [userId, dieticianId]
  messages: [MessageSchema],
  lastMessage: String,
  lastUpdated: Date
}
```

### Message Model
```javascript
{
  senderId: ObjectId,
  receiverId: ObjectId,
  message: String,
  messageType: String, // 'text', 'image', 'file'
  createdAt: Date,
  isRead: Boolean
}
```

## 🎨 UI Components

### User Chat Interface
- Clean, modern design
- Real-time message updates
- Typing indicators
- Online/offline status
- Auto-scroll to bottom

### Dietician Chat Interface
- Patient list sidebar
- Message history
- Real-time updates
- Patient selection

## 🔒 Security Features

- JWT authentication required
- User-specific room joining
- Message validation
- Rate limiting (can be added)

## 🐛 Troubleshooting

### Common Issues

1. **Socket connection failed**
   - Check if chat service is running on port 3005
   - Verify CORS settings

2. **Messages not sending**
   - Check JWT token validity
   - Verify user authentication

3. **Messages not receiving**
   - Check if both users are in correct rooms
   - Verify Socket.io event listeners

4. **Database errors**
   - Check MongoDB connection
   - Verify conversation creation

### Debug Steps
1. Check browser console for errors
2. Check chat service logs
3. Verify database connections
4. Test with simple messages first

## 📈 Future Enhancements

- [ ] File/image sharing
- [ ] Message encryption
- [ ] Push notifications
- [ ] Message search
- [ ] Chat history export
- [ ] Voice messages
- [ ] Video call integration
- [ ] Message reactions
- [ ] Read receipts
- [ ] Online presence indicators

## 🧪 Testing

### Unit Tests
- Socket.io connection
- Message sending/receiving
- Authentication
- Database operations

### Integration Tests
- End-to-end chat flow
- Multi-user scenarios
- Error handling
- Performance testing

## 📝 Notes

- Messages are stored in MongoDB for persistence
- Real-time updates use Socket.io
- Authentication is handled by JWT tokens
- The system supports multiple concurrent conversations
- Messages are automatically scrolled to the latest
