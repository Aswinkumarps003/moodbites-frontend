import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, Utensils, ArrowLeft, Star, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DietPlanView = () => {
  const [recipeData, setRecipeData] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRecipe = localStorage.getItem('currentRecipe');
    if (storedRecipe) {
      setRecipeData(JSON.parse(storedRecipe));
    } else {
      navigate('/diet-planner');
    }
  }, [navigate]);

  const markAsComplete = () => {
    setIsCompleted(true);
    setShowCelebration(true);
    
    // Store completion in localStorage
    const completedRecipes = JSON.parse(localStorage.getItem('completedRecipes') || '[]');
    completedRecipes.push({
      ...recipeData,
      completedAt: new Date().toISOString()
    });
    localStorage.setItem('completedRecipes', JSON.stringify(completedRecipes));
    
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const getMealEmoji = (mealType) => {
    switch (mealType) {
      case 'Breakfast': return '🌅';
      case 'Snack1': return '🍎';
      case 'Lunch': return '🌞';
      case 'Snack2': return '🍌';
      case 'Dinner': return '🌙';
      default: return '🍽️';
    }
  };

  if (!recipeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* Enhanced Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl border-b border-white/20 relative z-10 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.close()}
              className="p-3 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-emerald-100 hover:to-teal-100 transition-all duration-300 shadow-lg"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </motion.button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">{getMealEmoji(recipeData.mealType)}</span>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {recipeData.mealType}
              </h1>
              </div>
              <p className="text-gray-600 text-lg font-medium">{recipeData.recipe}</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">{recipeData.readyInMinutes ? `${recipeData.readyInMinutes} min` : '30-45 min'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Recipe Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-8"
        >
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                {recipeData.recipe}
              </h2>
              {recipeData.image && (
                <div className="mb-6 overflow-hidden rounded-2xl shadow-lg">
                  <img src={recipeData.image} alt={recipeData.recipe} className="w-full h-64 object-cover" />
                </div>
              )}
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                A delicious and nutritious {recipeData.mealType.toLowerCase()} recipe that fits perfectly into your diet plan. 
                This dish combines fresh ingredients to create a balanced meal that supports your health goals.
              </p>
              
              <div className="flex items-center gap-8 mb-6">
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl">
                  <Utensils className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">{recipeData.ingredients.length} Ingredients</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl">
                  <Heart className="w-5 h-5 text-red-600" />
                  <span className="text-red-700 font-semibold">
                    {typeof recipeData.calories === 'number' ? `${Math.round(recipeData.calories)} kcal` : recipeData.calories}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-3xl p-6 border-2 border-emerald-100 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">📊</span>
                  </div>
                  <h3 className="text-xl font-bold text-emerald-800">Nutrition Info</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                    <span className="text-gray-600 font-medium">Calories</span>
                    <span className="font-bold text-emerald-700">{typeof recipeData.calories === 'number' ? Math.round(recipeData.calories) : recipeData.calories}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                    <span className="text-gray-600 font-medium">Servings</span>
                    <span className="font-bold text-emerald-700">{recipeData.servings || '2-3'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                    <span className="text-gray-600 font-medium">Prep Time</span>
                    <span className="font-bold text-emerald-700">15 min</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                    <span className="text-gray-600 font-medium">Cook Time</span>
                    <span className="font-bold text-emerald-700">30 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Ingredients List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🛒</span>
              </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Shopping List
            </h3>
            <p className="text-gray-600 text-lg">Here are all the ingredients you'll need for this recipe</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipeData.ingredients.map((ingredient, index) => (
              <motion.div
                key={ingredient}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="group p-4 rounded-2xl border-2 border-gray-200 hover:border-emerald-300 hover:shadow-lg bg-white/80 backdrop-blur-sm transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <span className="font-semibold text-gray-800 text-lg group-hover:text-emerald-700 transition-colors duration-300">
                    {ingredient}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Back to Recipe Button */}
          <div className="text-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.close()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Diet Plan
            </motion.button>
          </div>
        </motion.div>

        {/* Enhanced Cooking Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👨‍🍳</span>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Cooking Instructions
            </h3>
            <p className="text-gray-600 text-lg">Follow these steps to create your delicious meal</p>
          </div>
          
          <div className="space-y-6">
            {[
              "Prepare all ingredients as listed in the shopping list above.",
              "Heat a large pan or pot over medium heat.",
              "Add your base ingredients (onions, garlic, etc.) and sauté until fragrant.",
              "Add the main ingredients and cook according to the recipe style.",
              "Season with spices and herbs as needed.",
              "Simmer until all ingredients are cooked through and flavors are well combined.",
              "Taste and adjust seasoning if necessary.",
              "Serve hot and enjoy your nutritious meal!"
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-start gap-6 p-6 rounded-2xl bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  {index + 1}
                </div>
                <p className="text-gray-700 leading-relaxed text-lg font-medium pt-1">{step}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Complete Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={markAsComplete}
            disabled={isCompleted}
            className={`px-10 py-5 rounded-3xl font-bold text-xl transition-all duration-300 shadow-2xl ${
              isCompleted
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white hover:shadow-emerald-300'
            }`}
          >
            {isCompleted ? (
              <div className="flex items-center gap-3">
                <CheckCircle className="w-7 h-7" />
                <span>Completed! 🎉</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Star className="w-7 h-7" />
                <span>Mark as Complete</span>
              </div>
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Enhanced Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 max-w-lg mx-4 text-center shadow-2xl border border-white/20"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 15, -15, 0]
                }}
                transition={{ 
                  duration: 0.8,
                  repeat: 2
                }}
                className="text-8xl mb-6"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
                Congratulations!
              </h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                You've successfully completed your {recipeData.mealType.toLowerCase()}! 
                Keep up the great work on your health journey.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCelebration(false)}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Awesome! 🚀
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DietPlanView;
