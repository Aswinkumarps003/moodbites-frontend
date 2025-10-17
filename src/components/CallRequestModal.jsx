import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video, Mic, User, Clock } from 'lucide-react';

const CallRequestModal = ({ 
  isOpen, 
  callerInfo, 
  callType = 'video',
  onAccept, 
  onReject,
  onTimeout = 30000 // 30 seconds timeout
}) => {
  const [timeLeft, setTimeLeft] = useState(Math.floor(onTimeout / 1000));
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onReject('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onReject]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(Math.floor(onTimeout / 1000));
      setIsAccepting(false);
      setIsRejecting(false);
    }
  }, [isOpen, onTimeout]);

  const handleAccept = async () => {
    console.log('CallRequestModal: Accept button clicked');
    setIsAccepting(true);
    try {
      await onAccept();
      console.log('CallRequestModal: Accept handler completed');
    } catch (error) {
      console.error('Error accepting call:', error);
      setIsAccepting(false);
    }
  };

  const handleReject = () => {
    console.log('CallRequestModal: Reject button clicked');
    setIsRejecting(true);
    onReject('user_rejected');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          // Prevent backdrop clicks from closing modal
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => {
            // Prevent modal content clicks from bubbling to backdrop
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {/* Header with pulsing animation */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                {callType === 'video' ? (
                  <Video className="w-10 h-10 text-white" />
                ) : (
                  <Phone className="w-10 h-10 text-white" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Incoming Call</h2>
              <p className="text-white/90">from {callerInfo?.name || 'Unknown'}</p>
            </div>
          </div>

          {/* Caller Info */}
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {callerInfo?.name || 'Unknown Caller'}
            </h3>
            <p className="text-gray-600 mb-4">
              {callType === 'video' ? 'Video Call' : 'Audio Call'}
            </p>
            
            {/* Timer */}
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-6">
              <Clock className="w-4 h-4" />
              <span>Call expires in {timeLeft}s</span>
            </div>

            {/* Call Type Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  {callType === 'video' ? (
                    <Video className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Phone className="w-4 h-4 text-blue-500" />
                  )}
                  <span>{callType === 'video' ? 'Video' : 'Audio'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mic className="w-4 h-4 text-green-500" />
                  <span>Audio</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50">
            <div className="flex space-x-4">
              {/* Reject Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  console.log('Reject button clicked, event:', e);
                  e.preventDefault();
                  e.stopPropagation();
                  handleReject();
                }}
                disabled={isRejecting || isAccepting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                <PhoneOff className="w-5 h-5" />
                <span>{isRejecting ? 'Rejecting...' : 'Reject'}</span>
              </motion.button>

              {/* Accept Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  console.log('Accept button clicked, event:', e);
                  e.preventDefault();
                  e.stopPropagation();
                  handleAccept();
                }}
                disabled={isAccepting || isRejecting}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                <Phone className="w-5 h-5" />
                <span>{isAccepting ? 'Accepting...' : 'Accept'}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CallRequestModal;
