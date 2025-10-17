import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Heart, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Star,
  Clock,
  Users
} from 'lucide-react';

const AIRecommendations = () => {
  const [selectedRecommendation, setSelectedRecommendation] = useState(0);

  const recommendations = [
    {
      id: 1,
      title: 'Mood-Boosting Meal Plan',
      description: 'AI-suggested diet plan focusing on serotonin-boosting foods for patients with low mood scores.',
      category: 'Nutrition',
      priority: 'high',
      patientsAffected: 12,
      effectiveness: 87,
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
      details: [
        'Include omega-3 rich foods (salmon, walnuts)',
        'Add complex carbohydrates (oats, quinoa)',
        'Increase tryptophan sources (turkey, bananas)',
        'Limit processed sugars and caffeine'
      ]
    },
    {
      id: 2,
      title: 'Stress Management Protocol',
      description: 'Comprehensive approach combining nutrition and lifestyle changes for stress reduction.',
      category: 'Lifestyle',
      priority: 'medium',
      patientsAffected: 8,
      effectiveness: 92,
      icon: Zap,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      details: [
        'Magnesium-rich foods (spinach, almonds)',
        'Adaptogenic herbs (ashwagandha, rhodiola)',
        'Regular meal timing',
        'Hydration optimization'
      ]
    },
    {
      id: 3,
      title: 'Energy Optimization Diet',
      description: 'Personalized nutrition plan to combat fatigue and improve energy levels throughout the day.',
      category: 'Energy',
      priority: 'high',
      patientsAffected: 15,
      effectiveness: 78,
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      details: [
        'Iron-rich foods (lean meats, legumes)',
        'B-vitamin sources (whole grains, eggs)',
        'Balanced macronutrient ratios',
        'Regular snack intervals'
      ]
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <Brain className="w-6 h-6 mr-2 text-purple-500" />
          AI Recommendations
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Star className="w-4 h-4" />
          <span>Updated 2 hours ago</span>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const Icon = rec.icon;
          const isSelected = selectedRecommendation === index;
          
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => setSelectedRecommendation(index)}
              className={`${rec.bgColor} backdrop-blur-sm rounded-xl p-4 border border-white/50 cursor-pointer transition-all duration-200 ${
                isSelected ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${rec.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-800">{rec.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{rec.patientsAffected} patients</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{rec.effectiveness}% effective</span>
                      </div>
                      <span className="text-purple-600 font-medium">{rec.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-lg hover:bg-white/50 transition-colors">
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t border-white/50"
                >
                  <h4 className="font-semibold text-gray-700 mb-3">Implementation Details:</h4>
                  <ul className="space-y-2">
                    {rec.details.map((detail, detailIndex) => (
                      <motion.li
                        key={detailIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: detailIndex * 0.1 }}
                        className="flex items-center space-x-2 text-sm text-gray-600"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{detail}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-600 transition-all">
                        Apply to Patients
                      </button>
                      <button className="px-4 py-2 bg-white/60 text-gray-700 rounded-lg text-sm font-medium hover:bg-white/80 transition-all">
                        View Details
                      </button>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>Last updated: 2 hours ago</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* AI Insights Footer */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">AI Insights</p>
            <p className="text-xs text-gray-600">Recommendations are updated based on patient progress and latest nutrition research</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIRecommendations;


