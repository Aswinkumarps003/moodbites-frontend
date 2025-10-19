import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Maximize2, 
  Minimize2,
  Settings,
  Users,
  MessageCircle,
  X
} from 'lucide-react';
import useWebRTC from '../hooks/useWebRTC';
import { io } from 'socket.io-client';

const WebRTCCall = ({ 
  isOpen, 
  onClose, 
  targetUser, 
  callType = 'video', // 'video' or 'audio'
  onCallEnd,
  autoStart = false
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [callerInfo, setCallerInfo] = useState(null);
  const [remoteVideoActive, setRemoteVideoActive] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const signalingSocketRef = useRef(null);
  const [signalSocket, setSignalSocket] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Initialize signaling socket
  useEffect(() => {
    if (!isOpen) return;

    const signalingSocket = io('VITE_WEBRTC_SERVICE_URL', {
      query: {
        userId: user._id,
        userName: user.name
      }
    });

    signalingSocket.on('connect', () => {
      console.log('Connected to WebRTC signaling server');
      // Join personal room so this socket can receive directed offers
      try {
        const me = JSON.parse(localStorage.getItem('user') || '{}');
        if (me && me._id) {
          signalingSocket.emit('join-room', me._id);
        }
      } catch (_) {}
    });

    signalingSocket.on('webrtc-call-request', (data) => {
      console.log('Incoming call from:', data.callerName);
      setIsIncomingCall(true);
      setCallerInfo({
        id: data.callerId,
        name: data.callerName,
        type: data.callType
      });
    });

    signalingSocket.on('webrtc-call-response', (data) => {
      if (data.accepted) {
        console.log('Call accepted by:', data.responderName);
        // Start the call
        startWebRTCCall(data.responderId);
      } else {
        console.log('Call rejected by:', data.responderName);
        onClose();
      }
    });

    signalingSocketRef.current = signalingSocket;
    setSignalSocket(signalingSocket);

    return () => {
      signalingSocket.close();
    };
  }, [isOpen, onClose]);

  // WebRTC hook
  const {
    isConnected,
    isCallActive,
    isVideoEnabled,
    isAudioEnabled,
    connectionState,
    startCall,
    answerCall,
    endCall,
    toggleVideo,
    toggleAudio,
    sendP2PMessage
  } = useWebRTC(signalSocket, localVideoRef, remoteVideoRef, { initialVideo: callType === 'video', initialAudio: true });

  // Auto start outgoing call when requested (caller side)
  useEffect(() => {
    if (!isOpen) return;
    if (autoStart && !isIncomingCall) {
      if (!targetUser?.id) {
        console.warn('WebRTCCall: autoStart requested but target user id is missing');
        return;
      }
      // Defer one tick to ensure socket and refs are ready
      const t = setTimeout(() => {
        // Directly start WebRTC offer as caller
        startWebRTCCall(targetUser.id);
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isOpen, autoStart, isIncomingCall, targetUser]);

  // Track remote video playback state to support audio-only UI gracefully
  useEffect(() => {
    const videoEl = remoteVideoRef.current;
    if (!videoEl) return;
    const handlePlaying = () => setRemoteVideoActive(true);
    const handlePause = () => setRemoteVideoActive(false);
    const handleEmptied = () => setRemoteVideoActive(false);
    videoEl.addEventListener('playing', handlePlaying);
    videoEl.addEventListener('pause', handlePause);
    videoEl.addEventListener('emptied', handleEmptied);
    return () => {
      videoEl.removeEventListener('playing', handlePlaying);
      videoEl.removeEventListener('pause', handlePause);
      videoEl.removeEventListener('emptied', handleEmptied);
    };
  }, [remoteVideoRef]);

  // Call duration timer
  useEffect(() => {
    let interval;
    if (isCallActive && isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive, isConnected]);

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start outgoing call
  const startOutgoingCall = () => {
    if (!targetUser || !targetUser.id) {
      console.warn('WebRTCCall: Missing target user id for outgoing call');
      return;
    }
    if (signalingSocketRef.current) {
      signalingSocketRef.current.emit('webrtc-call-request', {
        targetUserId: targetUser.id,
        responderId: targetUser.id, // for compatibility with server expectation
        callType: callType
      });
    }
  };

  // Start WebRTC call
  const startWebRTCCall = (targetUserId) => {
    startCall(targetUserId);
  };

  // Answer incoming call
  const answerIncomingCall = () => {
    if (callerInfo) {
      answerCall(null, callerInfo.id);
      setIsIncomingCall(false);
    }
  };

  // Reject incoming call
  const rejectIncomingCall = () => {
    if (signalingSocketRef.current && callerInfo) {
      signalingSocketRef.current.emit('webrtc-call-response', {
        callerId: callerInfo.id,
        accepted: false,
        reason: 'User rejected the call'
      });
    }
    setIsIncomingCall(false);
    setCallerInfo(null);
    onClose();
  };

  // End call
  const handleEndCall = () => {
    endCall();
    setCallDuration(0);
    onClose();
    if (onCallEnd) {
      onCallEnd();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        {/* Decorative background accents */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`${
            isMinimized ? 'w-80 h-60' : 'w-full h-full max-w-6xl max-h-[90vh]'
          }`}
        >
          {/* Gradient border wrapper */}
          <div className="p-[1px] rounded-2xl bg-gradient-to-br from-white/20 via-purple-400/20 to-blue-400/20">
            <div className="bg-gray-900 rounded-[15px] shadow-2xl overflow-hidden">
          {/* Call Header */}
          <div className="bg-gray-800/80 backdrop-blur-sm p-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {targetUser?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  {isIncomingCall ? callerInfo?.name : targetUser?.name || 'Unknown User'}
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${isConnected ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-200' }`}>
                    {isConnected ? 'Connected' : (isIncomingCall ? 'Incoming...' : 'Connecting...')}
                  </span>
                  {isConnected && (
                    <span className="text-gray-300">{formatDuration(callDuration)}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Call Content */}
          <div className="flex-1 flex">
            {/* Video Area */}
            <div className="flex-1 relative bg-gray-900">
              {/* Remote Video */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{ display: isConnected && remoteVideoActive ? 'block' : 'none' }}
              />
              
              {/* Local Video */}
              <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800/70 backdrop-blur rounded-lg overflow-hidden border border-white/10 shadow-lg">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Call Status Overlay */}
              {/* Audio-only / connecting overlays */}
              {(!isConnected || !remoteVideoActive) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl">
                      {isIncomingCall ? (
                        <Phone className="w-10 h-10" />
                      ) : (
                        <Video className="w-10 h-10" />
                      )}
                    </div>
                    <h3 className="text-2xl font-semibold mb-1">
                      {isIncomingCall ? 'Incoming Call' : (remoteVideoActive ? 'Connecting...' : 'Audio Only')}
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {isIncomingCall ? `from ${callerInfo?.name}` : `with ${targetUser?.name}`}
                    </p>
                    {/* Equalizer for audio-only */}
                    {isConnected && !remoteVideoActive && (
                      <div className="flex items-end justify-center gap-1 h-6">
                        <span className="w-1.5 bg-white/80 rounded-sm animate-[equalize_1s_ease-in-out_infinite]" style={{ height: '50%' }} />
                        <span className="w-1.5 bg-white/60 rounded-sm animate-[equalize_1s_ease-in-out_infinite]" style={{ height: '85%', animationDelay: '0.15s' }} />
                        <span className="w-1.5 bg-white/70 rounded-sm animate-[equalize_1s_ease-in-out_infinite]" style={{ height: '65%', animationDelay: '0.3s' }} />
                        <span className="w-1.5 bg-white/50 rounded-sm animate-[equalize_1s_ease-in-out_infinite]" style={{ height: '90%', animationDelay: '0.45s' }} />
                        <span className="w-1.5 bg-white/75 rounded-sm animate-[equalize_1s_ease-in-out_infinite]" style={{ height: '55%', animationDelay: '0.6s' }} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Controls Panel */}
            <div className="w-80 bg-gray-800/80 backdrop-blur-sm p-6 flex flex-col border-l border-white/10">
              {/* Call Controls */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="space-y-4">
                  {/* Video Toggle */}
                  <button
                    onClick={toggleVideo}
                    className={`w-full p-4 rounded-xl flex items-center justify-center space-x-3 transition-all shadow ${
                      isVideoEnabled 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    <span>{isVideoEnabled ? 'Video On' : 'Video Off'}</span>
                  </button>

                  {/* Audio Toggle */}
                  <button
                    onClick={toggleAudio}
                    className={`w-full p-4 rounded-xl flex items-center justify-center space-x-3 transition-all shadow ${
                      isAudioEnabled 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    <span>{isAudioEnabled ? 'Audio On' : 'Audio Off'}</span>
                  </button>

                  {/* End Call */}
                  <button
                    onClick={handleEndCall}
                    className="w-full p-4 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center space-x-3 transition-all shadow"
                  >
                    <PhoneOff className="w-6 h-6" />
                    <span>End Call</span>
                  </button>
                </div>
              </div>

              {/* Incoming Call Actions */}
              {isIncomingCall && (
                <div className="space-y-3">
                  <button
                    onClick={answerIncomingCall}
                    className="w-full p-4 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center space-x-3 transition-all shadow"
                  >
                    <Phone className="w-6 h-6" />
                    <span>Answer</span>
                  </button>
                  <button
                    onClick={rejectIncomingCall}
                    className="w-full p-4 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center space-x-3 transition-all shadow"
                  >
                    <PhoneOff className="w-6 h-6" />
                    <span>Reject</span>
                  </button>
                </div>
              )}

              {/* Start Call Button (for outgoing calls) */}
              {!isIncomingCall && !isCallActive && (
                <button
                  onClick={startOutgoingCall}
                  className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center space-x-3 transition-all shadow"
                >
                  <Phone className="w-6 h-6" />
                  <span>Start Call</span>
                </button>
              )}
            </div>
          </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WebRTCCall;
