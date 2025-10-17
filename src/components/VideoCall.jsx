// File: /components/VideoCall.jsx
// LiveKit video call component for dietitian consultations

import '@livekit/components-styles';
import {
  LiveKitRoom,
  VideoConference,
  ControlBar,
} from '@livekit/components-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Settings, Users } from 'lucide-react';
import { getVideoCallAPIUrl, getLiveKitURL } from '../config/environment';

export default function VideoCall({ roomName, userName, userRole = 'user', onCallEnd }) {
  const [token, setToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState(0);

  useEffect(() => {
    const fetchToken = async () => {
      if (!roomName || !userName) return;
      
      setIsConnecting(true);
      setError(null);
      
      try {
        console.log('Fetching token for:', { roomName, userName, userRole });
        
        const response = await fetch(getVideoCallAPIUrl(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomName,
            participantName: userName,
            participantRole: userRole
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Network error' }));
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to get access token`);
        }

        const data = await response.json();
        console.log('Token response:', data);
        console.log('Token type:', typeof data.token);
        console.log('Token value:', data.token);
        
        if (typeof data.token === 'string' && data.token.length > 0) {
          setToken(data.token);
        } else {
          throw new Error('Invalid token received from server');
        }
      } catch (error) {
        console.error('Error fetching token:', error);
        setError(`Token generation failed: ${error.message}`);
      } finally {
        setIsConnecting(false);
      }
    };

    fetchToken();
  }, [roomName, userName, userRole]);

  const handleDisconnect = () => {
    setToken('');
    if (onCallEnd) {
      onCallEnd();
    }
  };

  // Loading state
  if (isConnecting) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Joining Consultation...</h2>
          <p className="text-gray-600">Please wait while we connect you</p>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-pink-100"
      >
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneOff className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  // No token yet
  if (!token) {
    return null;
  }

  console.log('Rendering LiveKitRoom with token:', token);
  console.log('Token type:', typeof token);
  console.log('Token length:', token ? token.length : 0);
  console.log('Server URL:', getLiveKitURL());

  return (
    <div className="h-screen w-screen bg-gray-900">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={getLiveKitURL()}
        data-lk-theme="default"
        style={{ height: '100vh' }}
        onDisconnected={(reason) => {
          console.log('Disconnected from room:', reason);
          handleDisconnect();
        }}
        onConnected={() => {
          console.log('Connected to room:', roomName);
          setError(null);
        }}
        onError={(error) => {
          console.error('LiveKit connection error:', error);
          setError(`Connection error: ${error.message || 'Unknown error'}`);
        }}
      >
        <div className="relative h-full">
          {/* Custom Video Conference Layout */}
          <VideoConference />
          
          {/* Custom Control Bar */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <ControlBar />
          </div>

          {/* Room Info */}
          <div className="absolute top-4 left-4 z-50">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {participants + 1} participant{participants !== 0 ? 's' : ''}
                </span>
              </div>
              <div className="text-xs text-gray-300 mt-1">
                Room: {roomName}
              </div>
            </div>
          </div>

          {/* End Call Button */}
          <div className="absolute top-4 right-4 z-50">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDisconnect}
              className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-colors"
            >
              <PhoneOff className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </LiveKitRoom>
    </div>
  );
}

