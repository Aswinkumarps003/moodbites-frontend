import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const recipes = [
  "Rainbow Salad",
  "Quinoa Bowl",
  "Avocado Smoothie"
];

const RecipeList = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl p-6 shadow-lg bg-white min-w-[220px]"
  >
    <div className="font-bold text-lg mb-4 text-gray-800">Top Performing Recipes</div>
    <ul className="space-y-3">
      <AnimatePresence>
        {recipes.map((recipe, idx) => (
          <motion.li
            key={recipe}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            whileHover={{ scale: 1.05, backgroundColor: "#FFF7E6" }}
            className="flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-all duration-200 text-gray-700 font-semibold bg-gradient-to-r from-orange-50 to-amber-100"
          >
            <span className="text-xl">🥗</span>
            {recipe}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  </motion.div>
);

export default RecipeList;
