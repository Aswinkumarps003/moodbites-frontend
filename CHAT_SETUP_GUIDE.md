# 🚀 Complete Chat Service Setup Guide

This guide will help you set up and test the complete chat functionality between users and dieticians in your MoodBites project.

## 📋 Prerequisites

Make sure you have the following services running:

1. **MongoDB** - Database for storing conversations and messages
2. **User Service** - Running on port 5000
3. **Chat Service** - Running on port 3005
4. **Frontend** - Running on port 3000

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install chat service dependencies
cd ../chat-service
npm install
```

### 2. Environment Variables

Create a `.env` file in the `chat-service` directory:

```env
MONGODB_URI=mongodb://localhost:27017/moodbites_chat
PORT=3005
FRONTEND_URL=http://localhost:3000
```

### 3. Start Services

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start User Service
cd user-service
npm start

# Terminal 3: Start Chat Service
cd chat-service
npm start

# Terminal 4: Start Frontend
cd frontend
npm run dev
```

## 🧪 Testing the Chat Service

### Option 1: Automated Test

Run the comprehensive test script:

```bash
cd frontend
npm run test:chat
```

This will:
- Register test users (user and dietician)
- Test Socket.io connections
- Send test messages
- Verify MongoDB persistence
- Test typing indicators

### Option 2: Manual Testing

1. **Open the frontend** in your browser: `http://localhost:3000`

2. **Login as a user** (role 1)

3. **Navigate to Dashboard** and click "Consult Dietician"

4. **Select a dietician** and click "Live Chat"

5. **Test the chat functionality**:
   - Send messages
   - Test emoji picker
   - Test attachment menu
   - Test typing indicators

## 🎨 Chat Features

### ✨ Enhanced UI Features

- **Modern Design**: Gradient backgrounds, glassmorphism effects
- **Real-time Messaging**: Instant message delivery
- **Typing Indicators**: See when someone is typing
- **Message Status**: Read receipts (✓ and ✓✓)
- **Emoji Picker**: Quick emoji insertion
- **Attachment Menu**: Support for photos, documents, voice
- **Responsive Design**: Works on mobile and desktop
- **Smooth Animations**: Framer Motion animations

### 🔧 Technical Features

- **MongoDB Integration**: Persistent message storage
- **Socket.io**: Real-time communication
- **JWT Authentication**: Secure user sessions
- **Message Types**: Text, image, file support
- **Conversation Management**: Automatic conversation creation
- **Read Status Tracking**: Message read/unread status

## 📊 Database Schema

The chat service uses the following MongoDB schema:

```javascript
// Message Schema
{
  senderId: ObjectId,      // User who sent the message
  receiverId: ObjectId,    // User who receives the message
  message: String,         // Message content
  messageType: String,     // "text", "image", "file"
  createdAt: Date,         // Timestamp
  isRead: Boolean          // Read status
}

// Conversation Schema
{
  participants: [ObjectId], // Array of user IDs
  messages: [Message],      // Embedded messages
  lastMessage: String,      // Last message content
  lastUpdated: Date         // Last activity timestamp
}
```

## 🔌 API Endpoints

### Chat Service (Port 3005)

- `GET /health` - Health check
- `GET /api/conversations/:userId` - Get user's conversations
- `GET /api/conversations/:conversationId/messages` - Get conversation messages

### Socket.io Events

- `join-room` - Join user's personal room
- `send-message` - Send a message
- `receive-message` - Receive a message
- `message-sent` - Message sent confirmation
- `typing` - Typing indicator
- `user-typing` - Receive typing indicator
- `mark-as-read` - Mark message as read
- `message-read` - Message read confirmation

## 🐛 Troubleshooting

### Common Issues

1. **Socket.io connection failed**
   - Check if chat service is running on port 3005
   - Verify CORS settings in chat service

2. **Messages not saving to MongoDB**
   - Check MongoDB connection
   - Verify MONGODB_URI in environment variables

3. **Authentication errors**
   - Check if user service is running
   - Verify JWT token in localStorage

4. **Frontend not loading**
   - Run `npm install` in frontend directory
   - Check if all dependencies are installed

### Debug Steps

1. **Check service status**:
   ```bash
   # Check if services are running
   curl http://localhost:5000/health  # User service
   curl http://localhost:3005/health  # Chat service
   ```

2. **Check MongoDB connection**:
   ```bash
   mongo
   use moodbites_chat
   db.conversations.find().pretty()
   ```

3. **Check browser console** for JavaScript errors

## 📱 Mobile Support

The chat interface is fully responsive and works on:
- 📱 Mobile phones (iOS/Android)
- 📱 Tablets
- 💻 Desktop computers
- 🖥️ Large screens

## 🚀 Next Steps

1. **Add file upload functionality** for attachments
2. **Implement voice messages** using WebRTC
3. **Add video calling** integration
4. **Implement push notifications** for offline users
5. **Add message search** functionality
6. **Implement message encryption** for privacy

## 📞 Support

If you encounter any issues:

1. Check the console logs for error messages
2. Verify all services are running
3. Check the network tab in browser dev tools
4. Review the MongoDB logs

## 🎉 Success!

Once everything is working, you should see:
- ✅ Real-time messaging between users and dieticians
- ✅ Messages persisting in MongoDB
- ✅ Beautiful, responsive chat interface
- ✅ Typing indicators and read receipts
- ✅ Emoji picker and attachment menu

Your chat service is now ready for production use! 🚀
