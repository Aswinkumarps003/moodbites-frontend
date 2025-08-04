import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Loader, Mail } from "lucide-react";
import axios from "axios";

const API_URL = 'http://localhost:5000/api/user';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/verify-email/${token}`);
        
        setStatus('success');
        setMessage(response.data.message);
        setUser(response.data.user);
        
        // Store user data and token for automatic login
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Dispatch login event to update navbar
        window.dispatchEvent(new Event('moodbites-login'));
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
        
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const getStatusContent = () => {
    switch (status) {
      case 'verifying':
        return {
          icon: <Loader className="w-12 h-12 animate-spin text-[#F10100]" />,
          title: 'Verifying your email...',
          message: 'Please wait while we verify your email address.',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          title: 'Email Verified Successfully!',
          message: message,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700'
        };
      case 'error':
        return {
          icon: <XCircle className="w-12 h-12 text-red-500" />,
          title: 'Verification Failed',
          message: message,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700'
        };
      default:
        return {
          icon: <Mail className="w-12 h-12 text-gray-500" />,
          title: 'Email Verification',
          message: 'Processing your verification request...',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700'
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mx-auto w-16 h-16 bg-gradient-to-r from-[#F10100] to-[#FFD122] rounded-2xl flex items-center justify-center shadow-lg mb-6"
          >
            <span className="text-2xl">🍽️</span>
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 font-display">
            Email Verification
          </h2>
          <p className="mt-2 text-gray-600">
            Completing your account setup
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`bg-white rounded-2xl shadow-xl p-8 border ${content.borderColor}`}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mb-6"
            >
              {content.icon}
            </motion.div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-4 font-display">
              {content.title}
            </h3>
            
            <p className={`text-sm ${content.textColor} mb-6`}>
              {content.message}
            </p>

            {status === 'success' && user && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
              >
                <p className="text-sm text-green-700">
                  Welcome, <span className="font-semibold">{user.name}</span>! 
                  You're now part of the MoodBites community.
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Redirecting to your dashboard...
                </p>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full bg-gradient-to-r from-[#F10100] to-[#FFD122] text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Try Signing Up Again
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full border border-[#F10100] text-[#F10100] py-3 px-4 rounded-xl font-semibold hover:bg-[#F10100] hover:text-white transition-all duration-200"
                >
                  Go to Login
                </button>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Redirecting to dashboard...</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail; 