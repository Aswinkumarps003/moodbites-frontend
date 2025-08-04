import React, { useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp, Star, Clock } from "lucide-react";
import MoodCard from "../components/MoodCard";
import { mockMoods, mockUserProfile, mockMoodTrends, mockRecipes } from "../mock.jsx";

const Dashboard = () => {
  const [selectedMood, setSelectedMood] = useState(mockMoods[0]);

  const filteredRecipes = mockRecipes.filter(
    recipe => recipe.mood === selectedMood.name
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {mockUserProfile.name.split(' ')[0]}!
              </h1>
              <p className="text-gray-600 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Mood</p>
                <p className="text-lg font-bold text-[#F10100]">
                  {mockUserProfile.currentMood}
                </p>
              </div>
              <img
                src={mockUserProfile.avatar}
                alt="Profile"
                className="w-12 h-12 rounded-full border-2 border-[#F10100]/20"
              />
            </div>
          </div>
        </motion.div>

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
            {/* Profile Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fitness Goal</span>
                  <span className="font-semibold text-[#476E00]">
                    {mockUserProfile.fitnessGoal}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Saved Meals</span>
                  <span className="font-semibold text-[#FFD122]">
                    {mockUserProfile.savedMeals}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Recipes Shared</span>
                  <span className="font-semibold text-[#F10100]">
                    {mockUserProfile.totalRecipes}
                  </span>
                </div>
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

            {/* Quick Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-[#F1E1C8]/30 to-[#D8D86B]/30 rounded-3xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-xl transition-colors duration-300 text-left">
                  Log Today's Meal
                </button>
                <button className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-xl transition-colors duration-300 text-left">
                  Update Mood
                </button>
                <button className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-xl transition-colors duration-300 text-left">
                  View Recipe History
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;