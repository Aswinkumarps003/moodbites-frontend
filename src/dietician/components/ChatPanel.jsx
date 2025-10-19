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
  Filter,
  User,
  Clock,
  Check,
  CheckCheck,
  MoreHorizontal,
  Image as ImageIcon,
  FileText,
  Mic,
  X,
  Utensils,
  Calendar,
  Target,
  Activity,
  Heart,
  Zap,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Download,
  Share2,
  Star,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { io } from 'socket.io-client';
import AudioRecorder from '../../components/AudioRecorder';
import FileUploader from '../../components/FileUploader';
import MessageBubble from '../../components/MessageBubble';

const ChatPanel = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [patients, setPatients] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [dietPlans, setDietPlans] = useState([]);
  const [selectedDietPlan, setSelectedDietPlan] = useState(null);
  const [regenLoadingIdx, setRegenLoadingIdx] = useState(-1);
  const [regenQuery, setRegenQuery] = useState('');
  const [regenFlags, setRegenFlags] = useState({ lowSugar: false, lowCholesterol: false, lowSaturatedFat: false, lowCarb: false });
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [patientInfo, setPatientInfo] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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

    const newSocket = io('https://chat-service-latest-m6az.onrender.com', {
      auth: { token: token }
    });

    newSocket.on('connect', () => {
      console.log('Dietician connected to chat service');
      setIsConnected(true);
      newSocket.emit('join-room', dietician._id);
    });

    newSocket.on('disconnect', () => {
      console.log('Dietician disconnected from chat service');
      setIsConnected(false);
    });

    newSocket.on('receive-message', (data) => {
      console.log('Received message:', data);
      const newMessage = {
        id: data._id || data.messageId || Date.now() + Math.random(),
        text: data.message,
        sender: data.senderId.toString() === dietician._id ? 'doctor' : 'patient',
        time: new Date(data.createdAt || new Date()).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        isRead: data.isRead || false,
        messageType: data.messageType || 'text',
        createdAt: data.createdAt || new Date(),
        // File-related fields
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
        fileUrl: data.fileUrl,
        filePublicId: data.filePublicId,
        // Audio-related fields
        audioUrl: data.audioUrl,
        audioPublicId: data.audioPublicId,
        audioDuration: data.audioDuration
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Mark message as read if it's from patient
      if (data._id && data.senderId.toString() !== dietician._id) {
        newSocket.emit('mark-as-read', {
          conversationId: data.conversationId,
          messageId: data._id,
          userId: dietician._id
        });
      }
    });

    newSocket.on('message-sent', (data) => {
      console.log('Message sent confirmation:', data);
      const newMessage = {
        id: data._id || data.messageId || Date.now() + Math.random(),
        text: data.message,
        sender: 'doctor',
        time: new Date(data.createdAt || new Date()).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        isRead: true,
        messageType: data.messageType || 'text',
        createdAt: data.createdAt || new Date(),
        // File-related fields
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
        fileUrl: data.fileUrl,
        filePublicId: data.filePublicId,
        // Audio-related fields
        audioUrl: data.audioUrl,
        audioPublicId: data.audioPublicId,
        audioDuration: data.audioDuration
      };
      
      setMessages(prev => [...prev, newMessage]);
    });

    newSocket.on('user-typing', (data) => {
      if (data.senderId === selectedPatient?._id) {
        setIsTyping(data.isTyping);
      }
    });

    newSocket.on('message-read', (data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, isRead: true } : msg
      ));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token, dietician, selectedPatient]);

  // Fetch patients (users with role 1) with profile images
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('https://user-service-latest-bae8.onrender.com/api/user/users/role/1', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          // Ensure patients have profile images from Cloudinary
          const patientsWithImages = (data.users || []).map(patient => ({
            ...patient,
            profileImage: patient.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name || 'Patient')}&background=6366f1&color=ffffff&size=200`
          }));
          setPatients(patientsWithImages);
        }
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      }
    };

    if (token) {
      fetchPatients();
    }
  }, [token]);

  // Fetch conversation history when patient is selected
  useEffect(() => {
    const fetchConversation = async () => {
      if (!selectedPatient || !token) return;

      try {
        const response = await fetch(`http://localhost:3006/api/conversations/${dietician._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const conversations = await response.json();
          console.log('Fetched conversations:', conversations);
          
          // Find conversation between dietician and selected patient
          const currentConversation = conversations.find(conv => {
            const participantIds = conv.participants.map(p => {
              // Handle both populated and unpopulated participants
              if (typeof p === 'object' && p._id) {
                return p._id.toString();
              }
              return p.toString();
            });
            return participantIds.includes(dietician._id) && participantIds.includes(selectedPatient._id);
          });
          
          console.log('Current conversation:', currentConversation);
          
          if (currentConversation && currentConversation.messages) {
            setConversationId(currentConversation._id);
            const formattedMessages = currentConversation.messages.map(msg => ({
              id: msg._id,
              text: msg.message,
              sender: msg.senderId.toString() === dietician._id ? 'doctor' : 'patient',
              time: new Date(msg.createdAt).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              }),
              isRead: msg.isRead,
              messageType: msg.messageType || 'text',
              createdAt: msg.createdAt,
              // File-related fields
              fileName: msg.fileName,
              fileSize: msg.fileSize,
              fileType: msg.fileType,
              fileUrl: msg.fileUrl,
              filePublicId: msg.filePublicId,
              // Audio-related fields
              audioUrl: msg.audioUrl,
              audioPublicId: msg.audioPublicId,
              audioDuration: msg.audioDuration
            }));
            
            console.log('Formatted messages:', formattedMessages);
            setMessages(formattedMessages);
          } else {
            setMessages([]);
            setConversationId(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch conversation:', err);
        setMessages([]);
      }
    };

    fetchConversation();
  }, [selectedPatient, token, dietician]);

  // Fetch selected patient's diet plans
  useEffect(() => {
    const fetchPatientDietPlans = async () => {
      if (!selectedPatient || !token) return;
      try {
        const response = await fetch(`https://diet-service-latest.onrender.com/api/diet-plans/${selectedPatient._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const allPlans = (data.dietPlans || []).slice();
          allPlans.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          setDietPlans(allPlans.slice(0, 2));
          setSelectedDietPlan(null);
        }
      } catch (error) {
        console.error('Failed to fetch patient diet plans:', error);
      }
    };

    fetchPatientDietPlans();
  }, [selectedPatient, token]);
  const regenerateMeal = async (planId, mealIdx) => {
    try {
      if (!selectedPatient) return;
      setRegenLoadingIdx(mealIdx);
      const params = new URLSearchParams();
      if (regenQuery) params.set('q', regenQuery);
      if (regenFlags.lowSugar) params.set('lowSugar', 'true');
      if (regenFlags.lowCholesterol) params.set('lowCholesterol', 'true');
      if (regenFlags.lowSaturatedFat) params.set('lowSaturatedFat', 'true');
      if (regenFlags.lowCarb) params.set('lowCarb', 'true');
      params.set('number', '1');
      const searchResp = await fetch(`https://diet-service-latest.onrender.com/api/spoonacular/search?${params.toString()}`);
      if (!searchResp.ok) throw new Error('Search failed');
      const searchJson = await searchResp.json();
      const first = (searchJson.results || [])[0];
      if (!first) throw new Error('No matching recipe found');
      const replaceResp = await fetch(`https://diet-service-latest.onrender.com/api/diet-plans/${planId}/meals/replace`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealIndex: mealIdx, spoonacularId: first.id })
      });
      if (!replaceResp.ok) throw new Error('Replace failed');
      // Refresh plans
      const response = await fetch(`https://diet-service-latest.onrender.com/api/diet-plans/${selectedPatient._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const allPlans = (data.dietPlans || []).slice();
        allPlans.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setDietPlans(allPlans.slice(0, 2));
      }
    } catch (e) {
      // Silent fail: optionally toast
    } finally {
      setRegenLoadingIdx(-1);
    }
  };


  const handleSendMessage = () => {
    if (message.trim() && socket && selectedPatient) {
      const messageData = {
        senderId: dietician._id,
        receiverId: selectedPatient._id,
        message: message.trim(),
        messageType: 'text'
      };
      
      socket.emit('send-message', messageData);
      setMessage('');
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (socket && selectedPatient) {
      socket.emit('typing', {
        receiverId: selectedPatient._id,
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

  const handleSendAudio = async (audioBlob) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-message.webm');
      
      // Upload audio file to server
      const uploadResponse = await fetch('http://localhost:3006/api/upload/audio', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (uploadResponse.ok) {
        const { audioUrl, audioPublicId, duration } = await uploadResponse.json();
        
        // Send audio message
        const messageData = {
          senderId: dietician._id,
          receiverId: selectedPatient._id,
          message: 'Voice message',
          messageType: 'audio',
          audioUrl: audioUrl,
          audioPublicId: audioPublicId,
          audioDuration: duration
        };
        
        socket.emit('send-message', messageData);
      } else {
        throw new Error('Failed to upload audio');
      }
    } catch (error) {
      console.error('Error sending audio:', error);
    }
  };

  const handleSendFile = async (file, fileType) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      
      // Upload file to server
      const uploadResponse = await fetch('http://localhost:3006/api/upload/file', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (uploadResponse.ok) {
        const { fileUrl, filePublicId, fileName, fileSize } = await uploadResponse.json();
        
        // Send file message
        const messageData = {
          senderId: dietician._id,
          receiverId: selectedPatient._id,
          message: `Shared ${fileType}: ${fileName}`,
          messageType: 'file',
          fileName: fileName,
          fileSize: fileSize,
          fileType: fileType,
          fileUrl: fileUrl,
          filePublicId: filePublicId
        };
        
        socket.emit('send-message', messageData);
      } else {
        throw new Error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error sending file:', error);
    }
  };

  const handleFileDownload = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  

  const emojis = ['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🎉', '🔥', '💯', '👏'];

  const selectedPatientData = selectedPatient;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 min-h-screen p-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 h-[800px] flex overflow-hidden">
      {/* Patients List */}
          <div className="w-80 border-r border-gray-200/30 flex flex-col bg-gradient-to-b from-gray-50/50 to-white">
            <div className="p-6 border-b border-gray-200/30 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Patients</h2>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-sm text-indigo-100">
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
          <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-200" />
            <input
              type="text"
              placeholder="Search patients..."
                  className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-indigo-200"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {patients.map((patient) => (
            <motion.button
                  key={patient._id}
                  whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                  onClick={() => setSelectedPatient(patient)}
                  className={`w-full p-4 text-left border-b border-gray-100/50 transition-all duration-200 ${
                    selectedPatient?._id === patient._id ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {patient.profileImage ? (
                    <img 
                      src={patient.profileImage} 
                      alt={patient.name}
                      className="w-12 h-12 rounded-2xl object-cover shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg ${patient.profileImage ? 'hidden' : ''}`}
                  >
                    {patient.name?.charAt(0) || 'P'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 truncate">{patient.name}</h3>
                        <span className="text-xs text-gray-500">2 min ago</span>
                  </div>
                      <p className="text-sm text-gray-600 truncate mt-1">Last message preview...</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

          {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
            {selectedPatient ? (
              <>
        {/* Chat Header */}
                <div className="p-6 border-b border-gray-200/30 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {selectedPatient.profileImage ? (
                        <img 
                          src={selectedPatient.profileImage} 
                          alt={selectedPatient.name}
                          className="w-12 h-12 rounded-2xl object-cover shadow-lg border-2 border-white/20"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${selectedPatient.profileImage ? 'hidden' : ''}`}
                      >
                        {selectedPatient.name?.charAt(0) || 'P'}
              </div>
              <div>
                        <h3 className="font-bold text-lg">{selectedPatient.name}</h3>
                        <div className="text-indigo-100 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                          <span>Online</span>
                        </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
                      <button className="p-3 rounded-xl hover:bg-white/20 transition-all duration-200" title="Voice Call">
                        <Phone className="w-5 h-5" />
              </button>
                      <button className="p-3 rounded-xl hover:bg-white/20 transition-all duration-200" title="Video Call">
                        <Video className="w-5 h-5" />
              </button>
                      <button 
                        onClick={() => setShowSidePanel(!showSidePanel)}
                        className="p-3 rounded-xl hover:bg-white/20 transition-all duration-200" 
                        title="Toggle Side Panel"
                      >
                        <Utensils className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
          <AnimatePresence>
                    {messages.map((msg, index) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.sender === 'doctor'}
                senderName={msg.sender === 'doctor' ? dietician?.name : selectedPatient?.name}
                senderAvatar={msg.sender === 'doctor' ? dietician?.profileImage : selectedPatient?.profileImage}
                onFileDownload={handleFileDownload}
              />
            ))}
                    
                    {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            {selectedPatient.profileImage ? (
                              <img 
                                src={selectedPatient.profileImage} 
                                alt={selectedPatient.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-full h-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold ${selectedPatient.profileImage ? 'hidden' : ''}`}
                            >
                              {selectedPatient.name?.charAt(0) || 'P'}
                            </div>
                          </div>
                          <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl shadow-lg border border-gray-200">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                </div>
              </motion.div>
                    )}
          </AnimatePresence>
                  <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
                <div className="p-6 border-t border-gray-200/30 bg-white/80 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <button 
                        onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                        className="p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 text-gray-600"
                        title="Attach File"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      
                      {/* Attachment Menu */}
                      <AnimatePresence>
                        {showAttachmentMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-14 left-0 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-10"
                          >
                            <button 
                              onClick={() => {
                                setShowFileUploader(true);
                                setShowAttachmentMenu(false);
                              }}
                              className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <ImageIcon className="w-4 h-4 text-blue-500" />
                              <span className="text-sm">Files</span>
                            </button>
                            <button 
                              onClick={() => {
                                setShowAudioRecorder(true);
                                setShowAttachmentMenu(false);
                              }}
                              className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <Mic className="w-4 h-4 text-red-500" />
                              <span className="text-sm">Voice Message</span>
            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                        onChange={handleTyping}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        disabled={!isConnected}
                      />
                      <button 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Smile className="w-5 h-5 text-gray-600" />
                      </button>
                      
                      {/* Emoji Picker */}
                      <AnimatePresence>
                        {showEmojiPicker && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-14 right-0 bg-white rounded-xl shadow-lg border border-gray-200 p-3 z-10"
                          >
                            <div className="grid grid-cols-6 gap-2">
                              {emojis.map((emoji, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setMessage(prev => prev + emoji);
                                    setShowEmojiPicker(false);
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-lg"
                                >
                                  {emoji}
              </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
            </div>

            <button
              onClick={handleSendMessage}
                      disabled={!message.trim() || !isConnected}
                      className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
                      <Send className="w-5 h-5" />
            </button>
          </div>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf,.doc,.docx"
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50/50 to-white">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Patient</h3>
                  <p className="text-gray-600">Choose a patient from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>

          {/* Diet Plan Side Panel */}
          {showSidePanel && selectedPatient && (
            <div className="w-96 border-l border-gray-200/30 flex flex-col bg-gradient-to-b from-gray-50/50 to-white">
              <div className="p-6 border-b border-gray-200/30 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">{selectedPatient.name?.split(' ')[0] || 'Patient'}'s Diet Plans</h3>
                  <div className="text-sm text-gray-500">{dietPlans.length} {dietPlans.length === 1 ? 'plan' : 'plans'}</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {dietPlans && dietPlans.length > 0 ? (
                  dietPlans.map((plan) => {
                    const isOpen = selectedDietPlan?._id === plan._id;
                    const createdAt = plan.createdAt ? new Date(plan.createdAt) : null;
                    return (
                      <div key={plan._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <button
                          onClick={() => setSelectedDietPlan(isOpen ? null : plan)}
                          className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{createdAt ? createdAt.toLocaleDateString() : '—'}</span>
                              </div>
                              <h4 className="text-base font-semibold text-gray-800 mt-1">{plan.planName || 'Diet Plan'}</h4>
                              <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                                <span className="inline-flex items-center gap-1"><Target className="w-4 h-4 text-emerald-500" />{plan.totalCalories || 0} kcal</span>
                                <span className="inline-flex items-center gap-1"><Activity className="w-4 h-4 text-indigo-500" />{(plan.meals || []).length} meals</span>
                              </div>
                            </div>
                            <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            </div>
                          </div>
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4">
                            {plan.preferences && (
                              <div className="mb-3">
                                <div className="text-xs text-gray-500 mb-1">Preferences</div>
                                <div className="flex flex-wrap gap-2">
                                  {plan.preferences.dietPreference ? (
                                    <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs border border-emerald-200">{plan.preferences.dietPreference}</span>
                                  ) : null}
                                  {(plan.preferences.cuisine || []).slice(0, 3).map((c, idx) => (
                                    <span key={idx} className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs border border-indigo-200">{c}</span>
                                  ))}
                                  {(plan.preferences.healthConditions || []).slice(0, 3).map((h, idx) => (
                                    <span key={idx} className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs border border-amber-200">{h}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="space-y-3">
                              {/* Regenerate controls */}
                              <div className="p-3 rounded-xl bg-white border border-gray-200 mb-2">
                                <div className="text-sm font-semibold text-gray-800 mb-2">Regenerate criteria</div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  <label className="inline-flex items-center gap-1 text-xs">
                                    <input type="checkbox" checked={regenFlags.lowSugar} onChange={e => setRegenFlags(prev => ({ ...prev, lowSugar: e.target.checked }))} /> Low sugar
                                  </label>
                                  <label className="inline-flex items-center gap-1 text-xs">
                                    <input type="checkbox" checked={regenFlags.lowCholesterol} onChange={e => setRegenFlags(prev => ({ ...prev, lowCholesterol: e.target.checked }))} /> Low cholesterol
                                  </label>
                                  <label className="inline-flex items-center gap-1 text-xs">
                                    <input type="checkbox" checked={regenFlags.lowSaturatedFat} onChange={e => setRegenFlags(prev => ({ ...prev, lowSaturatedFat: e.target.checked }))} /> Low saturated fat
                                  </label>
                                  <label className="inline-flex items-center gap-1 text-xs">
                                    <input type="checkbox" checked={regenFlags.lowCarb} onChange={e => setRegenFlags(prev => ({ ...prev, lowCarb: e.target.checked }))} /> Low carb
                                  </label>
                                </div>
                                <input
                                  value={regenQuery}
                                  onChange={e => setRegenQuery(e.target.value)}
                                  placeholder="e.g., Indian, Salad, Paneer"
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                              </div>
                              {(plan.meals || []).map((meal, idx) => (
                                <div key={idx} className="p-3 rounded-xl border border-gray-200 bg-gray-50/50">
                                  <div className="flex items-center gap-3">
                                    {meal.image ? (
                                      <img src={meal.image} alt={meal.recipe} className="w-14 h-14 rounded-lg object-cover border border-gray-200" />
                                    ) : (
                                      <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-xs">No image</div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs text-gray-500">{meal.mealType || 'Meal'}</div>
                                      <div className="font-semibold text-gray-800 truncate">{meal.recipe}</div>
                                      <div className="text-xs text-gray-600 mt-1 flex items-center gap-3">
                                        <span>{meal.calories || 0} kcal</span>
                                        {meal.readyInMinutes ? <span>{meal.readyInMinutes} min</span> : null}
                                        {meal.servings ? <span>{meal.servings} servings</span> : null}
                                      </div>
                                      {meal.ingredients && meal.ingredients.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          {meal.ingredients.slice(0, 3).map((ing, i) => (
                                            <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700 text-xs">{ing}</span>
                                          ))}
                                          {meal.ingredients.length > 3 ? (
                                            <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-500 text-xs">+{meal.ingredients.length - 3} more</span>
                                          ) : null}
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <button
                                        onClick={() => regenerateMeal(plan._id, idx)}
                                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg disabled:opacity-50"
                                        disabled={regenLoadingIdx === idx}
                                      >
                                        {regenLoadingIdx === idx ? 'Regenerating...' : 'Regenerate'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Utensils className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h5 className="font-medium text-gray-800 mb-1">No Diet Plans</h5>
                    <p className="text-sm text-gray-600">This patient has no diet plans yet</p>
                  </div>
                )}
        </div>
            </div>
          )}

        </div>

        {/* Audio Recorder Component */}
        <AudioRecorder
          isOpen={showAudioRecorder}
          onSendAudio={handleSendAudio}
          onCancel={() => setShowAudioRecorder(false)}
        />

        {/* File Uploader Component */}
        <FileUploader
          isOpen={showFileUploader}
          onSendFile={handleSendFile}
          onCancel={() => setShowFileUploader(false)}
        />
      </div>
    </motion.div>
  );
};

export default ChatPanel;


