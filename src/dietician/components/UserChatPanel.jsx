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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/80 h-[calc(100vh-140px)] flex overflow-hidden relative group"
    >
      <div className="absolute top-[20%] left-[30%] w-[30%] h-[30%] bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-400/30 transition-colors duration-700"></div>

      {/* Users List */}
      <div className="w-80 border-r border-white/60 flex flex-col bg-white/40 z-10">
        <div className="p-6 border-b border-white/60 bg-white/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Patients</h2>
            <div className="flex items-center space-x-2 bg-white/60 px-3 py-1.5 rounded-xl border border-white shadow-sm">
              <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="relative group/search">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full pl-11 pr-4 py-2.5 bg-white/60 border border-white/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 focus:bg-white text-sm font-medium text-slate-700 placeholder:text-slate-400 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {users.map((user) => (
            <motion.button
              key={user._id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-4 text-left border-b border-white/40 transition-all duration-300 relative overflow-hidden ${
                selectedUser?._id === user._id ? 'bg-emerald-50/80 border-l-4 border-l-emerald-500' : 'hover:bg-white/60 hover:shadow-sm'
              }`}
            >
              {selectedUser?._id === user._id && (
                 <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>
              )}
              <div className="flex items-center space-x-4 relative z-10">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md border border-white/60">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  {user.unread > 0 && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-md ring-2 ring-white">
                      {user.unread}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[15px] text-slate-800 truncate tracking-tight">{user.name}</h3>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {new Date(user.lastUpdated).toLocaleTimeString('en-US', { 
                        hour: '2-digit', minute: '2-digit', hour12: true 
                      })}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 truncate mt-0.5">{user.lastMessage}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative z-10 bg-white/20">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-white/60 bg-white/40 backdrop-blur-md sticky top-0 z-20 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md border border-white/80">
                  {selectedUser?.name?.charAt(0) || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-800 tracking-tight">{selectedUser?.name || 'Select a patient'}</h3>
                <div className="text-emerald-600 font-semibold text-xs uppercase tracking-wider mt-0.5 flex items-center gap-1">
                  Online
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleStartAudioCall}
                className="p-3.5 bg-white/60 border border-white hover:bg-white hover:shadow-md hover:text-emerald-600 rounded-2xl transition-all duration-300 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                title="Voice Call"
                disabled={!selectedUser}
              >
                <Phone className="w-5 h-5" />
              </button>
              <button 
                onClick={handleStartVideoCall}
                className="p-3.5 bg-white/60 border border-white hover:bg-white hover:shadow-md hover:text-emerald-600 rounded-2xl transition-all duration-300 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                title="Video Call"
                disabled={!selectedUser}
              >
                <Video className="w-5 h-5" />
              </button>
              <button className="p-3.5 bg-white/60 border border-white hover:bg-white hover:shadow-md hover:text-emerald-600 rounded-2xl transition-all duration-300 text-slate-500" title="More Options">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-transparent">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.sender === 'dietician' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-5 py-3 rounded-3xl shadow-sm backdrop-blur-sm border ${
                    msg.sender === 'dietician'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-none border-emerald-400'
                      : 'bg-white/90 text-slate-800 rounded-tl-none border-white'
                  }`}
                >
                  <p className="text-[15px] leading-relaxed tracking-wide">{msg.text}</p>
                  <p className={`text-[10px] font-semibold mt-1.5 flex items-center ${
                    msg.sender === 'dietician' ? 'text-emerald-100 justify-end' : 'text-slate-400 justify-start'
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
                <div className="bg-white/90 text-slate-800 px-5 py-4 rounded-3xl rounded-tl-none border border-white shadow-sm flex space-x-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-5 border-t border-white/60 bg-white/60 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <button className="p-3.5 bg-white/80 border border-white hover:bg-white shadow-sm rounded-2xl transition-all duration-300 text-slate-500 hover:text-emerald-600" title="Attach File">
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 relative group/input">
              <input
                type="text"
                value={message}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full pl-5 pr-14 py-3.5 bg-white/60 border border-white/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 focus:bg-white transition-all shadow-inner text-sm font-medium text-slate-800 placeholder:text-slate-400"
                disabled={!isConnected || !selectedUser}
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-500 transition-colors text-slate-400">
                <Smile className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || !isConnected || !selectedUser}
              className="p-3.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              <Send className="w-5 h-5 ml-0.5" />
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
