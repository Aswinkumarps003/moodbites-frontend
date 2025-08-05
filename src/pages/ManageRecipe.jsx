import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  Clock,
  Users,
  Heart,
  Star
} from "lucide-react";
import { mockMoods } from "../mock.jsx";

const API_URL = "http://localhost:5002/api/food/dishes";
const CLOUDINARY_UPLOAD_URL = "http://localhost:5002/api/food/upload-recipe-image";

const ManageRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [newTag, setNewTag] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const difficulties = ["Easy", "Medium", "Hard"];

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch recipe data
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
          throw new Error('Recipe not found');
        }
        const data = await response.json();
        setRecipe(data);
      } catch (error) {
        console.error('Error fetching recipe:', error);
        alert('Error loading recipe: ' + error.message);
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id, navigate]);

  const handleInputChange = (field, value) => {
    setRecipe(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...recipe[field]];
    newArray[index] = value;
    setRecipe(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field) => {
    setRecipe(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }));
  };

  const removeArrayItem = (field, index) => {
    setRecipe(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !recipe.tags.includes(newTag.trim())) {
      setRecipe(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tag) => {
    setRecipe(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setRecipe(prev => ({ ...prev, image_url: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append('recipeImage', file);

      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }

      const result = await response.json();
      return result.image_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!recipe) return;

    setSaving(true);
    try {
      let imageUrl = recipe.image_url;

      // Upload new image if changed
      if (imageFile) {
        try {
          imageUrl = await uploadImageToCloudinary(imageFile);
          console.log('Image uploaded to Cloudinary:', imageUrl);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          alert("Failed to upload image. Please try again.");
          return;
        }
      }

      // Prepare update data
      const updateData = {
        title: recipe.title,
        mood: recipe.mood,
        cook_time: recipe.cook_time,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        description: recipe.description,
        ingredients: recipe.ingredients.filter(ing => ing.trim() !== ""),
        instructions: recipe.instructions.filter(inst => inst.trim() !== ""),
        tags: recipe.tags,
        image_url: imageUrl
      };

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update recipe');
      }

      const updatedRecipe = await response.json();
      setRecipe(updatedRecipe);
      setIsEditing(false);
      setImageFile(null);
      alert('Recipe updated successfully!');
    } catch (error) {
      console.error('Error updating recipe:', error);
      alert('Error updating recipe: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleRecipeStatus = async () => {
    if (!recipe) return;

    try {
      const response = await fetch(`${API_URL}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !recipe.is_active })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update recipe status');
      }

      const result = await response.json();
      setRecipe(prev => ({ ...prev, is_active: !prev.is_active }));
      alert(result.message);
    } catch (error) {
      console.error('Error toggling recipe status:', error);
      alert('Error updating recipe status: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete recipe');
      }

      alert('Recipe deleted successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Error deleting recipe: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F10100] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recipe not found</h2>
          <p className="text-gray-600">The recipe you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/profile')}
              className="bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:bg-white transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Profile</span>
            </motion.button>
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Recipe
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Status Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleRecipeStatus}
              className={`px-4 py-2 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-300 ${
                recipe.is_active
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {recipe.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{recipe.is_active ? 'Active' : 'Inactive'}</span>
            </motion.button>

            {/* Edit/Save Button */}
            {isEditing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={saving}
                className="bg-[#F10100] text-white px-6 py-2 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:bg-[#FF4444] transition-all duration-300"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="bg-[#F10100] text-white px-6 py-2 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:bg-[#FF4444] transition-all duration-300"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Recipe</span>
              </motion.button>
            )}

            {/* Delete Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:bg-red-600 transition-all duration-300"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </motion.button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recipe Image */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recipe Photo</h2>
            
            <div className="relative">
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="w-full h-80 object-cover rounded-2xl"
              />
              
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                  <label className="bg-white text-gray-700 px-4 py-2 rounded-xl font-semibold cursor-pointer hover:bg-gray-100 transition-all duration-300">
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recipe Details */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Basic Information */}
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Recipe Title *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={recipe.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300 ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mood Association *
                  </label>
                  <select
                    required
                    disabled={!isEditing}
                    value={recipe.mood}
                    onChange={(e) => handleInputChange("mood", e.target.value)}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300 ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  >
                    {mockMoods.map((mood) => (
                      <option key={mood.id} value={mood.name}>
                        {mood.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Cook Time
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={recipe.cook_time || ''}
                      onChange={(e) => handleInputChange("cook_time", e.target.value)}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300 ${
                        !isEditing ? 'bg-gray-50' : ''
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Servings
                    </label>
                    <input
                      type="number"
                      disabled={!isEditing}
                      value={recipe.servings || ''}
                      onChange={(e) => handleInputChange("servings", e.target.value)}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300 ${
                        !isEditing ? 'bg-gray-50' : ''
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <div className="flex space-x-3">
                    {difficulties.map((difficulty) => (
                      <button
                        key={difficulty}
                        type="button"
                        disabled={!isEditing}
                        onClick={() => handleInputChange("difficulty", difficulty)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                          recipe.difficulty === difficulty
                            ? "bg-[#F10100] text-white shadow-lg"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {difficulty}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    disabled={!isEditing}
                    value={recipe.description || ''}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300 resize-none ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ingredients</h2>
              
              <div className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={ingredient}
                      onChange={(e) => handleArrayChange("ingredients", index, e.target.value)}
                      className={`flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300 ${
                        !isEditing ? 'bg-gray-50' : ''
                      }`}
                    />
                    {isEditing && recipe.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("ingredients", index)}
                        className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors duration-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={() => addArrayItem("ingredients")}
                  className="mt-4 flex items-center space-x-2 text-[#F10100] hover:text-[#FF4444] font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Ingredient</span>
                </button>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructions</h2>
              
              <div className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-[#F10100] text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                      {index + 1}
                    </div>
                    <textarea
                      disabled={!isEditing}
                      value={instruction}
                      onChange={(e) => handleArrayChange("instructions", index, e.target.value)}
                      rows={3}
                      className={`flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300 resize-none ${
                        !isEditing ? 'bg-gray-50' : ''
                      }`}
                    />
                    {isEditing && recipe.instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("instructions", index)}
                        className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors duration-300 mt-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={() => addArrayItem("instructions")}
                  className="mt-4 flex items-center space-x-2 text-[#F10100] hover:text-[#FF4444] font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Step</span>
                </button>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tags</h2>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#F10100]/10 text-[#F10100] px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2"
                  >
                    <span>{tag}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-600 transition-colors duration-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              
              {isEditing && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Add tags..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-6 py-3 bg-[#F10100] text-white rounded-2xl font-medium hover:bg-[#FF4444] transition-all duration-300"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ManageRecipe; 