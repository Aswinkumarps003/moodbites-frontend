import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Plus, X, Camera, Clock, Users, Heart } from "lucide-react";
import { mockMoods } from "../mock.jsx";

// You can set your backend API endpoint here
const API_URL = "http://localhost:5002/api/food/dishes"; // Change this to your actual backend endpoint

const SubmitRecipe = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cookTime: "",
    servings: "",
    mood: "",
    difficulty: "Easy",
    ingredients: [""],
    instructions: [""],
    tags: [],
    image: null
  });

  const [dragActive, setDragActive] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  const difficulties = ["Easy", "Medium", "Hard"];

  // Get user from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, image: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // This is the API call to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Check if user is logged in
      if (!user) {
        alert("Please log in to submit a recipe");
        return;
      }

      // Map frontend data to backend expected format
      const backendData = {
        title: formData.title,
        mood: formData.mood,
        cook_time: formData.cookTime,
        servings: formData.servings ? parseInt(formData.servings) : null,
        difficulty: formData.difficulty,
        description: formData.description,
        ingredients: formData.ingredients.filter(ing => ing.trim() !== ""),
        instructions: formData.instructions.filter(inst => inst.trim() !== ""),
        tags: formData.tags,
        image_url: formData.image,
        user_id: user._id || user.id // Use MongoDB _id or fallback to id
      };

      console.log('Sending data to backend:', backendData);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(backendData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || "Failed to submit recipe");
      }

      // Optionally, handle the response
      const data = await response.json();
      console.log('Success response:', data);
      alert("Recipe submitted successfully!");
      
      // Reset the form
      setFormData({
        title: "",
        description: "",
        cookTime: "",
        servings: "",
        mood: "",
        difficulty: "Easy",
        ingredients: [""],
        instructions: [""],
        tags: [],
        image: null
      });
    } catch (error) {
      console.error('Submit error:', error);
      alert("Error submitting recipe: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Share Your <span className="text-[#F10100]">Recipe</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help others discover amazing mood-boosting meals by sharing your favorite recipes
          </p>
          {!user && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-xl">
              <p className="text-yellow-800">Please log in to submit a recipe</p>
            </div>
          )}
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter recipe name..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mood Association *
                </label>
                <select
                  required
                  value={formData.mood}
                  onChange={(e) => handleInputChange("mood", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300"
                >
                  <option value="">Select a mood...</option>
                  {mockMoods.map((mood) => (
                    <option key={mood.id} value={mood.name}>
                      {mood.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Cook Time
                </label>
                <input
                  type="text"
                  value={formData.cookTime}
                  onChange={(e) => handleInputChange("cookTime", e.target.value)}
                  placeholder="e.g., 30 minutes"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Servings
                </label>
                <input
                  type="number"
                  value={formData.servings}
                  onChange={(e) => handleInputChange("servings", e.target.value)}
                  placeholder="Number of servings"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <div className="flex space-x-3">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty}
                      type="button"
                      onClick={() => handleInputChange("difficulty", difficulty)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                        formData.difficulty === difficulty
                          ? "bg-[#F10100] text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your recipe and what makes it special..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300 resize-none"
                />
              </div>
            </div>
          </motion.div>

          {/* Image Upload */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recipe Photo</h2>
            
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                dragActive
                  ? "border-[#F10100] bg-[#F10100]/5"
                  : "border-gray-300 hover:border-[#F10100]"
              }`}
            >
              {formData.image ? (
                <div className="relative">
                  <img
                    src={formData.image}
                    alt="Recipe preview"
                    className="w-full h-64 object-cover rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange("image", null)}
                    className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drop your image here, or click to browse
                  </p>
                  <p className="text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Ingredients */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ingredients</h2>
            
            <div className="space-y-4">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleArrayChange("ingredients", index, e.target.value)}
                    placeholder={`Ingredient ${index + 1}`}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300"
                  />
                  {formData.ingredients.length > 1 && (
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
            
            <button
              type="button"
              onClick={() => addArrayItem("ingredients")}
              className="mt-4 flex items-center space-x-2 text-[#F10100] hover:text-[#FF4444] font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Add Ingredient</span>
            </button>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Instructions</h2>
            
            <div className="space-y-4">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-[#F10100] text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    {index + 1}
                  </div>
                  <textarea
                    value={instruction}
                    onChange={(e) => handleArrayChange("instructions", index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    rows={3}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] transition-all duration-300 resize-none"
                  />
                  {formData.instructions.length > 1 && (
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
            
            <button
              type="button"
              onClick={() => addArrayItem("instructions")}
              className="mt-4 flex items-center space-x-2 text-[#F10100] hover:text-[#FF4444] font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Add Step</span>
            </button>
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tags</h2>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#F10100]/10 text-[#F10100] px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-600 transition-colors duration-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add tags (e.g., vegetarian, gluten-free)..."
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
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <motion.button
              type="submit"
              whileHover={{ 
                scale: 1.02, 
                boxShadow: "0 25px 50px rgba(241, 1, 0, 0.3)" 
              }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-[#F10100] to-[#FF4444] text-white px-12 py-4 rounded-2xl font-bold text-lg flex items-center space-x-3 shadow-xl hover:shadow-2xl transition-all duration-300 mx-auto"
              disabled={submitting || !user}
            >
              <Heart className="w-6 h-6" />
              <span>{submitting ? "Submitting..." : "Share Recipe"}</span>
            </motion.button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
};

export default SubmitRecipe;