import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { 
  Calendar, TrendingUp, Star, Clock, User, Mail, Phone, MapPin, Target, Award, Heart, BookOpen, 
  Camera, Scale, Activity, Moon, Zap, Brain, Settings, Edit, Save, X,
  Globe, Languages, Users, Lock, Eye, EyeOff, ChefHat, AlertCircle, Shield, ShieldCheck, ShieldX, CheckCircle
} from "lucide-react";
import MoodCard from "../components/MoodCard";
import ScrollReveal from "../components/ScrollReveal";
import { mockMoods, mockUserProfile, mockMoodTrends, mockRecipes } from "../mock.jsx";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Dashboard = () => {
  // Navigation state
  const [activeTab, setActiveTab] = useState("overview");
  
  // Dashboard state
  const [selectedMood, setSelectedMood] = useState(mockMoods[0]);

  // Profile state
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const [userRecipes, setUserRecipes] = useState([]);
  const [userRecipeCount, setUserRecipeCount] = useState(0);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [recipeView, setRecipeView] = useState('my'); // 'my' | 'saved'
  const [dietPlan, setDietPlan] = useState(null);
  const [dietPlanLoading, setDietPlanLoading] = useState(false);
  const [consumedCaloriesToday, setConsumedCaloriesToday] = useState(0);
  const [completedMealsToday, setCompletedMealsToday] = useState({});
  const [validationErrors, setValidationErrors] = useState({
    age: '',
    heightCm: '',
    weightKg: ''
  });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
  const [profileData, setProfileData] = useState({
    // Basic Information
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    heightCm: "",
    weightKg: "",
    location: "",
    language: "English",
    joinDate: "",
    bio: "",
    
    // Health & Diet Preferences
    fitnessGoal: "",
    dietType: "",
    allergies: [],
    calorieTarget: 0,
    macroRatio: { protein: 25, carbs: 45, fats: 30 },
    waterIntakeGoal: 8,
    
    // Additional preferences
    dietaryRestrictions: [],
    favoriteIngredients: [],
    favoriteCuisines: [],
    
    // Activity & Fitness
    dailySteps: 0,
    sleepDuration: 0,
    workoutDuration: 0,
    workoutType: "",
    activityLevel: "",
    
    // Health Metrics
    bmi: 0,
    bodyFat: 0,
    restingHeartRate: 0,
    
    // Notifications & Settings
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    moodReminders: true,
    mealPlanUpdates: true
  });

  // Helpers: BMI calculations
  const computeBMI = (heightCm, weightKg) => {
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (!h || !w) return 0;
    const heightM = h / 100;
    if (heightM <= 0) return 0;
    const bmi = w / (heightM * heightM);
    return Math.round(bmi * 10) / 10; // one decimal place
  };

  const getBMICategory = (bmi) => {
    const val = parseFloat(bmi);
    if (!val || !Number.isFinite(val)) return 'unknown';
    if (val < 18.5) return 'underweight';
    if (val < 25) return 'normal';
    if (val < 30) return 'overweight';
    return 'obese';
  };

  const navigate = useNavigate();
  const location = useLocation();
  const filteredRecipes = mockRecipes.filter(
    recipe => recipe.mood === selectedMood.name
  );

  // Set active tab based on route
  useEffect(() => {
    if (location.pathname === '/profile') {
      setActiveTab('profile');
    } else if (location.pathname === '/dashboard') {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  // Authentication check
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        navigate('/login');
        return;
      }
      
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchUserData(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch user data from MongoDB Atlas
  const fetchUserData = async (userData) => {
    try {
      setLoading(true);
      
      // Fetch user profile from backend
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://user-service-o0l2.onrender.com/api/user/profile/${userData._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const userProfileData = await response.json();
        setUserProfile(userProfileData);
        
        // Set profile image if available
        if (userProfileData.profileImage) {
          setProfileImage(userProfileData.profileImage);
        }
        
        // Update profile data with fetched user data
        setProfileData(prev => ({
          ...prev,
          name: userProfileData.name || userData.name,
          email: userProfileData.email || userData.email,
          phone: userProfileData.phone || "",
          age: userProfileData.age || "",
          gender: userProfileData.gender || "",
          heightCm: userProfileData.heightCm || "",
          weightKg: userProfileData.weightKg || "",
          location: userProfileData.location || "",
          bio: userProfileData.bio || "",
          fitnessGoal: userProfileData.fitnessGoal || "",
          dietType: userProfileData.dietType || "",
          allergies: userProfileData.allergies || [],
          calorieTarget: userProfileData.calorieTarget || 0,
          waterIntakeGoal: userProfileData.waterIntakeGoal || 8,
          dietaryRestrictions: userProfileData.dietaryRestrictions || [],
          favoriteIngredients: userProfileData.favoriteIngredients || [],
          favoriteCuisines: userProfileData.favoriteCuisines || [],
          dailySteps: userProfileData.dailySteps || 0,
          sleepDuration: userProfileData.sleepDuration || 0,
          workoutDuration: userProfileData.workoutDuration || 0,
          workoutType: userProfileData.workoutType || "",
          activityLevel: userProfileData.activityLevel || "",
          bmi: userProfileData.bmi || 0,
          bodyFat: userProfileData.bodyFat || 0,
          restingHeartRate: userProfileData.restingHeartRate || 0,
          joinDate: new Date(userProfileData.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          }),
        }));
      } else {
        // Fallback to localStorage user data
        setProfileData(prev => ({
          ...prev,
          name: userData.name,
          email: userData.email,
          joinDate: "Recently",
        }));
      }
      
      // Fetch user recipes and diet plan
      await Promise.all([
        fetchUserRecipes(userData._id || userData.id),
        fetchSavedRecipes(userData._id || userData.id),
        fetchDietPlan(userData._id || userData.id),
        fetchUserRecipeCount(userData._id || userData.id)
      ]);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to localStorage user data
      setProfileData(prev => ({
        ...prev,
        name: userData.name,
        email: userData.email,
        joinDate: "Recently",
      }));
    } finally {
      setLoading(false);
    }
  };

  // Daily calorie progress helpers
  const getTodayKey = (theUser) => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const uid = theUser?._id || theUser?.id || 'anonymous';
    return `calorieProgress:${uid}:${y}-${m}-${d}`;
  };

  const loadDailyProgress = (theUser) => {
    try {
      const key = getTodayKey(theUser);
      const saved = localStorage.getItem(key);
      if (saved) {
        const json = JSON.parse(saved);
        setConsumedCaloriesToday(Number(json.consumed) || 0);
        setCompletedMealsToday(json.completed || {});
      } else {
        setConsumedCaloriesToday(0);
        setCompletedMealsToday({});
      }
    } catch (e) {
      setConsumedCaloriesToday(0);
      setCompletedMealsToday({});
    }
  };

  const saveDailyProgress = (theUser, consumed, completed) => {
    try {
      const key = getTodayKey(theUser);
      localStorage.setItem(key, JSON.stringify({ consumed, completed }));
    } catch (e) {}
  };

  useEffect(() => {
    if (user) loadDailyProgress(user);
  }, [user]);

  const parseCalories = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const n = parseFloat(value.replace(/[^0-9.]/g, ''));
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };

  const getDailyTargetCalories = () => {
    if (profileData?.calorieTarget && Number(profileData.calorieTarget) > 0) {
      return Number(profileData.calorieTarget);
    }
    const planTotal = dietPlan?.generatedPlan?.TotalCalories;
    return parseCalories(planTotal);
  };

  const handleMarkMealComplete = (mealType, mealCalories) => {
    if (!user) return;
    if (completedMealsToday[mealType]) return;
    const add = parseCalories(mealCalories);
    const nextConsumed = Math.max(0, consumedCaloriesToday + add);
    const nextCompleted = { ...completedMealsToday, [mealType]: true };
    setConsumedCaloriesToday(nextConsumed);
    setCompletedMealsToday(nextCompleted);
    saveDailyProgress(user, nextConsumed, nextCompleted);
  };

  // Derive and keep BMI in sync when height/weight change
  useEffect(() => {
    const nextBmi = computeBMI(profileData.heightCm, profileData.weightKg);
    if (nextBmi && nextBmi !== profileData.bmi) {
      setProfileData(prev => ({ ...prev, bmi: nextBmi }));
    }
  }, [profileData.heightCm, profileData.weightKg]);

  // Fetch user's diet plan
  const fetchDietPlan = async (userId) => {
    try {
      setDietPlanLoading(true);
      const response = await fetch(`http://localhost:5005/api/diet-planner/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.diets && data.diets.length > 0) {
          // Get the most recent diet plan with generated plan
          const latestDiet = data.diets.find(diet => diet.generatedPlan) || data.diets[0];
          setDietPlan(latestDiet);
        }
      }
    } catch (error) {
      console.error('Error fetching diet plan:', error);
    } finally {
      setDietPlanLoading(false);
    }
  };

  // Fetch user recipes from Supabase
  const fetchUserRecipes = async (userId) => {
    try {
      console.log('Fetching recipes for user:', userId);
      
      const response = await fetch(`http://localhost:5002/api/food/users/${userId}/dishes`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user recipes');
      }
      
      const recipes = await response.json();
      console.log('Fetched user recipes:', recipes);
      
      // Transform Supabase data to match expected format
      const transformedRecipes = recipes.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image_url || "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500",
        rating: 4.5, // Default rating since we don't have ratings in Supabase yet
        cookTime: recipe.cook_time || "30 min",
        servings: recipe.servings || 4,
        author: "You", // Since these are user's own recipes
        reviews: 0, // Default since we don't have reviews yet
        mood: recipe.mood,
        difficulty: recipe.difficulty,
        description: recipe.description
      }));
      
      setUserRecipes(transformedRecipes);
    } catch (error) {
      console.error('Error fetching user recipes:', error);
      setUserRecipes([]);
    }
  };

  const fetchSavedRecipes = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5002/api/food/users/${userId}/saved-recipes`);
      if (!response.ok) throw new Error('Failed to fetch saved recipes');
      const data = await response.json();
      setSavedRecipes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching saved recipes:', err);
      setSavedRecipes([]);
    }
  };

  // Fetch user's recipe count from food-service (Supabase)
  const fetchUserRecipeCount = async (userId) => {
    try {
      console.log('Fetching recipe count for user:', userId);
      // Try dedicated count endpoint first
      const response = await fetch(`http://localhost:5002/api/food/users/${userId}/dishes/count`);
      if (response.ok) {
        const json = await response.json();
        setUserRecipeCount(Number(json.count) || 0);
        return;
      }

      // If count endpoint is missing (404) or failed, fall back to listing dishes and counting
      console.warn('Count endpoint unavailable, falling back to list length');
      const listResp = await fetch(`http://localhost:5002/api/food/users/${userId}/dishes`);
      if (listResp.ok) {
        const dishes = await listResp.json();
        setUserRecipeCount(Array.isArray(dishes) ? dishes.length : 0);
      } else {
        throw new Error('Failed to fetch dishes list for count');
      }
    } catch (error) {
      console.error('Error fetching recipe count:', error);
      setUserRecipeCount(0);
    }
  };

  // Validation functions
  const validateAge = (age) => {
    if (!age || age === '') return '';
    const numAge = parseInt(age);
    if (isNaN(numAge)) return 'Age must be a valid number';
    if (numAge < 15) return 'Age must be at least 15 years';
    if (numAge > 85) return 'Age cannot be more than 85 years';
    return '';
  };

  const validateHeight = (height) => {
    if (!height || height === '') return '';
    const numHeight = parseInt(height);
    if (isNaN(numHeight)) return 'Height must be a valid number';
    if (numHeight < 100) return 'Height must be at least 100 cm';
    if (numHeight > 210) return 'Height cannot be more than 210 cm';
    return '';
  };

  const validateWeight = (weight) => {
    if (!weight || weight === '') return '';
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight)) return 'Weight must be a valid number';
    if (numWeight < 30) return 'Weight must be at least 30 kg';
    if (numWeight > 180) return 'Weight cannot be more than 180 kg';
    return '';
  };

  // Password strength checker (same as Signup.jsx)
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

  // Profile management functions
  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    
    // Live validation for specific fields
    if (field === 'age') {
      const error = validateAge(value);
      setValidationErrors(prev => ({ ...prev, age: error }));
    } else if (field === 'heightCm') {
      const error = validateHeight(value);
      setValidationErrors(prev => ({ ...prev, heightCm: error }));
    } else if (field === 'weightKg') {
      const error = validateWeight(value);
      setValidationErrors(prev => ({ ...prev, weightKg: error }));
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    
    // Update password strength when new password changes
    if (field === 'newPassword') {
      if (value) {
        setPasswordStrength(checkPasswordStrength(value));
      } else {
        setPasswordStrength({ score: 0, feedback: [] });
      }
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    try {
      // Validate all fields before saving
      const ageError = validateAge(profileData.age);
      const heightError = validateHeight(profileData.heightCm);
      const weightError = validateWeight(profileData.weightKg);
      
      setValidationErrors({
        age: ageError,
        heightCm: heightError,
        weightKg: weightError
      });
      
      // Check if there are any validation errors
      if (ageError || heightError || weightError) {
        setSaveStatus({ type: 'error', message: 'Please fix validation errors before saving' });
        return;
      }
      
      setSaveStatus({ type: 'loading', message: 'Saving changes...' });
      
      // Update user profile in backend
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://user-service-o0l2.onrender.com/api/user/profile/${user._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const result = await response.json();
        setIsEditing(false);
        setSaveStatus({ type: 'success', message: 'Profile updated successfully!' });
        
        // Update localStorage with new user data
        const updatedUser = { ...user, ...result.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveStatus({ type: '', message: '' });
        }, 3000);
      } else {
        const errorData = await response.json();
        setSaveStatus({ type: 'error', message: errorData.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveStatus({ type: 'error', message: 'Network error. Please try again.' });
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setSaveStatus({ type: 'error', message: 'New passwords do not match' });
        return;
      }

      // Additional password strength validation
      if (passwordStrength.score < 3) {
        setSaveStatus({ type: 'error', message: 'Password is too weak. Please make it stronger.' });
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setSaveStatus({ type: 'error', message: 'Password must be at least 6 characters' });
        return;
      }

      setSaveStatus({ type: 'loading', message: 'Updating password...' });

      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://user-service-o0l2.onrender.com/api/user/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        setSaveStatus({ type: 'success', message: 'Password updated successfully!' });
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordStrength({ score: 0, feedback: [] });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveStatus({ type: '', message: '' });
        }, 3000);
      } else {
        const errorData = await response.json();
        setSaveStatus({ type: 'error', message: errorData.message || 'Failed to update password' });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setSaveStatus({ type: 'error', message: 'Network error. Please try again.' });
    }
  };

  // Image upload handlers
  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSaveStatus({ type: 'error', message: 'Please select an image file' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSaveStatus({ type: 'error', message: 'Image size should be less than 5MB' });
        return;
      }

      // Upload to Cloudinary
      uploadImageToServer(file);
    }
  };

  const uploadImageToServer = async (file) => {
    try {
      setSaveStatus({ type: 'loading', message: 'Uploading image...' });

      const formData = new FormData();
      formData.append('profileImage', file);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://user-service-o0l2.onrender.com/api/user/upload-profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setProfileImage(result.profileImage);
        setSaveStatus({ type: 'success', message: 'Image uploaded successfully!' });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveStatus({ type: '', message: '' });
        }, 3000);
      } else {
        const errorData = await response.json();
        setSaveStatus({ type: 'error', message: errorData.message || 'Failed to upload image' });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setSaveStatus({ type: 'error', message: 'Network error. Please try again.' });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F10100] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access your dashboard</h2>
          <p className="text-gray-600">You need to be logged in to view this page.</p>
        </div>
      </div>
    );
  }

  // Data for profile stats and metrics
  const profileStats = [
    {
      icon: BookOpen,
      label: "Recipes Shared",
      value: userRecipeCount,
      color: "#F10100",
      trend: ""
    },
    {
      icon: Heart,
      label: "Saved Recipes",
      value: 0,
      color: "#FFD122",
      trend: ""
    },
    {
      icon: Award,
      label: "Community Rank",
      value: 0,
      color: "#476E00",
      trend: ""
    },
    {
      icon: Target,
      label: "Goal Progress",
      value: 0,
      color: "#D8D86B",
      trend: ""
    }
  ];

  const healthMetrics = [
    { label: "BMI", value: profileData.bmi, unit: "", status: getBMICategory(profileData.bmi), color: "#476E00" },
    { label: "Body Fat", value: profileData.bodyFat, unit: "%", status: "good", color: "#FFD122" },
    { label: "Resting HR", value: profileData.restingHeartRate, unit: "bpm", status: "excellent", color: "#F10100" },
    { label: "Daily Steps", value: profileData.dailySteps, unit: "", status: "active", color: "#D8D86B" }
  ];

  const macroData = [
    { name: "Protein", value: profileData.macroRatio.protein, fill: "#F10100" },
    { name: "Carbs", value: profileData.macroRatio.carbs, fill: "#FFD122" },
    { name: "Fats", value: profileData.macroRatio.fats, fill: "#476E00" }
  ];

  const tabNavigation = [
    { id: "overview", label: "Dashboard", icon: TrendingUp },
    { id: "profile", label: "Profile", icon: User },
    { id: "health", label: "Health & Diet", icon: Heart },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "mood", label: "Mood History", icon: Brain },
    { id: "recipes", label: "My Recipes", icon: ChefHat },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <ScrollReveal>
          <motion.div className="bg-white rounded-3xl shadow-professional overflow-hidden mb-8">
            <div className="relative h-64 bg-gradient-to-r from-[#F10100]/20 via-[#FFD122]/20 to-[#476E00]/20">
              <div className="absolute inset-0 animated-gradient opacity-30" />
              <div className="absolute bottom-8 left-8 flex items-end space-x-6">
                <div className="relative group">
                  {/* Hidden file input */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  
                  {/* Profile image display */}
                  <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl bg-gradient-to-r from-[#F10100] to-[#FFD122] flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCameraClick}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#F10100] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#FF4444] transition-colors duration-300"
                  >
                    <Camera className="w-5 h-5" />
                  </motion.button>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg" />
                </div>
                <div className="text-white pb-4">
                  <h1 className="text-4xl font-bold mb-2 font-display">{profileData.name || 'User'}</h1>
                  <p className="text-white/90 flex items-center space-x-2 text-lg font-medium">
                    <Calendar className="w-5 h-5" />
                    <span>Joined {profileData.joinDate || 'Recently'}</span>
                  </p>
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{profileData.email || 'No email'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-8 right-8">
                
              </div>
            </div>
          </motion.div>
        </ScrollReveal>

        {/* Stats Overview */}
        <ScrollReveal delay={0.2}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {profileStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-3xl shadow-professional hover:shadow-professional-hover p-6 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
              <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 font-display">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">{stat.trend}</div>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600">{stat.label}</h3>
                </motion.div>
              );
            })}
              </div>
        </ScrollReveal>

        {/* Tab Navigation */}
        <ScrollReveal delay={0.3}>
          <div className="bg-white rounded-3xl shadow-professional p-2 mb-8">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {tabNavigation.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-[#F10100] text-white shadow-lg"
                        : "text-gray-600 hover:text-[#F10100] hover:bg-[#F10100]/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Dashboard Overview Tab */}
          {activeTab === "overview" && (
            <>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Mood Selection */}
          <div className="lg:col-span-2">
            {/* Mood Cards */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                How are you feeling today?
              </h2>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {mockMoods.map((mood, index) => (
                  <MoodCard
                    key={mood.id}
                    mood={mood}
                    isSelected={selectedMood.id === mood.id}
                    onClick={() => setSelectedMood(mood)}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>

            {/* Food Recommendations */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl shadow-lg p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Recommended for <span style={{ color: selectedMood.color }}>
                    {selectedMood.name}
                  </span> Mood
                </h3>
                <div
                  className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: selectedMood.color }}
                >
                  {filteredRecipes.length} recipes
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {filteredRecipes.map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative h-48">
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <div className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-current text-yellow-400" />
                          <span>{recipe.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        {recipe.title}
                      </h4>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{recipe.cookTime}</span>
                        </div>
                        <span>Serves {recipe.servings}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                          >
                            {ingredient}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">
                        by {recipe.author}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Stats & Insights */}
          <div className="space-y-6">
                  {/* Quick Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-[#F1E1C8]/30 to-[#D8D86B]/30 rounded-3xl shadow-lg p-6"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <Link to="/emotion-detection" className="block w-full bg-white hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-xl transition-colors duration-300 text-left">
                        Detect My Mood
                      </Link>
                      <button className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-xl transition-colors duration-300 text-left">
                        Log Today's Meal
                      </button>
                      <button className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-xl transition-colors duration-300 text-left">
                        Update Mood
                      </button>
                      <button className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-xl transition-colors duration-300 text-left">
                        View Recipe History
                      </button>
                      <button
                        onClick={() => {
                          const roomId = `room-${Date.now()}`;
                          const role = (user && (user.role === 2 || user.role === '2')) ? 'dietician' : 'user';
                          navigate(`/video-consultation/${roomId}/${role}`);
                        }}
                        className="w-full bg-[#F10100] hover:bg-[#FF4444] text-white py-3 px-4 rounded-xl transition-colors duration-300 text-left"
                      >
                        Start Video Consultation
                      </button>
              </div>
            </motion.div>

            {/* Mood Trends Chart */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-3xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Mood Trends</h3>
                <TrendingUp className="w-5 h-5 text-[#476E00]" />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockMoodTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'white', 
                        border: 'none', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Happy" 
                      stroke="#476E00" 
                      strokeWidth={3}
                      dot={{ fill: "#476E00", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, stroke: "#476E00", strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Energetic" 
                      stroke="#FFD122" 
                      strokeWidth={3}
                      dot={{ fill: "#FFD122", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, stroke: "#FFD122", strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Stressed" 
                      stroke="#F10100" 
                      strokeWidth={3}
                      dot={{ fill: "#F10100", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, stroke: "#F10100", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Mood Legend */}
              <div className="flex justify-center space-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#476E00] rounded-full" />
                  <span className="text-xs text-gray-600">Happy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#FFD122] rounded-full" />
                  <span className="text-xs text-gray-600">Energetic</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#F10100] rounded-full" />
                  <span className="text-xs text-gray-600">Stressed</span>
                </div>
              </div>
            </motion.div>
                </div>
              </div>
            </>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <ScrollReveal delay={0.4}>
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Bio Section */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-3xl shadow-professional p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 font-display">About Me</h2>
                    {isEditing ? (
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300 resize-none font-medium"
                        placeholder="Tell us about your wellness journey..."
                      />
                    ) : (
                      <p className="text-gray-600 leading-relaxed text-lg">
                        {profileData.bio || "Welcome to MoodBites! This is where you can share your wellness journey, dietary preferences, and health goals. Click 'Edit Profile' to add your personal bio and make this profile truly yours."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl shadow-professional p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 font-display">Health Metrics</h3>
                    <div className="space-y-4">
                      {healthMetrics.map((metric, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-600 font-medium">{metric.label}</span>
                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-900">
                              {metric.value}{metric.unit}
                            </span>
                            <div 
                              className="text-xs font-semibold capitalize"
                              style={{ color: metric.color }}
                            >
                              {metric.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl shadow-professional p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 font-display">Current Goals</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Fitness Goal</span>
                        <span className="font-semibold text-[#F10100]">
                          {profileData.fitnessGoal}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Daily Calories</span>
                        <span className="font-semibold text-[#FFD122]">
                          {profileData.calorieTarget}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Water Goal</span>
                        <span className="font-semibold text-[#476E00]">
                          {profileData.waterIntakeGoal} glasses
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Health & Diet Tab */}
          {activeTab === "health" && (
            <ScrollReveal delay={0.4}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Health & Diet</h2>
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/diet-planner')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 text-white"
                >
                  <span className="w-2 h-2 rounded-full bg-white/80" />
                  Add Diet Planner
                </motion.button>
              </div>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl shadow-professional p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Your Health Snapshot</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex justify-between"><span>Gender</span><span className="font-semibold">{profileData.gender || '—'}</span></div>
                    <div className="flex justify-between"><span>Age</span><span className="font-semibold">{profileData.age || '—'}</span></div>
            
                    <div className="flex justify-between"><span>Height</span><span className="font-semibold">{profileData.heightCm || '—'}</span></div>
                    <div className="flex justify-between"><span>Weight</span><span className="font-semibold">{profileData.weightKg || '—'}</span></div>
                  </div>
                </div>
                <div className="bg-white rounded-3xl shadow-professional p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Tips</h3>
                  <p className="text-gray-600">Use the Add Diet Planner to personalize your calorie targets, macros, and meal timing based on your activity level, goals, and medical conditions.</p>
                </div>
              </div>

              {/* Diet Plan Display */}
              {dietPlanLoading ? (
                <div className="mt-8 bg-white rounded-3xl shadow-professional p-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                    <span className="ml-3 text-gray-600">Loading your diet plan...</span>
                  </div>
                </div>
              ) : dietPlan && dietPlan.generatedPlan ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl shadow-professional p-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-emerald-800">🍽️ Your Current Diet Plan</h3>
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 bg-emerald-100 rounded-full">
                        <span className="text-emerald-800 font-semibold">
                          {dietPlan.generatedPlan.TotalCalories || '—'}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/diet-planner')}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                      >
                        Update Plan
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/consult')}
                        className="px-4 py-2 bg-gradient-to-r from-[#F10100] to-[#FFD122] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                      >
                        Consult Dietician
                      </motion.button>
                    </div>
                  </div>

                  {/* Daily progress card */}
                  {(() => {
                    const target = getDailyTargetCalories();
                    const consumed = Math.min(consumedCaloriesToday, target || consumedCaloriesToday);
                    const remaining = Math.max((target || 0) - consumed, 0);
                    const pct = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;
                    return (
                      <div className="mb-6 bg-white rounded-2xl p-4 border border-emerald-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm text-gray-600">Daily Goal</div>
                          <div className="text-sm font-semibold text-emerald-700">{consumed} / {target || '—'} kcal</div>
                        </div>
                        <div className="w-full h-3 bg-emerald-100 rounded-full overflow-hidden">
                          <div className="h-3 bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-gray-600">Remaining</span>
                          <span className="font-semibold text-emerald-700">{remaining} kcal</span>
                        </div>
                        {pct >= 75 && (
                          <div className="mt-2 text-sm font-semibold text-emerald-700">🎉 Great progress! Keep it up!</div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="grid gap-4">
                    {Object.entries(dietPlan.generatedPlan)
                      .filter(([key]) => key !== 'TotalCalories')
                      .map(([mealType, mealData], index) => (
                        <motion.div
                          key={mealType}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-2xl bg-white border border-emerald-100 hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-lg font-semibold text-emerald-700 capitalize">
                                  {mealType === 'Snack1' ? 'Morning Snack' : 
                                   mealType === 'Snack2' ? 'Evening Snack' : 
                                   mealType}
                                </span>
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                                  {typeof mealData.calories === 'number' ? `${Math.round(mealData.calories)} kcal` : mealData.calories}
                                </span>
                              </div>
                              <p className="text-gray-700 font-medium">{mealData.recipe}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {mealData.ingredients?.length || 0} ingredients
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={async () => {
                                  try {
                                    const body = {
                                      user_id: (user && (user._id || user.id)) || null,
                                      name: mealData.recipe,
                                      calories: typeof mealData.calories === 'number' ? Math.round(mealData.calories) : parseFloat(String(mealData.calories || '').replace(/[^0-9.]/g,'')) || null,
                                      servings: 1,
                                      instructions: [],
                                      ingredients: mealData.ingredients || [],
                                      image_url: mealData.image || null,
                                      spoonacular_id: null,
                                      ready_in_minutes: null,
                                      nutrition: null
                                    };
                                    await fetch('http://localhost:5002/api/food/saved-recipes', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify(body)
                                    });
                                    setSaveStatus({ type: 'success', message: 'Recipe saved!' });
                                    setTimeout(() => setSaveStatus({ type: '', message: '' }), 1500);
                                  } catch (e) {
                                    setSaveStatus({ type: 'error', message: 'Failed to save recipe' });
                                  }
                                }}
                                className="px-4 py-2 bg-white text-emerald-700 border border-emerald-300 rounded-xl font-semibold hover:shadow transition-all duration-300"
                              >
                                Save Recipe
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  const recipeData = {
                                    mealType,
                                    recipe: mealData.recipe,
                                    calories: mealData.calories,
                                    ingredients: mealData.ingredients
                                  };
                                  localStorage.setItem('currentRecipe', JSON.stringify(recipeData));
                                  window.open('/diet-plan-view', '_blank');
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                              >
                                View Recipe
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={async () => {
                                  handleMarkMealComplete(mealType, mealData.calories);
                                  try {
                                    const token = localStorage.getItem('authToken');
                                    await fetch('https://user-service-o0l2.onrender.com/api/user/activity', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                      body: JSON.stringify({
                                        type: 'meal_complete',
                                        mealType,
                                        recipe: mealData.recipe,
                                        calories: typeof mealData.calories === 'number' ? Math.round(mealData.calories) : parseFloat(String(mealData.calories || '').replace(/[^0-9.]/g,'')) || null,
                                        ingredients: mealData.ingredients || []
                                      })
                                    });
                                  } catch (e) {}
                                }}
                                disabled={!!completedMealsToday[mealType]}
                                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${completedMealsToday[mealType] ? 'bg-emerald-100 text-emerald-700 cursor-default' : 'bg-[#F10100] text-white hover:shadow-lg'}`}
                              >
                                {completedMealsToday[mealType] ? '✓ Completed' : 'Mark as Complete'}
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl">🎯</span>
                      <span className="text-lg font-semibold text-emerald-800">
                        Daily Goal: {dietPlan.generatedPlan.TotalCalories}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-white rounded-3xl shadow-professional p-8 text-center"
                >
                  <div className="text-6xl mb-4">🍽️</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Diet Plan Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Create your personalized diet plan to get started on your health journey!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/diet-planner')}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Create Diet Plan
                  </motion.button>
                </motion.div>
              )}
            </ScrollReveal>
          )}

          {/* My Recipes Tab */}
          {activeTab === "recipes" && (
            <ScrollReveal delay={0.4}>
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-900 font-display">{recipeView === 'my' ? 'My Recipe Collection' : 'Saved Recipes'}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRecipeView('my')}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold ${recipeView === 'my' ? 'bg-[#F10100] text-white' : 'bg-white text-gray-700 border'}`}
                    >
                      My Recipes
                    </button>
                    <button
                      onClick={() => setRecipeView('saved')}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold ${recipeView === 'saved' ? 'bg-[#F10100] text-white' : 'bg-white text-gray-700 border'}`}
                    >
                      Saved Recipes
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(recipeView === 'my' ? userRecipes : savedRecipes).length > 0 ? (
                    (recipeView === 'my' ? userRecipes : savedRecipes).map((recipe, index) => (
                      <motion.div
                        key={recipe.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-3xl shadow-professional hover:shadow-professional-hover overflow-hidden transition-all duration-300"
                      >
                        <div className="relative h-48">
                          <img
                          src={recipe.image_url || recipe.image}
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-current text-yellow-400" />
                          <span>{recipe.rating || '4.5'}</span>
                        </div>
                        {recipeView === 'saved' && (
                          <div className="absolute top-3 left-3">
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await fetch(`http://localhost:5002/api/food/saved-recipes/${recipe.id}` , { method: 'DELETE' });
                                  setSavedRecipes(prev => prev.filter(r => r.id !== recipe.id));
                                } catch (err) {
                                  console.error('Failed to delete saved recipe', err);
                                }
                              }}
                              className="bg-white/90 backdrop-blur-sm text-red-600 px-3 py-1 rounded-lg text-xs font-semibold shadow hover:bg-white"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                        {/* Manage Recipe Button */}
                        <div className="absolute bottom-3 left-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/manage-recipe/${recipe.id}`)}
                            className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-2 rounded-xl font-semibold text-sm flex items-center space-x-1 shadow-lg hover:bg-white transition-all duration-300"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Manage</span>
                          </motion.button>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 font-display">
                          {recipe.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{recipe.cook_time || recipe.cookTime}</span>
                          </div>
                          <span>Serves {recipe.servings}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Mood: <span className="font-medium text-[#F10100]">{recipe.mood}</span>
                          </span>
                          <div className="text-sm font-bold text-[#F10100]">
                            {recipe.difficulty}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-16 bg-white rounded-3xl shadow-professional">
                      <div className="text-6xl mb-4">🍽️</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">No {recipeView === 'my' ? 'recipes' : 'saved recipes'} yet</h3>
                      <p className="text-gray-600 mb-6">
                        {recipeView === 'my' ? 'Start sharing your amazing recipes with the community!' : 'Save recipes you like to see them here.'}
                      </p>
                      {recipeView === 'my' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 bg-gradient-to-r from-[#F10100] to-[#FFD122] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                          onClick={() => window.location.href = '/submit'}
                        >
                          Create Your First Recipe
                        </motion.button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <ScrollReveal delay={0.4}>
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Account Settings */}
                <div className="bg-white rounded-3xl shadow-professional p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 font-display">Account Settings</h2>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsEditing(!isEditing)}
                      className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                        isEditing 
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                          : 'bg-[#F10100] text-white hover:bg-[#FF4444] shadow-lg hover:shadow-xl'
                      }`}
                    >
                      <Edit className="w-4 h-4" />
                      <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                    </motion.button>
                  </div>
                  <div className="space-y-6">
                    {/* <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        readOnly={!isEditing}
                        className={`w-full px-4 py-3 border border-gray-200 rounded-2xl transition-all duration-300 font-medium ${
                          isEditing 
                            ? 'focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100]' 
                            : 'bg-gray-50 cursor-not-allowed'
                        }`}
                      />
                    </div> */}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        readOnly={!isEditing}
                        className={`w-full px-4 py-3 border border-gray-200 rounded-2xl transition-all duration-300 font-medium ${
                          isEditing 
                            ? 'focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100]' 
                            : 'bg-gray-50 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Age
                      </label>
                      <input
                        type="number"
                        value={profileData.age}
                        onChange={(e) => handleInputChange("age", e.target.value)}
                        onKeyUp={(e) => handleInputChange("age", e.target.value)}
                        readOnly={!isEditing}
                        className={`w-full px-4 py-3 border rounded-2xl transition-all duration-300 font-medium ${
                          isEditing 
                            ? validationErrors.age
                              ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
                              : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100]'
                            : 'bg-gray-50 cursor-not-allowed border-gray-200'
                        }`}
                        placeholder="Enter your age (15-85)"
                        min="15"
                        max="85"
                      />
                      {validationErrors.age && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.age}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Scale className="w-4 h-4 inline mr-2" />
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        value={profileData.heightCm}
                        onChange={(e) => handleInputChange("heightCm", e.target.value)}
                        onKeyUp={(e) => handleInputChange("heightCm", e.target.value)}
                        readOnly={!isEditing}
                        className={`w-full px-4 py-3 border rounded-2xl transition-all duration-300 font-medium ${
                          isEditing 
                            ? validationErrors.heightCm
                              ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
                              : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100]'
                            : 'bg-gray-50 cursor-not-allowed border-gray-200'
                        }`}
                        placeholder="Enter your height in cm (100-210)"
                        min="100"
                        max="210"
                      />
                      {validationErrors.heightCm && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.heightCm}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Activity className="w-4 h-4 inline mr-2" />
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={profileData.weightKg}
                        onChange={(e) => handleInputChange("weightKg", e.target.value)}
                        onKeyUp={(e) => handleInputChange("weightKg", e.target.value)}
                        readOnly={!isEditing}
                        className={`w-full px-4 py-3 border rounded-2xl transition-all duration-300 font-medium ${
                          isEditing 
                            ? validationErrors.weightKg
                              ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
                              : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100]'
                            : 'bg-gray-50 cursor-not-allowed border-gray-200'
                        }`}
                        placeholder="Enter your weight in kg (30-180)"
                        min="30"
                        max="180"
                        step="0.1"
                      />
                      {validationErrors.weightKg && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.weightKg}
                        </p>
                      )}
                    </div>

                    <div>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full px-4 py-3 border border-[#F10100] text-[#F10100] rounded-2xl font-semibold hover:bg-[#F10100] hover:text-white transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Change Password</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white rounded-3xl shadow-professional p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 font-display">Notifications</h2>
                  <div className="space-y-6">
                    {[
                      { key: "emailNotifications", label: "Email Notifications", description: "Receive updates via email" },
                      { key: "pushNotifications", label: "Push Notifications", description: "Mobile app notifications" },
                      { key: "weeklyReports", label: "Weekly Reports", description: "Mood and nutrition summary" },
                      { key: "moodReminders", label: "Mood Check-ins", description: "Daily mood tracking reminders" },
                      { key: "mealPlanUpdates", label: "Meal Plan Updates", description: "New recipe suggestions" }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div>
                          <div className="font-semibold text-gray-900">{setting.label}</div>
                          <div className="text-sm text-gray-500">{setting.description}</div>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleInputChange(setting.key, !profileData[setting.key])}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                            profileData[setting.key] ? "bg-[#F10100]" : "bg-gray-300"
                          }`}
                        >
                          <motion.div
                            animate={{
                              x: profileData[setting.key] ? 24 : 0
                            }}
                            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-300"
                          />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Save Changes Button */}
          {isEditing && (
            <ScrollReveal delay={0.6}>
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saveStatus.type === 'loading' || validationErrors.age || validationErrors.heightCm || validationErrors.weightKg}
                  className={`px-12 py-4 rounded-2xl font-bold text-lg flex items-center space-x-3 shadow-xl transition-all duration-300 mx-auto ${
                    saveStatus.type === 'loading' || validationErrors.age || validationErrors.heightCm || validationErrors.weightKg
                      ? 'bg-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-[#F10100] to-[#FF4444] hover:shadow-2xl'
                  }`}
                >
                  <Save className="w-6 h-6" />
                  <span>{saveStatus.type === 'loading' ? 'Saving...' : 'Save All Changes'}</span>
                </motion.button>
                {(validationErrors.age || validationErrors.heightCm || validationErrors.weightKg) && (
                  <p className="text-red-500 text-sm mt-2 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Please fix validation errors before saving
                  </p>
                )}
              </div>
            </ScrollReveal>
          )}

          {/* Status Messages */}
          {saveStatus.message && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-xl shadow-lg ${
                saveStatus.type === 'success' 
                  ? 'bg-green-100 border border-green-300 text-green-800'
                  : saveStatus.type === 'error'
                  ? 'bg-red-100 border border-red-300 text-red-800'
                  : 'bg-blue-100 border border-blue-300 text-blue-800'
              }`}
            >
              {saveStatus.message}
            </motion.div>
          )}

          {/* Password Change Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Change Password</h3>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                        className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                        className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {passwordData.newPassword && (
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

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                        className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowPasswordModal(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300"
                    >
                      Cancel
                </button>
                    <button
                      onClick={handlePasswordUpdate}
                      disabled={saveStatus.type === 'loading' || passwordStrength.score < 3}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-[#F10100] to-[#FFD122] text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                    >
                      {saveStatus.type === 'loading' ? 'Updating...' : 'Update Password'}
                </button>
                  </div>
              </div>
            </motion.div>
          </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;