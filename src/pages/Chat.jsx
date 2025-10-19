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
  ArrowLeft,
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
  Info,
  MessageCircle,
  Bell,
  Settings,
  Menu,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  BookOpen,
  TrendingUp,
  Award,
  Shield,
  Clock3,
  Users,
  BarChart3,
  PieChart,
  LineChart,
  Coffee,
  Apple,
  Carrot,
  Fish,
  Beef,
  Leaf,
  Droplets,
  Flame,
  Scale,
  Ruler,
  Timer,
  MapPin,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import WebRTCCall from '../components/WebRTCCall';
import AudioRecorder from '../components/AudioRecorder';
import FileUploader from '../components/FileUploader';
import MessageBubble from '../components/MessageBubble';

const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:5000';
const CHAT_SERVICE_URL = import.meta.env.VITE_CHAT_SERVICE_URL || 'http://localhost:3006';
const SIGNALING_SERVICE_URL = import.meta.env.VITE_SIGNALING_SERVICE_URL || 'http://localhost:3007';
const DIET_PLANNER_URL = 'https://diet-service-latest.onrender.com';
const MOOD_SERVICE_URL = import.meta.env.VITE_MOOD_SERVICE_URL || 'http://localhost:3001';

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [dietician, setDietician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [dietPlans, setDietPlans] = useState([]);
  const [selectedDietPlan, setSelectedDietPlan] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showDietHistory, setShowDietHistory] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [lastSeen, setLastSeen] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showWebRTCCall, setShowWebRTCCall] = useState(false);
  const [webRTCCallType, setWebRTCCallType] = useState('video');
  const [signalSocket, setSignalSocket] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showCallRequest, setShowCallRequest] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dieticianId = searchParams.get('dieticianId');
  const patientIdParam = searchParams.get('userId');

  const token = useMemo(() => localStorage.getItem('authToken'), []);
  const user = useMemo(() => {
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
    if (!token || !dieticianId) {
      navigate('/consult');
      return;
    }

    setConnectionStatus('connecting');
    const newSocket = io(CHAT_SERVICE_URL, {
      auth: {
        token: token
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat service');
      setIsConnected(true);
      setConnectionStatus('connected');
      
      // Join user's personal room
      newSocket.emit('join-room', user._id);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat service');
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', () => {
      setConnectionStatus('error');
    });

    newSocket.on('receive-message', (data) => {
      const newMessage = {
        id: data.messageId || Date.now() + Math.random(),
        text: data.message,
        sender: 'dietician',
        time: new Date().toLocaleTimeString('en-US', { 
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
      
      // Add notification
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'message',
        message: `New message from ${dietician?.name || 'Dietician'}`,
        time: new Date(),
        read: false
      }]);
      
      // Mark message as read
      if (data.messageId) {
        newSocket.emit('mark-as-read', {
          conversationId: data.conversationId,
          messageId: data.messageId,
          userId: user._id
        });
      }
    });

    newSocket.on('message-sent', (data) => {
      const newMessage = {
        id: data.messageId || Date.now() + Math.random(),
        text: data.message,
        sender: 'user',
        time: new Date().toLocaleTimeString('en-US', { 
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
      if (data.senderId === dieticianId) {
        setIsTyping(data.isTyping);
        
        // Clear existing timeout
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }
        
        // Set new timeout to stop typing indicator
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
        
        setTypingTimeout(timeout);
      }
    });

    newSocket.on('message-read', (data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, isRead: true } : msg
      ));
    });

    newSocket.on('user-online', (data) => {
      if (data.userId === dieticianId) {
        setLastSeen('Online now');
      }
    });

    newSocket.on('user-offline', (data) => {
      if (data.userId === dieticianId) {
        setLastSeen(`Last seen ${new Date().toLocaleTimeString()}`);
      }
    });

    newSocket.on('message-error', (error) => {
      setError(error.error || 'Failed to send message');
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: error.error || 'Failed to send message',
        time: new Date(),
        read: false
      }]);
    });

    setSocket(newSocket);

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      newSocket.close();
    };
  }, [token, dieticianId, user, navigate, dietician, typingTimeout]);

  // Initialize signaling socket for WebRTC call requests
  useEffect(() => {
    if (!user) return;
    const s = io(SIGNALING_SERVICE_URL, {
      query: { userId: user._id, userName: user.name }
    });
    s.on('connect', () => {
      // also join personal room explicitly for compatibility
      s.emit('join-room', user._id);
    });
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
    return () => {
      s.disconnect();
    };
  }, [user]);

  // Fetch dietician info with profile image
  useEffect(() => {
    const fetchDietician = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${USER_SERVICE_URL}/api/user/profile/${dieticianId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const dieticianData = await response.json();
          // Ensure dietician has profile image from Cloudinary
          const dieticianWithImage = {
            ...dieticianData,
            profileImage: dieticianData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(dieticianData.name || 'Dietician')}&background=10b981&color=ffffff&size=200`
          };
          setDietician(dieticianWithImage);
        } else {
          throw new Error('Failed to fetch dietician info');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (dieticianId) {
      fetchDietician();
    }
  }, [dieticianId, token]);

  // Fetch conversation history
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await fetch(`${CHAT_SERVICE_URL}/api/conversations/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const conversations = await response.json();
          const currentConversation = conversations.find(conv => 
            conv.participants.some(p => p._id === dieticianId)
          );
          
          if (currentConversation) {
            setConversationId(currentConversation._id);
            setMessages(currentConversation.messages.map(msg => ({
              id: msg._id,
              text: msg.message,
              sender: msg.senderId === user._id ? 'user' : 'dietician',
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
            })));
          }
        }
      } catch (err) {
        console.error('Failed to fetch conversation:', err);
      }
    };

    if (user && dieticianId) {
      fetchConversation();
    }
  }, [user, dieticianId, token]);

  const isDietician = useMemo(() => (user && (user.role === 2 || user.role === '2')), [user]);
  const chatPartnerId = useMemo(() => {
    // If dietician is logged in, partner is the patient (prefer explicit userId param, fallback to dieticianId param)
    if (isDietician) return patientIdParam || dieticianId;
    // If user (patient) is logged in, partner is the dietician from dieticianId param
    return dieticianId;
  }, [isDietician, patientIdParam, dieticianId]);

  // Fetch diet plans (for self if patient; for partner if dietician)
  useEffect(() => {
    const fetchDietPlans = async () => {
      try {
        const subjectUserId = isDietician ? chatPartnerId : user._id;
        if (!subjectUserId) return;
        const response = await fetch(`https://diet-service-latest.onrender.com/api/diet-plans/${subjectUserId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`https://diet-service-latest.onrender.com/api/diet-plans/${subjectUserId}`);
        console.log(response);
        if (response.ok) {
          const data = await response.json();
          const allPlans = (data.dietPlans || []).slice();
          allPlans.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          setDietPlans(allPlans.slice(0, 2));
        }
      } catch (error) {
        console.error('Failed to fetch diet plans:', error);
      }
    };

    if (token && (user || isDietician)) {
      fetchDietPlans();
    }
  }, [user, token, isDietician, chatPartnerId]);

  // Fetch user stats and activity
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        // Mock user stats - replace with actual API call
        setUserStats({
          totalMessages: messages.length,
          dietPlansGenerated: dietPlans.length,
          activeStreak: 7,
          goalsAchieved: 3,
          weeklyProgress: 85,
          monthlyProgress: 72
        });

        // Mock recent activity
        setRecentActivity([
          { id: 1, type: 'message', text: 'Sent message to dietician', time: '2 min ago', icon: MessageCircle },
          { id: 2, type: 'diet', text: 'Generated new diet plan', time: '1 hour ago', icon: Utensils },
          { id: 3, type: 'goal', text: 'Achieved weekly goal', time: '2 hours ago', icon: Target },
          { id: 4, type: 'progress', text: 'Updated progress', time: '1 day ago', icon: TrendingUp }
        ]);
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      }
    };

    fetchUserStats();
  }, [messages.length, dietPlans.length]);

  const handleSendMessage = () => {
    if (message.trim() && socket && dieticianId) {
      const messageData = {
        senderId: user._id,
        receiverId: dieticianId,
        message: message.trim(),
        messageType: 'text'
      };
      
      socket.emit('send-message', messageData);
      setMessage('');
      
      // Add to recent activity
      setRecentActivity(prev => [{
        id: Date.now(),
        type: 'message',
        text: 'Sent message to dietician',
        time: 'Just now',
        icon: MessageCircle
      }, ...prev.slice(0, 9)]);
    }
  };

  const handleSharePlan = async (plan) => {
    try {
      // 1) Mark as shared in diet-service
      await fetch(`${DIET_PLANNER_URL}/api/diet-plans/${plan._id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dieticianId })
      });

      // 2) Send structured message through chat-service
      if (socket && dieticianId) {
        const formatPlanMessage = (p) => {
          const header = `Diet Plan: ${p.planName || 'My Plan'}\nTotal: ${p.totalCalories || '—'}`;
          const prefs = p.preferences ? `\nPreferences: ${[p.preferences.dietPreference, (p.preferences.cuisine||[]).join(', '), (p.preferences.healthConditions||[]).join(', ')].filter(Boolean).join(' | ')}` : '';
          const mealsText = (p.meals || []).map(m => {
            const ing = Array.isArray(m.ingredients) ? m.ingredients.slice(0, 6).join(', ') + (m.ingredients.length > 6 ? '…' : '') : '';
            const meta = [m.calories ? `${m.calories} kcal` : null, m.readyInMinutes ? `${m.readyInMinutes} min` : null, m.servings ? `serves ${m.servings}` : null].filter(Boolean).join(' • ');
            return `\n- ${m.mealType}: ${m.recipe}${meta ? ` (${meta})` : ''}${ing ? `\n  ingredients: ${ing}` : ''}`;
          }).join('');
          return `${header}${prefs}\nMeals:${mealsText}`;
        };
        const fullText = formatPlanMessage(plan);
        const fullMeals = (plan.meals || []).map(m => ({
          mealType: m.mealType,
          recipe: m.recipe,
          calories: m.calories,
          ingredients: Array.isArray(m.ingredients) ? m.ingredients : [],
          spoonacularId: m.spoonacularId,
          image: m.image,
          readyInMinutes: m.readyInMinutes,
          servings: m.servings,
          nutrition: m.nutrition || null
        }));
        const messagePayload = {
          senderId: user._id,
          receiverId: dieticianId,
          message: fullText,
          messageType: 'plan',
          planId: plan._id,
          planName: plan.planName,
          totalCalories: plan.totalCalories,
          preferences: plan.preferences || {},
          meals: fullMeals
        };
        socket.emit('send-message', messagePayload);
      }

      setNotifications(prev => [{
        id: Date.now(),
        type: 'success',
        message: 'Diet plan sent to dietician',
        time: new Date(),
        read: false
      }, ...prev]);
    } catch (e) {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'error',
        message: 'Failed to share diet plan',
        time: new Date(),
        read: false
      }, ...prev]);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (socket && dieticianId) {
      socket.emit('typing', {
        receiverId: dieticianId,
        senderId: user._id,
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'info',
        message: `File "${file.name}" selected for upload`,
        time: new Date(),
        read: false
      }]);
    }
  };

  const handleSendAudio = async (audioBlob) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-message.webm');
      
      // Upload audio file to server (you'll need to implement this endpoint)
      const uploadResponse = await fetch(`${CHAT_SERVICE_URL}/api/upload/audio`, {
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
          senderId: user._id,
          receiverId: dieticianId,
          message: 'Voice message',
          messageType: 'audio',
          audioUrl: audioUrl,
          audioPublicId: audioPublicId,
          audioDuration: duration
        };
        
        socket.emit('send-message', messageData);
        
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'success',
          message: 'Voice message sent successfully!',
          time: new Date(),
          read: false
        }]);
      } else {
        throw new Error('Failed to upload audio');
      }
    } catch (error) {
      console.error('Error sending audio:', error);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Failed to send voice message',
        time: new Date(),
        read: false
      }]);
    }
  };

  const handleSendFile = async (file, fileType) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      
      // Upload file to server (you'll need to implement this endpoint)
      const uploadResponse = await fetch(`${CHAT_SERVICE_URL}/api/upload/file`, {
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
          senderId: user._id,
          receiverId: dieticianId,
          message: `Shared ${fileType}: ${fileName}`,
          messageType: 'file',
          fileName: fileName,
          fileSize: fileSize,
          fileType: fileType,
          fileUrl: fileUrl,
          filePublicId: filePublicId
        };
        
        socket.emit('send-message', messageData);
        
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'success',
          message: `File "${fileName}" sent successfully!`,
          time: new Date(),
          read: false
        }]);
      } else {
        throw new Error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error sending file:', error);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Failed to send file',
        time: new Date(),
        read: false
      }]);
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

  const generateDietPlan = async () => {
    try {
      const response = await fetch(`${MOOD_SERVICE_URL}/api/diet-planner/generate/${user._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedDietPlan(data.plan);
        
        // Refresh diet plans
        const plansResponse = await fetch(`${DIET_PLANNER_URL}/api/diet-plans/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (plansResponse.ok) {
          const plansData = await plansResponse.json();
          setDietPlans(plansData.dietPlans || []);
        }
        
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'success',
          message: 'New diet plan generated successfully!',
          time: new Date(),
          read: false
        }]);
      }
    } catch (error) {
      console.error('Failed to generate diet plan:', error);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Failed to generate diet plan',
        time: new Date(),
        read: false
      }]);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // WebRTC call handlers
  const handleStartVideoCall = () => {
    setWebRTCCallType('video');
    setShowWebRTCCall(true);
  };

  const handleStartAudioCall = () => {
    setWebRTCCallType('audio');
    setShowWebRTCCall(true);
  };

  const handleEndWebRTCCall = () => {
    setShowWebRTCCall(false);
    setWebRTCCallType('video');
  };

  // Accept/Reject incoming video calls
  const handleAcceptIncomingCall = async () => {
    if (!signalSocket || !incomingCall) return;
    signalSocket.emit('webrtc-call-response', {
      callerId: incomingCall.callerId,
      responderId: user._id,
      responderName: user.name,
      accepted: true,
      roomId: incomingCall.roomId
    });
    setShowCallRequest(false);
    setShowWebRTCCall(true);
  };

  const handleRejectIncomingCall = (reason = 'User declined') => {
    if (signalSocket && incomingCall) {
      signalSocket.emit('webrtc-call-response', {
        callerId: incomingCall.callerId,
        responderId: user._id,
        responderName: user.name,
        accepted: false,
        reason
      });
    }
    setShowCallRequest(false);
    setIncomingCall(null);
  };

  const emojis = ['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🎉', '🔥', '💯', '👏', '🍎', '🥗', '💪', '🏃‍♂️', '🧘‍♀️', '🎯', '⭐', '🌟', '✨', '🎊', '🎈', '🎁', '🎂', '🍰', '🥤', '☕', '🍵', '🥛', '🍌', '🍊', '🍇', '🍓', '🥑', '🥕', '🥒', '🥬', '🥦', '🍅', '🌶️', '🧄', '🧅', '🥔', '🍠', '🌽', '🥜', '🌰', '🍞', '🥖', '🥐', '🧀', '🥚', '🍳', '🥓', '🍖', '🍗', '🥩', '🌭', '🍔', '🍟', '🍕', '🌮', '🌯', '🥙', '🥗', '🍲', '🍜', '🍝', '🍛', '🍣', '🍱', '🍙', '🍚', '🍘', '🍥', '🥟', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🍾', '🥄', '🍴', '🥢', '🍽️', '🥣', '🥡', '🥧', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🍾', '🥄', '🍴', '🥢', '🍽️', '🥣', '🥡'];

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F10100] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/consult')}
            className="px-6 py-3 bg-[#F10100] text-white rounded-xl font-semibold hover:bg-[#FF4444] transition"
          >
            Back to Consult
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-16 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 h-[800px] flex overflow-hidden"
        >
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Enhanced Chat Header */}
            <div className="p-6 border-b border-gray-200/30 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate('/consult')}
                    className="p-2 rounded-xl hover:bg-white/20 transition-all duration-200"
                    title="Back to Consult"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    {dietician?.profileImage ? (
                      <img 
                        src={dietician.profileImage} 
                        alt={dietician.name}
                        className="w-12 h-12 rounded-2xl object-cover shadow-lg border-2 border-white/20"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${dietician?.profileImage ? 'hidden' : ''}`}
                    >
                      {dietician?.name?.charAt(0) || 'D'}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      isConnected ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{dietician?.name || 'Dietician'}</h3>
                    <p className="text-indigo-100 flex items-center gap-2">
                      {connectionStatus === 'connected' ? (
                        <Wifi className="w-4 h-4 text-green-400" />
                      ) : connectionStatus === 'connecting' ? (
                        <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-400" />
                      )}
                      {lastSeen || (isConnected ? 'Online' : 'Offline')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-3 rounded-xl hover:bg-white/20 transition-all duration-200 relative"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                        {notifications.filter(n => !n.read).length}
                      </div>
                    )}
                  </button>
                  <button 
                    onClick={handleStartAudioCall}
                    className="p-3 rounded-xl hover:bg-white/20 transition-all duration-200" 
                    title="Voice Call"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleStartVideoCall}
                    className="p-3 rounded-xl hover:bg-white/20 transition-all duration-200" 
                    title="Video Call"
                  >
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

            {/* Enhanced Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.sender === 'user'}
                    senderName={msg.sender === 'user' ? user?.name : dietician?.name}
                    senderAvatar={msg.sender === 'user' ? user?.profileImage : dietician?.profileImage}
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
                            {dietician?.profileImage ? (
                              <img 
                                src={dietician.profileImage} 
                                alt={dietician.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-full h-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold ${dietician?.profileImage ? 'hidden' : ''}`}
                            >
                              {dietician?.name?.charAt(0) || 'D'}
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

            {/* Enhanced Message Input */}
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
                  
                  {/* Enhanced Emoji Picker */}
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-14 right-0 bg-white rounded-xl shadow-lg border border-gray-200 p-3 z-10 max-h-60 overflow-y-auto"
                      >
                        <div className="grid grid-cols-8 gap-1">
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
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,application/pdf,.doc,.docx"
              />
            </div>
          </div>

          {/* Enhanced Side Panel */}
          <AnimatePresence>
            {showSidePanel && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 400, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-gray-200/30 bg-gradient-to-b from-gray-50/50 to-white overflow-hidden"
              >
                {/* Side Panel Header */}
                <div className="p-6 border-b border-gray-200/30 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">{isDietician ? 'Patient Dashboard' : 'Your Dashboard'}</h3>
                    <button
                      onClick={() => setShowSidePanel(false)}
                      className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Messages</span>
                      </div>
                      <div className="text-xl font-bold">{messages.length}</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Utensils className="w-4 h-4" />
                        <span className="text-sm font-medium">Plans</span>
                      </div>
                      <div className="text-xl font-bold">{dietPlans.length}</div>
                    </div>
                  </div>
                </div>

                {/* Side Panel Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Diet Plans Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                        <Utensils className="w-5 h-5 text-emerald-500" />
                        <span>{isDietician ? 'Patient Diet Plans' : 'Diet Plans'}</span>
                      </h4>
                      {!isDietician && (
                        <button
                          onClick={generateDietPlan}
                          className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                          title="Generate New Plan"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {dietPlans.length > 0 ? (
                      <div className="space-y-3">
                        {dietPlans.slice(0, 3).map((plan, index) => (
                          <motion.div
                            key={plan._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-200"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-800 text-sm">{plan.planName}</h5>
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 text-yellow-500" />
                                <span className="text-xs text-gray-600">Active</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-xs text-gray-600">
                                <Target className="w-3 h-3" />
                                <span>{plan.totalCalories}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-600">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <div className="mt-3">
                              <h6 className="font-medium text-gray-700 text-xs mb-2">Meals:</h6>
                              {plan.meals?.slice(0, 2).map((meal, mealIndex) => (
                                <div key={mealIndex} className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 mb-1">
                                  <div className="font-medium">{meal.mealType}</div>
                                  <div className="truncate">{meal.recipe}</div>
                                  <div className="text-emerald-600">{meal.calories} cal</div>
                                </div>
                              ))}
                              {plan.meals?.length > 2 && (
                                <div className="text-xs text-gray-500 text-center">
                                  +{plan.meals.length - 2} more meals
                                </div>
                              )}
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <button
                                onClick={() => handleSharePlan(plan)}
                                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
                              >
                                Send to Dietician
                              </button>
                              <button
                                onClick={() => {
                                  // Quick message preview
                                  if (socket && dieticianId) {
                                    const msg = {
                                      senderId: user._id,
                                      receiverId: dieticianId,
                                      message: `Requesting consultation on plan: ${plan.planName}`,
                                      messageType: 'text'
                                    };
                                    socket.emit('send-message', msg);
                                  }
                                }}
                                className="px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold"
                              >
                                Ask Feedback
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Utensils className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h5 className="font-medium text-gray-800 mb-2">No Diet Plans hehe</h5>
                        {!isDietician && (
                          <>
                            <p className="text-sm text-gray-600 mb-3">Generate your first personalized diet plan</p>
                            <button
                              onClick={generateDietPlan}
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl transition-all duration-200 text-sm"
                            >
                              Generate Plan
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* User Stats Section */}
                  {userStats && (
                    <div>
                      <h4 className="font-semibold text-gray-800 flex items-center space-x-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                        <span>Your Progress</span>
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Weekly Progress</span>
                            <span className="text-sm font-bold text-indigo-600">{userStats.weeklyProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${userStats.weeklyProgress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Monthly Progress</span>
                            <span className="text-sm font-bold text-emerald-600">{userStats.monthlyProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${userStats.monthlyProgress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 text-center">
                            <div className="text-2xl font-bold text-indigo-600">{userStats.activeStreak}</div>
                            <div className="text-xs text-gray-600">Day Streak</div>
                          </div>
                          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 text-center">
                            <div className="text-2xl font-bold text-emerald-600">{userStats.goalsAchieved}</div>
                            <div className="text-xs text-gray-600">Goals Met</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Activity */}
                  <div>
                    <h4 className="font-semibold text-gray-800 flex items-center space-x-2 mb-4">
                      <Clock3 className="w-5 h-5 text-purple-500" />
                      <span>Recent Activity</span>
                    </h4>
                    
                    <div className="space-y-2">
                      {recentActivity.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100"
                        >
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                            <activity.icon className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{activity.text}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notifications Panel */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-20 right-6 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50"
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    <button
                      onClick={clearAllNotifications}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? 'bg-indigo-50' : ''
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'error' ? 'bg-red-500' :
                            notification.type === 'success' ? 'bg-green-500' :
                            notification.type === 'info' ? 'bg-blue-500' : 'bg-indigo-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.time).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No notifications</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* WebRTC Call Component */}
          <WebRTCCall
            isOpen={showWebRTCCall}
            onClose={() => setShowWebRTCCall(false)}
            targetUser={{ id: dietician?._id, name: dietician?.name, profileImage: dietician?.profileImage }}
            callType={webRTCCallType}
            onCallEnd={handleEndWebRTCCall}
          />

          {/* Incoming Call Modal */}
          <AnimatePresence>
            {showCallRequest && incomingCall && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-200"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <Video className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Incoming {incomingCall.callType === 'audio' ? 'Audio' : 'Video'} Call</h3>
                    <p className="text-gray-600 mb-6">from {incomingCall.callerName}</p>
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={handleAcceptIncomingCall} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold">Accept</button>
                      <button onClick={() => handleRejectIncomingCall('User declined')} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold">Reject</button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Chat;
