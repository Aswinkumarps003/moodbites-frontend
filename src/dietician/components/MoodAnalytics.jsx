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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/80 relative overflow-hidden group"
    >
      {/* Decorative Blob */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-400/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-400/30 transition-colors duration-700"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 relative z-10">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Mood & Nutrition Analytics</h2>
        <div className="flex items-center space-x-2 text-sm font-semibold text-emerald-600 bg-white/60 px-3 py-1.5 rounded-xl border border-white mt-4 sm:mt-0 shadow-sm cursor-pointer hover:bg-white transition-colors">
          <TrendingUp className="w-4 h-4" />
          <span>Last 7 days</span>
        </div>
      </div>

      <div className="space-y-10 relative z-10">
        {/* Mood Trends Chart */}
        <div className="bg-white/40 p-6 rounded-2xl border border-white/60 shadow-inner">
          <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mr-3 shadow-md shadow-emerald-500/20">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            Mood Trends Overview
          </h3>
          <div className="h-44 flex items-end space-x-3 sm:space-x-4">
            {moodTrendData.map((data, index) => (
              <div key={data.day} className="flex-1 flex flex-col items-center group/bar cursor-pointer">
                <div className="relative w-full flex justify-center mb-2 h-full items-end">
                  <div className="absolute -top-10 bg-slate-800 text-white text-xs font-bold px-2 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity translate-y-2 group-hover/bar:translate-y-0 duration-300 shadow-xl whitespace-nowrap z-20">
                    Score: {data.mood}
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.mood / 10) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.8, type: "spring", bounce: 0.2 }}
                    className="w-full max-w-[40px] bg-gradient-to-t from-emerald-500 via-teal-400 to-emerald-300 rounded-xl relative shadow-lg shadow-emerald-500/20 group-hover/bar:shadow-emerald-500/40 group-hover/bar:brightness-110 transition-all"
                  ></motion.div>
                </div>
                <div className="text-xs font-bold text-slate-500 mt-2">
                  {data.day}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Food Categories Pie Chart (Linearized) */}
          <div className="bg-white/40 p-6 rounded-2xl border border-white/60 shadow-inner">
            <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center mr-3 shadow-md shadow-purple-500/20">
                <PieChart className="w-4 h-4 text-white" />
              </div>
              Food Categories
            </h3>
            <div className="space-y-5">
              {foodCategories.map((category, index) => (
                <div key={category.name} className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                    <span className="flex items-center">
                      <div className={`w-2.5 h-2.5 rounded-full ${category.color} mr-2 shadow-sm`}></div>
                      {category.name}
                    </span>
                    <span>{category.value}%</span>
                  </div>
                  <div className="w-full bg-slate-200/50 rounded-full h-2.5 overflow-hidden border border-white/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${category.value}%` }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 1, type: "spring" }}
                      className={`h-full ${category.color} shadow-sm rounded-full bg-gradient-to-r ${
                        category.name === 'Comfort Foods' ? 'from-purple-400 to-purple-600' :
                        category.name === 'Healthy Options' ? 'from-emerald-400 to-emerald-600' :
                        category.name === 'Energy Boosters' ? 'from-orange-400 to-orange-600' :
                        'from-blue-400 to-blue-600'
                      }`}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Chart */}
          <div className="bg-white/40 p-6 rounded-2xl border border-white/60 shadow-inner">
            <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mr-3 shadow-md shadow-blue-500/20">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              Patient Engagement
            </h3>
            <div className="space-y-6">
              {engagementData.map((item, index) => (
                <div key={item.type} className="flex flex-col">
                  <div className="flex justify-between items-center text-sm font-bold text-slate-700 mb-2">
                    <span>{item.type}</span>
                    <span className="text-indigo-600 tracking-tight">{item.value} metrics</span>
                  </div>
                  <div className="w-full bg-slate-200/50 rounded-full h-3 overflow-hidden border border-white/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.value / 100) * 100}%` }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 1, type: "spring" }}
                      className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full shadow-inner"
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MoodAnalytics;


