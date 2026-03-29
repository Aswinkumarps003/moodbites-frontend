import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { BookOpen, Search, Filter, CheckCircle, XCircle, RefreshCw } from "lucide-react";

const API_URL = "https://food-service-new.onrender.com/api/food";

const RecipesPage = () => {
  const [search, setSearch] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRecipes, setSelectedRecipes] = useState(new Set());

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/dishes?include_inactive=true`);
      setRecipes(response.data);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

  const toggleRecipeStatus = async (recipeId, currentStatus) => {
    try {
      setUpdating(prev => ({ ...prev, [recipeId]: true }));
      const newStatus = !currentStatus;
      await axios.patch(`${API_URL}/dishes/${recipeId}/status`, { is_active: newStatus });
      setRecipes(prev => prev.map(recipe =>
        recipe.id === recipeId ? { ...recipe, is_active: newStatus } : recipe
      ));
    } catch (err) {
      console.error('Error updating recipe status:', err);
    } finally {
      setUpdating(prev => ({ ...prev, [recipeId]: false }));
    }
  };

  useEffect(() => { fetchRecipes(); }, []);

  const bulkActivate = async () => {
    const ids = Array.from(selectedRecipes).filter(id => {
      const r = recipes.find(rec => rec.id === id);
      return r && !r.is_active;
    });
    for (const id of ids) await toggleRecipeStatus(id, false);
    setSelectedRecipes(new Set());
  };

  const bulkDeactivate = async () => {
    const ids = Array.from(selectedRecipes).filter(id => {
      const r = recipes.find(rec => rec.id === id);
      return r && r.is_active;
    });
    for (const id of ids) await toggleRecipeStatus(id, true);
    setSelectedRecipes(new Set());
  };

  const filtered = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(search.toLowerCase()) ||
      recipe.mood.toLowerCase().includes(search.toLowerCase()) ||
      (recipe.user_id && recipe.user_id.toString().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && recipe.is_active) ||
      (statusFilter === "inactive" && !recipe.is_active);
    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedRecipes.size === filtered.length) setSelectedRecipes(new Set());
    else setSelectedRecipes(new Set(filtered.map(r => r.id)));
  };

  const toggleSelectRecipe = (recipeId) => {
    const s = new Set(selectedRecipes);
    if (s.has(recipeId)) s.delete(recipeId);
    else s.add(recipeId);
    setSelectedRecipes(s);
  };

  const activeCount = recipes.filter(r => r.is_active).length;
  const inactiveCount = recipes.filter(r => !r.is_active).length;

  const moodColors = {
    happy: "#fbbf24", sad: "#60a5fa", stressed: "#f87171", energetic: "#34d399",
    calm: "#a78bfa", angry: "#ef4444", tired: "#94a3b8", anxious: "#fb923c",
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6"
        style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center justify-center h-64 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-600 border-t-orange-400" />
          <span className="text-slate-400">Loading recipes...</span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6"
        style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="text-center py-8">
          <div className="text-red-400 text-lg font-semibold mb-2">Error</div>
          <p className="text-slate-400 mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchRecipes}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "rgba(249,115,22,0.15)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.2)" }}
          >
            Retry
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="space-y-5"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Recipes", value: recipes.length, color: "#f97316", icon: BookOpen },
          { label: "Active", value: activeCount, color: "#34d399", icon: CheckCircle },
          { label: "Inactive", value: inactiveCount, color: "#f87171", icon: XCircle },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(15,23,42,0.6)", border: `1px solid ${s.color}22` }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5"
        style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Recipes Management</h2>
            <p className="text-xs text-slate-500 mt-1">{recipes.length} total • Showing {filtered.length} recipes</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-transparent outline-none text-sm text-slate-300"
              >
                <option value="all" style={{ background: "#0f172a" }}>All Recipes</option>
                <option value="active" style={{ background: "#0f172a" }}>Active Only</option>
                <option value="inactive" style={{ background: "#0f172a" }}>Inactive Only</option>
              </select>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm text-slate-300 placeholder-slate-600 w-40"
              />
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={fetchRecipes}
              className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
              style={{ background: "rgba(249,115,22,0.12)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.2)" }}>
              <RefreshCw className="w-4 h-4" /> Refresh
            </motion.button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedRecipes.size > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 px-4 py-3 rounded-xl flex items-center justify-between"
            style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.12)" }}>
            <span className="text-sm font-medium text-orange-300">{selectedRecipes.size} recipe(s) selected</span>
            <div className="flex gap-2">
              <button onClick={bulkActivate} className="px-3 py-1 rounded-lg text-xs font-medium transition-colors" style={{ background: "rgba(16,185,129,0.12)", color: "#34d399" }}>Activate</button>
              <button onClick={bulkDeactivate} className="px-3 py-1 rounded-lg text-xs font-medium transition-colors" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}>Deactivate</button>
              <button onClick={() => setSelectedRecipes(new Set())} className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}>Clear</button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr style={{ background: "rgba(249,115,22,0.06)", borderBottom: "1px solid rgba(249,115,22,0.1)" }}>
                <th className="px-5 py-3 text-left">
                  <input type="checkbox" checked={selectedRecipes.size === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll} className="rounded border-slate-600" />
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Recipe</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Mood</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">User ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="px-5 py-10 text-center text-slate-500">
                  {search || statusFilter !== "all" ? 'No recipes found matching your filters.' : 'No recipes available.'}
                </td></tr>
              ) : (
                filtered.map((recipe, idx) => {
                  const moodColor = moodColors[recipe.mood?.toLowerCase()] || "#94a3b8";
                  return (
                    <motion.tr
                      key={recipe.id}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="transition-colors duration-200 border-b"
                      style={{ borderColor: "rgba(255,255,255,0.03)" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(249,115,22,0.04)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <td className="px-5 py-4">
                        <input type="checkbox" checked={selectedRecipes.has(recipe.id)}
                          onChange={() => toggleSelectRecipe(recipe.id)} className="rounded border-slate-600" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {recipe.image_url ? (
                            <img src={recipe.image_url} alt={recipe.title}
                              className="w-10 h-10 rounded-lg object-cover" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
                          ) : (
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(249,115,22,0.1)" }}>
                              <BookOpen className="w-4 h-4 text-orange-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-200 text-sm">{recipe.title}</div>
                            <div className="text-xs text-slate-500">{recipe.difficulty} • {recipe.cook_time || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                          style={{ background: `${moodColor}18`, color: moodColor, border: `1px solid ${moodColor}30` }}>
                          {recipe.mood}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-500 font-mono text-xs">{recipe.user_id}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                          style={{
                            background: recipe.is_active ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                            color: recipe.is_active ? "#34d399" : "#f87171",
                            border: `1px solid ${recipe.is_active ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                          }}>
                          {recipe.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">{new Date(recipe.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleRecipeStatus(recipe.id, recipe.is_active)}
                          disabled={updating[recipe.id]}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-40"
                          style={{
                            background: recipe.is_active ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                            color: recipe.is_active ? "#f87171" : "#34d399",
                            border: `1px solid ${recipe.is_active ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
                          }}
                        >
                          {updating[recipe.id] ? (
                            <span className="flex items-center gap-1">
                              <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent" /> ...
                            </span>
                          ) : (recipe.is_active ? "Deactivate" : "Activate")}
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RecipesPage;
