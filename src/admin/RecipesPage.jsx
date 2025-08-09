import React, { useState } from "react";
import { motion } from "framer-motion";

const dummyRecipes = [
  { name: "Rainbow Salad", category: "Salad", author: "Alice Smith", status: "Published" },
  { name: "Quinoa Bowl", category: "Bowl", author: "Bob Lee", status: "Draft" },
  { name: "Avocado Smoothie", category: "Drink", author: "Carol Jones", status: "Published" },
];

const RecipesPage = () => {
  const [search, setSearch] = useState("");
  const filtered = dummyRecipes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.author.toLowerCase().includes(search.toLowerCase()));
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-900">Recipes</h2>
        <input
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-orange-400 focus:border-orange-400"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-amber-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filtered.map((recipe, idx) => (
              <motion.tr
                key={recipe.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:bg-orange-50"
              >
                <td className="px-6 py-4 whitespace-nowrap font-semibold">{recipe.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{recipe.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">{recipe.author}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${recipe.status === "Published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{recipe.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-orange-600 hover:text-orange-900 font-bold">Edit</button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default RecipesPage;


