// File: /pages/VideoConsultation.jsx
// Video consultation page for dietitian sessions

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, Video, Users, Clock, ArrowLeft, User, Shield, AlertCircle } from 'lucide-react';
import WebRTCCall from '../components/WebRTCCall';
import CallRequestModal from '../components/CallRequestModal';
import { requestMediaPermissions } from '../utils/mediaPermissions';
import { io } from 'socket.io-client';

const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:5000';
const SIGNALING_SERVICE_URL = import.meta.env.VITE_SIGNALING_SERVICE_URL || 'http://localhost:3007';

const VideoConsultation = () => {
  const { roomId, userRole } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [consultationData, setConsultationData] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);
  const [showCallRequest, setShowCallRequest] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [socket, setSocket] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // 'idle', 'requesting', 'connecting', 'connected', 'error'
  const [callMessage, setCallMessage] = useState('');
  const [mediaStream, setMediaStream] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (roomId) {
      // In a real app, you would fetch consultation data from your backend
      setConsultationData({
        roomId,
        dieticianName: "Dr. Sarah Johnson",
        dieticianSpecialty: "Nutrition & Wellness",
        scheduledTime: new Date().toISOString(),
        duration: 30, // minutes
        status: "active"
      });
    }
  }, [roomId]);

  // Initialize socket connection for call signaling
  useEffect(() => {
    if (!user) return;

    const signalingSocket = io(SIGNALING_SERVICE_URL, {
      query: {
        userId: user._id,
        userName: user.name
      }
    });

    signalingSocket.on('connect', () => {
      console.log('Connected to signaling server');
      // Join the personal room so the server can find this user
      signalingSocket.emit('join-room', user._id);
    });

    // Listen for incoming call requests
    signalingSocket.on('webrtc-call-request', (data) => {
      console.log('Incoming call from:', data.callerName);
      setIncomingCall({
        callerId: data.callerId,
        callerName: data.callerName,
        callType: data.callType,
        roomId: data.roomId
      });
      setShowCallRequest(true);
    });

    // Listen for call responses
    signalingSocket.on('webrtc-call-response', (data) => {
      if (data.accepted) {
        console.log('Call accepted by:', data.responderName);
        setCallStatus('connected');
        setCallMessage('Call accepted! Starting video call...');
        setIsCallActive(true);
        setCallStartTime(new Date());
      } else {
        console.log('Call rejected by:', data.responderName);
        setCallStatus('error');
        setCallMessage(`Call rejected: ${data.reason || 'User declined'}`);
        setShowCallRequest(false);
        setIncomingCall(null);
      }
    });

    // Listen for call errors
    signalingSocket.on('webrtc-call-error', (data) => {
      console.log('Call error:', data.error);
      setCallStatus('error');
      setCallMessage(`Call failed: ${data.error}`);
    });

    setSocket(signalingSocket);

    return () => {
      signalingSocket.disconnect();
    };
  }, [user]);

  // When an incoming call arrives, fetch dietician profile for proper display
  useEffect(() => {
    const enrichCallerInfo = async () => {
      try {
        if (!incomingCall?.callerId) return;
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const resp = await fetch(`${USER_SERVICE_URL}/api/user/profile/${incomingCall.callerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resp.ok) {
          const profile = await resp.json();
          setIncomingCall(prev => prev ? ({ ...prev, callerName: profile.name || prev.callerName, callerImage: profile.profileImage || prev.callerImage }) : prev);
        }
      } catch (_) {
        // Best-effort only
      }
    };
    enrichCallerInfo();
  }, [incomingCall?.callerId]);

  const startCall = async () => {
    try {
      setPermissionError(null);
      setCallStatus('requesting');
      setCallMessage('Requesting camera and microphone permissions...');
      
      // Request camera and microphone permissions with better error handling
      console.log('🎥 Requesting media permissions...');
      const permissionResult = await requestMediaPermissions('video');
      
      if (!permissionResult.success) {
        console.error('❌ Permission denied:', permissionResult.error);
        setPermissionError(permissionResult.error);
        setCallStatus('error');
        setCallMessage(`Permission denied: ${permissionResult.error}`);
        return;
      }

      console.log('✅ Permissions granted, stream available:', !!permissionResult.stream);
      
      // Store the media stream for later use
      if (permissionResult.stream) {
        setMediaStream(permissionResult.stream);
      }
      
      setCallMessage('Permissions granted. Sending call request...');

      // For testing purposes, let's use a test dietician ID
      // In a real app, you would get this from the consultation data or URL params
      const testDieticianId = '68cd9c232f24476e904c5956'; // Replace with actual dietician ID
      // You can also use the roomId if it contains the dietician ID
      const targetDieticianId = roomId || testDieticianId;
      
      // Send call request to dietician
      if (socket) {
        console.log('📞 Sending call request to:', targetDieticianId);
        socket.emit('webrtc-call-request', {
          callerId: user._id,
          callerName: user.name,
          responderId: targetDieticianId, // Use target dietician ID
          callType: 'video',
          roomId: getRoomName()
        });
        
        setCallStatus('connecting');
        setCallMessage('Call request sent. Waiting for dietician response...');
        
        // Set a timeout for the call request
        setTimeout(() => {
          if (callStatus === 'connecting') {
            setCallStatus('error');
            setCallMessage('Call request timed out. The dietician may be offline.');
          }
        }, 30000); // 30 second timeout
        
      } else {
        console.error('❌ Socket not connected');
        setCallStatus('error');
        setCallMessage('Not connected to server. Please refresh and try again.');
      }
    } catch (error) {
      console.error('❌ Error starting call:', error);
      setPermissionError('Failed to start video call. Please try again.');
      setCallStatus('error');
      setCallMessage(`Failed to start video call: ${error.message}`);
    }
  };

  const endCall = () => {
    // Stop media stream if it exists
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Stopped track:', track.kind);
      });
      setMediaStream(null);
    }
    
    setIsCallActive(false);
    setCallStartTime(null);
    setShowCallRequest(false);
    setIncomingCall(null);
    setPermissionError(null);
    setCallStatus('idle');
    setCallMessage('');
    // In a real app, you would save call duration and notes
    navigate('/dashboard');
  };

  const handleAcceptCall = async () => {
    console.log('VideoConsultation: handleAcceptCall called');
    try {
      setPermissionError(null);
      
      // Request camera and microphone permissions
      console.log('VideoConsultation: Requesting media permissions...');
      const permissionResult = await requestMediaPermissions('video');
      
      if (!permissionResult.success) {
        console.log('VideoConsultation: Permission denied:', permissionResult.error);
        setPermissionError(permissionResult.error);
        return;
      }

      console.log('VideoConsultation: Permissions granted, preparing to accept call...');
      // Mount WebRTC UI first so its socket connects and joins personal room
      setShowCallRequest(false);
      setIsCallActive(true);
      setCallStartTime(new Date());
      // Emit accept slightly later to ensure WebRTCCall socket is connected
      setTimeout(() => {
        if (socket && incomingCall && user) {
          console.log('VideoConsultation: Emitting call response (accepted)');
          socket.emit('webrtc-call-response', {
            callerId: incomingCall.callerId,
            responderId: user._id,
            responderName: user.name,
            accepted: true,
            roomId: incomingCall.roomId
          });
        }
      }, 200);
    } catch (error) {
      console.error('Error accepting call:', error);
      setPermissionError('Failed to accept video call. Please try again.');
    }
  };

  const handleRejectCall = (reason) => {
    console.log('VideoConsultation: handleRejectCall called with reason:', reason);
    if (socket && incomingCall) {
      console.log('VideoConsultation: Emitting reject response...');
      socket.emit('webrtc-call-response', {
        callerId: incomingCall.callerId,
        responderId: user._id,
        responderName: user.name,
        accepted: false,
        reason: reason
      });
    }
    
    console.log('VideoConsultation: Closing call request modal...');
    setShowCallRequest(false);
    setIncomingCall(null);
  };

  const getRoomName = () => {
    return `consultation-${roomId}`;
  };

  const getUserName = () => {
    return user ? `${user.name || 'User'}` : 'Anonymous';
  };

  const getUserRole = () => {
    // Determine role based on user type or URL parameter
    if (userRole === 'dietician' || (user && user.role === 2)) {
      return 'dietician';
    }
    return 'user';
  };

  const testCameraAndMic = async () => {
    try {
      setPermissionError(null);
      setCallStatus('requesting');
      setCallMessage('Testing camera and microphone...');
      
      const permissionResult = await requestMediaPermissions('video');
      
      if (!permissionResult.success) {
        setPermissionError(permissionResult.error);
        setCallStatus('error');
        setCallMessage(`Test failed: ${permissionResult.error}`);
        return;
      }

      // Test successful
      setCallStatus('connected');
      setCallMessage('✅ Camera and microphone are working correctly!');
      
      // Store the stream for the actual call
      if (permissionResult.stream) {
        setMediaStream(permissionResult.stream);
      }
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setCallStatus('idle');
        setCallMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error testing camera:', error);
      setPermissionError('Failed to test camera and microphone.');
      setCallStatus('error');
      setCallMessage('Failed to test camera and microphone.');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isCallActive) {
    return (
      <WebRTCCall
        isOpen={isCallActive}
        onClose={endCall}
        targetUser={{
          id: incomingCall?.callerId || roomId || '',
          name: incomingCall?.callerName || consultationData?.dieticianName || 'Dietician',
          profileImage: null
        }}
        callType="video"
        onCallEnd={endCall}
      />
    );
  }

  return (
    <>
      {/* Call Request Modal */}
      <CallRequestModal
        isOpen={showCallRequest}
        callerInfo={incomingCall}
        callType="video"
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      >
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Video Consultation</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Consultation Info Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {consultationData?.dieticianName || 'Dr. Sarah Johnson'}
                </h2>
                <p className="text-gray-600">
                  {consultationData?.dieticianSpecialty || 'Nutrition & Wellness Specialist'}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{consultationData?.duration || 30} minutes</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>1-on-1 Session</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Ready to Start</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Room ID</p>
                <p className="font-mono text-lg font-semibold text-gray-900">{roomId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Your Role</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {getUserRole() === 'dietician' ? 'Dietician' : 'Patient'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Scheduled Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Session Type</p>
                <p className="text-lg font-semibold text-gray-900">Video Call</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pre-call Checklist */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Pre-call Checklist</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-700">Camera and microphone permissions granted</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-700">Stable internet connection verified</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-700">Audio and video devices working</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-700">Quiet environment prepared</span>
            </div>
          </div>
        </motion.div>

        {/* Permission Error Alert */}
        {permissionError && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-1">Permission Required</h4>
                <p className="text-red-800 text-sm">{permissionError}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Call Status Alert */}
        {callStatus !== 'idle' && callMessage && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`rounded-xl p-4 mb-6 border ${
              callStatus === 'error' ? 'bg-red-50 border-red-200' :
              callStatus === 'connected' ? 'bg-green-50 border-green-200' :
              callStatus === 'connecting' ? 'bg-yellow-50 border-yellow-200' :
              'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              {callStatus === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              ) : callStatus === 'connected' ? (
                <div className="w-5 h-5 bg-green-500 rounded-full mt-0.5"></div>
              ) : callStatus === 'connecting' ? (
                <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mt-0.5"></div>
              ) : (
                <div className="w-5 h-5 bg-blue-500 rounded-full mt-0.5"></div>
              )}
              <div>
                <h4 className={`font-semibold mb-1 ${
                  callStatus === 'error' ? 'text-red-900' :
                  callStatus === 'connected' ? 'text-green-900' :
                  callStatus === 'connecting' ? 'text-yellow-900' :
                  'text-blue-900'
                }`}>
                  {callStatus === 'error' ? 'Call Failed' :
                   callStatus === 'connected' ? 'Call Connected' :
                   callStatus === 'connecting' ? 'Connecting...' :
                   'Call Status'}
                </h4>
                <p className={`text-sm ${
                  callStatus === 'error' ? 'text-red-800' :
                  callStatus === 'connected' ? 'text-green-800' :
                  callStatus === 'connecting' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {callMessage}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Camera Test and Start Call Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-4"
        >
          {/* Test Camera Button */}
          <div>
            <motion.button
              whileHover={{ scale: callStatus === 'idle' ? 1.05 : 1 }}
              whileTap={{ scale: callStatus === 'idle' ? 0.95 : 1 }}
              onClick={testCameraAndMic}
              disabled={callStatus !== 'idle'}
              className={`px-8 py-3 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 flex items-center space-x-3 mx-auto mb-2 ${
                callStatus === 'idle' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl cursor-pointer' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Video className="w-5 h-5" />
              <span>Test Camera & Mic</span>
            </motion.button>
            <p className="text-gray-500 text-sm">
              Test your camera and microphone before starting the call
            </p>
          </div>

          {/* Start Call Button */}
          <div>
            <motion.button
              whileHover={{ scale: callStatus === 'idle' ? 1.05 : 1 }}
              whileTap={{ scale: callStatus === 'idle' ? 0.95 : 1 }}
              onClick={startCall}
              disabled={callStatus !== 'idle'}
              className={`px-12 py-4 rounded-2xl font-bold text-xl shadow-2xl transition-all duration-300 flex items-center space-x-3 mx-auto ${
                callStatus === 'idle' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-3xl cursor-pointer' 
                  : callStatus === 'connecting' || callStatus === 'requesting'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white cursor-wait'
                  : callStatus === 'connected'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-default'
                  : 'bg-gradient-to-r from-red-500 to-pink-500 text-white cursor-pointer'
              }`}
            >
              {callStatus === 'connecting' || callStatus === 'requesting' ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>
                    {callStatus === 'requesting' ? 'Requesting Permissions...' : 'Connecting...'}
                  </span>
                </>
              ) : callStatus === 'connected' ? (
                <>
                  <div className="w-6 h-6 bg-white rounded-full"></div>
                  <span>Call Connected</span>
                </>
              ) : callStatus === 'error' ? (
                <>
                  <AlertCircle className="w-6 h-6" />
                  <span>Try Again</span>
                </>
              ) : (
                <>
                  <Video className="w-6 h-6" />
                  <span>Start Video Call</span>
                </>
              )}
            </motion.button>
            
            <p className="text-gray-600 mt-4">
              Click to request camera and microphone access, then join the consultation room
            </p>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Secure & Private</h4>
              <p className="text-blue-800 text-sm">
                Your consultation is encrypted and secure. All video and audio data is protected 
                and will not be recorded without your explicit consent.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
    </>
  );
};

export default VideoConsultation;
