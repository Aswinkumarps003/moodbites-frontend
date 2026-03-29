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
      title: 'Metabolic Syndrome Reversal Protocol',
      description: 'A targeted, low-glycemic meal plan specifically designed to improve insulin sensitivity and reduce visceral fat in pre-diabetic patients.',
      category: 'Clinical Nutrition',
      priority: 'high',
      patientsAffected: 24,
      effectiveness: 91,
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
      details: [
        'Implement 14:10 intermittent fasting window',
        'Cap net carbohydrates to under 100g daily',
        'Increase soluble fiber (chia, flaxseed, psyllium)',
        'Replace saturated fats with monounsaturated sources (olive oil, avocados)'
      ]
    },
    {
      id: 2,
      title: 'Gut Microbiome Restoration',
      description: 'A comprehensive approach aimed at healing gut dysbiosis and reducing systemic inflammation through prebiotic and probiotic dietary interventions.',
      category: 'Digestive Health',
      priority: 'high',
      patientsAffected: 18,
      effectiveness: 88,
      icon: Zap,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      details: [
        'Introduce naturally fermented foods (kefir, sauerkraut, kimchi)',
        'Incorporate prebiotic fibers (garlic, onions, asparagus)',
        'Eliminate artificial sweeteners and emulsifiers for 30 days',
        'Supplement with L-Glutamine and Zinc Carnosine'
      ]
    },
    {
      id: 3,
      title: 'Cognitive Function & Focus Diet',
      description: 'Neuroprotective nutritional strategy utilizing medium-chain triglycerides and specific micronutrients to combat brain fog and support cognitive stamina.',
      category: 'Neurology',
      priority: 'medium',
      patientsAffected: 32,
      effectiveness: 84,
      icon: TrendingUp,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      details: [
        'Increase DHA/EPA omega-3 fatty acids (cold-water fish or algae oil)',
        'Incorporate polyphenol-rich berries and dark cocoa',
        'Utilize exogenous MCT oil for rapid neuronal energy',
        'Ensure optimal B12, Folate, and Vitamin D3 levels'
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/80 relative overflow-hidden group"
    >
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-purple-400/30 transition-colors duration-700"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">AI Insights</h2>
            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center">
              <Star className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
              Smart Recommendations
            </p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 px-4 py-2 bg-white/60 rounded-xl border border-white shadow-sm flex items-center space-x-2 text-sm font-bold text-slate-600">
          <Clock className="w-4 h-4 text-purple-500" />
          <span>Updated just now</span>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const Icon = rec.icon;
          const isSelected = selectedRecommendation === index;
          
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4, type: "spring", bounce: 0.3 }}
              whileHover={{ scale: 1.01, y: -2 }}
              onClick={() => setSelectedRecommendation(index)}
              className={`backdrop-blur-md rounded-2xl p-5 border border-white/60 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                isSelected ? 'bg-white/80 ring-2 ring-purple-500 shadow-xl shadow-purple-500/10' : 'bg-white/40 hover:bg-white/60 hover:shadow-lg'
              }`}
            >
              {isSelected && (
                 <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none"></div>
              )}
              
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-start space-x-5">
                  <div className={`w-14 h-14 bg-gradient-to-br ${rec.color} rounded-2xl flex items-center justify-center shadow-lg transform transition-transform group-hover:rotate-6`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg text-slate-800 tracking-tight">{rec.title}</h3>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-4">{rec.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600 bg-white/50 inline-flex px-3 py-1.5 rounded-xl border border-white/60">
                      <div className="flex items-center space-x-1.5">
                        <Users className="w-4 h-4 text-indigo-500" />
                        <span><span className="text-slate-800">{rec.patientsAffected}</span> patients</span>
                      </div>
                      <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                      <div className="flex items-center space-x-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span><span className="text-slate-800">{rec.effectiveness}%</span> effective</span>
                      </div>
                      <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                      <span className="text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md">{rec.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className={`p-2.5 rounded-xl transition-all duration-300 ${isSelected ? 'bg-purple-100 text-purple-600' : 'bg-white/60 text-slate-400 hover:bg-white hover:text-purple-500 shadow-sm'}`}>
                    <ArrowRight className={`w-5 h-5 transform transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 pt-5 border-t border-white/60 relative z-10"
                >
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                    <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                    Implementation Steps
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {rec.details.map((detail, detailIndex) => (
                      <motion.li
                        key={detailIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: detailIndex * 0.1 }}
                        className="flex items-start space-x-3 bg-white/50 p-3 rounded-xl border border-white/60"
                      >
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-slate-600 leading-tight">{detail}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                      <button className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:from-purple-600 hover:to-indigo-700 transition-all hover:-translate-y-0.5">
                        Apply Plan
                      </button>
                      <button className="flex-1 sm:flex-none px-6 py-2.5 bg-white/80 text-slate-700 border border-white rounded-xl text-sm font-bold hover:bg-white shadow-sm transition-all hover:-translate-y-0.5">
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* AI Insights Footer */}
      <div className="mt-8 p-6 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl border border-indigo-100 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 relative z-10 text-center sm:text-left">
          <div className="w-12 h-12 bg-white shadow-md rounded-xl flex items-center justify-center border border-purple-100 flex-shrink-0">
            <Brain className="w-6 h-6 text-indigo-500 animate-pulse" />
          </div>
          <div>
            <p className="text-base font-bold text-indigo-900 mb-1 tracking-tight">Continuous Learning</p>
            <p className="text-sm font-medium text-slate-600 leading-relaxed">Recommendations adapt in real-time based on your patients' metabolic data, mood tracking, and the latest nutritional research algorithms.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIRecommendations;


