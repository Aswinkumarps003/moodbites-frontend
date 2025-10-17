import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, PieChart, BarChart3 } from 'lucide-react';

const MoodAnalytics = () => {
  // Mock data for charts
  const moodTrendData = [
    { day: 'Mon', mood: 6.2 },
    { day: 'Tue', mood: 7.1 },
    { day: 'Wed', mood: 6.8 },
    { day: 'Thu', mood: 7.5 },
    { day: 'Fri', mood: 7.8 },
    { day: 'Sat', mood: 8.1 },
    { day: 'Sun', mood: 7.9 },
  ];

  const foodCategories = [
    { name: 'Comfort Foods', value: 35, color: 'bg-purple-500' },
    { name: 'Healthy Options', value: 28, color: 'bg-emerald-500' },
    { name: 'Energy Boosters', value: 22, color: 'bg-orange-500' },
    { name: 'Calming Foods', value: 15, color: 'bg-blue-500' },
  ];

  const engagementData = [
    { type: 'Consultations', value: 45 },
    { type: 'Chat Messages', value: 78 },
    { type: 'Video Calls', value: 23 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Mood & Nutrition Analytics</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <TrendingUp className="w-4 h-4" />
          <span>Last 7 days</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Mood Trends Chart */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" />
            Mood Trends
          </h3>
          <div className="h-32 flex items-end space-x-2">
            {moodTrendData.map((data, index) => (
              <motion.div
                key={data.day}
                initial={{ height: 0 }}
                animate={{ height: `${(data.mood / 10) * 100}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg relative group"
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {data.mood}
                </div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-medium">
                  {data.day}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Food Categories Pie Chart */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-purple-500" />
            Recommended Food Categories
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {foodCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3"
              >
                <div className={`w-4 h-4 ${category.color} rounded-full`}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-sm font-semibold text-gray-800">{category.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${category.value}%` }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                      className={`h-2 ${category.color} rounded-full`}
                    ></motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Engagement Chart */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-teal-500" />
            Patient Engagement
          </h3>
          <div className="space-y-3">
            {engagementData.map((item, index) => (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <span className="text-sm font-medium text-gray-700">{item.type}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.value / 100) * 100}%` }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                      className="h-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                    ></motion.div>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 w-8">{item.value}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MoodAnalytics;


