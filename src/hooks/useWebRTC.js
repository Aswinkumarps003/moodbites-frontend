import { useState, useEffect, useRef, useCallback } from 'react';

const useWebRTC = (socket, localVideoRef, remoteVideoRef, options = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(options.initialVideo !== undefined ? options.initialVideo : true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(options.initialAudio !== undefined ? options.initialAudio : true);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [dataChannel, setDataChannel] = useState(null);
  const [p2pMessages, setP2pMessages] = useState([]);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const dataChannelRef = useRef(null);

  // WebRTC configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };

  // Initialize local media stream (with reuse and safe retry)
  const initializeLocalStream = useCallback(async () => {
    // Reuse existing active stream if available
    if (localStreamRef.current) {
      const hasActiveTrack = localStreamRef.current.getTracks().some(t => t.readyState === 'live');
      if (hasActiveTrack) {
        if (localVideoRef.current && !localVideoRef.current.srcObject) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
        return localStreamRef.current;
      }
    }

    const constraints = {
      video: isVideoEnabled ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      audio: isAudioEnabled
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      // Graceful fallback: if camera missing, try audio-only and disable video
      if (error && (error.name === 'NotFoundError' || error.name === 'OverconstrainedError')) {
        try {
          const audioOnly = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          setIsVideoEnabled(false);
          setIsAudioEnabled(true);
          localStreamRef.current = audioOnly;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = audioOnly;
          }
          return audioOnly;
        } catch (fallbackErr) {
          console.error('Audio-only fallback failed:', fallbackErr);
        }
      }
      // Handle device-in-use by retrying once after releasing any stale tracks
      if (error && (error.name === 'NotReadableError' || error.message?.includes('Device in use'))) {
        try {
          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => {
              try { t.stop(); } catch (_) {}
            });
            localStreamRef.current = null;
          }
          if (localVideoRef.current && localVideoRef.current.srcObject) {
            localVideoRef.current.srcObject = null;
          }
          // Small delay to allow driver to release device
          await new Promise(r => setTimeout(r, 200));
          const retryStream = await navigator.mediaDevices.getUserMedia(constraints);
          localStreamRef.current = retryStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = retryStream;
          }
          return retryStream;
        } catch (retryError) {
          console.error('Retry getUserMedia failed:', retryError);
          throw retryError;
        }
      }
      throw error;
    }
  }, [isVideoEnabled, isAudioEnabled, localVideoRef]);

  // Create peer connection
  const createPeerConnection = useCallback(() => {
    const peerConnection = new RTCPeerConnection(rtcConfig);
    
    // Add local stream to peer connection (attach later if not ready)
    const attachLocalTracks = () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          try {
            peerConnection.addTrack(track, localStreamRef.current);
          } catch (_) {}
        });
      }
    };
    attachLocalTracks();

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote stream');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc-ice-candidate', {
          candidate: event.candidate,
          targetUserId: socket.targetUserId
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      setConnectionState(peerConnection.connectionState);
      setIsConnected(peerConnection.connectionState === 'connected');
    };

    // Create data channel for P2P messaging
    const dataChannel = peerConnection.createDataChannel('chat', {
      ordered: true
    });

    dataChannel.onopen = () => {
      console.log('Data channel opened');
      setDataChannel(dataChannel);
      setDataChannel(dataChannel);
    };

    dataChannel.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setP2pMessages(prev => [...prev, {
        ...message,
        id: Date.now() + Math.random(),
        timestamp: new Date()
      }]);
    };

    dataChannelRef.current = dataChannel;
    peerConnectionRef.current = peerConnection;

    return peerConnection;
  }, [socket, remoteVideoRef]);

  // Start a call
  const startCall = useCallback(async (targetUserId) => {
    try {
      setIsCallActive(true);
      if (socket) socket.targetUserId = targetUserId;

      // Initialize local stream first (reuse if exists)
      await initializeLocalStream();

      // Create peer connection and ensure tracks are attached
      const peerConnection = createPeerConnection();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          try {
            peerConnection.addTrack(track, localStreamRef.current);
          } catch (_) {}
        });
      }

      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Send offer through signaling server
      if (socket) {
        socket.emit('webrtc-offer', {
          offer,
          targetUserId
        });
      }

      console.log('Call initiated');
    } catch (error) {
      console.error('Error starting call:', error);
      setIsCallActive(false);
    }
  }, [initializeLocalStream, createPeerConnection, socket]);

  // Answer a call
  const answerCall = useCallback(async (offer, targetUserId) => {
    try {
      setIsCallActive(true);
      if (socket) socket.targetUserId = targetUserId;

      // Initialize local stream first (reuse if exists)
      await initializeLocalStream();

      // Create peer connection and ensure tracks are attached
      const peerConnection = createPeerConnection();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          try {
            peerConnection.addTrack(track, localStreamRef.current);
          } catch (_) {}
        });
      }

      // Set remote description
      await peerConnection.setRemoteDescription(offer);

      // Create answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Send answer through signaling server
      if (socket) {
        socket.emit('webrtc-answer', {
          answer,
          targetUserId
        });
      }

      console.log('Call answered');
    } catch (error) {
      console.error('Error answering call:', error);
      setIsCallActive(false);
    }
  }, [initializeLocalStream, createPeerConnection, socket]);

  // End call
  const endCall = useCallback(() => {
    setIsCallActive(false);
    setIsConnected(false);
    setConnectionState('disconnected');

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
      setDataChannel(null);
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Notify other party
    if (socket) {
      socket.emit('webrtc-end-call', {
        targetUserId: socket.targetUserId
      });
    }

    console.log('Call ended');
  }, [socket, localVideoRef, remoteVideoRef]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  // Send P2P message
  const sendP2PMessage = useCallback((message) => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      const messageData = {
        text: message,
        sender: 'local',
        timestamp: new Date().toISOString()
      };
      
      dataChannelRef.current.send(JSON.stringify(messageData));
      
      // Add to local messages
      setP2pMessages(prev => [...prev, {
        ...messageData,
        id: Date.now() + Math.random()
      }]);
    }
  }, []);

  // Handle incoming WebRTC messages
  useEffect(() => {
    if (!socket) return;

    const handleOffer = async (data) => {
      console.log('Received offer:', data);
      await answerCall(data.offer, data.senderId);
    };

    const handleAnswer = async (data) => {
      console.log('Received answer:', data);
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(data.answer);
      }
    };

    const handleIceCandidate = async (data) => {
      console.log('Received ICE candidate:', data);
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(data.candidate);
      }
    };

    const handleEndCall = () => {
      console.log('Call ended by remote party');
      endCall();
    };

    const handleDataChannel = (event) => {
      console.log('Received data channel');
      const dataChannel = event.channel;
      
      dataChannel.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setP2pMessages(prev => [...prev, {
          ...message,
          id: Date.now() + Math.random(),
          timestamp: new Date()
        }]);
      };
      
      setDataChannel(dataChannel);
      dataChannelRef.current = dataChannel;
    };

    // Listen for data channel on peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ondatachannel = handleDataChannel;
    }

    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);
    socket.on('webrtc-end-call', handleEndCall);

    return () => {
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-ice-candidate', handleIceCandidate);
      socket.off('webrtc-end-call', handleEndCall);
    };
  }, [socket, answerCall, endCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    // State
    isConnected,
    isCallActive,
    isVideoEnabled,
    isAudioEnabled,
    connectionState,
    dataChannel,
    p2pMessages,
    
    // Actions
    startCall,
    answerCall,
    endCall,
    toggleVideo,
    toggleAudio,
    sendP2PMessage,
    
    // Utils
    initializeLocalStream
  };
};

export default useWebRTC;
