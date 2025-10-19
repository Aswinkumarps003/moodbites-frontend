import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, CheckCircle, Shield, ShieldCheck, ShieldX, Users, UtensilsCrossed } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";

const API_URL = 'http://localhost:5000/api/user';

// Simple vertical wheel picker component
const WheelPicker = ({ values = [], value, onChange, visibleCount = 5, itemClass = "", getLabel }) => {
  const itemHeight = 40; // px
  const paddingItems = Math.floor(visibleCount / 2);
  const displayValues = useMemo(() => {
    const padTop = Array.from({ length: paddingItems }).map((_, i) => `__pad_top_${i}`);
    const padBot = Array.from({ length: paddingItems }).map((_, i) => `__pad_bot_${i}`);
    return [...padTop, ...values, ...padBot];
  }, [values, paddingItems]);

  const handleScroll = (e) => {
    const scrollTop = e.currentTarget.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const actualIndex = Math.min(Math.max(index, 0), values.length - 1);
    const selected = values[actualIndex];
    if (selected !== undefined && selected !== value) onChange(selected);
  };

  useEffect(() => {
    const container = document.getElementById(`wheel-${itemClass}`);
    if (!container) return;
    const idx = values.findIndex((v) => v === value);
    const targetIdx = idx >= 0 ? idx : 0;
    container.scrollTo({ top: targetIdx * itemHeight, behavior: 'instant' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      <div className="absolute left-0 right-0 z-10 pointer-events-none" style={{ top: `${(visibleCount/2)*itemHeight - itemHeight}px`, height: `${itemHeight}px` }}>
        <div className="border border-gray-200 rounded-xl" />
      </div>
      <div
        id={`wheel-${itemClass}`}
        onScroll={handleScroll}
        className="overflow-y-scroll snap-y snap-mandatory no-scrollbar h-40 relative"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {displayValues.map((v, i) => (
          <div
            key={`${v}-${i}`}
            className={`h-10 flex items-center justify-center snap-start ${typeof v === 'string' && v.startsWith('__pad_') ? 'invisible' : ''} ${itemClass}`}
          >
            <span className={`text-sm font-medium ${value === v ? 'text-gray-900' : 'text-gray-500'}`}>
              {typeof v === 'string' && v.startsWith('__pad_') ? '' : (getLabel ? getLabel(v) : v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

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
      password: '',
      role: '1', // Default to normal user
      gender: 'Male',
      age: 25,
      heightUnit: 'cm',
      heightCm: 170,
      heightFt: 5,
      heightIn: 7,
      weightUnit: 'kg',
      weight: 70
    }
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = account, 2 = details

  // If already authenticated, redirect away from signup
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    axios
      .get(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const role = res.data?.role;
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        // not authenticated; stay on signup
      });
  }, [navigate]);

  // Local UI state for pickers
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState(25);
  const [heightUnit, setHeightUnit] = useState('cm'); // 'cm' | 'ftin'
  const [heightCm, setHeightCm] = useState(170);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(7);
  const [weightUnit, setWeightUnit] = useState('kg'); // 'kg' | 'lb'
  const [weight, setWeight] = useState(70);

  // Sync with form values
  useEffect(() => {
    setValue('gender', gender, { shouldValidate: true });
  }, [gender, setValue]);
  useEffect(() => {
    setValue('age', age, { shouldValidate: true });
  }, [age, setValue]);
  useEffect(() => {
    setValue('heightUnit', heightUnit);
    setValue('heightCm', heightCm);
    setValue('heightFt', heightFt);
    setValue('heightIn', heightIn);
  }, [heightUnit, heightCm, heightFt, heightIn, setValue]);
  useEffect(() => {
    setValue('weightUnit', weightUnit);
    setValue('weight', weight);
  }, [weightUnit, weight, setValue]);

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

  // Debounced AJAX email availability check
  useEffect(() => {
    const email = watchedEmail?.trim();
    setEmailExists(false);
    if (!email) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return;
    setEmailChecking(true);
    const t = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_URL}/check-email`, { params: { email } });
        setEmailExists(!!res.data?.exists);
      } catch (e) {
        // Silently ignore; do not block user
      } finally {
        setEmailChecking(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [watchedEmail]);

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

  // Form submission handler for normal users
  const onSubmit = async (data) => {
    // Only allow submit on step 2
    if (step === 1) return;

    // Additional password strength validation
    if (passwordStrength.score < 3) {
      setError("Password is too weak. Please make it stronger.");
      return;
    }
    if (emailExists) {
      setError('Email already registered. Please use another email.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Normalize height (to cm) and weight (to kg)
      let normalizedHeightCm = data.heightCm;
      if (data.heightUnit === 'ftin') {
        normalizedHeightCm = Math.round((Number(data.heightFt || 0) * 30.48 + Number(data.heightIn || 0) * 2.54));
      }
      let normalizedWeightKg = data.weight;
      if (data.weightUnit === 'lb') {
        normalizedWeightKg = Math.round((Number(data.weight || 0) * 0.453592) * 10) / 10;
      }

      const response = await axios.post(`${API_URL}/register`, {
        name: data.name,
        email: data.email,
        password: data.password,
        role: parseInt(data.role), // Convert string to integer
        gender: data.gender,
        age: Number(data.age),
        heightCm: Number(normalizedHeightCm),
        weightKg: Number(normalizedWeightKg)
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

  const handleNext = async () => {
    // Validate step 1 fields
    const ok = await trigger(["name", "email", "password", "role"], { shouldFocus: true });
    if (!ok) return;
    if (passwordStrength.score < 3) {
      setError("Password is too weak. Please make it stronger.");
      return;
    }
    if (emailExists) {
      setError('Email already registered. Please use another email.');
      return;
    }
    setError(null);
    
    // If user is a dietician, require certificate and submit multipart
    if (watch("role") === "2") {
      // Validate certificate presence and type/size
      if (!certificate) {
        setError('Please upload your dietician certificate (image or PDF, max 10MB).');
        return;
      }
      const allowedTypes = ['image/jpeg','image/png','image/webp','image/gif','application/pdf'];
      if (!allowedTypes.includes(certificate.type)) {
        setError('Invalid file type. Upload an image (jpg, png, webp, gif) or PDF.');
        return;
      }
      if (certificate.size > 10 * 1024 * 1024) { // 10MB
        setError('File too large. Maximum size is 10MB.');
        return;
      }

      const fd = new FormData();
      fd.append('name', watch('name'));
      fd.append('email', watch('email'));
      fd.append('password', watch('password'));
      fd.append('role', parseInt(watch('role')));
      fd.append('certificate', certificate);

      await submitDieticianRegistration(fd);
    } else {
      setStep(2);
    }
  };

  const handleBack = () => setStep(1);

  // Separate submission function for dieticians (multipart)
  const submitDieticianRegistration = async (formData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axios.post(`${API_URL}/register-dietician`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Show success message
      setSuccess(response.data.message);
      
      // Reset form
      reset();
      setPasswordStrength({ score: 0, feedback: [] });
      setCertificate(null);
      
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

          {/* STEP 1: Account */}
          {step === 1 && (
            <>
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

              <div className="space-y-6">
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
              {/* AJAX email check feedback */}
              <div className="mt-2">
                {emailChecking && (
                  <div className="text-xs text-gray-500">Checking email availability...</div>
                )}
                {!errors.email && !emailChecking && emailExists && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">Email already registered. Try logging in or use another email.</span>
                  </motion.p>
                )}
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

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Account Type
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-[#F10100] hover:bg-red-50 transition-all duration-200 group">
                  <input
                    type="radio"
                    value="1"
                    {...register("role")}
                    className="w-4 h-4 text-[#F10100] border-gray-300 focus:ring-[#F10100] focus:ring-2"
                  />
                  <div className="ml-3 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Normal User</div>
                      <div className="text-xs text-gray-500">Access to food recommendations and mood tracking</div>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-[#F10100] hover:bg-red-50 transition-all duration-200 group">
                  <input
                    type="radio"
                    value="2"
                    {...register("role")}
                    className="w-4 h-4 text-[#F10100] border-gray-300 focus:ring-[#F10100] focus:ring-2"
                  />
                  <div className="ml-3 flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-200">
                      <UtensilsCrossed className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Dietician</div>
                      <div className="text-xs text-gray-500">Professional access to manage recipes and diet plans</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Certificate upload for Dietician */}
            {watch("role") === "2" && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Dietician Certificate (image or PDF)
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setCertificate(e.target.files?.[0] || null)}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-gray-200 rounded-xl p-2"
                />
                <p className="text-xs text-gray-500 mt-2">Required for dietician accounts. Max 10MB. Accepted: images, PDF.</p>
              </div>
            )}

                <div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#F10100] to-[#FFD122] text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating account..." : (watch("role") === "2" ? "Create Account" : "Continue")}
                  </motion.button>
                </div>
              </div>
            </>
          )}

          {/* STEP 2: Details - Only for Normal Users */}
          {step === 2 && watch("role") === "1" && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Gender Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-[#F10100] hover:bg-red-50 transition-all duration-200">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={gender === 'Male'}
                      onChange={() => setGender('Male')}
                      className="w-4 h-4 text-[#F10100] border-gray-300 focus:ring-[#F10100] focus:ring-2"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">Male</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-[#F10100] hover:bg-red-50 transition-all duration-200">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={gender === 'Female'}
                      onChange={() => setGender('Female')}
                      className="w-4 h-4 text-[#F10100] border-gray-300 focus:ring-[#F10100] focus:ring-2"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">Female</span>
                  </label>
                </div>
              </div>

              {/* Age, Height, Weight Pickers */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">Age, Height & Weight</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Age */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="text-xs text-gray-500 mb-2">Age</div>
                    <WheelPicker
                      values={Array.from({ length: 83 }).map((_, i) => i + 18)}
                      value={age}
                      onChange={setAge}
                      itemClass="age-picker"
                    />
                    <div className="mt-2 text-center text-sm font-semibold text-gray-900">{age} yrs</div>
                  </div>

                  {/* Height */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-500">Height</div>
                      <div className="bg-white rounded-lg p-1 border border-gray-200">
                        <button
                          type="button"
                          onClick={() => setHeightUnit('cm')}
                          className={`px-2 py-1 text-xs rounded-md ${heightUnit === 'cm' ? 'bg-[#F10100] text-white' : 'text-gray-600'}`}
                        >cm</button>
                        <button
                          type="button"
                          onClick={() => setHeightUnit('ftin')}
                          className={`px-2 py-1 text-xs rounded-md ${heightUnit === 'ftin' ? 'bg-[#F10100] text-white' : 'text-gray-600'}`}
                        >ft/in</button>
                      </div>
                    </div>
                    {heightUnit === 'cm' ? (
                      <>
                        <WheelPicker
                          values={Array.from({ length: 141 }).map((_, i) => i + 100)}
                          value={heightCm}
                          onChange={setHeightCm}
                          itemClass="height-cm-picker"
                        />
                        <div className="mt-2 text-center text-sm font-semibold text-gray-900">{heightCm} cm</div>
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">ft</div>
                          <WheelPicker
                            values={Array.from({ length: 4 }).map((_, i) => i + 4)}
                            value={heightFt}
                            onChange={setHeightFt}
                            itemClass="height-ft-picker"
                          />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">in</div>
                          <WheelPicker
                            values={Array.from({ length: 12 }).map((_, i) => i)}
                            value={heightIn}
                            onChange={setHeightIn}
                            itemClass="height-in-picker"
                          />
                        </div>
                        <div className="col-span-2 mt-2 text-center text-sm font-semibold text-gray-900">{heightFt} ft {heightIn} in</div>
                      </div>
                    )}
                  </div>

                  {/* Weight */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-500">Weight</div>
                      <div className="bg-white rounded-lg p-1 border border-gray-200">
                        <button
                          type="button"
                          onClick={() => setWeightUnit('kg')}
                          className={`px-2 py-1 text-xs rounded-md ${weightUnit === 'kg' ? 'bg-[#F10100] text-white' : 'text-gray-600'}`}
                        >kg</button>
                        <button
                          type="button"
                          onClick={() => setWeightUnit('lb')}
                          className={`px-2 py-1 text-xs rounded-md ${weightUnit === 'lb' ? 'bg-[#F10100] text-white' : 'text-gray-600'}`}
                        >lb</button>
                      </div>
                    </div>
                    <WheelPicker
                      values={weightUnit === 'kg' ? Array.from({ length: 151 }).map((_, i) => i + 30) : Array.from({ length: 331 }).map((_, i) => i + 66)}
                      value={weight}
                      onChange={setWeight}
                      itemClass="weight-picker"
                      getLabel={(v) => `${v}`}
                    />
                    <div className="mt-2 text-center text-sm font-semibold text-gray-900">{weight} {weightUnit}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Back
                </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !isFormValid}
                  className="flex-1 bg-gradient-to-r from-[#F10100] to-[#FFD122] text-white py-3 px-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create account"}
            </motion.button>
              </div>
          </form>
          )}

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