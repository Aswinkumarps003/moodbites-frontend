import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  Search,
  User,
  Image as ImageIcon,
  Mic,
  MessageCircle
} from 'lucide-react';
import { io } from 'socket.io-client';
import AudioRecorder from '../../components/AudioRecorder';
import FileUploader from '../../components/FileUploader';
import MessageBubble from '../../components/MessageBubble';
import WebRTCCall from '../../components/WebRTCCall';
import CallRequestModal from '../../components/CallRequestModal';
import { logCall } from '../../utils/callLogger';

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

  const [conversationId, setConversationId] = useState(null);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [showWebRTCCall, setShowWebRTCCall] = useState(false);
  const [webRTCCallType, setWebRTCCallType] = useState('video');
  const [signalSocket, setSignalSocket] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showCallRequest, setShowCallRequest] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);
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

    const newSocket = io('http://localhost:3006', {
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

  // ── WebRTC Signaling Socket ──
  useEffect(() => {
    if (!dietician) return;
    const s = io('https://webrtc-signaling-service-47a8.onrender.com', {
      query: { userId: dietician._id, userName: dietician.name }
    });
    s.on('connect', () => s.emit('join-room', dietician._id));
    s.on('webrtc-call-request', (data) => {
      setIncomingCall({
        callerId: data.callerId,
        callerName: data.callerName,
        callType: data.callType || 'video',
        roomId: data.roomId
      });
      setShowCallRequest(true);
    });
    s.on('webrtc-end-call', () => {
      setShowWebRTCCall(false);
      setIncomingCall(null);
      setShowCallRequest(false);
    });
    setSignalSocket(s);
    return () => s.disconnect();
  }, [dietician]);

  // ── Call Handlers ──
  const handleStartVideoCall = () => {
    if (!selectedPatient) return;
    setWebRTCCallType('video');
    setCallStartTime(new Date());
    setShowWebRTCCall(true);
  };

  const handleStartAudioCall = () => {
    if (!selectedPatient) return;
    setWebRTCCallType('audio');
    setCallStartTime(new Date());
    setShowWebRTCCall(true);
  };

  const handleAcceptIncomingCall = () => {
    if (signalSocket && incomingCall && dietician) {
      signalSocket.emit('webrtc-call-response', {
        callerId: incomingCall.callerId,
        responderId: dietician._id,
        responderName: dietician.name,
        accepted: true,
        roomId: incomingCall.roomId
      });
    }
    setShowCallRequest(false);
    setCallStartTime(new Date());
    setShowWebRTCCall(true);
  };

  const handleRejectIncomingCall = (reason) => {
    if (signalSocket && incomingCall && dietician) {
      signalSocket.emit('webrtc-call-response', {
        callerId: incomingCall.callerId,
        responderId: dietician._id,
        responderName: dietician.name,
        accepted: false,
        reason
      });
    }
    setShowCallRequest(false);
    setIncomingCall(null);
  };

  const handleEndWebRTCCall = () => {
    const endTime = new Date();
    const duration = callStartTime ? Math.round((endTime - callStartTime) / 1000) : 0;

    // Log the call
    if (dietician && (selectedPatient || incomingCall)) {
      const partner = selectedPatient || { _id: incomingCall?.callerId, name: incomingCall?.callerName };
      logCall({
        callerId: dietician._id,
        callerName: dietician.name,
        receiverId: partner._id,
        receiverName: partner.name || 'Patient',
        callType: webRTCCallType,
        duration,
        startedAt: callStartTime?.toISOString(),
        endedAt: endTime.toISOString(),
      });
    }

    setShowWebRTCCall(false);
    setCallStartTime(null);
    setIncomingCall(null);
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/80 h-[calc(100vh-140px)] flex overflow-hidden relative group"
    >
      <div className="absolute top-[20%] left-[30%] w-[30%] h-[30%] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-400/30 transition-colors duration-700"></div>

      {/* Patients List */}
      <div className="w-80 border-r border-white/60 flex flex-col bg-white/40 z-10">
        <div className="p-6 border-b border-white/60 bg-white/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Messages</h2>
            <div className="flex items-center space-x-2 bg-white/60 px-3 py-1.5 rounded-xl border border-white shadow-sm">
              <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="relative group/search">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full pl-11 pr-4 py-2.5 bg-white/60 border border-white/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white text-sm font-medium text-slate-700 placeholder:text-slate-400 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {patients.map((patient) => (
            <motion.button
              key={patient._id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedPatient(patient)}
              className={`w-full p-4 text-left border-b border-white/40 transition-all duration-300 relative overflow-hidden ${selectedPatient?._id === patient._id ? 'bg-indigo-50/80 border-l-4 border-l-indigo-500' : 'hover:bg-white/60 hover:shadow-sm'
                }`}
            >
              {selectedPatient?._id === patient._id && (
                 <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none"></div>
              )}
              <div className="flex items-center space-x-4 relative z-10">
                <div className="relative">
                  {patient.profileImage ? (
                    <img
                      src={patient.profileImage}
                      alt={patient.name}
                      className="w-12 h-12 rounded-2xl object-cover shadow-md border border-white/60"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md border border-white/60 ${patient.profileImage ? 'hidden' : ''}`}
                  >
                    {patient.name?.charAt(0) || 'P'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[15px] text-slate-800 truncate tracking-tight">{patient.name}</h3>
                    <span className="text-[11px] font-semibold text-slate-400">2 min</span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 truncate mt-0.5">Last message preview...</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10 bg-white/20">
        {selectedPatient ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-white/60 bg-white/40 backdrop-blur-md sticky top-0 z-20 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {selectedPatient.profileImage ? (
                      <img
                        src={selectedPatient.profileImage}
                        alt={selectedPatient.name}
                        className="w-12 h-12 rounded-2xl object-cover shadow-md border border-white/80"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md border border-white/80 ${selectedPatient.profileImage ? 'hidden' : ''}`}
                    >
                      {selectedPatient.name?.charAt(0) || 'P'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-800 tracking-tight">{selectedPatient.name}</h3>
                    <div className="text-emerald-600 font-semibold text-xs uppercase tracking-wider mt-0.5">
                      Online
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleStartAudioCall}
                    disabled={!selectedPatient}
                    className="p-3.5 bg-white/60 border border-white hover:bg-white hover:shadow-md hover:text-indigo-600 rounded-2xl transition-all duration-300 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Voice Call"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleStartVideoCall}
                    disabled={!selectedPatient}
                    className="p-3.5 bg-white/60 border border-white hover:bg-white hover:shadow-md hover:text-indigo-600 rounded-2xl transition-all duration-300 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Video Call"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-transparent">
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
            <div className="p-5 border-t border-white/60 bg-white/60 backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    className="p-3.5 bg-white/80 border border-white hover:bg-white shadow-sm rounded-2xl transition-all duration-300 text-slate-500 hover:text-indigo-600"
                    title="Attach File"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  {/* Attachment Menu */}
                  <AnimatePresence>
                    {showAttachmentMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10, transformOrigin: 'bottom left' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, type: "spring", bounce: 0.3 }}
                        className="absolute bottom-16 left-0 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white p-2 z-20 min-w-40"
                      >
                        <button
                          onClick={() => {
                            setShowFileUploader(true);
                            setShowAttachmentMenu(false);
                          }}
                          className="flex items-center space-x-3 w-full px-4 py-3 hover:bg-indigo-50/80 rounded-xl transition-all text-slate-700 font-semibold"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm">Files</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowAudioRecorder(true);
                            setShowAttachmentMenu(false);
                          }}
                          className="flex items-center space-x-3 w-full px-4 py-3 mt-1 hover:bg-rose-50/80 rounded-xl transition-all text-slate-700 font-semibold"
                        >
                          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                            <Mic className="w-4 h-4 text-rose-600" />
                          </div>
                          <span className="text-sm">Voice Message</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex-1 relative group/input">
                  <input
                    type="text"
                    value={message}
                    onChange={handleTyping}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full pl-5 pr-14 py-3.5 bg-white/60 border border-white/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white transition-all shadow-inner text-sm font-medium text-slate-800 placeholder:text-slate-400"
                    disabled={!isConnected}
                  />
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <Smile className="w-5 h-5 text-slate-400 hover:text-indigo-500 transition-colors" />
                  </button>

                  {/* Emoji Picker */}
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, type: "spring", bounce: 0.3 }}
                        className="absolute bottom-16 right-0 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white p-3 z-20"
                      >
                        <div className="grid grid-cols-6 gap-2">
                          {emojis.map((emoji, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setMessage(prev => prev + emoji);
                                setShowEmojiPicker(false);
                              }}
                              className="p-2 hover:bg-indigo-50 rounded-xl transition-colors text-xl transform hover:scale-110"
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
                  className="p-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  <Send className="w-5 h-5 ml-0.5" />
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
          <div className="flex-1 flex items-center justify-center bg-transparent">
            <div className="text-center p-8 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl max-w-sm">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner shadow-white/30">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Select a Patient</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">Choose a patient from the list on the left to review their progress and start chatting.</p>
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

      {/* WebRTC Call Component */}
      <WebRTCCall
        isOpen={showWebRTCCall}
        onClose={() => setShowWebRTCCall(false)}
        targetUser={selectedPatient ? { id: selectedPatient._id, name: selectedPatient.name, profileImage: selectedPatient.profileImage } : (incomingCall ? { id: incomingCall.callerId, name: incomingCall.callerName } : null)}
        callType={webRTCCallType}
        onCallEnd={handleEndWebRTCCall}
      />

      {/* Incoming Call Request Modal */}
      <CallRequestModal
        isOpen={showCallRequest}
        callerInfo={incomingCall}
        callType={incomingCall?.callType || 'video'}
        onAccept={handleAcceptIncomingCall}
        onReject={handleRejectIncomingCall}
      />
    </motion.div>
  );
};

export default ChatPanel;
