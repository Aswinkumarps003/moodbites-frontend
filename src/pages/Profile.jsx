import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { 
  Edit, Save, X, User, Mail, Phone, MapPin, Calendar, Target, Award, Heart, BookOpen, 
  Camera, Scale, Activity, Moon, Zap, Brain, Settings, 
  TrendingUp, Clock, AlertCircle, Star, ChefHat, 
  Globe, Languages, Users, Lock, Eye, EyeOff
} from "lucide-react";
import ScrollReveal from "../components/ScrollReveal";
import { mockUserProfile, mockRecipes, mockMoodTrends } from "../mock.jsx";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [userRecipes, setUserRecipes] = useState([]);
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
  const [profileData, setProfileData] = useState({
    // Basic Information
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
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

  const savedRecipes = mockRecipes.filter(recipe => recipe.id % 2 === 0);

  // Fetch user data from MongoDB Atlas
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Fetch user profile from backend
          const token = localStorage.getItem('authToken');
          const response = await fetch(`http://localhost:5000/api/user/profile/${parsedUser._id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const userProfileData = await response.json();
            setUserProfile(userProfileData);
            
            // Update profile data with fetched user data
            setProfileData(prev => ({
              ...prev,
              name: userProfileData.name || parsedUser.name,
              email: userProfileData.email || parsedUser.email,
              phone: userProfileData.phone || "",
              age: userProfileData.age || "",
              gender: userProfileData.gender || "",
              height: userProfileData.height || "",
              weight: userProfileData.weight || "",
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
              name: parsedUser.name,
              email: parsedUser.email,
              joinDate: "Recently",
            }));
          }
          
          // Fetch user recipes
          await fetchUserRecipes(parsedUser._id || parsedUser.id);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to localStorage user data
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setProfileData(prev => ({
            ...prev,
            name: parsedUser.name,
            email: parsedUser.email,
            joinDate: "Recently",
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    try {
      setSaveStatus({ type: 'loading', message: 'Saving changes...' });
      
      // Update user profile in backend
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/user/profile/${user._id}`, {
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

      if (passwordData.newPassword.length < 6) {
        setSaveStatus({ type: 'error', message: 'Password must be at least 6 characters' });
        return;
      }

      setSaveStatus({ type: 'loading', message: 'Updating password...' });

      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/user/change-password`, {
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

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F10100] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
          <p className="text-gray-600">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  const profileStats = [
    {
      icon: BookOpen,
      label: "Recipes Shared",
      value: userRecipes.length,
      color: "#F10100",
      trend: "+3 this month"
    },
    {
      icon: Heart,
      label: "Saved Recipes",
      value: mockUserProfile.savedMeals,
      color: "#FFD122",
      trend: "+5 this week"
    },
    {
      icon: Award,
      label: "Community Rank",
      value: `#${mockUserProfile.communityRank}`,
      color: "#476E00",
      trend: "↑12 positions"
    },
    {
      icon: Target,
      label: "Goal Progress",
      value: `${mockUserProfile.goalProgress}%`,
      color: "#D8D86B",
      trend: "On track"
    }
  ];

  const healthMetrics = [
    { label: "BMI", value: profileData.bmi, unit: "", status: "normal", color: "#476E00" },
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
    { id: "overview", label: "Overview", icon: User },
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
                  <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl bg-gradient-to-r from-[#F10100] to-[#FFD122] flex items-center justify-center text-white text-4xl font-bold">
                    {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white/90 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-2xl font-semibold flex items-center space-x-2 shadow-lg hover:bg-white transition-all duration-300"
                >
                  {isEditing ? <X className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                  <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
                </motion.button>
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
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
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
            </>
          )}

          {/* Health & Diet Tab */}
          {activeTab === "health" && (
            <ScrollReveal delay={0.4}>
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Basic Health Info */}
                <div className="bg-white rounded-3xl shadow-professional p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 font-display">Basic Information</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { icon: User, label: "Age", field: "age", type: "number" },
                      { icon: Users, label: "Gender", field: "gender", type: "text" },
                      { icon: TrendingUp, label: "Height", field: "height", type: "text" },
                      { icon: Scale, label: "Weight", field: "weight", type: "text" }
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.field}>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Icon className="w-4 h-4 inline mr-2" />
                            {item.label}
                          </label>
                          {isEditing ? (
                            <input
                              type={item.type}
                              value={profileData[item.field]}
                              onChange={(e) => handleInputChange(item.field, e.target.value)}
                              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300 font-medium"
                            />
                          ) : (
                            <p className="text-gray-600 py-3 font-medium">{profileData[item.field]}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 font-display">Macro Targets</h3>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-32 h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={macroData}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={60}
                              dataKey="value"
                            >
                              {macroData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 ml-6">
                        {macroData.map((macro) => (
                          <div key={macro.name} className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: macro.fill }}
                              />
                              <span className="text-sm font-medium text-gray-600">{macro.name}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{macro.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diet Preferences */}
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl shadow-professional p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 font-display">Diet Preferences</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Diet Type</label>
                        {isEditing ? (
                          <select
                            value={profileData.dietType}
                            onChange={(e) => handleInputChange("dietType", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300 font-medium bg-white"
                          >
                            <option value="Vegetarian">Vegetarian</option>
                            <option value="Vegan">Vegan</option>
                            <option value="Non-Vegetarian">Non-Vegetarian</option>
                            <option value="Keto">Keto</option>
                            <option value="Paleo">Paleo</option>
                            <option value="Mediterranean">Mediterranean</option>
                          </select>
                        ) : (
                          <p className="text-gray-600 py-3 font-medium">{profileData.dietType}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Allergies & Intolerances</label>
                        <div className="flex flex-wrap gap-2">
                          {profileData.allergies.map((allergy) => (
                            <span
                              key={allergy}
                              className="px-4 py-2 bg-[#F10100]/10 text-[#F10100] rounded-full text-sm font-semibold flex items-center space-x-2"
                            >
                              <AlertCircle className="w-3 h-3" />
                              <span>{allergy}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Favorite Ingredients</label>
                        <div className="flex flex-wrap gap-2">
                          {profileData.favoriteIngredients.map((ingredient) => (
                            <span
                              key={ingredient}
                              className="px-4 py-2 bg-[#476E00]/10 text-[#476E00] rounded-full text-sm font-semibold"
                            >
                              {ingredient}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Favorite Cuisines</label>
                        <div className="flex flex-wrap gap-2">
                          {profileData.favoriteCuisines.map((cuisine) => (
                            <span
                              key={cuisine}
                              className="px-4 py-2 bg-[#FFD122]/10 text-[#FFD122] rounded-full text-sm font-semibold"
                            >
                              {cuisine}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <ScrollReveal delay={0.4}>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl shadow-professional p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 font-display">Activity Metrics</h2>
                  <div className="space-y-6">
                    {[
                      { icon: Activity, label: "Daily Steps", value: profileData.dailySteps, color: "#F10100" },
                      { icon: Moon, label: "Sleep Duration", value: `${profileData.sleepDuration} hours`, color: "#476E00" },
                      { icon: Zap, label: "Workout Duration", value: `${profileData.workoutDuration} mins`, color: "#FFD122" },
                      { icon: TrendingUp, label: "Activity Level", value: profileData.activityLevel, color: "#D8D86B" }
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100"
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: `${item.color}15` }}
                            >
                              <Icon className="w-6 h-6" style={{ color: item.color }} />
                            </div>
                            <span className="font-semibold text-gray-700">{item.label}</span>
                          </div>
                          <span className="text-xl font-bold text-gray-900">{item.value}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-professional p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 font-display">Weekly Progress</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockMoodTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'white', 
                            border: 'none', 
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Bar dataKey="Energetic" fill="#FFD122" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Mood History Tab */}
          {activeTab === "mood" && (
            <ScrollReveal delay={0.4}>
              <div className="space-y-8">
                <div className="bg-white rounded-3xl shadow-professional p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 font-display">Mood Trends</h2>
                    <div className="flex items-center space-x-2">
                      <Brain className="w-6 h-6 text-[#F10100]" />
                      <span className="text-lg font-semibold text-gray-700">Current: Energetic</span>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockMoodTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'white', 
                            border: 'none', 
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Line type="monotone" dataKey="Happy" stroke="#476E00" strokeWidth={3} dot={{ fill: "#476E00", strokeWidth: 0, r: 5 }} />
                        <Line type="monotone" dataKey="Energetic" stroke="#FFD122" strokeWidth={3} dot={{ fill: "#FFD122", strokeWidth: 0, r: 5 }} />
                        <Line type="monotone" dataKey="Stressed" stroke="#F10100" strokeWidth={3} dot={{ fill: "#F10100", strokeWidth: 0, r: 5 }} />
                        <Line type="monotone" dataKey="Focused" stroke="#D8D86B" strokeWidth={3} dot={{ fill: "#D8D86B", strokeWidth: 0, r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-3xl shadow-professional p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 font-display">Most Frequent</h3>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[#476E00]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Heart className="w-8 h-8 text-[#476E00]" />
                      </div>
                      <div className="text-2xl font-bold text-[#476E00] font-display">Happy</div>
                      <div className="text-gray-500">45% of the time</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl shadow-professional p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 font-display">Best Day</h3>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[#FFD122]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="w-8 h-8 text-[#FFD122]" />
                      </div>
                      <div className="text-2xl font-bold text-[#FFD122] font-display">Friday</div>
                      <div className="text-gray-500">Most positive mood</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl shadow-professional p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 font-display">Improvement</h3>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[#F10100]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-8 h-8 text-[#F10100]" />
                      </div>
                      <div className="text-2xl font-bold text-[#F10100] font-display">+15%</div>
                      <div className="text-gray-500">vs last month</div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* My Recipes Tab */}
          {activeTab === "recipes" && (
            <ScrollReveal delay={0.4}>
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-900 font-display">My Recipe Collection</h2>
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-gray-500">
                      <div>Total: <span className="font-bold text-gray-900">{userRecipes.length}</span></div>
                      <div>Avg Rating: <span className="font-bold text-[#FFD122]">4.7 ⭐</span></div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userRecipes.length > 0 ? (
                    userRecipes.map((recipe, index) => (
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
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-current text-yellow-400" />
                          <span>{recipe.rating}</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 font-display">
                          {recipe.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{recipe.cookTime}</span>
                          </div>
                          <span>Serves {recipe.servings}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            by <span className="font-medium">{recipe.author}</span>
                          </span>
                          <div className="text-sm font-bold text-[#F10100]">
                            {recipe.reviews} reviews
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-16 bg-white rounded-3xl shadow-professional">
                      <div className="text-6xl mb-4">🍽️</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">No recipes yet</h3>
                      <p className="text-gray-600 mb-6">
                        Start sharing your amazing recipes with the community!
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-[#F10100] to-[#FFD122] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                        onClick={() => window.location.href = '/submit'}
                      >
                        Create Your First Recipe
                      </motion.button>
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
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 font-display">Account Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300 font-medium"
                      />
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
                  disabled={saveStatus.type === 'loading'}
                  className="bg-gradient-to-r from-[#F10100] to-[#FF4444] text-white px-12 py-4 rounded-2xl font-bold text-lg flex items-center space-x-3 shadow-xl hover:shadow-2xl transition-all duration-300 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-6 h-6" />
                  <span>{saveStatus.type === 'loading' ? 'Saving...' : 'Save All Changes'}</span>
                </motion.button>
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
                      disabled={saveStatus.type === 'loading'}
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

export default Profile;