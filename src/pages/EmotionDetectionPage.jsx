import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Brain, 
  Utensils, 
  Clock, 
  Flame, 
  Plus, 
  RefreshCw, 
  Share2, 
  TrendingUp,
  Zap,
  Coffee,
  Pizza,
  Salad,
  Cake,
  Leaf,
  Type,
  Send,
  ChefHat,
  Timer,
  Users,
  Sparkles,
  Star,
  ArrowRight,
  CheckCircle,
  Filter,
  Search,
  Globe,
  Award,
  Target,
  Activity
} from "lucide-react";

const EmotionDetectionPage = () => {
  const [currentMood, setCurrentMood] = useState(null);
  const [moodIntensity, setMoodIntensity] = useState(5);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionMethod, setDetectionMethod] = useState('manual');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [selectedTime, setSelectedTime] = useState('all');
  const [selectedCalories, setSelectedCalories] = useState('all');
  const [textInput, setTextInput] = useState('');
  const [isTextAnalyzing, setIsTextAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [recipeError, setRecipeError] = useState(null);

  const moods = [
    { id: 'joy', emoji: '😊', name: 'Happy', color: 'from-yellow-400 to-orange-400', description: 'Energetic and positive' },
    { id: 'neutral', emoji: '😌', name: 'Calm', color: 'from-blue-400 to-cyan-400', description: 'Relaxed and peaceful' },
    { id: 'sadness', emoji: '😞', name: 'Sad', color: 'from-gray-400 to-blue-400', description: 'Need comfort and warmth' },
    { id: 'anger', emoji: '😡', name: 'Angry', color: 'from-red-400 to-pink-400', description: 'High tension and anxiety' },
    { id: 'fear', emoji: '😨', name: 'Anxious', color: 'from-purple-400 to-indigo-400', description: 'Low energy and fatigue' },
    { id: 'surprise', emoji: '😍', name: 'Excited', color: 'from-pink-400 to-red-400', description: 'High energy and enthusiasm' }
  ];

  // Function to fetch recipes from our API based on mood
  const fetchRecipesByMood = async (mood, preferences = {}) => {
    setIsLoadingRecipes(true);
    setRecipeError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/recipes/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood: mood,
          preferences: {
            cuisine: selectedCuisine !== 'all' ? selectedCuisine : undefined,
            diet: preferences.diet || 'all',
            maxReadyTime: selectedTime !== 'all' ? parseInt(selectedTime) : undefined,
            maxCalories: selectedCalories !== 'all' ? parseInt(selectedCalories) : undefined,
            number: 6
          }
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('🍽️ Recipes fetched:', result);
        setRecommendations(result.recipes || []);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch recipes');
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipeError(error.message);
      // Fallback to mock data
      setRecommendations(getMockRecommendations(mood));
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  // Mock food recommendations as fallback
  const getMockRecommendations = (mood) => {
    const recommendations = {
      joy: [
        {
          id: 1,
          name: "Rainbow Buddha Bowl",
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
          calories: 420,
          protein: "18g",
          carbs: "45g",
          fats: "22g",
          moodBenefit: "Boosts serotonin with natural carbs and colorful nutrients",
          cuisine: "vegan",
          time: "lunch"
        }
      ],
      neutral: [
        {
          id: 2,
          name: "Lavender Chamomile Tea Cake",
          image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
          calories: 280,
          protein: "6g",
          carbs: "38g",
          fats: "12g",
          moodBenefit: "Lavender and chamomile promote relaxation and calmness",
          cuisine: "dessert",
          time: "snack"
        }
      ],
      sadness: [
        {
          id: 3,
          name: "Warm Chicken Soup",
          image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
          calories: 320,
          protein: "25g",
          carbs: "28g",
          fats: "15g",
          moodBenefit: "Comforting and warming, perfect for lifting spirits",
          cuisine: "comfort",
          time: "dinner"
        }
      ],
      anger: [
        {
          id: 4,
          name: "Spicy Thai Curry",
          image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400",
          calories: 450,
          protein: "22g",
          carbs: "35g",
          fats: "28g",
          moodBenefit: "Spicy food can help release endorphins and reduce stress",
          cuisine: "thai",
          time: "dinner"
        }
      ],
      fear: [
        {
          id: 5,
          name: "Calming Chamomile Smoothie",
          image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400",
          calories: 180,
          protein: "8g",
          carbs: "22g",
          fats: "6g",
          moodBenefit: "Gentle and soothing, helps calm nerves",
          cuisine: "smoothie",
          time: "snack"
        }
      ],
      surprise: [
        {
          id: 6,
          name: "Colorful Sushi Roll",
          image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
          calories: 380,
          protein: "16g",
          carbs: "42g",
          fats: "18g",
          moodBenefit: "Exciting flavors and textures to match your enthusiasm",
          cuisine: "japanese",
          time: "lunch"
        }
      ],
      disgust: [
        {
          id: 7,
          name: "Fresh Green Salad",
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
          calories: 220,
          protein: "12g",
          carbs: "18g",
          fats: "14g",
          moodBenefit: "Clean, fresh ingredients to reset your palate",
          cuisine: "salad",
          time: "lunch"
        }
      ]
    };
    return recommendations[mood] || recommendations.joy;
  };

  // Function to detect mood from text using the API
  const detectMoodFromText = async () => {
    if (!textInput.trim()) return;
    
    setIsTextAnalyzing(true);
    try {
      const response = await fetch('http://localhost:8000/detect-mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
      });
      
      if (response.ok) {
        const result = await response.json();
        const detectedMood = moods.find(mood => mood.id === result.mood) || moods[0];
        setCurrentMood(detectedMood);
        setDetectionMethod('text');
        
        // Fetch real recipes based on detected mood
        await fetchRecipesByMood(result.mood);
      } else {
        console.error('Failed to detect mood from text');
        setDetectionMethod('manual');
      }
    } catch (error) {
      console.error('Error detecting mood from text:', error);
      setDetectionMethod('manual');
    } finally {
      setIsTextAnalyzing(false);
    }
  };

  // Simulate mood detection
  const detectMood = () => {
    setIsDetecting(true);
    setTimeout(() => {
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      setCurrentMood(randomMood);
      setDetectionMethod('auto');
      setIsDetecting(false);
      
      // Fetch real recipes based on detected mood
      fetchRecipesByMood(randomMood.id);
    }, 3000);
  };

  // Handle mood selection
  const selectMood = (mood) => {
    setCurrentMood(mood);
    setDetectionMethod('manual');
    
    // Fetch real recipes based on selected mood
    fetchRecipesByMood(mood.id);
  };

  // Handle text input change
  const handleTextChange = (e) => {
    setTextInput(e.target.value);
  };

  // Handle text submission
  const handleTextSubmit = (e) => {
    e.preventDefault();
    detectMoodFromText();
  };

  // Handle preference changes
  const handlePreferenceChange = (type, value) => {
    switch (type) {
      case 'cuisine':
        setSelectedCuisine(value);
        break;
      case 'time':
        setSelectedTime(value);
        break;
      case 'calories':
        setSelectedCalories(value);
        break;
      default:
        break;
    }
    
    // Refetch recipes with new preferences if mood is set
    if (currentMood) {
      fetchRecipesByMood(currentMood.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#F10100]/10 to-[#FFD122]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-400/5 to-yellow-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center relative z-10"
          >
            {/* Floating Icons */}
            <div className="absolute -top-10 -left-10 w-20 h-20 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <div className="absolute -top-5 -right-5 w-16 h-16 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '1s' }}>
              <Brain className="w-6 h-6 text-blue-500" />
            </div>
            <div className="absolute top-10 left-1/4 w-14 h-14 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '1.5s' }}>
              <Utensils className="w-5 h-5 text-orange-500" />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-8"
            >
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-700">AI-Powered Mood Detection</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              What's Your{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-[#F10100] via-[#FFD122] to-[#F10100] bg-clip-text text-transparent animate-pulse">
                  Mood
                </span>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#F10100] to-[#FFD122] rounded-full"
                />
              </span>{" "}
              Today?
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed"
            >
              Discover the perfect culinary experience tailored to your emotions. 
              <span className="font-semibold text-gray-800"> Our AI analyzes your mood</span> and recommends 
              <span className="font-semibold text-gray-800"> personalized recipes</span> that match your energy and feelings.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Real-time Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Personalized Recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Nutritional Insights</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Mood Detection Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Choose Your Detection Method
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Select how you'd like to discover your current mood and get personalized food recommendations
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Auto Detection Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 hover:shadow-3xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    AI Detection
              </h3>
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    Recommended
                  </div>
                </div>
              
              {currentMood && detectionMethod === 'auto' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                    <div className="relative mb-6">
                      <div className="text-8xl mb-4 animate-bounce">{currentMood.emoji}</div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentMood.name}
                  </h4>
                  <p className="text-gray-600 mb-6">{currentMood.description}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={detectMood}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                      <RefreshCw className="w-4 h-4" />
                    Re-scan Mood
                  </motion.button>
                </motion.div>
              ) : (
                <div className="text-center">
                    <div className="mb-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Analysis</h4>
                      <p className="text-sm text-gray-600">Our advanced AI will analyze your current emotional state</p>
                    </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={detectMood}
                    disabled={isDetecting}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isDetecting ? (
                        <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Heart className="w-6 h-6" />
                        </motion.div>
                        Detecting Mood...
                        </>
                    ) : (
                      <>
                          <Heart className="w-6 h-6" />
                        Detect My Mood
                          <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
            </motion.div>

            {/* Text-based Mood Detection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 hover:shadow-3xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
                      <Type className="w-6 h-6 text-white" />
                    </div>
                    Text Analysis
              </h3>
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    Advanced
                  </div>
                </div>
              
              {currentMood && detectionMethod === 'text' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                    <div className="relative mb-6">
                      <div className="text-8xl mb-4 animate-bounce">{currentMood.emoji}</div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentMood.name}
                  </h4>
                  <p className="text-gray-600 mb-6">{currentMood.description}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setTextInput('');
                      setCurrentMood(null);
                      setDetectionMethod('manual');
                    }}
                      className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                      <RefreshCw className="w-4 h-4" />
                    Try Again
                  </motion.button>
                </motion.div>
              ) : (
                  <div>
                    <div className="mb-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Type className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2"><br></br><br></br><br></br><br></br>Natural Language Processing</h4>
                      <p className="text-sm text-gray-600">Describe your feelings and our AI will understand your mood</p>
                    </div>
                    <form onSubmit={handleTextSubmit} className="space-y-4">
                      <div className="relative">
                    <textarea
                      value={textInput}
                      onChange={handleTextChange}
                      placeholder="Describe how you're feeling today... (e.g., 'I'm feeling really stressed about work and need something comforting')"
                          className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                      rows={4}
                      disabled={isTextAnalyzing}
                    />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                          {textInput.length}/500
                        </div>
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!textInput.trim() || isTextAnalyzing}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isTextAnalyzing ? (
                          <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Brain className="w-5 h-5" />
                        </motion.div>
                        Analyzing...
                          </>
                    ) : (
                      <>
                            <Send className="w-5 h-5" />
                        Analyze My Text
                            <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>
                  </div>
              )}
            </div>
            </motion.div>

            {/* Manual Mood Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 hover:shadow-3xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    Quick Select
              </h3>
                  <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                    Instant
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Mood</h4>
                  <p className="text-sm text-gray-600">Select from our curated mood options for instant recommendations</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {moods.map((mood, index) => (
                  <motion.button
                    key={mood.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => selectMood(mood)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 group ${
                      currentMood?.id === mood.id
                          ? 'border-[#F10100] bg-gradient-to-r ' + mood.color + ' text-white shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">{mood.emoji}</div>
                    <div className="text-sm font-medium">{mood.name}</div>
                      {currentMood?.id === mood.id && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                  </motion.button>
                ))}
              </div>
            </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Food Recommendations */}
        {currentMood && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#F10100] to-[#FFD122] text-white px-6 py-3 rounded-full shadow-lg mb-6"
              >
                <div className="text-2xl">{currentMood.emoji}</div>
                <div>
                  <h3 className="text-xl font-bold">Perfect for {currentMood.name} Mood</h3>
                  <p className="text-sm opacity-90">Personalized recommendations just for you</p>
                </div>
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Your Personalized Recommendations
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover delicious recipes that perfectly match your current mood and energy level
              </p>
            </div>

            {/* Enhanced Preferences Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h4 className="text-lg font-semibold text-gray-900">Filter Your Results</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Cuisine Type
                  </label>
                <select
                  value={selectedCuisine}
                  onChange={(e) => handlePreferenceChange('cuisine', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F10100] focus:border-[#F10100] transition-all duration-200 bg-white"
                  >
                    <option value="all">🌍 All Cuisines</option>
                    <option value="italian">🍝 Italian</option>
                    <option value="mexican">🌮 Mexican</option>
                    <option value="chinese">🥢 Chinese</option>
                    <option value="japanese">🍣 Japanese</option>
                    <option value="thai">🌶️ Thai</option>
                    <option value="indian">🍛 Indian</option>
                    <option value="mediterranean">🫒 Mediterranean</option>
                </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    Cooking Time
                  </label>
                <select
                  value={selectedTime}
                  onChange={(e) => handlePreferenceChange('time', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F10100] focus:border-[#F10100] transition-all duration-200 bg-white"
                  >
                    <option value="all">⏰ Any Time</option>
                    <option value="15">⚡ Quick (≤15 min)</option>
                    <option value="30">🚀 Fast (≤30 min)</option>
                    <option value="45">⏱️ Medium (≤45 min)</option>
                    <option value="60">☕ Relaxed (≤60 min)</option>
                </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Calories
                  </label>
                <select
                  value={selectedCalories}
                  onChange={(e) => handlePreferenceChange('calories', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F10100] focus:border-[#F10100] transition-all duration-200 bg-white"
                  >
                    <option value="all">🔥 Any Calories</option>
                    <option value="300">🥗 Light (≤300 cal)</option>
                    <option value="500">⚖️ Moderate (≤500 cal)</option>
                    <option value="700">🍽️ Hearty (≤700 cal)</option>
                    <option value="1000">🎉 Indulgent (≤1000 cal)</option>
                </select>
              </div>
            </div>
            </motion.div>

            {/* Loading State */}
            {isLoadingRecipes && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 bg-gradient-to-r from-[#F10100] to-[#FFD122] rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <ChefHat className="w-10 h-10 text-white" />
                </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F10100] to-[#FFD122] rounded-full blur-lg opacity-30 animate-pulse"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Crafting Your Perfect Menu</h3>
                <p className="text-lg text-gray-600">Finding the most delicious recipes for your {currentMood.name.toLowerCase()} mood...</p>
                <div className="flex justify-center mt-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#F10100] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#FFD122] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[#F10100] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
              </div>
              </motion.div>
            )}

            {/* Error State */}
            {recipeError && !isLoadingRecipes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 mb-8"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 text-red-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-red-800">API Connection Issue</h4>
                </div>
                <p className="text-red-700">
                  <strong>Note:</strong> {recipeError} We're showing sample recommendations instead to keep your experience smooth.
                </p>
              </motion.div>
            )}

            {/* Recipes Grid */}
            {!isLoadingRecipes && recommendations.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendations.map((dish, index) => (
                <motion.div
                  key={dish.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100"
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#F10100]/5 to-[#FFD122]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                      <Flame className="w-4 h-4 text-orange-500" />
                      </div>
                      {dish.spoonacularScore && (
                        <div className="bg-gradient-to-r from-[#F10100] to-[#FFD122] text-white rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {Math.round(dish.spoonacularScore)}
                        </div>
                      )}
                    </div>
                      
                      {/* Recipe Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                      <div className="flex items-center gap-4 text-white text-sm mb-2">
                          {dish.readyInMinutes && (
                          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                            <Timer className="w-3 h-3" />
                              {dish.readyInMinutes}m
                            </div>
                          )}
                          {dish.servings && (
                          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                            <Users className="w-3 h-3" />
                              {dish.servings}
                            </div>
                          )}
                            </div>
                      <h4 className="text-xl font-bold text-white mb-1 group-hover:text-yellow-300 transition-colors duration-300">
                        {dish.name}
                      </h4>
                    </div>
                  </div>
                    
                  <div className="p-6 relative z-10">
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{dish.moodBenefit}</p>
                    
                    {/* Enhanced Nutrition Info */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="text-center p-3 bg-gray-50 rounded-xl group-hover:bg-[#F10100]/5 transition-colors duration-300">
                        <div className="text-lg font-bold text-gray-900">{dish.calories}</div>
                        <div className="text-xs text-gray-500 font-medium">calories</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl group-hover:bg-[#FFD122]/5 transition-colors duration-300">
                        <div className="text-lg font-bold text-gray-900">{dish.protein}</div>
                        <div className="text-xs text-gray-500 font-medium">protein</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl group-hover:bg-green-500/5 transition-colors duration-300">
                        <div className="text-lg font-bold text-gray-900">{dish.carbs}</div>
                        <div className="text-xs text-gray-500 font-medium">carbs</div>
                      </div>
                    </div>
                    
                    {/* Enhanced Action Buttons */}
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 bg-gradient-to-r from-[#F10100] to-[#FFD122] text-white py-3 px-4 rounded-xl font-semibold text-sm hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                      >
                        <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-300" />
                        Add to Plan
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-[#F10100] hover:bg-[#F10100]/5 transition-all duration-300 group/btn"
                      >
                        <Share2 className="w-4 h-4 text-gray-600 group-hover/btn:text-[#F10100] transition-colors duration-300" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            )}
          </motion.div>
        )}

        {/* Call-to-Action Footer */}
        {currentMood && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <div className="relative overflow-hidden bg-gradient-to-r from-[#F10100] via-[#FFD122] to-[#F10100] rounded-3xl p-12 text-white">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
              </div>
              
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6"
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-semibold">Ready to Transform Your Eating?</span>
                </motion.div>
                
                <h3 className="text-3xl md:text-4xl font-bold mb-4">Take Your Mood-Based Nutrition to the Next Level</h3>
                <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
                  Save your personalized recommendations and create a comprehensive diet plan that adapts to your emotional patterns and nutritional needs.
                </p>
                
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                    className="bg-white text-[#F10100] px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-3 group"
                >
                    <Award className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  Save My Recommendations
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                    className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-[#F10100] transition-all duration-300 flex items-center gap-3 group"
                >
                    <ChefHat className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  Generate Diet Plan
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
                </div>
                
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm opacity-80">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Personalized Recipes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Nutritional Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Mood Tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EmotionDetectionPage;
