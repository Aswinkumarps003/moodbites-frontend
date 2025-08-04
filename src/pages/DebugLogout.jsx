import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DebugLogout = () => {
  const [localStorageState, setLocalStorageState] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkState = () => {
    const authToken = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    const parsedUser = user ? JSON.parse(user) : null;
    
    setLocalStorageState({
      authToken: authToken ? 'Present' : 'Not found',
      user: user ? 'Present' : 'Not found',
      parsedUser: parsedUser ? parsedUser.name : 'N/A'
    });
    
    setIsLoggedIn(!!authToken);
  };

  const handleLogout = () => {
    console.log('=== MANUAL LOGOUT TEST ===');
    console.log('Before logout:');
    console.log('authToken:', localStorage.getItem('authToken'));
    console.log('user:', localStorage.getItem('user'));
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    console.log('After logout:');
    console.log('authToken:', localStorage.getItem('authToken'));
    console.log('user:', localStorage.getItem('user'));
    
    // Dispatch logout event
    window.dispatchEvent(new Event('moodbites-logout'));
    
    checkState();
  };

  const handleLogin = () => {
    // Simulate login
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Test User', email: 'test@example.com' }));
    window.dispatchEvent(new Event('moodbites-login'));
    checkState();
  };

  useEffect(() => {
    checkState();
    
    const handleStorage = () => {
      checkState();
    };
    
    const handleCustomLogout = () => {
      console.log('Custom logout event received');
      checkState();
    };
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('moodbites-logout', handleCustomLogout);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('moodbites-logout', handleCustomLogout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 pt-20 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-professional p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Debug Logout</h1>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-3">Current State</h2>
              <div className="space-y-2 text-sm">
                <div>Login Status: <span className={isLoggedIn ? 'text-green-600' : 'text-red-600'}>{isLoggedIn ? 'Logged In' : 'Not Logged In'}</span></div>
                <div>Auth Token: <span className="font-mono">{localStorageState.authToken}</span></div>
                <div>User Data: <span className="font-mono">{localStorageState.user}</span></div>
                <div>User Name: <span className="font-mono">{localStorageState.parsedUser}</span></div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleLogin}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Simulate Login
              </button>
              
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Test Logout
              </button>
              
              <button
                onClick={checkState}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Refresh State
              </button>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Instructions</h3>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Click "Simulate Login" to set test data</li>
                <li>2. Check the navbar - it should show user icon</li>
                <li>3. Click "Test Logout" to clear data</li>
                <li>4. Check the navbar - it should show login/signup buttons</li>
                <li>5. Open browser console to see debug logs</li>
              </ol>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DebugLogout; 