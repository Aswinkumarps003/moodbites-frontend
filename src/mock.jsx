// Mock data for MoodBites app
export const mockMoods = [
  {
    id: 1,
    name: "Energetic",
    color: "#FFD122",
    icon: "zap",
    foods: ["Quinoa Bowl", "Green Smoothie", "Energy Bars", "Greek Yogurt", "Oatmeal", "Bananas"],
    description: "Foods to fuel your active lifestyle and boost natural energy",
    recipes: 24
  },
  {
    id: 2,
    name: "Stressed",
    color: "#F10100",
    icon: "brain",
    foods: ["Dark Chocolate", "Herbal Tea", "Nuts & Seeds", "Avocado Toast", "Salmon", "Blueberries"],
    description: "Comfort foods to help you unwind and reduce cortisol levels",
    recipes: 18
  },
  {
    id: 3,
    name: "Happy",
    color: "#476E00",
    icon: "smile",
    foods: ["Fresh Salad", "Fruit Smoothie", "Grilled Fish", "Colorful Veggies", "Berries", "Citrus"],
    description: "Light, fresh foods to maintain your mood and celebrate wellness",
    recipes: 32
  },
  {
    id: 4,
    name: "Tired",
    color: "#D8D86B",
    icon: "battery",
    foods: ["Iron-rich Spinach", "Protein Shake", "Whole Grains", "Lean Meat", "Eggs", "Sweet Potato"],
    description: "Energy-boosting nutrients to combat fatigue naturally",
    recipes: 21
  },
  {
    id: 5,
    name: "Focused",
    color: "#F1E1C8",
    icon: "target",
    foods: ["Blueberries", "Salmon", "Walnuts", "Green Tea", "Dark Leafy Greens", "Turmeric"],
    description: "Brain foods for enhanced mental clarity and concentration",
    recipes: 27
  }
];

export const mockRecipes = [
  {
    id: 1,
    title: "Energizing Quinoa Power Bowl",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    cookTime: "20 mins",
    servings: 2,
    difficulty: "Easy",
    calories: 420,
    mood: "Energetic",
    ingredients: ["Quinoa", "Spinach", "Cherry Tomatoes", "Avocado", "Chickpeas", "Lemon", "Olive Oil"],
    rating: 4.8,
    reviews: 124,
    author: "Sarah Johnson",
    authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b602?ixlib=rb-4.0.3&w=150&q=80",
    description: "A nutrient-packed bowl designed to fuel your morning with sustained energy and essential vitamins."
  },
  {
    id: 2,
    title: "Calming Herbal Tea Blend",
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    cookTime: "5 mins",
    servings: 1,
    difficulty: "Easy",
    calories: 5,
    mood: "Stressed",
    ingredients: ["Chamomile", "Lavender", "Honey", "Lemon", "Peppermint"],
    rating: 4.9,
    reviews: 89,
    author: "Mike Chen",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&q=80",
    description: "A soothing blend of herbs scientifically proven to reduce stress and promote relaxation."
  },
  {
    id: 3,
    title: "Happy Rainbow Salad",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    cookTime: "15 mins",
    servings: 3,
    difficulty: "Easy",
    calories: 250,
    mood: "Happy",
    ingredients: ["Mixed Greens", "Bell Peppers", "Carrots", "Cucumber", "Feta", "Balsamic", "Walnuts"],
    rating: 4.7,
    reviews: 156,
    author: "Emma Davis",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=150&q=80",
    description: "Colorful, vitamin-rich salad that naturally boosts mood with fresh, seasonal ingredients."
  },
  {
    id: 4,
    title: "Energy Boost Smoothie",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    cookTime: "5 mins",
    servings: 1,
    difficulty: "Easy",
    calories: 320,
    mood: "Tired",
    ingredients: ["Banana", "Spinach", "Protein Powder", "Almond Milk", "Chia Seeds", "Honey"],
    rating: 4.6,
    reviews: 203,
    author: "Alex Thompson",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=150&q=80",
    description: "A protein-rich smoothie that combats fatigue and provides sustained energy for hours."
  }
];

