import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Webcam from "react-webcam";
import { Camera, Upload, Scan, X, ChefHat, Clock, Zap, RefreshCw, CheckCircle, Plus, Trash2, Edit3 } from "lucide-react";
import ScrollReveal from "../components/ScrollReveal";
import { mockFridgeScans } from "../mock.jsx";

const FridgeScanner = () => {
  const [scanMode, setScanMode] = useState("camera"); // camera, upload, results, manage
  const [isScanning, setIsScanning] = useState(false);
  const [isFetchingRecipes, setIsFetchingRecipes] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [manualIngredients, setManualIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [ingredientError, setIngredientError] = useState("");
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Food validation keywords (imported from SubmitRecipe validation)
  const FOOD_KEYWORDS = new Set([
    // staple foods (grains, breads, pasta, noodles)
    'strong' ,'brew','brewed','steep','rolled','chamomile','ada', 'adai', 'akki roti', 'amaranth', 'appam', 'arborio', 'atta', 'bagel', 'baguette', 'bajra', 'bajra roti', 'barley', 'basmati', 'besan', 'bhakri', 'bhatura', 'bread', 'brioche', 'brown rice', 'buckwheat', 'bulgur', 'carnaroli', 'cellophane noodles', 'chapati', 'cheela', 'chawal', 'ciabatta', 'cornbread', 'cornmeal', 'couscous', 'cracker', 'croissant', 'dosa', 'egg noodles', 'farro', 'fettuccine', 'flour', 'focaccia', 'freekeh', 'fusilli', 'gehun', 'gnocchi', 'gram flour', 'grits', 'idiyappam', 'idli', 'jau', 'jowar', 'jowar roti', 'kamut', 'khamiri roti', 'kulcha', 'kuttu', 'lachha paratha', 'lasagna', 'linguine', 'lobia', 'luchi', 'macaroni', 'maida', 'makki', 'makki di roti', 'malabar parotta', 'masala dosa', 'millet', 'missi roti', 'murmura', 'naan', 'neer dosa', 'noodles', 'oats', 'orzo', 'paratha', 'parotta', 'pasta', 'penne', 'pesarattu', 'pita', 'poha', 'polenta', 'pongal', 'puri', 'pumpernickel', 'puttu', 'quinoa', 'ragi', 'ragi roti', 'ramen', 'rava', 'rava dosa', 'ravioli', 'rice', 'rice flour', 'rice noodles', 'rigatoni', 'risotto', 'roti', 'rumali roti', 'rye', 'sago', 'sabudana', 'sattu', 'semolina', 'set dosa', 'sheermal', 'soba', 'sooji', 'sorghum', 'sourdough', 'spaghetti', 'spelt', 'sticky rice', 'suji', 'sushi rice', 'taftan', 'tagliatelle', 'tapioca', 'teff', 'thalipeeth', 'thepla', 'tortellini', 'tortilla', 'udon', 'upma', 'uttapam', 'valencia', 'vermicelli', 'wheat', 'wild rice',

    // proteins (meat, poultry, seafood, dairy, legumes, nuts, seeds)
    'abalone', 'albacore', 'almond', 'anchovy', 'arhar dal', 'bacon', 'bass', 'bean', 'beans', 'beef', 'black bean', 'black chana', 'brie', 'camembert', 'carp', 'cashew', 'catfish', 'chana', 'chana dal', 'cheddar', 'cheese', 'chenna', 'cherrystone', 'chia', 'chickpea', 'chickpeas', 'chicken', 'clam', 'cod', 'conch', 'cottage cheese', 'crab', 'crayfish', 'cream cheese', 'curd', 'dahi', 'dal', 'doodh', 'duck', 'edamame', 'eel', 'egg', 'eggs', 'emmental', 'escargot', 'fava bean', 'feta', 'fish', 'flax', 'gorgonzola', 'gosht', 'gouda', 'gram', 'grouper', 'gruyere', 'haddock', 'halibut', 'halloumi', 'ham', 'hazelnut', 'hemp', 'herring', 'jerky', 'kabuli chana', 'kala chana', 'kefir', 'khoya', 'kidney', 'kulthi', 'lamb', 'langoustine', 'lentil', 'lentils', 'lima bean', 'liver', 'lobster', 'lobia', 'macadamia', 'mackerel', 'mahi-mahi', 'malai', 'manchego', 'mascarpone', 'masoor', 'masoor dal', 'matar', 'matki', 'mawa', 'milk', 'monkfish', 'moong', 'moong dal', 'mortadella', 'moth bean', 'mozzarella', 'mung', 'mussel', 'mutton', 'natto', 'nut', 'nuts', 'octopus', 'offal', 'oyster', 'pancetta', 'paneer', 'parmesan', 'pea', 'peanut', 'peas', 'pecan', 'pecorino', 'pepperoni', 'perch', 'pike', 'pine nut', 'pinto bean', 'pistachio', 'pollock', 'pork', 'prawn', 'prosciutto', 'provolone', 'pumpkin seed', 'quail', 'rabbit', 'rajma', 'red snapper', 'ricotta', 'roquefort', 'salami', 'salmon', 'sardine', 'sausage', 'scallop', 'sea urchin', 'seed', 'seeds', 'seitan', 'sesame seed', 'shrimp', 'snapper', 'soy', 'squid', 'steak', 'stilton', 'sunflower seed', 'swordfish', 'tempeh', 'tilapia', 'tofu', 'toor dal', 'tripe', 'trout', 'tuna', 'turbot', 'turkey', 'uni', 'urad', 'urad dal', 'veal', 'venison', 'walnut', 'white bean', 'yogurt',

    // vegetables (sabzi) & greens
    'acorn squash', 'adrak', 'aloo', 'amaranth leaves', 'arbi', 'artichoke', 'arugula', 'arvi', 'asparagus', 'baingan', 'bamboo shoot', 'bathua', 'bean sprout', 'beetroot', 'bell pepper', 'bhindi', 'bitter gourd', 'bok choy', 'brinjal', 'broccoli', 'brussels sprout', 'burdock', 'butternut squash', 'cabbage', 'capers', 'capsicum', 'cardoon', 'carrot', 'cassava', 'cauliflower', 'celeriac', 'celery', 'chard', 'chayote', 'chili', 'chilli', 'chukandar', 'cluster beans', 'collard greens', 'colocasia', 'corn', 'courgette', 'cucumber', 'curry leaves', 'daikon', 'dandelion greens', 'dhaniya', 'drumstick', 'edamame', 'eggplant', 'endive', 'fennel', 'fenugreek leaves', 'fiddlehead', 'gajar', 'galangal', 'garlic', 'ginger', 'gobi', 'gourd', 'green bean', 'guar', 'hari mirch', 'hearts of palm', 'horseradish', 'ivy gourd', 'jicama', 'jimikand', 'kachha kela', 'kakdi', 'kale', 'kanda', 'kanthari mulaku', 'karela', 'kariveppila', 'kathal', 'kohlrabi', 'kundru', 'lauki', 'leek', 'lehsun', 'lemongrass', 'lettuce', 'lotus root', 'methi', 'mooli', 'moringa', 'mushroom', 'mustard greens', 'nori', 'okra', 'olive', 'onion', 'palak', 'parsnip', 'parwal', 'patta gobi', 'pepper', 'petha', 'plantain', 'pointed gourd', 'potato', 'pudina', 'pumpkin', 'pyaz', 'radicchio', 'radish', 'ramps', 'rhubarb', 'ridge gourd', 'rocket', 'romanesco', 'sabzi', 'sainjan', 'samphire', 'sarson', 'scallion', 'seaweed', 'sem', 'shallot', 'shakarkandi', 'snap pea', 'snow pea', 'spinach', 'sprouts', 'squash', 'sunchoke', 'suran', 'sweet potato', 'taro', 'tamatar', 'tinda', 'tomatillo', 'tomato', 'turai', 'turnip', 'vazhakka', 'water chestnut', 'watercress', 'yam', 'zucchini',

    // fruits (phal)
    'aam', 'ackee', 'acai', 'amla', 'amrood', 'anar', 'angoor', 'apple', 'apricot', 'avocado', 'banana', 'ber', 'berries', 'bilberry', 'blackberry', 'blood orange', 'blueberry', 'boysenberry', 'breadfruit', 'cantaloupe', 'carambola', 'cherimoya', 'cherry', 'chikoo', 'citron', 'citrus', 'clementine', 'cloudberry', 'coconut', 'crabapple', 'cranberry', 'currant', 'custard apple', 'damson', 'date', 'dates', 'dragonfruit', 'durian', 'elderberry', 'feijoa', 'fig', 'goji berry', 'gooseberry', 'grape', 'grapefruit', 'grapes', 'guava', 'honeydew', 'huckleberry', 'imli', 'jackfruit', 'jamun', 'jujube', 'kaintha', 'kamrakh', 'karonda', 'kathal', 'kela', 'kiwi', 'kodampuli', 'kumquat', 'lemon', 'lime', 'loganberry', 'longan', 'loquat', 'lychee', 'mandarin', 'mango', 'mangosteen', 'marionberry', 'melon', 'mulberry', 'nariyal', 'nectarine', 'nimbu', 'orange', 'papaya', 'passionfruit', 'pawpaw', 'peach', 'pear', 'persimmon', 'phal', 'pineapple', 'plantain', 'plum', 'pomegranate', 'pomelo', 'prune', 'quince', 'raisin', 'rambutan', 'raspberry', 'redcurrant', 'santra', 'sapodilla', 'seb', 'sharifa', 'singhara', 'sitaphal', 'soursop', 'star fruit', 'strawberry', 'tamarind', 'tangerine', 'thenga', 'ugli fruit', 'watermelon', 'wood apple', 'yuzu',

    // fats, oils & sweeteners
    'almond oil', 'avocado oil', 'butter', 'canola', 'cheeni', 'coconut', 'coconut oil', 'corn oil', 'cream', 'duck fat', 'ghee', 'grapeseed oil', 'groundnut', 'gud', 'honey', 'jaggery', 'lard', 'makhan', 'margarine', 'mayo', 'mayonnaise', 'mishri', 'moongphali', 'mustard', 'mustard oil', 'nariyal tel', 'oil', 'olive oil', 'palm oil', 'peanut oil', 'safflower oil', 'sarson ka tel', 'schmaltz', 'sesame', 'sesame oil', 'shahad', 'shakkar', 'sharkara', 'shortening', 'suet', 'sunflower', 'sunflower oil', 'tel', 'til', 'truffle oil', 'vegetable', 'velichenna', 'walnut oil',

    // spices & herbs
    'ajwain', 'allspice', 'amchur', 'anardana', 'anise', 'annatto', 'asafoetida', 'basil', 'bay', 'biryani masala', 'black salt', 'blackpepper', 'caraway', 'cardamom', 'carom', 'cassia', 'cayenne', 'celery seed', 'chakri phool', 'chaat masala', 'chervil', 'chives', 'cilantro', 'cinnamon', 'clove', 'coriander', 'cumin', 'curry', 'dalchini', 'dhaniya', 'dill', 'elaichi', 'epazote', 'fennel', 'fenugreek', 'fenugreek seeds', 'fleur de sel', 'galangal', 'garam', 'garam masala', 'garlic powder', 'goda masala', 'grains of paradise', 'haldi', 'hing', 'hyssop', 'jaiphal', 'javitri', 'jeera', 'juniper berry', 'kaffir lime', 'kala jeera', 'kala mirch', 'kala namak', 'kalonji', 'kalpasi', 'kasoori methi', 'kashmiri mirch', 'kesar', 'kosher salt', 'lal mirch', 'laung', 'lavender', 'leaf', 'leaves', 'lemon balm', 'lemongrass', 'lovage', 'mace', 'mahlab', 'marjoram', 'masala', 'methi', 'methi dana', 'mint', 'mustard seed', 'nigella', 'nutmeg', 'onion powder', 'oregano', 'panch phoron', 'paprika', 'parsley', 'peppercorn', 'podi', 'poppy', 'powder', 'pudina', 'rai', 'rasam powder', 'rosemary', 'saffron', 'sage', 'salt', 'sambar powder', 'saunf', 'savory', 'sea salt', 'shahi jeera', 'shiso', 'sonth', 'star', 'sumac', 'tarragon', 'tej patta', 'thyme', 'turmeric', 'vanilla', 'zaffran', 'zaatar'
  ]);

  // Validate ingredient name
  const validateIngredient = (ingredientName) => {
    if (!ingredientName.trim()) return "Ingredient name is required";
    if (ingredientName.trim().length < 2) return "Ingredient name must be at least 2 characters";
    if (ingredientName.trim().length > 50) return "Ingredient name must be less than 50 characters";
    
    const name = ingredientName.toLowerCase().trim();
    const tokens = name.split(/\s+/);
    
    // Check if any token matches food keywords
    const hasFoodKeyword = tokens.some(token => FOOD_KEYWORDS.has(token));
    if (!hasFoodKeyword) return "Please enter a valid food ingredient";
    
    return null;
  };

  // Categorize ingredients based on their names
  const categorizeIngredient = (ingredientName) => {
    const name = ingredientName.toLowerCase();
    
    // Fruits
    if (['apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'lemon', 'lime', 'pear', 'peach', 'plum', 'cherry', 'watermelon', 'pineapple', 'mango', 'kiwi', 'avocado'].some(fruit => name.includes(fruit))) {
      return 'Fruits';
    }
    
    // Vegetables
    if (['tomato', 'potato', 'onion', 'garlic', 'carrot', 'broccoli', 'spinach', 'lettuce', 'cabbage', 'pepper', 'cucumber', 'zucchini', 'eggplant', 'corn', 'peas', 'beans', 'celery', 'mushroom', 'radish', 'beet'].some(veg => name.includes(veg))) {
      return 'Vegetables';
    }
    
    // Default category
    return 'Produce';
  };

  // Manual ingredient management functions
  const addManualIngredient = () => {
    const validationError = validateIngredient(newIngredient);
    if (validationError) {
      setIngredientError(validationError);
      return;
    }

    const ingredient = {
      name: newIngredient.trim(),
      confidence: 100, // Manual ingredients have 100% confidence
      category: categorizeIngredient(newIngredient.trim()),
      isManual: true
    };

    const updatedManualIngredients = [...manualIngredients, ingredient];
    setManualIngredients(updatedManualIngredients);
    setNewIngredient("");
    setIngredientError("");

    // Update scanResults if it exists
    if (scanResults) {
      const allIngredients = [...scanResults.detectedIngredients, ...updatedManualIngredients];
      setScanResults(prev => ({
        ...prev,
        manualIngredients: updatedManualIngredients,
        allIngredients: allIngredients
      }));
      
      // Automatically refresh recipes with new ingredients
      refreshRecipesWithIngredients(allIngredients);
    }
  };

  const removeManualIngredient = (index) => {
    const updatedManualIngredients = manualIngredients.filter((_, i) => i !== index);
    setManualIngredients(updatedManualIngredients);
    
    // Update scanResults if it exists
    if (scanResults) {
      const allIngredients = [...scanResults.detectedIngredients, ...updatedManualIngredients];
      setScanResults(prev => ({
        ...prev,
        manualIngredients: updatedManualIngredients,
        allIngredients: allIngredients
      }));
    }
  };

  const removeDetectedIngredient = (index) => {
    if (scanResults) {
      const updatedIngredients = scanResults.detectedIngredients.filter((_, i) => i !== index);
      const allIngredients = [...updatedIngredients, ...manualIngredients];
      setScanResults(prev => ({
        ...prev,
        detectedIngredients: updatedIngredients,
        allIngredients: allIngredients
      }));
    }
  };

  // Refresh recipes when ingredients change
  const refreshRecipes = async () => {
    if (!scanResults) return;
    
    setIsFetchingRecipes(true);
    try {
      const updatedRecipes = await fetchRecipesFromAPI(scanResults.allIngredients);
      setScanResults(prev => ({
        ...prev,
        suggestedRecipes: updatedRecipes
      }));
    } catch (error) {
      console.error('Error refreshing recipes:', error);
    } finally {
      setIsFetchingRecipes(false);
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc || typeof imageSrc !== 'string' || !imageSrc.startsWith('data:image')) {
      setError('Could not capture image from camera. Please allow camera access and try again.');
      return;
    }
    setCapturedImage(imageSrc);
    performScan(imageSrc);
  }, [webcamRef]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (!result || typeof result !== 'string' || !result.startsWith('data:image')) {
        setError('Selected file could not be read as an image.');
        return;
      }
      setCapturedImage(result);
      performScan(result);
    };
    reader.readAsDataURL(file);
  };

  const performScan = async (imageData) => {
    if (!imageData || typeof imageData !== 'string' || !imageData.startsWith('data:image')) {
      setError('Invalid image data for scanning.');
      setScanMode('camera');
      setIsScanning(false);
      return;
    }
    setIsScanning(true);
    setScanMode("scanning");
    
    try {
      // Convert base64 image to blob for upload
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Create FormData for API call
      const formData = new FormData();
      formData.append('file', blob, 'fridge_scan.jpg');
      
      // Call YOLO model API
      const apiResponse = await fetch('https://moodbites-fridge-service.onrender.com/api/predict', {
        method: 'POST',
        body: formData
      });
      
      if (!apiResponse.ok) {
        throw new Error(`API Error: ${apiResponse.status}`);
      }
      
      const predictions = await apiResponse.json();
      console.log('Raw predictions from backend:', predictions);
      
      // Transform YOLO predictions to our format
      const detectedIngredients = predictions.predictions.map(pred => ({
        name: pred.className,
        confidence: Math.round(pred.confidence * 100), // Convert decimal to percentage
        category: categorizeIngredient(pred.className),
        bbox: pred.bbox
      })).filter(item => item.confidence > 0.1) // Filter low confidence detections (10% threshold)
        .sort((a, b) => b.confidence - a.confidence); // Sort by confidence
      
      console.log('Processed detected ingredients:', detectedIngredients);
      
      // If no ingredients detected, show fallback message
      if (detectedIngredients.length === 0) {
        setError("No ingredients detected. Try taking a clearer photo with better lighting.");
        setIsScanning(false);
        setScanMode("camera");
        return;
      }

      // Combine detected and manual ingredients
      const allIngredients = [...detectedIngredients, ...manualIngredients];
      
      // Fetch real recipes from food service
      setIsFetchingRecipes(true);
      const suggestedRecipes = await fetchRecipesFromAPI(allIngredients);
      
      // Create nutrition summary
      const nutritionSummary = {
        estimatedMeals: Math.min(allIngredients.length, 5),
        avgCalories: Math.round(allIngredients.length * 45 + Math.random() * 100),
        categories: getCategoriesFromIngredients(allIngredients)
      };

      const results = {
        detectedIngredients,
        manualIngredients,
        allIngredients,
        suggestedRecipes,
        nutritionSummary
      };
      
      setScanResults(results);
      setError(null);
      
      // Tell the component to switch to the results view
      setScanMode("results");
      
    } catch (error) {
      console.error('Scan error:', error);
      setError(`Scanning failed: ${error.message}. Make sure the YOLO model server is running on port 4010.`);
      setScanMode("camera");
    } finally {
      setIsScanning(false);
      setIsFetchingRecipes(false);
    }
  };

  // Fetch real recipes from Spoonacular API
  const fetchRecipesFromAPI = async (ingredients) => {
    try {
      const ingredientNames = ingredients.map(ing => ing.name).join(',');
      
      // First try Spoonacular API via mood-analysis service
      console.log('Fetching recipes from Spoonacular API for ingredients:', ingredientNames);
      
      const spoonacularResponse = await fetch(`http://localhost:3001/api/spoonacular/recipes/by-ingredients?ingredients=${encodeURIComponent(ingredientNames)}&number=6`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (spoonacularResponse.ok) {
        const spoonacularRecipes = await spoonacularResponse.json();
        
        if (spoonacularRecipes && spoonacularRecipes.length > 0) {
          console.log('Successfully fetched recipes from Spoonacular:', spoonacularRecipes.length);
          
          // Transform Spoonacular recipes to match our format
          return spoonacularRecipes.map(recipe => ({
            id: recipe.id,
            name: recipe.title,
            cookTime: recipe.readyInMinutes ? `${recipe.readyInMinutes} mins` : "30 mins",
            calories: recipe.calories || Math.floor(Math.random() * 200) + 150,
            difficulty: recipe.difficulty || "Easy",
            image: recipe.image || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            mood: recipe.mood || "Fresh",
            matchedIngredients: recipe.usedIngredientCount || Math.min(ingredients.length, Math.floor(Math.random() * 4) + 2),
            totalIngredients: recipe.totalIngredients || Math.floor(Math.random() * 3) + 4,
            description: recipe.summary ? recipe.summary.replace(/<[^>]*>/g, '') : "",
            instructions: recipe.instructions || [],
            missedIngredients: recipe.missedIngredientCount || 0,
            spoonacularId: recipe.id
          }));
        }
      }

      // Fallback to local food service API
      console.log('Mood-analysis service failed, trying local food service...');
      const foodServiceResponse = await fetch(`https://food-service-latest.onrender.com/api/food/recipes/by-ingredients?ingredients=${encodeURIComponent(ingredientNames)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (foodServiceResponse.ok) {
        const localRecipes = await foodServiceResponse.json();
        
        if (localRecipes && localRecipes.length > 0) {
          console.log('Successfully fetched recipes from local food service:', localRecipes.length);
          
          return localRecipes.map(recipe => ({
            id: recipe._id || recipe.id,
            name: recipe.title || recipe.name,
            cookTime: recipe.cook_time || recipe.cookTime || "30 mins",
            calories: recipe.calories || Math.floor(Math.random() * 200) + 150,
            difficulty: recipe.difficulty || "Easy",
            image: recipe.image_url || recipe.image || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            mood: recipe.mood || "Fresh",
            matchedIngredients: Math.min(ingredients.length, Math.floor(Math.random() * 4) + 2),
            totalIngredients: recipe.ingredients ? recipe.ingredients.length : Math.floor(Math.random() * 3) + 4,
            description: recipe.description || "",
            instructions: recipe.instructions || []
          }));
        }
      }

      // Final fallback to mock recipes
      console.log('All APIs failed, using fallback mock recipes');
      return generateRecipeSuggestions(ingredients);

    } catch (error) {
      console.error('Error fetching recipes from APIs:', error);
      console.log('Falling back to mock recipes');
      return generateRecipeSuggestions(ingredients);
    }
  };

  // Generate recipe suggestions based on detected ingredients
  const generateRecipeSuggestions = (ingredients) => {
    const recipes = [
      {
        id: 1,
        name: "Fresh Garden Salad",
        cookTime: "5 mins",
        calories: 150,
        difficulty: "Easy",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        mood: "Fresh"
      },
      {
        id: 2,
        name: "Roasted Vegetable Medley",
        cookTime: "25 mins",
        calories: 220,
        difficulty: "Easy",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        mood: "Comforting"
      },
      {
        id: 3,
        name: "Fruit & Veggie Smoothie Bowl",
        cookTime: "10 mins",
        calories: 280,
        difficulty: "Easy",
        image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        mood: "Energetic"
      }
    ];

    return recipes.map(recipe => ({
      ...recipe,
      matchedIngredients: Math.min(ingredients.length, Math.floor(Math.random() * 4) + 2),
      totalIngredients: Math.floor(Math.random() * 3) + 4
    }));
  };

  // Get categories from detected ingredients
  const getCategoriesFromIngredients = (ingredients) => {
    const categories = new Set();
    ingredients.forEach(ingredient => {
      categories.add(ingredient.category);
    });
    
    const categoryList = Array.from(categories);
    if (categoryList.includes('Fruits')) categoryList.push('High Vitamin C');
    if (categoryList.includes('Vegetables')) categoryList.push('High Fiber');
    
    return categoryList.slice(0, 3);
  };

  const resetScanner = () => {
    setScanMode("camera");
    setScanResults(null);
    setCapturedImage(null);
    setIsScanning(false);
    setIsFetchingRecipes(false);
    setError(null);
    setManualIngredients([]);
    setNewIngredient("");
    setIngredientError("");
  };

  if (scanMode === "scanning") {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 bg-gradient-to-r from-[#F10100] to-[#FFD122] rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <Scan className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-display">
            {isFetchingRecipes ? "Finding Perfect Recipes" : "Analyzing Your Fridge"}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
            {isFetchingRecipes 
              ? "Searching our recipe database for dishes you can make with your ingredients..."
              : "Our YOLO AI model is detecting fruits and vegetables to suggest perfect recipes..."
            }
          </p>
          <div className="flex justify-center space-x-4 text-sm text-gray-500">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-[#F10100] rounded-full"></div>
              <span>{isFetchingRecipes ? "Searching recipes" : "Detecting ingredients"}</span>
            </motion.div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              className="flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-[#FFD122] rounded-full"></div>
              <span>{isFetchingRecipes ? "Filtering matches" : "Matching recipes"}</span>
            </motion.div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
              className="flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-[#476E00] rounded-full"></div>
              <span>{isFetchingRecipes ? "Preparing suggestions" : "Calculating nutrition"}</span>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (scanMode === "results") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-display">
                  Scan Complete!
                </h1>
              </div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
                We found <span className="font-bold text-green-600">{scanResults.allIngredients.length} ingredient{scanResults.allIngredients.length !== 1 ? 's' : ''}</span> and discovered amazing recipes using your available items
              </p>
              <div className="flex justify-center items-center space-x-2 text-sm text-gray-500 mb-4">
                <span>Ingredients:</span>
                {scanResults.allIngredients.slice(0, 3).map((ingredient, index) => (
                  <span key={index} className={`px-2 py-1 rounded-full font-medium ${
                    ingredient.isManual 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {ingredient.name}
                  </span>
                ))}
                {scanResults.allIngredients.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    +{scanResults.allIngredients.length - 3} more
                  </span>
                )}
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setScanMode("manage")}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-2xl transition-colors duration-300"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Manage Ingredients</span>
                </button>
                <button
                  onClick={resetScanner}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-colors duration-300"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Scan Again</span>
                </button>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* All Ingredients */}
            <div className="lg:col-span-1">
              <ScrollReveal direction="left" delay={0.2}>
                <div className="bg-white rounded-3xl shadow-professional p-6 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 font-display">
                    All Ingredients
                  </h2>
                  <div className="space-y-3">
                    {scanResults.allIngredients.map((ingredient, index) => (
                      <motion.div
                        key={`${ingredient.name}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center justify-between p-4 rounded-2xl border hover:shadow-md transition-all duration-200 ${
                          ingredient.isManual 
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100' 
                            : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            ingredient.isManual ? 'bg-blue-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <span className="font-bold text-lg text-gray-900 capitalize">
                              {ingredient.name}
                            </span>
                            <div className="text-sm text-gray-600">
                              Category: <span className="font-medium">{ingredient.category}</span>
                              {ingredient.isManual && <span className="ml-2 text-blue-600 font-medium">(Manual)</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            ingredient.isManual ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            {ingredient.confidence}%
                          </div>
                          <div className="text-xs text-gray-500">confidence</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="left" delay={0.3}>
                <div className="bg-white rounded-3xl shadow-professional p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 font-display">
                    Nutrition Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Estimated Meals</span>
                      <span className="font-bold text-[#F10100]">
                        {scanResults.nutritionSummary.estimatedMeals}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Avg Calories</span>
                      <span className="font-bold text-[#FFD122]">
                        {scanResults.nutritionSummary.avgCalories}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {scanResults.nutritionSummary.categories.map((category) => (
                          <span
                            key={category}
                            className="px-3 py-1 bg-[#476E00]/10 text-[#476E00] rounded-full text-sm font-medium"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Recipe Suggestions */}
            <div className="lg:col-span-2">
              <ScrollReveal direction="right" delay={0.2}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 font-display">
                    Suggested Recipes
                  </h2>
                  <button
                    onClick={resetScanner}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-colors duration-300"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Scan Again</span>
                  </button>
                </div>
              </ScrollReveal>

              <div className="space-y-6">
                {isFetchingRecipes && (
                  <div className="text-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 bg-gradient-to-r from-[#F10100] to-[#FFD122] rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <ChefHat className="w-6 h-6 text-white" />
                    </motion.div>
                    <p className="text-gray-600 font-medium">Updating recipe suggestions...</p>
                  </div>
                )}
                {!isFetchingRecipes && scanResults.suggestedRecipes.map((recipe, index) => (
                  <ScrollReveal key={recipe.id} direction="up" delay={0.3 + index * 0.1}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-3xl shadow-professional hover:shadow-professional-hover overflow-hidden transition-all duration-500"
                    >
                      <div className="md:flex">
                        <div className="md:w-1/3">
                          <img
                            src={recipe.image}
                            alt={recipe.name}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        </div>
                        <div className="md:w-2/3 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-2 font-display">
                                {recipe.name}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{recipe.cookTime}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Zap className="w-4 h-4" />
                                  <span>{recipe.calories} cal</span>
                                </div>
                                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                  {recipe.difficulty}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-[#476E00]">
                                {Math.round((recipe.matchedIngredients / recipe.totalIngredients) * 100)}%
                              </div>
                              <div className="text-xs text-gray-500">
                                {recipe.matchedIngredients}/{recipe.totalIngredients} ingredients
                              </div>
                              {recipe.missedIngredients > 0 && (
                                <div className="text-xs text-orange-600 mt-1">
                                  {recipe.missedIngredients} missing
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span
                                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                                style={{ backgroundColor: recipe.mood === "Energetic" ? "#FFD122" : recipe.mood === "Happy" ? "#476E00" : "#F1E1C8" }}
                              >
                                {recipe.mood} Mood
                              </span>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-gradient-to-r from-[#F10100] to-[#FF4444] text-white px-6 py-3 rounded-2xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <ChefHat className="w-4 h-4" />
                              <span>Cook Now</span>
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Ingredient Management Screen
  if (scanMode === "manage") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Edit3 className="w-8 h-8 text-blue-500 mr-3" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-display">
                  Manage Ingredients
                </h1>
              </div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
                Add or remove ingredients to customize your recipe suggestions
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setScanMode("results")}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-colors duration-300"
                >
                  <X className="w-4 h-4" />
                  <span>Back to Results</span>
                </button>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Add New Ingredient */}
            <ScrollReveal direction="left" delay={0.2}>
              <div className="bg-white rounded-3xl shadow-professional p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display">
                  Add Ingredient
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">
                      Ingredient Name
                    </label>
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={newIngredient}
                        onChange={(e) => {
                          setNewIngredient(e.target.value);
                          setIngredientError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && addManualIngredient()}
                        placeholder="e.g., tomatoes, onions, garlic..."
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 text-lg font-medium bg-white/70 backdrop-blur-sm hover:border-gray-300"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addManualIngredient}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <Plus className="w-5 h-5" />
                      </motion.button>
                    </div>
                    {ingredientError && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm font-semibold mt-2 flex items-center space-x-1"
                      >
                        <span>⚠</span>
                        <span>{ingredientError}</span>
                      </motion.p>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-2xl">
                    <strong>Tip:</strong> Enter common food ingredients like vegetables, fruits, grains, proteins, or spices. The system will validate that it's a real food item.
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Current Ingredients */}
            <ScrollReveal direction="right" delay={0.2}>
              <div className="bg-white rounded-3xl shadow-professional p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display">
                  Current Ingredients ({scanResults.allIngredients.length})
                </h2>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {scanResults.allIngredients.map((ingredient, index) => (
                    <motion.div
                      key={`${ingredient.name}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-4 rounded-2xl border hover:shadow-md transition-all duration-200 ${
                        ingredient.isManual 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100' 
                          : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          ingredient.isManual ? 'bg-blue-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <span className="font-bold text-lg text-gray-900 capitalize">
                            {ingredient.name}
                          </span>
                          <div className="text-sm text-gray-600">
                            {ingredient.category}
                            {ingredient.isManual && <span className="ml-2 text-blue-600 font-medium">(Manual)</span>}
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          if (ingredient.isManual) {
                            const manualIndex = manualIngredients.findIndex(ing => ing.name === ingredient.name);
                            removeManualIngredient(manualIndex);
                          } else {
                            const detectedIndex = scanResults.detectedIngredients.findIndex(ing => ing.name === ingredient.name);
                            removeDetectedIngredient(detectedIndex);
                          }
                        }}
                        className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
                
                {scanResults.allIngredients.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No ingredients available. Add some ingredients to get started!</p>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>

          {/* Update Recipes Button */}
          <ScrollReveal delay={0.4}>
            <div className="text-center mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshRecipes}
                disabled={isFetchingRecipes}
                className="bg-gradient-to-r from-[#F10100] to-[#FF4444] text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center space-x-3 shadow-xl hover:shadow-2xl transition-all duration-300 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChefHat className="w-6 h-6" />
                <span>{isFetchingRecipes ? "Updating..." : "Update Recipe Suggestions"}</span>
              </motion.button>
            </div>
          </ScrollReveal>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-stone-100"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-display">
              Smart Fridge <span className="text-[#F10100]">Scanner</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Scan your fridge and get personalized recipe recommendations based on available ingredients
            </p>
          </div>
        </ScrollReveal>

        {/* Scanner Interface */}
        <ScrollReveal delay={0.2}>
          <div className="bg-white rounded-3xl shadow-professional overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => setScanMode("camera")}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    scanMode === "camera"
                      ? "bg-[#F10100] text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Use Camera</span>
                </button>
                <button
                  onClick={() => setScanMode("upload")}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    scanMode === "upload"
                      ? "bg-[#F10100] text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl"
                >
                  <div className="flex items-center space-x-2">
                    <X className="w-5 h-5 text-red-500" />
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </motion.div>
              )}

              {scanMode === "camera" ? (
                <div className="space-y-6">
                  <div className="relative bg-gray-900 rounded-2xl overflow-hidden">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      className="w-full h-80 object-cover"
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: "environment" }}
                    />
                    <div className="absolute inset-0 border-4 border-dashed border-[#FFD122]/50 m-4 rounded-xl pointer-events-none" />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm">
                      Point camera at your fridge contents
                    </div>
                  </div>
                  <div className="text-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={capture}
                      disabled={isScanning}
                      className="bg-gradient-to-r from-[#F10100] to-[#FF4444] text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center space-x-3 shadow-xl hover:shadow-2xl transition-all duration-300 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Scan className="w-6 h-6" />
                      <span>{isScanning ? 'Scanning...' : 'Scan Fridge'}</span>
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-[#F10100] rounded-2xl p-12 text-center cursor-pointer transition-colors duration-300"
                  >
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Click to upload fridge photo
                    </p>
                    <p className="text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Recent Scans */}
        <ScrollReveal delay={0.4}>
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display">Recent Scans</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {mockFridgeScans.map((scan, index) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-3xl shadow-professional p-6 hover:shadow-professional-hover transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 font-display">
                      Scan from {new Date(scan.date).toLocaleDateString()}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {scan.ingredients.length} ingredients
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {scan.ingredients.slice(0, 4).map((ingredient) => (
                      <span
                        key={ingredient}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {ingredient}
                      </span>
                    ))}
                    {scan.ingredients.length > 4 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm">
                        +{scan.ingredients.length - 4} more
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>{scan.suggestedRecipes.length} recipes</strong> suggested
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </motion.div>
  );
};

export default FridgeScanner;
