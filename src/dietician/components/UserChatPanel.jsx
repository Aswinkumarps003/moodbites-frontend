import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical,
  Search,
  User
} from 'lucide-react';
import { io } from 'socket.io-client';
import WebRTCCall from '../../components/WebRTCCall';

const UserChatPanel = () => {
  const [socket, setSocket] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showWebRTCCall, setShowWebRTCCall] = useState(false);
  const [webRTCCallType, setWebRTCCallType] = useState('video');
  const messagesEndRef = useRef(null);

  const token = useMemo(() => localStorage.getItem('authToken'), []);
  const dietician = useMemo(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }, []);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket connection
  useEffect(() => {
    if (!token || !dietician) return;

    const newSocket = io('http://localhost:3005', {
      auth: {
        token: token
      }
    });

    newSocket.on('connect', () => {
      console.log('Dietician connected to chat service');
      setIsConnected(true);
      
      // Join dietician's personal room
      newSocket.emit('join-room', dietician._id);
    });

    newSocket.on('disconnect', () => {
      console.log('Dietician disconnected from chat service');
      setIsConnected(false);
    });

    newSocket.on('receive-message', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        text: data.message,
        sender: 'user',
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        isRead: data.isRead || false
      }]);
    });

    newSocket.on('message-sent', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        text: data.message,
        sender: 'dietician',
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        isRead: true
      }]);
    });

    newSocket.on('user-typing', (data) => {
      if (data.senderId === selectedUser?._id) {
        setIsTyping(data.isTyping);
      }
    });

    newSocket.on('message-error', (error) => {
      setError(error.error || 'Failed to send message');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token, dietician, selectedUser]);

  // Fetch users who have chatted with this dietician
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3005/api/conversations/${dietician._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const conversations = await response.json();
          const userList = conversations.map(conv => {
            const user = conv.participants.find(p => p._id !== dietician._id);
            return {
              ...user,
              lastMessage: conv.lastMessage,
              lastUpdated: conv.lastUpdated,
              unread: 0 // You can implement unread count logic
            };
          });
          setUsers(userList);
          
          if (userList.length > 0 && !selectedUser) {
            setSelectedUser(userList[0]);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (dietician) {
      fetchUsers();
    }
  }, [dietician, token]);

  // Fetch messages for selected user
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;

      try {
        const response = await fetch(`http://localhost:3005/api/conversations/${selectedUser.conversationId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const messagesData = await response.json();
          setMessages(messagesData.map(msg => ({
            id: msg._id,
            text: msg.message,
            sender: msg.senderId === dietician._id ? 'dietician' : 'user',
            time: new Date(msg.createdAt).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }),
            isRead: msg.isRead
          })));
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    if (selectedUser) {
      fetchMessages();
    }
  }, [selectedUser, dietician, token]);

  const handleSendMessage = () => {
    if (message.trim() && socket && selectedUser) {
      socket.emit('send-message', {
        senderId: dietician._id,
        receiverId: selectedUser._id,
        message: message.trim(),
        messageType: 'text'
      });
      setMessage('');
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (socket && selectedUser) {
      socket.emit('typing', {
        receiverId: selectedUser._id,
        senderId: dietician._id,
        isTyping: e.target.value.length > 0
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // WebRTC call handlers
  const handleStartVideoCall = () => {
    if (selectedUser) {
      setWebRTCCallType('video');
      setShowWebRTCCall(true);
    }
  };

  const handleStartAudioCall = () => {
    if (selectedUser) {
      setWebRTCCallType('audio');
      setShowWebRTCCall(true);
    }
  };

  const handleEndWebRTCCall = () => {
    setShowWebRTCCall(false);
    setWebRTCCallType('video');
  };

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 h-[600px] flex"
    >
      {/* Users List */}
      <div className="w-80 border-r border-gray-200/50 flex flex-col">
        <div className="p-4 border-b border-gray-200/50">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Patients</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {users.map((user) => (
            <motion.button
              key={user._id}
              whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-4 text-left border-b border-gray-100/50 transition-colors ${
                selectedUser?._id === user._id ? 'bg-emerald-50 border-emerald-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  {user.unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                      {user.unread}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 truncate">{user.name}</h3>
                    <span className="text-xs text-gray-500">
                      {new Date(user.lastUpdated).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">{user.lastMessage}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200/50 bg-white/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {selectedUser?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{selectedUser?.name || 'Select a patient'}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  {isConnected ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleStartAudioCall}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors" 
                title="Voice Call"
                disabled={!selectedUser}
              >
                <Phone className="w-4 h-4 text-gray-600" />
              </button>
              <button 
                onClick={handleStartVideoCall}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors" 
                title="Video Call"
                disabled={!selectedUser}
              >
                <Video className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="More Options">
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === 'dietician' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    msg.sender === 'dietician'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === 'dietician' ? 'text-emerald-100' : 'text-gray-500'
                  }`}>
                    {msg.time}
                  </p>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl">
                  <p className="text-sm italic">Typing...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200/50 bg-white/50">
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Attach File">
              <Paperclip className="w-4 h-4 text-gray-600" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={!isConnected || !selectedUser}
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <Smile className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || !isConnected || !selectedUser}
              className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* WebRTC Call Component */}
      <WebRTCCall
        isOpen={showWebRTCCall}
        onClose={() => setShowWebRTCCall(false)}
        targetUser={selectedUser}
        callType={webRTCCallType}
        onCallEnd={handleEndWebRTCCall}
      />
    </motion.div>
  );
};

export default UserChatPanel;