export const mockUserProfile = {
  name: "Jessica Martinez",
  email: "jessica.martinez@email.com",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b602?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
  age: 28,
  gender: "Female",
  height: "5'6\"",
  weight: "140 lbs",
  fitnessGoal: "Weight Loss",
  language: "English",
  currentMood: "Energetic",
  dietType: "Vegetarian",
  allergies: ["Nuts", "Lactose"],
  calorieTarget: 1800,
  macroRatio: { protein: 25, carbs: 45, fats: 30 },
  waterIntakeGoal: 8,
  recentMoods: ["Happy", "Focused", "Energetic", "Happy", "Stressed", "Happy", "Energetic"],
  savedMeals: 12,
  totalRecipes: 8,
  communityRank: 47,
  goalProgress: 78,
  bmi: 22.5,
  dailySteps: 8500,
  sleepDuration: 7.5,
  workoutDuration: 45,
  favoriteCuisines: ["Mediterranean", "Asian", "Mexican"],
  mealPlanToday: [
    { meal: "Breakfast", name: "Energizing Quinoa Bowl", calories: 420 },
    { meal: "Lunch", name: "Mediterranean Salad", calories: 350 },
    { meal: "Dinner", name: "Grilled Salmon", calories: 480 },
    { meal: "Snack", name: "Greek Yogurt with Berries", calories: 150 }
  ],
  fridgeIngredients: ["Eggs", "Spinach", "Tomatoes", "Bell Peppers", "Quinoa", "Avocado", "Chicken Breast", "Greek Yogurt"],
  pantryItems: ["Olive Oil", "Garlic", "Onions", "Rice", "Pasta", "Canned Tomatoes", "Herbs", "Spices"]
};

export const mockMoodTrends = [
  { day: "Mon", Happy: 8, Stressed: 2, Energetic: 6, Tired: 3, Focused: 7 },
  { day: "Tue", Happy: 6, Stressed: 4, Energetic: 8, Tired: 2, Focused: 5 },
  { day: "Wed", Happy: 9, Stressed: 1, Energetic: 7, Tired: 1, Focused: 8 },
  { day: "Thu", Happy: 5, Stressed: 6, Energetic: 4, Tired: 5, Focused: 6 },
  { day: "Fri", Happy: 10, Stressed: 0, Energetic: 9, Tired: 1, Focused: 7 },
  { day: "Sat", Happy: 9, Stressed: 1, Energetic: 8, Tired: 2, Focused: 6 },
  { day: "Sun", Happy: 8, Stressed: 2, Energetic: 6, Tired: 3, Focused: 7 }
];

export const mockFridgeScans = [
  {
    id: 1,
    date: "2025-01-15",
    ingredients: ["Eggs", "Milk", "Spinach", "Tomatoes", "Bell Peppers", "Cheese"],
    suggestedRecipes: [
      { name: "Vegetable Omelet", cookTime: "10 mins", calories: 280 },
      { name: "Spinach and Tomato Scramble", cookTime: "8 mins", calories: 220 },
      { name: "Bell Pepper Frittata", cookTime: "15 mins", calories: 320 }
    ]
  },
  {
    id: 2,
    date: "2025-01-12",
    ingredients: ["Chicken", "Broccoli", "Rice", "Garlic", "Ginger"],
    suggestedRecipes: [
      { name: "Chicken Stir Fry", cookTime: "20 mins", calories: 420 },
      { name: "Garlic Ginger Chicken", cookTime: "25 mins", calories: 380 }
    ]
  }
];

export const mockHealthMetrics = {
  weeklyStats: {
    avgCalories: 1650,
    avgSteps: 8200,
    avgSleep: 7.2,
    avgWater: 7.5,
    workoutsCompleted: 4
  },
  monthlyGoals: {
    weightLoss: { target: 5, current: 3.2, unit: "lbs" },
    consistency: { target: 80, current: 75, unit: "%" },
    mood: { target: "Happy", current: "Happy", frequency: 85 }
  }
}; 