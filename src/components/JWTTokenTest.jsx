import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { decodeJWT, isTokenExpired, getTokenExpiration } from '../utils/jwtUtils';

const JWTTokenTest = () => {
  const [token, setToken] = useState(null);
  const [decodedToken, setDecodedToken] = useState(null);
  const [showToken, setShowToken] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token) {
      setToken(token);
      
      // Decode without verification to see the payload
      const decoded = decodeJWT(token);
      setDecodedToken(decoded);
    }
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getTokenStatus = () => {
    if (!token) return { status: 'missing', color: 'red', icon: XCircle };
    if (!decodedToken) return { status: 'invalid', color: 'red', icon: XCircle };
    
    if (isTokenExpired(token)) {
      return { status: 'expired', color: 'red', icon: XCircle };
    }
    
    return { status: 'valid', color: 'green', icon: CheckCircle };
  };

  const tokenStatus = getTokenStatus();
  const StatusIcon = tokenStatus.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            JWT Token Test
          </h1>

          {/* Token Status */}
          <div className={`rounded-xl p-4 mb-6 border ${
            tokenStatus.color === 'green' ? 'bg-green-50 border-green-200' :
            tokenStatus.color === 'red' ? 'bg-red-50 border-red-200' :
            'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <StatusIcon className={`w-6 h-6 ${
                tokenStatus.color === 'green' ? 'text-green-500' :
                tokenStatus.color === 'red' ? 'text-red-500' :
                'text-gray-500'
              }`} />
              <div>
                <h3 className="font-semibold">Token Status</h3>
                <p className="text-sm capitalize">{tokenStatus.status}</p>
              </div>
            </div>
          </div>

          {/* User Information */}
          {user && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">User Information</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>ID:</strong> {user._id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role === 2 ? 'Dietician' : 'User'}</p>
              </div>
            </div>
          )}

          {/* Decoded Token Information */}
          {decodedToken && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Key className="w-5 h-5 mr-2" />
                Decoded Token Payload
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>User ID:</strong> {decodedToken.id || 'N/A'}</p>
                    <p><strong>Name:</strong> {decodedToken.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {decodedToken.email || 'N/A'}</p>
                    <p><strong>Role:</strong> {decodedToken.role || 'N/A'}</p>
                  </div>
                  <div>
                    <p><strong>Issued At:</strong> {formatDate(decodedToken.iat)}</p>
                    <p><strong>Expires At:</strong> {getTokenExpiration(token)?.toLocaleString() || 'N/A'}</p>
                    <p><strong>Issuer:</strong> {decodedToken.iss || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Raw Token */}
          {token && (
            <div className="bg-gray-900 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Raw JWT Token
                </h3>
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="text-xs font-mono text-gray-300 break-all">
                {showToken ? token : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">Important Notes</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• The token must include <code>id</code> and <code>name</code> fields</li>
                  <li>• Token must not be expired</li>
                  <li>• JWT_SECRET must match between user-service and webrtc-signaling-service</li>
                  <li>• If token is missing fields, you need to log in again</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JWTTokenTest;
