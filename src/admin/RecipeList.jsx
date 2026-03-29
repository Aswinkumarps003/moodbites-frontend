import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, TrendingUp } from "lucide-react";
import axios from "axios";

const FOOD_API = "https://food-service-new.onrender.com/api/food";

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopRecipes = async () => {
      try {
        const response = await axios.get(`${FOOD_API}/dishes`);
        const allRecipes = response.data || [];
        // Get top 5 recipes (active ones, sorted by most recent)
        const topRecipes = allRecipes
          .filter((r) => r.is_active)
          .slice(0, 5);
        setRecipes(topRecipes);
      } catch (err) {
        console.error("Error fetching top recipes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopRecipes();
  }, []);

  const moodEmojis = {
    happy: "😊",
    sad: "😢",
    stressed: "😰",
    energetic: "⚡",
    calm: "😌",
    angry: "😡",
    tired: "😴",
    anxious: "😟",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 min-w-[220px]"
      style={{
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="font-bold text-lg text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-orange-400" />
          Top Recipes
        </div>
        <span className="text-xs text-slate-500">{recipes.length} items</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence>
            {recipes.map((recipe, idx) => (
              <motion.li
                key={recipe.id || idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{
                  x: 4,
                  background: "rgba(249,115,22,0.08)",
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-default transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                {recipe.image_url ? (
                  <img
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="w-10 h-10 rounded-lg object-cover"
                    style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                ) : (
                  <span className="text-xl w-10 h-10 flex items-center justify-center rounded-lg" style={{ background: "rgba(249,115,22,0.1)" }}>
                    {moodEmojis[recipe.mood?.toLowerCase()] || "🍽️"}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-200 truncate">{recipe.title}</div>
                  <div className="text-xs text-slate-500">{recipe.mood} • {recipe.difficulty || "N/A"}</div>
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400 opacity-60" />
              </motion.li>
            ))}
          </AnimatePresence>
          {recipes.length === 0 && (
            <div className="text-center text-sm text-slate-500 py-6">No recipes found</div>
          )}
        </ul>
      )}
    </motion.div>
  );
};

export default RecipeList;
