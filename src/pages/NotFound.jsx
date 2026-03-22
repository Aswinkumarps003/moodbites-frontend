import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, Utensils } from "lucide-react";

const NotFound = () => {
  const floatingFoods = [
    { emoji: "🍕", x: "15%", y: "20%", delay: 0 },
    { emoji: "🍔", x: "75%", y: "15%", delay: 0.5 },
    { emoji: "🥗", x: "85%", y: "60%", delay: 1 },
    { emoji: "🍩", x: "10%", y: "70%", delay: 1.5 },
    { emoji: "🌮", x: "60%", y: "80%", delay: 0.8 },
    { emoji: "🍳", x: "30%", y: "85%", delay: 2 },
    { emoji: "🥑", x: "80%", y: "35%", delay: 1.2 },
    { emoji: "🍓", x: "20%", y: "45%", delay: 0.3 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-100 flex items-center justify-center relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 dots-pattern opacity-30 pointer-events-none" />

      {/* Floating food emojis */}
      {floatingFoods.map((food, index) => (
        <motion.div
          key={index}
          className="absolute text-4xl md:text-5xl pointer-events-none select-none"
          style={{ left: food.x, top: food.y }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 15, -15, 0],
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 4 + index * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: food.delay,
          }}
        >
          {food.emoji}
        </motion.div>
      ))}

      {/* Gradient blurs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-[#F10100]/10 to-[#FFD122]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-[#476E00]/10 to-[#D8D86B]/10 rounded-full blur-3xl"
        />
      </div>

      <div className="text-center max-w-2xl mx-auto px-4 relative z-10">
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <span className="text-[10rem] md:text-[12rem] font-bold gradient-text-animated leading-none font-display">
              404
            </span>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-4 -right-4 md:-top-2 md:-right-8"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#FFD122] to-[#F10100] rounded-2xl flex items-center justify-center shadow-lg shadow-[#F10100]/20">
                <Utensils className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Error Message Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-3xl p-10 mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-display">
            Oops! Recipe Not Found
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            It looks like the page you're looking for has been moved or doesn't exist.
            Don't worry, there are plenty of delicious recipes waiting for you!
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(241, 1, 0, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#F10100] to-[#FF4444] text-white px-8 py-4 rounded-2xl font-semibold text-lg flex items-center space-x-2 shadow-lg shadow-[#F10100]/20 hover:shadow-xl transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              <span>Go Home</span>
            </motion.button>
          </Link>

          <Link to="/recipes">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-gray-200 text-gray-700 hover:border-[#476E00] hover:text-[#476E00] hover:bg-[#476E00]/5 px-8 py-4 rounded-2xl font-semibold text-lg flex items-center space-x-2 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Browse Recipes</span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotFound;