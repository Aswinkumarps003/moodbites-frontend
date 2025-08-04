import React from "react";
import { motion } from "framer-motion";
import { Zap, Brain, Smile, Battery, Target, Heart } from "lucide-react";

const iconMap = {
  zap: Zap,
  brain: Brain,
  smile: Smile,
  battery: Battery,
  target: Target,
  heart: Heart,
};

const MoodCard = ({ mood, isSelected, onClick, index }) => {
  const Icon = iconMap[mood.icon] || Smile;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ 
        scale: 1.05, 
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
        isSelected
          ? "ring-2 ring-offset-2 ring-opacity-60"
          : "hover:shadow-xl"
      }`}
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${mood.color}15 0%, ${mood.color}25 100%)`
          : `linear-gradient(135deg, ${mood.color}08 0%, ${mood.color}15 100%)`,
        borderColor: isSelected ? mood.color : "transparent",
        ringColor: mood.color
      }}
    >
      {/* Mood Icon */}
      <div
        className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${mood.color} 0%, ${mood.color}CC 100%)`
        }}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Mood Name */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{mood.name}</h3>
      
      {/* Description */}
      <p className="text-gray-600 text-sm mb-4">{mood.description}</p>

      {/* Food Suggestions */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Recommended Foods
        </p>
        <div className="flex flex-wrap gap-2">
          {mood.foods.slice(0, 3).map((food, idx) => (
            <span
              key={idx}
              className="px-2 py-1 text-xs rounded-full bg-white/60 text-gray-700 border border-gray-200"
            >
              {food}
            </span>
          ))}
          {mood.foods.length > 3 && (
            <span className="px-2 py-1 text-xs rounded-full bg-white/60 text-gray-500 border border-gray-200">
              +{mood.foods.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: mood.color }}
        >
          <div className="w-2 h-2 bg-white rounded-full" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default MoodCard;