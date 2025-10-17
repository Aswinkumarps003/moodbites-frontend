import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Star, Clock, Users, Heart, Plus, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:5000';
const FOOD_SERVICE_URL = import.meta.env.VITE_FOOD_SERVICE_URL || 'http://localhost:5002';

const Recipes = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [likedRecipes, setLikedRecipes] = useState(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [source, setSource] = useState('all'); // 'all' | 'saved'
  const [moods, setMoods] = useState([]); // kept for backward-compat, not used for filters now
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userNames, setUserNames] = useState({});
  const [userImages, setUserImages] = useState({});

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('authToken');
      setIsLoggedIn(!!token);
    };
    
    checkLoginStatus();
    
    const handleStorage = () => {
      checkLoginStatus();
    };
    
    const handleCustomLogout = () => {
      setIsLoggedIn(false);
    };
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('moodbites-logout', handleCustomLogout);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('moodbites-logout', handleCustomLogout);
    };
  }, []);

  // Build Supabase client (expects VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

  // Function to fetch all users from MongoDB
  const fetchAllUsers = async () => {
    try {
      // Fetch all users from MongoDB API endpoint
      const response = await fetch(`${USER_SERVICE_URL}/api/user/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      
      // Create maps for quick lookup using the users array
      const nameMap = {};
      const imageMap = {};
      
      userData.users.forEach(user => {
        nameMap[user._id] = user.name;
        imageMap[user._id] = user.profileImage;
      });

      setUserNames(nameMap);
      setUserImages(imageMap);

      return { nameMap, imageMap };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return { nameMap: {}, imageMap: {} };
    }
  };

  // Simple category inference helpers
  const inferIsGlutenFree = (title = '', ingredients = []) => {
    const hay = `${title} ${ingredients.join(' ')}`.toLowerCase();
    if (hay.includes('gluten free') || hay.includes('gluten-free')) return true;
    // Heuristic: if explicitly mentions wheat/barley/rye, assume not GF
    if (/(wheat|barley|rye|maida)/i.test(hay)) return false;
    return false; // default unknown -> not GF
  };

  const inferIsDessert = (title = '', ingredients = []) => {
    const hay = `${title} ${ingredients.join(' ')}`.toLowerCase();
    return /(dessert|cake|cookie|brownie|ice cream|pudding|pastry|sweet|muffin|pie|tart|custard)/i.test(hay);
  };

  const inferIsNonVeg = (title = '', ingredients = []) => {
    const hay = `${title} ${ingredients.join(' ')}`.toLowerCase();
    return /(chicken|beef|pork|mutton|fish|prawn|shrimp|egg|bacon|lamb|turkey|ham|salmon|tuna)/i.test(hay);
  };

  const inferCategory = (raw) => {
    // Prefer explicit field if your table has one
    const explicit = raw.category || raw.diet || raw.type;
    if (explicit && typeof explicit === 'string') {
      const e = explicit.toLowerCase();
      if (e.includes('gluten')) return 'Gluten-Free';
      if (/(dessert|sweet)/.test(e)) return 'Dessert';
      if (/(veg|vegetarian)/.test(e)) return 'Vegetarian';
      if (/(non[- ]?veg|meat|chicken|fish)/.test(e)) return 'Non-Veg';
    }
    const ingredients = Array.isArray(raw.ingredients) ? raw.ingredients : (raw.ingredients ? String(raw.ingredients).split(',').map(s=>s.trim()) : []);
    const title = raw.title || '';
    if (inferIsDessert(title, ingredients)) return 'Dessert';
    if (inferIsNonVeg(title, ingredients)) return 'Non-Veg';
    // If not non-veg and hints of veg
    if (!inferIsNonVeg(title, ingredients)) return 'Vegetarian';
    return 'Vegetarian';
  };

  // Fetch active recipes from Supabase
  useEffect(() => {
    let isMounted = true;
    async function fetchActiveRecipes() {
      try {
        setLoading(true);
        setError(null);
        if (!supabase) {
          throw new Error("Supabase client not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
        }
        // Adjust table/columns as per your schema
        const { data, error: sbError } = await supabase
          .from("recipes")
          .select("id,title,image_url,difficulty,description,mood,ingredients,cook_time,servings,user_id,is_active")
          .eq("is_active", true)
          .order("id", { ascending: false });
        if (sbError) throw sbError;

        const normalized = (data || []).map(r => ({
          id: r.id,
          title: r.title || "Untitled Recipe",
          image: r.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
          mood: r.mood || "Neutral",
          ingredients: Array.isArray(r.ingredients) ? r.ingredients : (r.ingredients ? String(r.ingredients).split(",").map(s => s.trim()) : []),
          rating: typeof r.rating === "number" ? r.rating : 4.5,
          cookTime: r.cook_time || "30 mins",
          servings: r.servings || 2,
          author: "Loading...", // Will be updated after fetching user data
          userId: r.user_id,
          category: inferCategory(r),
          glutenFree: inferIsGlutenFree(r.title, Array.isArray(r.ingredients) ? r.ingredients : (r.ingredients ? String(r.ingredients).split(',').map(s=>s.trim()) : []))
        }));

        if (!isMounted) return;

        // Fetch all users from MongoDB first
        const { nameMap, imageMap } = await fetchAllUsers();

        // Update recipes with user data
        const enrichedRecipes = normalized.map(recipe => ({
          ...recipe,
          author: nameMap[recipe.userId] || "MoodBites Chef",
          userImage: imageMap[recipe.userId] || null
        }));

        setRecipes(enrichedRecipes);
        
        // We no longer use moods for filtering UI; keep state if needed elsewhere
        const uniqueMoods = Array.from(new Set(enrichedRecipes.map(r => r.mood))).filter(Boolean);
        setMoods(uniqueMoods.map(name => ({ name, color: "#F10100" })));
      } catch (e) {
        if (!isMounted) return;
        setError(e.message || "Failed to load recipes");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchActiveRecipes();
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseUrl, supabaseAnonKey]);

  // Fetch saved recipes for the logged-in user from food-service (Supabase saved_recipes)
  useEffect(() => {
    let isMounted = true;
    async function run() {
      try {
        if (source !== 'saved') return;
        const userRaw = localStorage.getItem('user');
        const user = userRaw ? JSON.parse(userRaw) : null;
        if (!user?._id) {
          setSavedRecipes([]);
          return;
        }
        const resp = await fetch(`${FOOD_SERVICE_URL}/api/food/users/${user._id}/saved-recipes`);
        if (!resp.ok) throw new Error('Failed to fetch saved recipes');
        const data = await resp.json();
        if (!isMounted) return;
        const normalized = (Array.isArray(data) ? data : []).map(r => ({
          id: r.id,
          title: r.title || 'Untitled Recipe',
          image: r.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
          mood: r.mood || 'Personal',
          ingredients: Array.isArray(r.ingredients) ? r.ingredients : (r.ingredients ? String(r.ingredients).split(',').map(s=>s.trim()) : []),
          rating: 4.7,
          cookTime: r.cook_time || (r.ready_in_minutes ? `${r.ready_in_minutes} mins` : '30 mins'),
          servings: r.servings || 1,
          author: 'You',
          userId: r.user_id,
          category: inferCategory(r),
          glutenFree: inferIsGlutenFree(r.title, Array.isArray(r.ingredients) ? r.ingredients : (r.ingredients ? String(r.ingredients).split(',').map(s=>s.trim()) : []))
        }));
        setSavedRecipes(normalized);
      } catch (e) {
        if (!isMounted) return;
        setSavedRecipes([]);
      }
    }
    run();
    return () => { isMounted = false; };
  }, [source]);

  const filters = ["All", "Gluten-Free", "Dessert", "Vegetarian", "Non-Veg"];

  const activeList = source === 'saved' ? savedRecipes : recipes;
  const filteredRecipes = activeList.filter(recipe => {
    let matchesFilter = true;
    if (selectedFilter !== "All") {
      switch (selectedFilter) {
        case 'Gluten-Free':
          matchesFilter = !!recipe.glutenFree || (recipe.category === 'Gluten-Free');
          break;
        case 'Dessert':
          matchesFilter = recipe.category === 'Dessert';
          break;
        case 'Vegetarian':
          matchesFilter = recipe.category === 'Vegetarian';
          break;
        case 'Non-Veg':
          matchesFilter = recipe.category === 'Non-Veg';
          break;
        default:
          matchesFilter = true;
      }
    }
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const toggleLike = (recipeId) => {
    const newLiked = new Set(likedRecipes);
    if (newLiked.has(recipeId)) {
      newLiked.delete(recipeId);
    } else {
      newLiked.add(recipeId);
    }
    setLikedRecipes(newLiked);
  };

  const addToDietPlan = (recipe) => {
    // Here you can implement the logic to add recipe to diet plan
    console.log('Adding recipe to diet plan:', recipe);
    // You might want to:
    // 1. Open a modal to select meal type (breakfast, lunch, dinner, snack)
    // 2. Select date
    // 3. Call API to save to diet plan
    // 4. Show success message
    
    // For now, let's show a simple alert
    alert(`Added "${recipe.title}" to your diet plan!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Recipe <span className="text-[#F10100]">Collection</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover mood-based recipes shared by our community of wellness enthusiasts
          </p>
        </motion.div>

        {/* Search, Source Toggle and Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 w-full lg:w-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search recipes, ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300"
              />
            </div>

            {/* Source Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSource('all')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${source === 'all' ? 'bg-[#F10100] text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All Recipes
              </button>
              <button
                onClick={() => setSource('saved')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${source === 'saved' ? 'bg-[#F10100] text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Saved Recipes
              </button>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-400" />
              {filters.map((filter) => (
                <motion.button
                  key={filter}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    selectedFilter === filter
                      ? "bg-[#F10100] text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Add Recipe Button - Only show when logged in */}
        <AnimatePresence>
          {isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.3 }}
              className="mb-6 flex justify-center"
            >
              <Link to="/submit">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#F10100] to-[#FFD122] text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Your Recipe</span>
                </motion.button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-16">
            <div className="text-2xl text-gray-600">Loading active recipes...</div>
          </div>
        )}
        {error && !loading && (
          <div className="text-center py-16">
            <div className="text-red-600 font-semibold">{error}</div>
            <div className="text-gray-500 text-sm mt-2">Ensure Supabase env vars are set and table/columns exist.</div>
          </div>
        )}

        {/* Recipe Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredRecipes.map((recipe, index) => {
            const moodColor = moods.find(mood => mood.name === recipe.mood)?.color || "#F10100";
            const isLiked = likedRecipes.has(recipe.id);
            
            return (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  y: -10, 
                  boxShadow: "0 25px 50px rgba(0,0,0,0.15)" 
                }}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group"
              >
                {/* Recipe Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Like Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleLike(recipe.id)}
                    className="absolute top-3 right-3 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Heart 
                      className={`w-5 h-5 transition-colors duration-300 ${
                        isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
                      }`} 
                    />
                  </motion.button>

                  {/* Mood Badge */}
                  <div 
                    className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-white text-xs font-semibold backdrop-blur-sm"
                    style={{ backgroundColor: `${moodColor}CC` }}
                  >
                    {recipe.mood}
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-current text-yellow-400" />
                    <span>{recipe.rating}</span>
                  </div>
                </div>

                {/* Recipe Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {recipe.title}
                  </h3>

                  {/* Recipe Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.cookTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>Serves {recipe.servings}</span>
                    </div>
                  </div>

                  {/* Ingredients Preview */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Key Ingredients
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                        >
                          {ingredient}
                        </span>
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">
                          +{recipe.ingredients.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      {recipe.userImage ? (
                        <img
                          src={recipe.userImage}
                          alt={recipe.author}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {recipe.author.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>
                      by <span className="font-medium">{recipe.author}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Add to Diet Plan Button - Only show when logged in */}
                      {isLoggedIn && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addToDietPlan(recipe)}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-1"
                          title="Add to Diet Plan"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Add to Plan</span>
                        </motion.button>
                      )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-[#F10100] to-[#FF4444] text-white rounded-xl text-xs font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      View Recipe
                    </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {filteredRecipes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Recipes;