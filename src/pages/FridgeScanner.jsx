import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Webcam from "react-webcam";
import { Camera, Upload, Scan, X, ChefHat, Clock, Zap, RefreshCw, CheckCircle } from "lucide-react";
import ScrollReveal from "../components/ScrollReveal";
import { mockFridgeScans } from "../mock.jsx";

const FridgeScanner = () => {
  const [scanMode, setScanMode] = useState("camera"); // camera, upload, results
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Categorize ingredients based on their names
  const categorizeIngredient = (ingredientName) => {
    const name = ingredientName.toLowerCase();
    
    // Fruits
    if (['apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'lemon', 'lime', 'pear', 'peach', 'plum', 'cherry', 'watermelon', 'pineapple', 'mango', 'kiwi', 'avocado'].some(fruit => name.includes(fruit))) {
      return 'Fruits';
    }
    
    // Vegetables
    if (['tomato', 'potato', 'onion', 'garlic', 'carrot', 'broccoli', 'spinach', 'lettuce', 'cabbage', 'pepper', 'cucumber', 'zucchini', 'eggplant', 'corn', 'peas', 'beans', 'celery', 'mushroom', 'radish', 'beet'].some(veg => name.includes(veg))) {
      return 'Vegetables';
    }
    
    // Default category
    return 'Produce';
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc || typeof imageSrc !== 'string' || !imageSrc.startsWith('data:image')) {
      setError('Could not capture image from camera. Please allow camera access and try again.');
      return;
    }
    setCapturedImage(imageSrc);
    performScan(imageSrc);
  }, [webcamRef]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (!result || typeof result !== 'string' || !result.startsWith('data:image')) {
        setError('Selected file could not be read as an image.');
        return;
      }
      setCapturedImage(result);
      performScan(result);
    };
    reader.readAsDataURL(file);
  };

  const performScan = async (imageData) => {
    if (!imageData || typeof imageData !== 'string' || !imageData.startsWith('data:image')) {
      setError('Invalid image data for scanning.');
      setScanMode('camera');
      setIsScanning(false);
      return;
    }
    setIsScanning(true);
    setScanMode("scanning");
    
    try {
      // Convert base64 image to blob for upload
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Create FormData for API call
      const formData = new FormData();
      formData.append('file', blob, 'fridge_scan.jpg');
      
      // Call YOLO model API
      const apiResponse = await fetch('http://localhost:4010/api/predict', {
        method: 'POST',
        body: formData
      });
      
      if (!apiResponse.ok) {
        throw new Error(`API Error: ${apiResponse.status}`);
      }
      
      const predictions = await apiResponse.json();
      console.log('Raw predictions from backend:', predictions);
      
      // Transform YOLO predictions to our format
      const detectedIngredients = predictions.predictions.map(pred => ({
        name: pred.className,
        confidence: Math.round(pred.confidence * 100), // Convert decimal to percentage
        category: categorizeIngredient(pred.className),
        bbox: pred.bbox
      })).filter(item => item.confidence > 0.1) // Filter low confidence detections (10% threshold)
        .sort((a, b) => b.confidence - a.confidence); // Sort by confidence
      
      console.log('Processed detected ingredients:', detectedIngredients);
      
      // If no ingredients detected, show fallback message
      if (detectedIngredients.length === 0) {
        setError("No ingredients detected. Try taking a clearer photo with better lighting.");
        setIsScanning(false);
        setScanMode("camera");
        return;
      }

      // Generate recipe suggestions based on detected ingredients
      const suggestedRecipes = generateRecipeSuggestions(detectedIngredients);
      
      // Create nutrition summary
      const nutritionSummary = {
        estimatedMeals: Math.min(detectedIngredients.length, 5),
        avgCalories: Math.round(detectedIngredients.length * 45 + Math.random() * 100),
        categories: getCategoriesFromIngredients(detectedIngredients)
      };

      const results = {
        detectedIngredients,
        suggestedRecipes,
        nutritionSummary
      };
      
      setScanResults(results);
      setError(null);
      
      // Tell the component to switch to the results view
      setScanMode("results");
      
    } catch (error) {
      console.error('Scan error:', error);
      setError(`Scanning failed: ${error.message}. Make sure the YOLO model server is running on port 4010.`);
      setScanMode("camera");
    } finally {
      setIsScanning(false);
    }
  };

  // Generate recipe suggestions based on detected ingredients
  const generateRecipeSuggestions = (ingredients) => {
    const recipes = [
      {
        id: 1,
        name: "Fresh Garden Salad",
        cookTime: "5 mins",
        calories: 150,
        difficulty: "Easy",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        mood: "Fresh"
      },
      {
        id: 2,
        name: "Roasted Vegetable Medley",
        cookTime: "25 mins",
        calories: 220,
        difficulty: "Easy",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        mood: "Comforting"
      },
      {
        id: 3,
        name: "Fruit & Veggie Smoothie Bowl",
        cookTime: "10 mins",
        calories: 280,
        difficulty: "Easy",
        image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        mood: "Energetic"
      }
    ];

    return recipes.map(recipe => ({
      ...recipe,
      matchedIngredients: Math.min(ingredients.length, Math.floor(Math.random() * 4) + 2),
      totalIngredients: Math.floor(Math.random() * 3) + 4
    }));
  };

  // Get categories from detected ingredients
  const getCategoriesFromIngredients = (ingredients) => {
    const categories = new Set();
    ingredients.forEach(ingredient => {
      categories.add(ingredient.category);
    });
    
    const categoryList = Array.from(categories);
    if (categoryList.includes('Fruits')) categoryList.push('High Vitamin C');
    if (categoryList.includes('Vegetables')) categoryList.push('High Fiber');
    
    return categoryList.slice(0, 3);
  };

  const resetScanner = () => {
    setScanMode("camera");
    setScanResults(null);
    setCapturedImage(null);
    setIsScanning(false);
    setError(null);
  };

  if (scanMode === "scanning") {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 bg-gradient-to-r from-[#F10100] to-[#FFD122] rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <Scan className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-display">Analyzing Your Fridge</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
            Our YOLO AI model is detecting fruits and vegetables to suggest perfect recipes...
          </p>
          <div className="flex justify-center space-x-4 text-sm text-gray-500">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-[#F10100] rounded-full"></div>
              <span>Detecting ingredients</span>
            </motion.div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              className="flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-[#FFD122] rounded-full"></div>
              <span>Matching recipes</span>
            </motion.div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
              className="flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-[#476E00] rounded-full"></div>
              <span>Calculating nutrition</span>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (scanMode === "results") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-display">
                  Scan Complete!
                </h1>
              </div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
                We detected <span className="font-bold text-green-600">{scanResults.detectedIngredients.length} ingredient{scanResults.detectedIngredients.length !== 1 ? 's' : ''}</span> and found amazing recipes using your available items
              </p>
              <div className="flex justify-center items-center space-x-2 text-sm text-gray-500">
                <span>Detected:</span>
                {scanResults.detectedIngredients.slice(0, 3).map((ingredient, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    {ingredient.name}
                  </span>
                ))}
                {scanResults.detectedIngredients.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    +{scanResults.detectedIngredients.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Detected Ingredients */}
            <div className="lg:col-span-1">
              <ScrollReveal direction="left" delay={0.2}>
                <div className="bg-white rounded-3xl shadow-professional p-6 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 font-display">
                    Detected Ingredients
                  </h2>
                  <div className="space-y-3">
                    {scanResults.detectedIngredients.map((ingredient, index) => (
                      <motion.div
                        key={`${ingredient.name}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-100 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <span className="font-bold text-lg text-gray-900 capitalize">
                              {ingredient.name}
                            </span>
                            <div className="text-sm text-gray-600">
                              Category: <span className="font-medium">{ingredient.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {ingredient.confidence}%
                          </div>
                          <div className="text-xs text-gray-500">confidence</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="left" delay={0.3}>
                <div className="bg-white rounded-3xl shadow-professional p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 font-display">
                    Nutrition Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Estimated Meals</span>
                      <span className="font-bold text-[#F10100]">
                        {scanResults.nutritionSummary.estimatedMeals}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Avg Calories</span>
                      <span className="font-bold text-[#FFD122]">
                        {scanResults.nutritionSummary.avgCalories}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {scanResults.nutritionSummary.categories.map((category) => (
                          <span
                            key={category}
                            className="px-3 py-1 bg-[#476E00]/10 text-[#476E00] rounded-full text-sm font-medium"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Recipe Suggestions */}
            <div className="lg:col-span-2">
              <ScrollReveal direction="right" delay={0.2}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 font-display">
                    Suggested Recipes
                  </h2>
                  <button
                    onClick={resetScanner}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-colors duration-300"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Scan Again</span>
                  </button>
                </div>
              </ScrollReveal>

              <div className="space-y-6">
                {scanResults.suggestedRecipes.map((recipe, index) => (
                  <ScrollReveal key={recipe.id} direction="up" delay={0.3 + index * 0.1}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-3xl shadow-professional hover:shadow-professional-hover overflow-hidden transition-all duration-500"
                    >
                      <div className="md:flex">
                        <div className="md:w-1/3">
                          <img
                            src={recipe.image}
                            alt={recipe.name}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        </div>
                        <div className="md:w-2/3 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-2 font-display">
                                {recipe.name}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{recipe.cookTime}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Zap className="w-4 h-4" />
                                  <span>{recipe.calories} cal</span>
                                </div>
                                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                  {recipe.difficulty}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-[#476E00]">
                                {Math.round((recipe.matchedIngredients / recipe.totalIngredients) * 100)}%
                              </div>
                              <div className="text-xs text-gray-500">
                                {recipe.matchedIngredients}/{recipe.totalIngredients} ingredients
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span
                                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                                style={{ backgroundColor: recipe.mood === "Energetic" ? "#FFD122" : recipe.mood === "Happy" ? "#476E00" : "#F1E1C8" }}
                              >
                                {recipe.mood} Mood
                              </span>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-gradient-to-r from-[#F10100] to-[#FF4444] text-white px-6 py-3 rounded-2xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <ChefHat className="w-4 h-4" />
                              <span>Cook Now</span>
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-display">
              Smart Fridge <span className="text-[#F10100]">Scanner</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Scan your fridge and get personalized recipe recommendations based on available ingredients
            </p>
          </div>
        </ScrollReveal>

        {/* Scanner Interface */}
        <ScrollReveal delay={0.2}>
          <div className="bg-white rounded-3xl shadow-professional overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => setScanMode("camera")}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    scanMode === "camera"
                      ? "bg-[#F10100] text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Use Camera</span>
                </button>
                <button
                  onClick={() => setScanMode("upload")}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    scanMode === "upload"
                      ? "bg-[#F10100] text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl"
                >
                  <div className="flex items-center space-x-2">
                    <X className="w-5 h-5 text-red-500" />
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </motion.div>
              )}

              {scanMode === "camera" ? (
                <div className="space-y-6">
                  <div className="relative bg-gray-900 rounded-2xl overflow-hidden">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      className="w-full h-80 object-cover"
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: "environment" }}
                    />
                    <div className="absolute inset-0 border-4 border-dashed border-[#FFD122]/50 m-4 rounded-xl pointer-events-none" />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm">
                      Point camera at your fridge contents
                    </div>
                  </div>
                  <div className="text-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={capture}
                      disabled={isScanning}
                      className="bg-gradient-to-r from-[#F10100] to-[#FF4444] text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center space-x-3 shadow-xl hover:shadow-2xl transition-all duration-300 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Scan className="w-6 h-6" />
                      <span>{isScanning ? 'Scanning...' : 'Scan Fridge'}</span>
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-[#F10100] rounded-2xl p-12 text-center cursor-pointer transition-colors duration-300"
                  >
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Click to upload fridge photo
                    </p>
                    <p className="text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Recent Scans */}
        <ScrollReveal delay={0.4}>
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display">Recent Scans</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {mockFridgeScans.map((scan, index) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-3xl shadow-professional p-6 hover:shadow-professional-hover transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 font-display">
                      Scan from {new Date(scan.date).toLocaleDateString()}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {scan.ingredients.length} ingredients
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {scan.ingredients.slice(0, 4).map((ingredient) => (
                      <span
                        key={ingredient}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {ingredient}
                      </span>
                    ))}
                    {scan.ingredients.length > 4 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm">
                        +{scan.ingredients.length - 4} more
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>{scan.suggestedRecipes.length} recipes</strong> suggested
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </motion.div>
  );
};

export default FridgeScanner;