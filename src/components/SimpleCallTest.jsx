import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, AlertCircle } from 'lucide-react';
import CallRequestModal from './CallRequestModal';
import { requestMediaPermissions } from '../utils/mediaPermissions';

const SimpleCallTest = () => {
  const [showCallRequest, setShowCallRequest] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callRejected, setCallRejected] = useState(false);

  const testCaller = {
    callerId: 'test-caller-123',
    callerName: 'Dr. Sarah Johnson',
    callType: 'video',
    roomId: 'test-room-456'
  };

  const handleStartTestCall = async () => {
    console.log('SimpleCallTest: Starting test call...');
    try {
      setPermissionError(null);
      setCallAccepted(false);
      setCallRejected(false);
      
      // Request camera and microphone permissions
      console.log('SimpleCallTest: Requesting media permissions...');
      const permissionResult = await requestMediaPermissions('video');
      
      if (!permissionResult.success) {
        console.log('SimpleCallTest: Permission denied:', permissionResult.error);
        setPermissionError(permissionResult.error);
        return;
      }

      console.log('SimpleCallTest: Permissions granted, showing call request...');
      // Simulate incoming call
      setShowCallRequest(true);
    } catch (error) {
      console.error('Error starting test call:', error);
      setPermissionError('Failed to start test call. Please try again.');
    }
  };

  const handleAcceptCall = async () => {
    console.log('SimpleCallTest: Accept button clicked in modal');
    try {
      setPermissionError(null);
      
      // Request camera and microphone permissions again
      console.log('SimpleCallTest: Requesting media permissions for accept...');
      const permissionResult = await requestMediaPermissions('video');
      
      if (!permissionResult.success) {
        console.log('SimpleCallTest: Permission denied on accept:', permissionResult.error);
        setPermissionError(permissionResult.error);
        return;
      }

      console.log('SimpleCallTest: Call accepted successfully!');
      setShowCallRequest(false);
      setCallAccepted(true);
    } catch (error) {
      console.error('Error accepting call:', error);
      setPermissionError('Failed to accept call. Please try again.');
    }
  };

  const handleRejectCall = (reason) => {
    console.log('SimpleCallTest: Reject button clicked in modal, reason:', reason);
    setShowCallRequest(false);
    setCallRejected(true);
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
            Simple Call Test
          </h1>

          {/* Status Messages */}
          {callAccepted && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                <p className="text-green-800 font-semibold">Call Accepted Successfully!</p>
              </div>
            </motion.div>
          )}

          {callRejected && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-red-500 rounded-full"></div>
                <p className="text-red-800 font-semibold">Call Rejected</p>
              </div>
            </motion.div>
          )}

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
              Test the call request modal functionality
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartTestCall}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center space-x-3 mx-auto"
            >
              <Video className="w-6 h-6" />
              <span>Test Call Request Modal</span>
            </motion.button>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-3">Test Steps:</h3>
              <ol className="text-sm text-gray-600 space-y-2 text-left list-decimal list-inside">
                <li>Click "Test Call Request Modal"</li>
                <li>Allow camera and microphone permissions</li>
                <li>Modal should appear with accept/reject buttons</li>
                <li>Click Accept or Reject to test functionality</li>
                <li>Check console for debug messages</li>
              </ol>
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

export default SimpleCallTest;
