import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const API_URL = "http://localhost:5002/api/food";

const RecipesPage = () => {
  const [search, setSearch] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "active", "inactive"
  const [selectedRecipes, setSelectedRecipes] = useState(new Set());

  // Fetch all recipes from food-service
  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all recipes including inactive ones for admin management
      const response = await axios.get(`${API_URL}/dishes?include_inactive=true`);
      setRecipes(response.data);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

  // Toggle recipe active status
  const toggleRecipeStatus = async (recipeId, currentStatus) => {
    try {
      setUpdating(prev => ({ ...prev, [recipeId]: true }));
      
      const newStatus = !currentStatus;
      const response = await axios.patch(`${API_URL}/dishes/${recipeId}/status`, {
        is_active: newStatus
      });
      
      // Update the recipe in the local state
      setRecipes(prev => prev.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, is_active: newStatus }
          : recipe
      ));
      
      console.log('Recipe status updated:', response.data.message);
    } catch (err) {
      console.error('Error updating recipe status:', err);
      alert('Failed to update recipe status');
    } finally {
      setUpdating(prev => ({ ...prev, [recipeId]: false }));
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  // Bulk actions
  const bulkActivate = async () => {
    const inactiveRecipes = Array.from(selectedRecipes).filter(id => {
      const recipe = recipes.find(r => r.id === id);
      return recipe && !recipe.is_active;
    });
    
    for (const recipeId of inactiveRecipes) {
      await toggleRecipeStatus(recipeId, false);
    }
    setSelectedRecipes(new Set());
  };

  const bulkDeactivate = async () => {
    const activeRecipes = Array.from(selectedRecipes).filter(id => {
      const recipe = recipes.find(r => r.id === id);
      return recipe && recipe.is_active;
    });
    
    for (const recipeId of activeRecipes) {
      await toggleRecipeStatus(recipeId, true);
    }
    setSelectedRecipes(new Set());
  };

  const toggleSelectAll = () => {
    if (selectedRecipes.size === filtered.length) {
      setSelectedRecipes(new Set());
    } else {
      setSelectedRecipes(new Set(filtered.map(recipe => recipe.id)));
    }
  };

  const toggleSelectRecipe = (recipeId) => {
    const newSelected = new Set(selectedRecipes);
    if (newSelected.has(recipeId)) {
      newSelected.delete(recipeId);
    } else {
      newSelected.add(recipeId);
    }
    setSelectedRecipes(newSelected);
  };

  // Filter recipes based on search and status
  const filtered = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(search.toLowerCase()) ||
      recipe.mood.toLowerCase().includes(search.toLowerCase()) ||
      (recipe.user_id && recipe.user_id.toString().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && recipe.is_active) ||
      (statusFilter === "inactive" && !recipe.is_active);
    
    return matchesSearch && matchesStatus;
  });
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Loading recipes...</span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchRecipes}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recipes Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage all user recipes ({recipes.length} total) • Showing {filtered.length} recipes
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-orange-400 focus:border-orange-400 text-sm"
            >
              <option value="all">All Recipes</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
        <input
          type="text"
              placeholder="Search recipes, mood, or user ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-orange-400 focus:border-orange-400"
        />
      </div>
        </div>
        
        {/* Bulk Actions */}
        {selectedRecipes.size > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-orange-800">
                {selectedRecipes.size} recipe(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={bulkActivate}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  Activate Selected
                </button>
                <button
                  onClick={bulkDeactivate}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  Deactivate Selected
                </button>
                <button
                  onClick={() => setSelectedRecipes(new Set())}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-amber-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedRecipes.size === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Recipe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Mood</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">User ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  {search || statusFilter !== "all" ? 'No recipes found matching your filters.' : 'No recipes available.'}
                </td>
              </tr>
            ) : (
              filtered.map((recipe, idx) => (
              <motion.tr
                  key={recipe.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:bg-orange-50"
              >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRecipes.has(recipe.id)}
                      onChange={() => toggleSelectRecipe(recipe.id)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {recipe.image_url && (
                        <img
                          src={recipe.image_url}
                          alt={recipe.title}
                          className="w-12 h-12 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{recipe.title}</div>
                        <div className="text-sm text-gray-500">
                          {recipe.difficulty} • {recipe.cook_time || 'No time set'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {recipe.mood}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {recipe.user_id}
                  </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      recipe.is_active 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {recipe.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(recipe.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRecipeStatus(recipe.id, recipe.is_active)}
                        disabled={updating[recipe.id]}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          recipe.is_active
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        } ${updating[recipe.id] ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {updating[recipe.id] ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
                            Updating...
                          </div>
                        ) : (
                          recipe.is_active ? "Deactivate" : "Activate"
                        )}
                      </button>
                    </div>
                </td>
              </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default RecipesPage;


