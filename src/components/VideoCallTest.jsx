import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Phone, AlertCircle } from 'lucide-react';
import CallRequestModal from './CallRequestModal';
import { requestMediaPermissions } from '../utils/mediaPermissions';

const VideoCallTest = () => {
  const [showCallRequest, setShowCallRequest] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [testCaller, setTestCaller] = useState({
    callerId: 'test-caller-123',
    callerName: 'Dr. Sarah Johnson',
    callType: 'video',
    roomId: 'test-room-456'
  });

  const handleStartTestCall = async () => {
    try {
      setPermissionError(null);
      
      // Request camera and microphone permissions
      const permissionResult = await requestMediaPermissions('video');
      
      if (!permissionResult.success) {
        setPermissionError(permissionResult.error);
        return;
      }

      // Simulate incoming call
      setShowCallRequest(true);
    } catch (error) {
      console.error('Error starting test call:', error);
      setPermissionError('Failed to start test call. Please try again.');
    }
  };

  const handleAcceptCall = async () => {
    try {
      setPermissionError(null);
      
      // Request camera and microphone permissions
      const permissionResult = await requestMediaPermissions('video');
      
      if (!permissionResult.success) {
        setPermissionError(permissionResult.error);
        return;
      }

      console.log('Call accepted!');
      setShowCallRequest(false);
    } catch (error) {
      console.error('Error accepting call:', error);
      setPermissionError('Failed to accept call. Please try again.');
    }
  };

  const handleRejectCall = (reason) => {
    console.log('Call rejected:', reason);
    setShowCallRequest(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Video Call Test
          </h1>

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

          <div className="text-center space-y-6">
            <p className="text-gray-600">
              Test the video call functionality with camera and microphone permissions
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartTestCall}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center space-x-3 mx-auto"
            >
              <Video className="w-6 h-6" />
              <span>Test Video Call</span>
            </motion.button>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-3">Test Features:</h3>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li>✅ Camera and microphone permission requests</li>
                <li>✅ Call request modal with accept/reject</li>
                <li>✅ Permission error handling</li>
                <li>✅ WebRTC signaling integration</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Call Request Modal */}
      <CallRequestModal
        isOpen={showCallRequest}
        callerInfo={testCaller}
        callType="video"
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />
    </div>
  );
};

export default VideoCallTest;
