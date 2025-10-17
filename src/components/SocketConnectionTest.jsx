import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { io } from 'socket.io-client';

const SocketConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [socket, setSocket] = useState(null);
  const [logs, setLogs] = useState([]);
  const [user, setUser] = useState(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  useEffect(() => {
    // Get user data
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    
    if (userData) {
      setUser(JSON.parse(userData));
    }

    if (!token) {
      addLog('No auth token found', 'error');
      return;
    }

    addLog('Connecting to WebRTC signaling server...', 'info');
    setConnectionStatus('connecting');

    const signalingSocket = io('http://localhost:3007', {
      auth: { token }
    });

    signalingSocket.on('connect', () => {
      addLog('✅ Connected to signaling server', 'success');
      setConnectionStatus('connected');
      
      // Join room
      if (user) {
        signalingSocket.emit('join-room', user._id);
        addLog(`🏠 Joined room: ${user._id}`, 'info');
      }
    });

    signalingSocket.on('connect_error', (error) => {
      addLog(`❌ Connection error: ${error.message}`, 'error');
      setConnectionStatus('error');
    });

    signalingSocket.on('disconnect', (reason) => {
      addLog(`🔌 Disconnected: ${reason}`, 'warning');
      setConnectionStatus('disconnected');
    });

    signalingSocket.on('webrtc-call-request', (data) => {
      addLog(`📞 Incoming call from: ${data.callerName}`, 'info');
    });

    signalingSocket.on('webrtc-call-response', (data) => {
      addLog(`📞 Call response: ${data.accepted ? 'accepted' : 'rejected'}`, 'info');
    });

    setSocket(signalingSocket);

    return () => {
      signalingSocket.disconnect();
    };
  }, [user]);

  const testCallRequest = () => {
    if (!socket || !user) {
      addLog('❌ Socket not connected or user not found', 'error');
      return;
    }

    addLog('📞 Sending test call request...', 'info');
    socket.emit('webrtc-call-request', {
      callerId: user._id,
      callerName: user.name,
      responderId: 'test-responder-123',
      callType: 'video',
      roomId: 'test-room-456'
    });
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'connecting':
        return <Wifi className="w-6 h-6 text-yellow-500 animate-pulse" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <WifiOff className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'connecting':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Socket Connection Test
          </h1>

          {/* Connection Status */}
          <div className={`rounded-xl p-4 mb-6 border ${getStatusColor()}`}>
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <h3 className="font-semibold">Connection Status</h3>
                <p className="text-sm capitalize">{connectionStatus}</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">User Information</h3>
              <div className="text-sm text-blue-800">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>ID:</strong> {user._id}</p>
                <p><strong>Role:</strong> {user.role === 2 ? 'Dietician' : 'User'}</p>
              </div>
            </div>
          )}

          {/* Test Button */}
          <div className="text-center mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={testCallRequest}
              disabled={connectionStatus !== 'connected'}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Call Request
            </motion.button>
          </div>

          {/* Logs */}
          <div className="bg-gray-900 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Connection Logs
            </h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`text-sm font-mono p-2 rounded ${
                    log.type === 'error' ? 'bg-red-900/50 text-red-300' :
                    log.type === 'success' ? 'bg-green-900/50 text-green-300' :
                    log.type === 'warning' ? 'bg-yellow-900/50 text-yellow-300' :
                    'bg-gray-800/50 text-gray-300'
                  }`}
                >
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SocketConnectionTest;




