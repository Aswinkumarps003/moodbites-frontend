# 🏥 Enhanced Dietician Chat Panel Setup Guide

This guide covers the advanced dietician chat panel with diet plan generation, real-time messaging, and MongoDB integration.

## 🚀 Features Overview

### ✨ **Advanced Chat Interface**
- **Real-time Messaging**: Socket.io integration for instant communication
- **Patient Management**: List of all patients with online status
- **Message Persistence**: All conversations stored in MongoDB
- **Typing Indicators**: Real-time typing status
- **Read Receipts**: Message read/unread status
- **Emoji Picker**: Quick emoji insertion
- **Attachment Support**: Photo, document, and voice message support

### 🍽️ **Diet Plan Integration**
- **Side Panel**: Toggleable diet plan management panel
- **Plan Generation**: Generate personalized diet plans using diet service
- **Plan History**: View all previous diet plans for each patient
- **Plan Details**: Detailed meal information with nutrition data
- **Active Plans**: Mark and manage active diet plans

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works on all screen sizes
- **Glassmorphism Effects**: Modern backdrop blur and transparency
- **Smooth Animations**: Framer Motion animations throughout
- **Gradient Backgrounds**: Beautiful color schemes
- **Professional Layout**: Clean, medical-grade interface

## 🛠️ Setup Instructions

### 1. Prerequisites

Ensure these services are running:
- **MongoDB** - Database for conversations and diet plans
- **User Service** - Port 5000 (for patient data)
- **Chat Service** - Port 3005 (for real-time messaging)
- **Diet Service** - Port 3001 (for diet plan generation)
- **Frontend** - Port 3000

### 2. Environment Variables

**Chat Service** (`.env` in `chat-service/`):
```env
MONGODB_URI=mongodb://localhost:27017/moodbites_chat
PORT=3005
FRONTEND_URL=http://localhost:3000
```

**Diet Service** (`.env` in `diet-service/`):
```env
MONGODB_URI=mongodb://localhost:27017/moodbites_diet
PORT=3001
SPOONACULAR_API_KEY=your_spoonacular_api_key
```

### 3. Start Services

```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: User Service
cd user-service
npm start

# Terminal 3: Chat Service
cd chat-service
npm start

# Terminal 4: Diet Service
cd diet-service
npm start

# Terminal 5: Frontend
cd frontend
npm run dev
```

## 🧪 Testing the Enhanced Chat

### 1. **Login as Dietician**
- Navigate to `http://localhost:3000`
- Login with dietician credentials (role 2)
- Go to Dashboard → Chat

### 2. **Test Patient Selection**
- Select a patient from the left panel
- Verify patient information loads
- Check online status indicator

### 3. **Test Messaging**
- Send messages to patients
- Verify messages appear in real-time
- Check read receipts and typing indicators

### 4. **Test Diet Plan Generation**
- Click the utensils icon to open side panel
- Click "Generate New Plan" for selected patient
- Verify plan generation and display

## 📊 Database Schema

### **Conversations Collection**
```javascript
{
  participants: [ObjectId], // Patient and dietician IDs
  messages: [{
    senderId: ObjectId,
    receiverId: ObjectId,
    message: String,
    messageType: String, // "text", "image", "file"
    createdAt: Date,
    isRead: Boolean
  }],
  lastMessage: String,
  lastUpdated: Date
}
```

### **Diet Plans Collection**
```javascript
{
  userId: ObjectId, // Patient ID
  dietId: ObjectId, // Reference to diet preferences
  planName: String,
  totalCalories: String,
  meals: [{
    mealType: String, // "Breakfast", "Lunch", etc.
    recipe: String,
    calories: Number,
    ingredients: [String],
    nutrition: {
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number,
      sugar: Number
    }
  }],
  isActive: Boolean,
  generatedAt: Date
}
```

## 🔌 API Endpoints

### **Chat Service** (Port 3005)
- `GET /health` - Health check
- `GET /api/conversations/:userId` - Get user conversations
- `GET /api/conversations/:conversationId/messages` - Get conversation messages

### **Diet Service** (Port 3001)
- `POST /api/diet-planner/generate/:userId` - Generate diet plan
- `GET /api/diet-plans/:userId` - Get user's diet plans
- `GET /api/diet-plans/detail/:planId` - Get specific diet plan
- `PATCH /api/diet-plans/:planId/deactivate` - Deactivate diet plan

### **User Service** (Port 5000)
- `GET /api/user/users/role/1` - Get all patients
- `GET /api/user/dieticians/active` - Get active dieticians

## 🎯 Key Features Explained

### **1. Real-time Messaging**
- Uses Socket.io for instant communication
- Messages are stored in MongoDB for persistence
- Supports typing indicators and read receipts
- Handles connection/disconnection gracefully

### **2. Diet Plan Management**
- Integrated with Spoonacular API for recipe generation
- Personalized plans based on user preferences
- Visual meal cards with nutrition information
- Plan history and active plan management

### **3. Patient Management**
- Real-time patient list with online status
- Patient selection with conversation history
- Search functionality for finding patients
- Visual indicators for message status

### **4. Advanced UI Features**
- Responsive design for all screen sizes
- Smooth animations and transitions
- Modern glassmorphism design
- Professional medical interface

## 🐛 Troubleshooting

### **Common Issues**

1. **Socket.io Connection Failed**
   - Check if chat service is running on port 3005
   - Verify CORS settings in chat service
   - Check browser console for connection errors

2. **Diet Plan Generation Failed**
   - Verify diet service is running on port 3001
   - Check SPOONACULAR_API_KEY in environment variables
   - Ensure patient has diet preferences set

3. **Patient List Not Loading**
   - Check user service is running on port 5000
   - Verify JWT token in localStorage
   - Check network tab for API errors

4. **Messages Not Saving**
   - Verify MongoDB connection
   - Check chat service logs
   - Ensure conversation is being created

### **Debug Steps**

1. **Check Service Status**:
   ```bash
   curl http://localhost:5000/health  # User service
   curl http://localhost:3005/health  # Chat service
   curl http://localhost:3001/health  # Diet service
   ```

2. **Check MongoDB**:
   ```bash
   mongo
   use moodbites_chat
   db.conversations.find().pretty()
   
   use moodbites_diet
   db.dietplans.find().pretty()
   ```

3. **Check Browser Console**:
   - Open Developer Tools
   - Check Console tab for errors
   - Check Network tab for failed requests

## 📱 Mobile Support

The enhanced chat panel is fully responsive and works on:
- 📱 Mobile phones (iOS/Android)
- 📱 Tablets
- 💻 Desktop computers
- 🖥️ Large screens

## 🚀 Next Steps

1. **Add Voice Messages**: Implement WebRTC for voice recording
2. **Video Calling**: Integrate video call functionality
3. **File Sharing**: Complete file upload and sharing
4. **Push Notifications**: Add offline notification support
5. **Message Search**: Implement conversation search
6. **Plan Templates**: Add pre-made diet plan templates
7. **Analytics**: Add conversation and plan analytics

## 🎉 Success!

Once everything is working, you should see:
- ✅ Real-time messaging between dieticians and patients
- ✅ Diet plan generation and management
- ✅ Professional, responsive interface
- ✅ All data persisting in MongoDB
- ✅ Smooth animations and interactions

Your enhanced dietician chat panel is now ready for production use! 🚀
