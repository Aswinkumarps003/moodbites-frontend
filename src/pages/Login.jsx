import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Utensils, Brain, Scan, Heart } from "lucide-react";
import axios from "axios";
import { getDashboardPath } from "../utils/roleRedirect";

const API_URL = 'https://user-service-latest-bae8.onrender.com/api/user';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [restrictedMsg, setRestrictedMsg] = useState("");
  const navigate = useNavigate();

  // If already authenticated, redirect away from login
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    axios
      .get(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const role = res.data?.role;
        navigate(getDashboardPath(role), { replace: true });
      })
      .catch(() => {
        // not authenticated; stay on login
      });
  }, [navigate]);

  // Initialize Google Sign-In
  useEffect(() => {
    const loadGoogleScript = () => {
      // Check if Google Client ID is configured
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId || clientId === 'your-google-client-id') {
        console.warn('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file');
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        if (window.google) {
          try {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: handleGoogleSignIn,
              auto_select: false,
              cancel_on_tap_outside: true,
            });

            window.google.accounts.id.renderButton(
              document.getElementById('google-signin-button'),
              {
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular',
                width: 300,
              }
            );
          } catch (error) {
            console.error('Error initializing Google Sign-In:', error);
          }
        }
      };

      script.onerror = () => {
        console.error('Failed to load Google Sign-In script');
      };
    };

    loadGoogleScript();
  }, []);

  const handleGoogleSignIn = async (response) => {
    try {
      setGoogleLoading(true);
      setError(null);

      const result = await axios.post(`${API_URL}/google-signin`, {
        credential: response.credential,
      });

      // Restrict any user if active === false
      const u = result.data.user;
      if (u && u.active === false) {
        setRestrictedMsg('Your login is restricted by the admin. Please contact support.');
        return;
      }

      // Store user data and token
      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('user', JSON.stringify(u));

      // Dispatch login event to update navbar
      window.dispatchEvent(new Event('moodbites-login'));

      // Navigate to dashboard based on role
      const role = u?.role;
      navigate(getDashboardPath(role));

    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/login`, formData);
      const u = response.data.user;
      // Restrict any user if active === false
      if (u && u.active === false) {
        setRestrictedMsg('Your login is restricted by the admin. Please contact support.');
        return;
      }

      // Normal users can login regardless, dieticians must be active
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(u));

      // Dispatch login event to update navbar
      window.dispatchEvent(new Event('moodbites-login'));

      // Navigate to dashboard based on role
      const role = u?.role;
      navigate(getDashboardPath(role));
    } catch (err) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const floatingIcons = [
    { emoji: "🥗", top: "10%", left: "8%", delay: 0 },
    { emoji: "🍎", top: "25%", left: "75%", delay: 0.5 },
    { emoji: "🥑", top: "60%", left: "12%", delay: 1 },
    { emoji: "🍊", top: "75%", left: "80%", delay: 1.5 },
    { emoji: "🥕", top: "45%", left: "90%", delay: 2 },
    { emoji: "🍇", top: "85%", left: "15%", delay: 0.8 },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1200&q=80"
          alt="Fresh healthy food spread"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#F10100]/80 via-[#F10100]/60 to-[#FFD122]/50" />

        {/* Floating elements */}
        {floatingIcons.map((item, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-40 pointer-events-none"
            style={{ top: item.top, left: item.left }}
            animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: item.delay }}
          >
            {item.emoji}
          </motion.div>
        ))}

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-start p-16 text-white">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Utensils className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold font-display">MoodBites</span>
            </div>

            <h1 className="text-5xl font-bold mb-6 font-display leading-tight">
              Nourish Your<br />
              <span className="text-[#FFD122]">Body & Mind</span>
            </h1>

            <p className="text-white/80 text-lg mb-10 max-w-md leading-relaxed">
              Discover personalized nutrition powered by AI mood analysis. Your journey to wellness starts here.
            </p>

            {/* Feature highlights */}
            <div className="space-y-4">
              {[
                { icon: Brain, text: "AI-powered mood detection" },
                { icon: Scan, text: "Smart fridge scanning" },
                { icon: Heart, text: "Personalized wellness plans" }
              ].map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.15 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <Icon className="w-4 h-4 text-[#FFD122]" />
                    </div>
                    <span className="text-white/90 font-medium">{feat.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-stone-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 dots-pattern opacity-30 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F10100]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FFD122]/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8 relative z-10"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-[#F10100] to-[#FFD122] rounded-2xl flex items-center justify-center shadow-lg shadow-[#F10100]/20 mb-6 lg:hidden"
            >
              <span className="text-2xl">🍽️</span>
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 font-display">
              Welcome Back!
            </h2>
            <p className="mt-2 text-gray-500">
              Sign in to your MoodBites account
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-premium p-8 border border-white/40"
          >
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Restricted Modal */}
            <AnimatePresence>
              {restrictedMsg && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 10, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: 10, opacity: 0 }}
                    className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-premium"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Login Restricted</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{restrictedMsg}</p>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setRestrictedMsg("")}
                        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Sign-In Button */}
            <div className="mb-6">
              <div id="google-signin-button" className="w-full"></div>
              {googleLoading && (
                <div className="mt-3 text-center">
                  <div className="inline-flex items-center text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#F10100] mr-2"></div>
                    Signing in with Google...
                  </div>
                </div>
              )}
              {!import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID === 'your-google-client-id' && (
                <div className="mt-3 text-center">
                  <div className="text-xs text-gray-500">
                    Google Sign-In not configured. Please set up your Google OAuth credentials.
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white/80 text-gray-400 text-xs uppercase tracking-wider font-medium">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#F10100] transition-colors" />
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300 bg-gray-50/50 hover:bg-white"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#F10100] transition-colors" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-12 pr-14 py-3.5 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300 bg-gray-50/50 hover:bg-white"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#F10100] hover:text-[#D10000] hover:underline font-medium"
                >
                  Forgot your password?
                </Link>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#F10100] to-[#FF4444] text-white py-3.5 px-4 rounded-xl font-semibold shadow-lg shadow-[#F10100]/20 hover:shadow-xl hover:shadow-[#F10100]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Signing in...
                  </span>
                ) : "Sign in"}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-[#F10100] hover:text-[#D10000] hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login; 