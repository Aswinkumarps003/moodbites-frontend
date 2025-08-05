import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, CheckCircle, Shield, ShieldCheck, ShieldX } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";

const API_URL = 'http://localhost:5000/api/user';

const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    watch,
    setValue,
    reset,
    trigger
  } = useForm({
    mode: "onChange", // Validate on change for real-time feedback
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
  const navigate = useNavigate();

  // Watch all fields for real-time validation
  const watchedPassword = watch("password");
  const watchedName = watch("name");
  const watchedEmail = watch("email");

  // Real-time validation triggers on keyup
  useEffect(() => {
    if (watchedName) {
      trigger("name");
    }
  }, [watchedName, trigger]);

  useEffect(() => {
    if (watchedEmail) {
      trigger("email");
    }
  }, [watchedEmail, trigger]);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const feedback = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
      feedback.push('At least 8 characters');
    } else {
      feedback.push('Need at least 8 characters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
      feedback.push('Contains uppercase letter');
    } else {
      feedback.push('Add an uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
      feedback.push('Contains lowercase letter');
    } else {
      feedback.push('Add a lowercase letter');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
      feedback.push('Contains number');
    } else {
      feedback.push('Add a number');
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
      feedback.push('Contains special character');
    } else {
      feedback.push('Add a special character');
    }

    return { score, feedback };
  };

  // Update password strength when password changes
  useEffect(() => {
    if (watchedPassword) {
      setPasswordStrength(checkPasswordStrength(watchedPassword));
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  }, [watchedPassword]);

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
                text: 'signup_with',
                shape: 'rectangular',
                width: '100%',
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
      setSuccess(null);

      const result = await axios.post(`${API_URL}/google-signin`, {
        credential: response.credential,
      });

      // Store user data and token
      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      
      // Dispatch login event to update navbar
      window.dispatchEvent(new Event('moodbites-login'));
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Form submission handler
  const onSubmit = async (data) => {
    // Additional password strength validation
    if (passwordStrength.score < 3) {
      setError("Password is too weak. Please make it stronger.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axios.post(`${API_URL}/register`, {
        name: data.name,
        email: data.email,
        password: data.password
      });
      
      // Show success message
      setSuccess(response.data.message);
      
      // Reset form
      reset();
      setPasswordStrength({ score: 0, feedback: [] });
      
    } catch (err) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Validation schema
  const validationSchema = {
    name: {
      required: "Full name is required",
      minLength: {
        value: 2,
        message: "Name must be at least 2 characters"
      },
      maxLength: {
        value: 50,
        message: "Name must not exceed 50 characters"
      },
      pattern: {
        value: /^[a-zA-Z\s]+$/,
        message: "Name can only contain letters and spaces"
      }
    },
    email: {
      required: "Email is required",
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: "Please enter a valid email address"
      },
      validate: {
        notSimplePattern: (value) => {
          // Check for simple patterns like 1@1.com, 2@2.com, etc.
          const simplePatterns = [
            /^\d+@\d+\.\w+$/, // 1@1.com, 2@2.com, etc.
            /^[a-z]@[a-z]\.\w+$/i, // a@a.com, b@b.com, etc.
            /^test@test\.\w+$/i, // test@test.com
            /^admin@admin\.\w+$/i, // admin@admin.com
            /^user@user\.\w+$/i, // user@user.com
            /^demo@demo\.\w+$/i, // demo@demo.com
            /^example@example\.\w+$/i, // example@example.com
          ];
          
          for (const pattern of simplePatterns) {
            if (pattern.test(value)) {
              return "Please enter a real email address, not a test pattern";
            }
          }
          
          // Check for very short local parts
          const localPart = value.split('@')[0];
          if (localPart && localPart.length < 2) {
            return "Email local part must be at least 2 characters";
          }
          
          // Check for very short domain parts
          const domainPart = value.split('@')[1]?.split('.')[0];
          if (domainPart && domainPart.length < 2) {
            return "Email domain must be at least 2 characters";
          }
          
          return true;
        }
      }
    },
    password: {
      required: "Password is required",
      minLength: {
        value: 6,
        message: "Password must be at least 6 characters"
      }
    }
  };

  const getStrengthColor = (score) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    if (score >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStrengthText = (score) => {
    if (score >= 4) return 'Strong';
    if (score >= 3) return 'Good';
    if (score >= 2) return 'Fair';
    return 'Weak';
  };

  const getStrengthIcon = (score) => {
    if (score >= 4) return <ShieldCheck className="w-4 h-4" />;
    if (score >= 3) return <Shield className="w-4 h-4" />;
    return <ShieldX className="w-4 h-4" />;
  };

  // Check if form is ready for submission
  const isFormValid = isValid && passwordStrength.score >= 3;

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
            Join MoodBites!
          </h2>
          <p className="mt-2 text-gray-600">
            Create your account to start your journey.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}
            
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5" />
                <div className="text-sm">
                  <div className="font-medium">{success}</div>
                  <div className="text-xs mt-1">
                    Please check your email and click the verification link to complete your registration.
                  </div>
                </div>
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
            {(!import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID === 'your-google-client-id') && (
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
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="name"
                  type="text"
                  {...register("name", validationSchema.name)}
                  onKeyUp={() => trigger("name")}
                  onBlur={() => trigger("name")}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F10100] focus:border-[#F10100] transition-all duration-200 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{errors.name.message}</span>
                </motion.p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  {...register("email", validationSchema.email)}
                  onKeyUp={() => trigger("email")}
                  onBlur={() => trigger("email")}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F10100] focus:border-[#F10100] transition-all duration-200 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{errors.email.message}</span>
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", validationSchema.password)}
                  onKeyUp={() => trigger("password")}
                  onBlur={() => trigger("password")}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F10100] focus:border-[#F10100] transition-all duration-200 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Validation Errors */}
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{errors.password.message}</span>
                </motion.p>
              )}
              
              {/* Password Strength Indicator */}
              {watchedPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    {getStrengthIcon(passwordStrength.score)}
                    <span className={`text-sm font-medium ${getStrengthColor(passwordStrength.score)}`}>
                      {getStrengthText(passwordStrength.score)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.score >= 4 ? 'bg-green-500' :
                        passwordStrength.score >= 3 ? 'bg-yellow-500' :
                        passwordStrength.score >= 2 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  
                  {/* Show feedback only when requirements are not met */}
                  {passwordStrength.score < 5 && (
                    <div className="mt-2 space-y-1">
                      {passwordStrength.feedback.map((feedback, index) => {
                        const isMet = feedback.startsWith('Contains') || feedback.startsWith('At least');
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              isMet ? 'bg-green-500' : 'bg-gray-300'
                            }`}></div>
                            <span className={`text-xs ${isMet ? 'text-green-600' : 'text-gray-600'}`}>
                              {feedback}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Show success message when all criteria are met */}
                  {passwordStrength.score === 5 && (
                    <div className="mt-2 flex items-center gap-2 text-green-600 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      All password requirements met!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-gradient-to-r from-[#F10100] to-[#FFD122] text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create account"}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#F10100] hover:text-[#D10000] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup; 