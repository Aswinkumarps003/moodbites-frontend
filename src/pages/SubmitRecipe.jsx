import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Plus, X, Camera, Clock, Users, Heart } from "lucide-react";
import { mockMoods } from "../mock.jsx";

// You can set your backend API endpoint here
const FOOD_SERVICE_URL = import.meta.env.VITE_FOOD_SERVICE_URL || 'http://localhost:5002';
const API_URL = `${FOOD_SERVICE_URL}/api/food/dishes`; // Change this to your actual backend endpoint
const CLOUDINARY_UPLOAD_URL = `${FOOD_SERVICE_URL}/api/food/upload-recipe-image`; // Food service Cloudinary upload endpoint

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
    image: null,
    imageFile: null // Store the actual file for upload
  });

  const [dragActive, setDragActive] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [nonFoodModal, setNonFoodModal] = useState(null); // { title, details }

  const difficulties = ["Easy", "Medium", "Hard"];

  // --- Food-related validation helpers ---
  const FOOD_KEYWORDS = new Set([
    // staple foods (grains, breads, pasta, noodles)
    'steep','rolled','chamomile','ada', 'adai', 'akki roti', 'amaranth', 'appam', 'arborio', 'atta', 'bagel', 'baguette', 'bajra', 'bajra roti', 'barley', 'basmati', 'besan', 'bhakri', 'bhatura', 'bread', 'brioche', 'brown rice', 'buckwheat', 'bulgur', 'carnaroli', 'cellophane noodles', 'chapati', 'cheela', 'chawal', 'ciabatta', 'cornbread', 'cornmeal', 'couscous', 'cracker', 'croissant', 'dosa', 'egg noodles', 'farro', 'fettuccine', 'flour', 'focaccia', 'freekeh', 'fusilli', 'gehun', 'gnocchi', 'gram flour', 'grits', 'idiyappam', 'idli', 'jau', 'jowar', 'jowar roti', 'kamut', 'khamiri roti', 'kulcha', 'kuttu', 'lachha paratha', 'lasagna', 'linguine', 'lobia', 'luchi', 'macaroni', 'maida', 'makki', 'makki di roti', 'malabar parotta', 'masala dosa', 'millet', 'missi roti', 'murmura', 'naan', 'neer dosa', 'noodles', 'oats', 'orzo', 'paratha', 'parotta', 'pasta', 'penne', 'pesarattu', 'pita', 'poha', 'polenta', 'pongal', 'puri', 'pumpernickel', 'puttu', 'quinoa', 'ragi', 'ragi roti', 'ramen', 'rava', 'rava dosa', 'ravioli', 'rice', 'rice flour', 'rice noodles', 'rigatoni', 'risotto', 'roti', 'rumali roti', 'rye', 'sago', 'sabudana', 'sattu', 'semolina', 'set dosa', 'sheermal', 'soba', 'sooji', 'sorghum', 'sourdough', 'spaghetti', 'spelt', 'sticky rice', 'suji', 'sushi rice', 'taftan', 'tagliatelle', 'tapioca', 'teff', 'thalipeeth', 'thepla', 'tortellini', 'tortilla', 'udon', 'upma', 'uttapam', 'valencia', 'vermicelli', 'wheat', 'wild rice',

    // proteins (meat, poultry, seafood, dairy, legumes, nuts, seeds)
    'abalone', 'albacore', 'almond', 'anchovy', 'arhar dal', 'bacon', 'bass', 'bean', 'beans', 'beef', 'black bean', 'black chana', 'brie', 'camembert', 'carp', 'cashew', 'catfish', 'chana', 'chana dal', 'cheddar', 'cheese', 'chenna', 'cherrystone', 'chia', 'chickpea', 'chickpeas', 'chicken', 'clam', 'cod', 'conch', 'cottage cheese', 'crab', 'crayfish', 'cream cheese', 'curd', 'dahi', 'dal', 'doodh', 'duck', 'edamame', 'eel', 'egg', 'eggs', 'emmental', 'escargot', 'fava bean', 'feta', 'fish', 'flax', 'gorgonzola', 'gosht', 'gouda', 'gram', 'grouper', 'gruyere', 'haddock', 'halibut', 'halloumi', 'ham', 'hazelnut', 'hemp', 'herring', 'jerky', 'kabuli chana', 'kala chana', 'kefir', 'khoya', 'kidney', 'kulthi', 'lamb', 'langoustine', 'lentil', 'lentils', 'lima bean', 'liver', 'lobster', 'lobia', 'macadamia', 'mackerel', 'mahi-mahi', 'malai', 'manchego', 'mascarpone', 'masoor', 'masoor dal', 'matar', 'matki', 'mawa', 'milk', 'monkfish', 'moong', 'moong dal', 'mortadella', 'moth bean', 'mozzarella', 'mung', 'mussel', 'mutton', 'natto', 'nut', 'nuts', 'octopus', 'offal', 'oyster', 'pancetta', 'paneer', 'parmesan', 'pea', 'peanut', 'peas', 'pecan', 'pecorino', 'pepperoni', 'perch', 'pike', 'pine nut', 'pinto bean', 'pistachio', 'pollock', 'pork', 'prawn', 'prosciutto', 'provolone', 'pumpkin seed', 'quail', 'rabbit', 'rajma', 'red snapper', 'ricotta', 'roquefort', 'salami', 'salmon', 'sardine', 'sausage', 'scallop', 'sea urchin', 'seed', 'seeds', 'seitan', 'sesame seed', 'shrimp', 'snapper', 'soy', 'squid', 'steak', 'stilton', 'sunflower seed', 'swordfish', 'tempeh', 'tilapia', 'tofu', 'toor dal', 'tripe', 'trout', 'tuna', 'turbot', 'turkey', 'uni', 'urad', 'urad dal', 'veal', 'venison', 'walnut', 'white bean', 'yogurt',

    // cuts & preparations of meat
    'bhuna', 'boti', 'breast', 'brisket', 'chaap', 'chop', 'chuck', 'confit', 'cutlet', 'do pyaza', 'drumstick', 'filet', 'flank', 'ground', 'ham hock', 'handi', 'jalfrezi', 'kadai', 'kathi', 'keema', 'leg', 'loin', 'medallion', 'mince', 'murgh', 'oxtail', 'pasanda', 'pastrami', 'pâté', 'rack', 'raan', 'rezala', 'rib', 'ribeye', 'roast', 'rogan josh', 'round', 'rump', 'seekh', 'shank', 'shoulder', 'shredded', 'sirloin', 'skirt', 'tandoori', 'tenderloin', 'terrine', 'thigh', 'tikka', 'tongue', 'wing',

    // vegetables (sabzi) & greens
    'acorn squash', 'adrak', 'aloo', 'amaranth leaves', 'arbi', 'artichoke', 'arugula', 'arvi', 'asparagus', 'baingan', 'bamboo shoot', 'bathua', 'bean sprout', 'beetroot', 'bell pepper', 'bhindi', 'bitter gourd', 'bok choy', 'brinjal', 'broccoli', 'brussels sprout', 'burdock', 'butternut squash', 'cabbage', 'capers', 'capsicum', 'cardoon', 'carrot', 'cassava', 'cauliflower', 'celeriac', 'celery', 'chard', 'chayote', 'chili', 'chilli', 'chukandar', 'cluster beans', 'collard greens', 'colocasia', 'corn', 'courgette', 'cucumber', 'curry leaves', 'daikon', 'dandelion greens', 'dhaniya', 'drumstick', 'edamame', 'eggplant', 'endive', 'fennel', 'fenugreek leaves', 'fiddlehead', 'gajar', 'galangal', 'garlic', 'ginger', 'gobi', 'gourd', 'green bean', 'guar', 'hari mirch', 'hearts of palm', 'horseradish', 'ivy gourd', 'jicama', 'jimikand', 'kachha kela', 'kakdi', 'kale', 'kanda', 'kanthari mulaku', 'karela', 'kariveppila', 'kathal', 'kohlrabi', 'kundru', 'lauki', 'leek', 'lehsun', 'lemongrass', 'lettuce', 'lotus root', 'methi', 'mooli', 'moringa', 'mushroom', 'mustard greens', 'nori', 'okra', 'olive', 'onion', 'palak', 'parsnip', 'parwal', 'patta gobi', 'pepper', 'petha', 'plantain', 'pointed gourd', 'potato', 'pudina', 'pumpkin', 'pyaz', 'radicchio', 'radish', 'ramps', 'rhubarb', 'ridge gourd', 'rocket', 'romanesco', 'sabzi', 'sainjan', 'samphire', 'sarson', 'scallion', 'seaweed', 'sem', 'shallot', 'shakarkandi', 'snap pea', 'snow pea', 'spinach', 'sprouts', 'squash', 'sunchoke', 'suran', 'sweet potato', 'taro', 'tamatar', 'tinda', 'tomatillo', 'tomato', 'turai', 'turnip', 'vazhakka', 'water chestnut', 'watercress', 'yam', 'zucchini',

    // specific mushroom types
    'chanterelle', 'cremini', 'enoki', 'gucchi', 'maitake', 'morel', 'oyster mushroom', 'porcini', 'portobello', 'shiitake', 'truffle',

    // fruits (phal)
    'aam', 'ackee', 'acai', 'amla', 'amrood', 'anar', 'angoor', 'apple', 'apricot', 'avocado', 'banana', 'ber', 'berries', 'bilberry', 'blackberry', 'blood orange', 'blueberry', 'boysenberry', 'breadfruit', 'cantaloupe', 'carambola', 'cherimoya', 'cherry', 'chikoo', 'citron', 'citrus', 'clementine', 'cloudberry', 'coconut', 'crabapple', 'cranberry', 'currant', 'custard apple', 'damson', 'date', 'dates', 'dragonfruit', 'durian', 'elderberry', 'feijoa', 'fig', 'goji berry', 'gooseberry', 'grape', 'grapefruit', 'grapes', 'guava', 'honeydew', 'huckleberry', 'imli', 'jackfruit', 'jamun', 'jujube', 'kaintha', 'kamrakh', 'karonda', 'kathal', 'kela', 'kiwi', 'kodampuli', 'kumquat', 'lemon', 'lime', 'loganberry', 'longan', 'loquat', 'lychee', 'mandarin', 'mango', 'mangosteen', 'marionberry', 'melon', 'mulberry', 'nariyal', 'nectarine', 'nimbu', 'orange', 'papaya', 'passionfruit', 'pawpaw', 'peach', 'pear', 'persimmon', 'phal', 'pineapple', 'plantain', 'plum', 'pomegranate', 'pomelo', 'prune', 'quince', 'raisin', 'rambutan', 'raspberry', 'redcurrant', 'santra', 'sapodilla', 'seb', 'sharifa', 'singhara', 'sitaphal', 'soursop', 'star fruit', 'strawberry', 'tamarind', 'tangerine', 'thenga', 'ugli fruit', 'watermelon', 'wood apple', 'yuzu',

    // fats, oils & sweeteners (tel, ghee, cheeni)
    'almond oil', 'avocado oil', 'butter', 'canola', 'cheeni', 'coconut', 'coconut oil', 'corn oil', 'cream', 'duck fat', 'ghee', 'grapeseed oil', 'groundnut', 'gud', 'honey', 'jaggery', 'lard', 'makhan', 'margarine', 'mayo', 'mayonnaise', 'mishri', 'moongphali', 'mustard', 'mustard oil', 'nariyal tel', 'oil', 'olive oil', 'palm oil', 'peanut oil', 'safflower oil', 'sarson ka tel', 'schmaltz', 'sesame', 'sesame oil', 'shahad', 'shakkar', 'sharkara', 'shortening', 'suet', 'sunflower', 'sunflower oil', 'tel', 'til', 'truffle oil', 'vegetable', 'velichenna', 'walnut oil',

    // spices & herbs (masala)
    'ajwain', 'allspice', 'amchur', 'anardana', 'anise', 'annatto', 'asafoetida', 'basil', 'bay', 'biryani masala', 'black salt', 'blackpepper', 'caraway', 'cardamom', 'carom', 'cassia', 'cayenne', 'celery seed', 'chakri phool', 'chaat masala', 'chervil', 'chives', 'cilantro', 'cinnamon', 'clove', 'coriander', 'cumin', 'curry', 'dalchini', 'dhaniya', 'dill', 'elaichi', 'epazote', 'fennel', 'fenugreek', 'fenugreek seeds', 'fleur de sel', 'galangal', 'garam', 'garam masala', 'garlic powder', 'goda masala', 'grains of paradise', 'haldi', 'hing', 'hyssop', 'jaiphal', 'javitri', 'jeera', 'juniper berry', 'kaffir lime', 'kala jeera', 'kala mirch', 'kala namak', 'kalonji', 'kalpasi', 'kasoori methi', 'kashmiri mirch', 'kesar', 'kosher salt', 'lal mirch', 'laung', 'lavender', 'leaf', 'leaves', 'lemon balm', 'lemongrass', 'lovage', 'mace', 'mahlab', 'marjoram', 'masala', 'methi', 'methi dana', 'mint', 'mustard seed', 'nigella', 'nutmeg', 'onion powder', 'oregano', 'panch phoron', 'paprika', 'parsley', 'peppercorn', 'podi', 'poppy', 'powder', 'pudina', 'rai', 'rasam powder', 'rosemary', 'saffron', 'sage', 'salt', 'sambar powder', 'saunf', 'savory', 'sea salt', 'shahi jeera', 'shiso', 'sonth', 'star', 'sumac', 'tarragon', 'tej patta', 'thyme', 'turmeric', 'vanilla', 'zaffran', 'zaatar',

    // condiments, sauces, pickles & ferments (achar, chutney)
    'achar', 'aioli', 'alfredo', 'apple butter', 'bbq', 'barbecue', 'bechamel', 'bolognese', 'capers', 'chaas', 'chutney', 'cider', 'demi-glace', 'doubanjiang', 'fish', 'gochujang', 'gunpowder', 'hollandaise', 'hoisin', 'horseradish', 'hot', 'hummus', 'jam', 'jelly', 'ketchup', 'kimchi', 'kombucha', 'lassi', 'marmalade', 'marinara', 'miso', 'mole', 'moru', 'nam pla', 'nuoc mam', 'olive', 'oyster', 'pachadi', 'pesto', 'pickle', 'raita', 'relish', 'remoulade', 'romesco', 'sambal', 'salsa', 'sauce', 'sauerkraut', 'shrimp paste', 'soy', 'sriracha', 'tabasco', 'tahini', 'tamarind paste', 'tapenade', 'teriyaki', 'thokku', 'tzatziki', 'velouté', 'vinegar', 'wasabi', 'worcestershire',

    // baking, pantry & sweeteners
    'agar', 'agave', 'almond paste', 'arrowroot', 'baking', 'balsamic', 'bouillon', 'brown sugar', 'cacao', 'caster sugar', 'chocolate', 'cocoa', 'coconut sugar', 'confectioners sugar', 'corn', 'corn syrup', 'cream of tartar', 'demerara', 'erythritol', 'extract', 'food', 'coloring', 'frosting', 'gelatin', 'glucose', 'golden syrup', 'icing', 'marzipan', 'molasses', 'monk fruit', 'muscovado', 'nutritional yeast', 'palm sugar', 'pectin', 'phyllo', 'puff pastry', 'rose water', 'kewra', 'soda', 'sourdough starter', 'sprinkles', 'starch', 'stevia', 'sucrose', 'sugar', 'syrup', 'treacle', 'turbinado', 'vanilla', 'xanthan gum', 'xylitol', 'yeast',

    // liquids
    'almond milk', 'broth', 'buttermilk', 'coconut milk', 'coconut water', 'dashi', 'juice', 'oat milk', 'rice milk', 'soy milk', 'stock', 'water',

    // beverages (alcoholic & non-alcoholic)
    'absinthe', 'ale', 'beer', 'bourbon', 'brandy', 'cappuccino', 'chai', 'cider', 'club soda', 'coffee', 'cognac', 'cola', 'espresso', 'feni', 'gin', 'green tea', 'herbal tea', 'jaljeera', 'kokum', 'kombucha', 'lager', 'latte', 'liqueur', 'masala chai', 'matcha', 'mate', 'mezcal', 'nimbu pani', 'oolong', 'port', 'prosecco', 'rooibos', 'rum', 'sake', 'scotch', 'seltzer', 'sharbat', 'sherry', 'soda', 'soju', 'sol kadhi', 'stout', 'tea', 'tequila', 'tisane', 'toddy', 'tonic', 'vermouth', 'vodka', 'whiskey', 'wine',

    // indian dishes: curries & gravies (sabzi, kootu, kuzhambu)
    'aloo gobi', 'aloo matar', 'avial', 'baingan bharta', 'bhindi masala', 'butter chicken', 'chana masala', 'chicken chettinad', 'chicken tikka masalas', 'chole', 'dal makhani', 'dal tadka', 'dum aloo', 'ennai kathirikai', 'erissery', 'gatte ki sabzi', 'gutti vankaya', 'ishtu', 'kootu', 'korma', 'kuzhambu', 'laal maas', 'kadai chicken', 'kadai paneer', 'kalan', 'kootu', 'malai kofta', 'matar paneer', 'meen curry', 'moru curry', 'murgh makhani', 'navratan korma', 'olan', 'pachadi', 'palak paneer', 'paneer butter masala', 'poriyal', 'rajma masala', 'rasam', 'saag', 'sambar', 'sarson ka saag', 'shahi paneer', 'stew', 'thoran', 'undhiyu', 'vatha kuzhambu', 'vindaloo',
    // indian dishes: rice
    'bisi bele bath', 'biryani', 'curd rice', 'ghee rice', 'jeera rice', 'khichdi', 'lemon rice', 'neychoru', 'pulao', 'puliyogare', 'tamarind rice', 'tehri', 'thayir sadam', 'zarda',
    // indian dishes: snacks & street food (chaat)
    'achappam', 'aloo chaat', 'aloo tikki', 'bhel puri', 'bhaji', 'bonda', 'chaat', 'chakli', 'dabeli', 'dahi puri', 'dahi vada', 'dhokla', 'fafda', 'gathiya', 'golgappe', 'kachori', 'khandvi', 'kothu parotta', 'kuzhalappam', 'masala vada', 'medu vada', 'mirchi bajji', 'murukku', 'paniyaram', 'pani puri', 'papdi chaat', 'parippu vada', 'pav bhaji', 'pazham pori', 'pakora', 'puchka', 'sev puri', 'samosa', 'unniyappam', 'uzhunnu vada', 'vada', 'vada pav',
    // indian dishes: sweets & desserts (mithai)
    'ada pradhaman', 'adhirasam', 'balushahi', 'barfi', 'basundi', 'besan ladoo', 'cham cham', 'chikki', 'elayada', 'gajar halwa', 'ghevar', 'gulab jamun', 'gujiya', 'halwa', 'imarti', 'jalebi', 'kaju katli', 'kheer', 'kulfi', 'ladoo', 'modak', 'moong dal halwa', 'motichoor ladoo', 'mysore pak', 'neyyappam', 'palada payasam', 'payasam', 'payesh', 'peda', 'phirni', 'puran poli', 'rabri', 'rasgulla', 'rasmalai', 'sandesh', 'shahi tukda', 'shrikhand', 'soan papdi', 'suji halwa',
    // other prepared dishes & concepts
    'adobo', 'bibimbap', 'borscht', 'bouillabaisse', 'burger', 'burrito', 'carbonara', 'casserole', 'ceviche', 'chili con carne', 'chowder', 'coq au vin', 'croquette', 'curry', 'dim sum', 'dumpling', 'enchilada', 'fajita', 'falafel', 'foie gras', 'fondue', 'frittata', 'gazpacho', 'goulash', 'gumbo', 'jambalaya', 'jollof', 'laksa', 'lasagna', 'moussaka', 'pad thai', 'paella', 'pancake', 'pho', 'pie', 'pierogi', 'pizza', 'poke', 'quesadilla', 'quiche', 'ratatouille', 'salad', 'sandwich', 'sashimi', 'satay', 'sauerbraten', 'shawarma', 'shepherds pie', 'soup', 'spring roll', 'stew', 'stir-fry', 'stroganoff', 'sushi', 'tabbouleh', 'taco', 'tagine', 'tamale', 'tapas', 'tart', 'tempura', 'teriyaki', 'tom yum', 'waffle',

    // units, commons & descriptors
    'baked', 'blanched', 'blend', 'boiled', 'braised', 'broiled', 'bunch', 'canned', 'charred', 'chiffonade', 'chop', 'chopped', 'clove', 'coarse', 'confit', 'core', 'creamed', 'crushed', 'crystalized', 'cube', 'cubed', 'cups', 'cured', 'dash', 'deglazed', 'dehydrated', 'deseeded', 'dice', 'diced', 'distilled', 'dollop', 'dried', 'dum', 'emulsify', 'fermented', 'filet', 'fillet', 'fine', 'flambe', 'floret', 'fold', 'fresh', 'fried', 'frozen', 'g', 'gallon', 'glaze', 'grated', 'grilled', 'grind', 'ground', 'half', 'head', 'infused', 'julienne', 'kg', 'knead', 'l', 'lb', 'marinated', 'mashed', 'melted', 'minced', 'mix', 'ml', 'ounce', 'oz', 'parboiled', 'pasteurized', 'peel', 'peeled', 'pickled', 'piece', 'pieces', 'pinch', 'pint', 'pitted', 'poached', 'powdered', 'pressed', 'pureed', 'quart', 'raw', 'reduce', 'rendered', 'ribbon', 'roasted', 'rough', 'scalded', 'scored', 'seared', 'shaved', 'shredded', 'sifted', 'simmered', 'slice', 'sliced', 'slices', 'smoked', 'soaked', 'spoonful', 'sprig', 'steamed', 'stewed', 'stir', 'stuffed', 'tadka', 'tarka', 'tablespoon', 'tbsp', 'teaspoon', 'thick', 'thin', 'toasted', 'tsp', 'whipped', 'whole', 'zest'
]);

  const NON_FOOD_BLOCKLIST = new Set([
    'laptop','phone','mobile','tyre','tire','desk','pen','pencil','keyboard','mouse','charger','screen','monitor','denim','shirt','paint','engine','petrol','diesel','cable','earphone','headphone','speaker','sofa','table','chair','notebook','book','bottle','battery'
  ]);

  const tokenize = (text) => (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s\.\-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const isUnitOrNumber = (token) => /^(\d+([\.\/]\d+)?|tsp|tbsp|cup|cups|ml|l|g|kg|mg|cm|mm)$/i.test(token);

  const COOKING_VERBS = ['mix','add','boil','bake','fry','saute','sauté','grill','roast','stir','cook','heat','serve','garnish','steam','simmer','blend','chop','marinate','knead','toast','season','whisk','reduce','preheat','put','place','keep','cover','mash'];

  const hasFoodSignal = (text) => {
    const tokens = tokenize(text);
    return tokens.some(t => FOOD_KEYWORDS.has(t));
  };

  const hasCookingSignal = (text) => {
    const tokens = tokenize(text);
    if (tokens.some(t => COOKING_VERBS.includes(t))) return true;
    // Phrase-based cues (not single tokens)
    const lower = (text || '').toLowerCase();
    if (/(low|medium|high)\s+flame/.test(lower)) return true;
    if (/bring\s+to\s+a\s+boil/.test(lower)) return true;
    if (/pressure\s*cook/.test(lower)) return true;
    if (/let\s+it\s+(rest|cool|sit)/.test(lower)) return true;
    return false;
  };

  const GENERIC_ALLOWED = new Set([
    'good','great','nice','tasty','delicious','yummy','awesome','hearty','savory','sweet','spicy','mild','flavorful','aromatic','fresh','healthy','simple','quick','easy','homemade','home','style','authentic','classic','comfort','comforting','diet','dish','meal','food','really','very','super','ultra','best'
  ]);

  const findNonFoodTokens = (text) => {
    const tokens = tokenize(text);
    const invalid = [];
    for (const t of tokens) {
      if (isUnitOrNumber(t)) continue;
      if (FOOD_KEYWORDS.has(t)) continue;
      if (NON_FOOD_BLOCKLIST.has(t)) { invalid.push(t); continue; }
      // allow cooking verbs
      if (COOKING_VERBS.includes(t)) continue;
      // allow generic descriptive words
      if (GENERIC_ALLOWED.has(t)) continue;
      // ignore trivial connectors
      if (['and','or','with','for','of','the','a','an','to','in'].includes(t)) continue;
      // token looks suspicious if length > 3 and not recognized
      if (t.length > 3) invalid.push(t);
    }
    return Array.from(new Set(invalid)).slice(0, 3); // cap to 3 for concise messaging
  };

  // Get user from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Validation functions
  const validateTitle = (title) => {
    if (!title.trim()) return "Recipe title is required";
    if (title.trim().length < 3) return "Title must be at least 3 characters";
    if (title.trim().length > 100) return "Title must be less than 100 characters";
    if (!/^[a-zA-Z\s]+$/.test(title.trim())) return "Title can only contain alphabets and spaces";
    return null;
  };

  const validateDescription = (description) => {
    if (!description.trim()) return "Description is required";
    if (description.trim().length < 10) return "Description must be at least 10 characters";
    if (description.trim().length > 500) return "Description must be less than 500 characters";
    if (!/^[a-zA-Z\s]+$/.test(description.trim())) return "Description can only contain alphabets and spaces";
    return null;
  };

  const validateCookTime = (cookTime) => {
    if (!cookTime.trim()) return "Cook time is required";
    if (!/^\d+\s*(minutes?|mins?|hours?|hrs?)$/i.test(cookTime.trim())) {
      return "Please enter valid time format (e.g., '30 minutes', '1 hour')";
    }
    return null;
  };

  const validateServings = (servings) => {
    if (!servings) return "Number of servings is required";
    const num = parseInt(servings);
    if (isNaN(num)) return "Please enter a valid number";
    if (num < 1) return "Servings must be at least 1";
    if (num > 20) return "Servings cannot exceed 20";
    return null;
  };

  const validateMood = (mood) => {
    if (!mood) return "Please select a mood";
    return null;
  };

  const validateIngredients = (ingredients) => {
    const validIngredients = ingredients.filter(ing => ing.trim() !== "");
    if (validIngredients.length === 0) return "At least one ingredient is required";
    if (validIngredients.length < 2) return "Please add at least 2 ingredients";
    if (validIngredients.length > 20) return "Maximum 20 ingredients allowed";
    
    // Check for duplicate ingredients
    const duplicates = validIngredients.filter((item, index) => 
      validIngredients.indexOf(item) !== index
    );
    if (duplicates.length > 0) return "Duplicate ingredients found";
    
    // Check ingredient format
    for (let ingredient of validIngredients) {
      if (ingredient.trim().length < 2) return "Each ingredient must be at least 2 characters";
      if (ingredient.trim().length > 50) return "Each ingredient must be less than 50 characters";
      if (!hasFoodSignal(ingredient)) return "Ingredient must include a recognizable food item";
      const bad = findNonFoodTokens(ingredient);
      if (bad.length) return `Ingredient contains non-food term: ${bad[0]}`;
    }
    return null;
  };

  const validateInstructions = (instructions) => {
    const validInstructions = instructions.filter(inst => inst.trim() !== "");
    if (validInstructions.length === 0) return "At least one instruction is required";
    if (validInstructions.length < 2) return "Please add at least 2 instructions";
    if (validInstructions.length > 15) return "Maximum 15 instructions allowed";
    
    // Check instruction format
    for (let instruction of validInstructions) {
      if (instruction.trim().length < 10) return "Each instruction must be at least 10 characters";
      if (instruction.trim().length > 200) return "Each instruction must be less than 200 characters";
      if (!(hasCookingSignal(instruction) || hasFoodSignal(instruction))) return "Instruction must include a cooking action or food term";
      const bad = findNonFoodTokens(instruction);
      if (bad.length) return `Instruction contains non-food term: ${bad[0]}`;
    }
    return null;
  };

  const validateTags = (tags) => {
    if (tags.length > 10) return "Maximum 10 tags allowed";
    for (let tag of tags) {
      if (tag.length < 2) return "Each tag must be at least 2 characters";
      if (tag.length > 20) return "Each tag must be less than 20 characters";
      if (!/^[a-zA-Z0-9\s\-]+$/.test(tag)) return "Tags can only contain letters, numbers, spaces, and hyphens";
      const bad = findNonFoodTokens(tag);
      if (bad.length) return `Tag contains non-food term: ${bad[0]}`;
    }
    return null;
  };

  const validateImage = (imageFile) => {
    if (!imageFile) return "Recipe image is required";
    if (imageFile.size > 10 * 1024 * 1024) return "Image size must be less than 10MB";
    if (!imageFile.type.startsWith('image/')) return "Please upload a valid image file";
    return null;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Live validation
    let error = null;
    switch (field) {
      case 'title':
        error = validateTitle(value);
        break;
      case 'description':
        error = validateDescription(value);
        break;
      case 'cookTime':
        error = validateCookTime(value);
        break;
      case 'servings':
        error = validateServings(value);
        break;
      case 'mood':
        error = validateMood(value);
        break;
      case 'ingredients':
        error = validateIngredients(value);
        break;
      case 'instructions':
        error = validateInstructions(value);
        break;
      case 'tags':
        error = validateTags(value);
        break;
      default:
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
    
    // Live validation for array fields
    let error = null;
    switch (field) {
      case 'ingredients':
        error = validateIngredients(newArray);
        break;
      case 'instructions':
        error = validateInstructions(newArray);
        break;
      default:
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
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
      const newTags = [...formData.tags, newTag.trim()];
      setFormData(prev => ({
        ...prev,
        tags: newTags
      }));
      setNewTag("");
      
      // Validate tags after adding
      const error = validateTags(newTags);
      setValidationErrors(prev => ({
        ...prev,
        tags: error
      }));
    }
  };

  const removeTag = (tag) => {
    const newTags = formData.tags.filter(t => t !== tag);
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }));
    
    // Validate tags after removing
    const error = validateTags(newTags);
    setValidationErrors(prev => ({
      ...prev,
      tags: error
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
      // Validate image
      const error = validateImage(file);
      setValidationErrors(prev => ({
        ...prev,
        image: error
      }));
      
      if (!error) {
      // Store the file for upload
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Also create a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, image: e.target.result }));
      };
      reader.readAsDataURL(file);
      }
    } else {
      setValidationErrors(prev => ({
        ...prev,
        image: "Please upload a valid image file"
      }));
    }
  };

  // Upload image to Cloudinary via food-service
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
      return result.image_url; // Return the Cloudinary URL
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
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

      // Validate all fields before submission
      const titleError = validateTitle(formData.title);
      const descriptionError = validateDescription(formData.description);
      const cookTimeError = validateCookTime(formData.cookTime);
      const servingsError = validateServings(formData.servings);
      const moodError = validateMood(formData.mood);
      const ingredientsError = validateIngredients(formData.ingredients);
      const instructionsError = validateInstructions(formData.instructions);
      const tagsError = validateTags(formData.tags);
      const imageError = validateImage(formData.imageFile);

      const allErrors = {
        title: titleError,
        description: descriptionError,
        cookTime: cookTimeError,
        servings: servingsError,
        mood: moodError,
        ingredients: ingredientsError,
        instructions: instructionsError,
        tags: tagsError,
        image: imageError
      };

      setValidationErrors(allErrors);

      // Check if there are any validation errors
      const hasErrors = Object.values(allErrors).some(error => error !== null);
      if (hasErrors) {
        alert("Please fix all validation errors before submitting");
        setSubmitting(false);
        return;
      }

      // Final food-related guard (cross-field):
      const combinedTexts = [
        formData.title,
        formData.description,
        ...formData.ingredients,
        ...formData.instructions,
        ...formData.tags
      ].join(' ');
      const nonFood = findNonFoodTokens(combinedTexts);
      if (nonFood.length) {
        setNonFoodModal({
          title: 'Details not food-related',
          details: `Found non-food terms: ${nonFood.join(', ')}. Please remove them before submitting.`
        });
        setSubmitting(false);
        return;
      }

      let imageUrl = null;
      
      // Upload image to Cloudinary if there's an image file
      if (formData.imageFile) {
        try {
          imageUrl = await uploadImageToCloudinary(formData.imageFile);
          console.log('Image uploaded to Cloudinary:', imageUrl);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          alert("Failed to upload image. Please try again.");
          return;
        }
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
        image_url: imageUrl, // Use the Cloudinary URL
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
        // If backend flags non-food, show modal
        const backendMsg = (errorData && (errorData.message || errorData.error)) || '';
        if (/non[- ]?food|not\s+food[- ]?related|invalid\s+food/i.test(backendMsg)) {
          setNonFoodModal({
            title: 'Details not food-related',
            details: backendMsg
          });
          setSubmitting(false);
          return;
        }
        throw new Error(backendMsg || "Failed to submit recipe");
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
        image: null,
        imageFile: null
      });
      
      // Clear validation errors
      setValidationErrors({});
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
      className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#F10100] rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {nonFoodModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-red-200">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold text-gray-900">{nonFoodModal.title}</h3>
                <button onClick={() => setNonFoodModal(null)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
              </div>
              <p className="mt-3 text-gray-700">{nonFoodModal.details || 'One or more inputs are not related to food or recipes.'}</p>
              <button onClick={() => setNonFoodModal(null)} className="mt-6 w-full bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-700">Okay</button>
            </div>
          </div>
        )}
        {/* Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#F10100] to-[#FF4444] rounded-2xl mb-6 shadow-2xl">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
            Share Your <span className="bg-gradient-to-r from-[#F10100] to-[#FF4444] bg-clip-text text-transparent">Recipe</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            Help others discover amazing mood-boosting meals by sharing your favorite recipes
          </p>
          {!user && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl shadow-lg backdrop-blur-sm"
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">!</span>
                </div>
                <p className="text-amber-800 font-semibold text-lg">Please log in to submit a recipe</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Basic Information */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F10100] via-blue-500 to-purple-500"></div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F10100] to-[#FF4444] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Basic Information</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center space-x-2">
                  <span>Recipe Title</span>
                  <span className="text-[#F10100]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    onKeyUp={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter recipe name..."
                    className={`w-full px-6 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 text-lg font-medium bg-white/50 backdrop-blur-sm ${
                      validationErrors.title 
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50/50' 
                        : 'border-gray-200 focus:ring-[#F10100]/20 focus:border-[#F10100] hover:border-gray-300'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <div className="w-2 h-2 bg-[#F10100] rounded-full"></div>
                  </div>
                </div>
                {validationErrors.title && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm font-semibold mt-2 flex items-center space-x-1"
                  >
                    <span>⚠</span>
                    <span>{validationErrors.title}</span>
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center space-x-2">
                  <span>Mood Association</span>
                  <span className="text-[#F10100]">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={formData.mood}
                    onChange={(e) => handleInputChange("mood", e.target.value)}
                    className={`w-full px-6 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 text-lg font-medium bg-white/50 backdrop-blur-sm appearance-none cursor-pointer ${
                      validationErrors.mood 
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50/50' 
                        : 'border-gray-200 focus:ring-[#F10100]/20 focus:border-[#F10100] hover:border-gray-300'
                    }`}
                  >
                    <option value="">Select a mood...</option>
                    {mockMoods.map((mood) => (
                      <option key={mood.id} value={mood.name}>
                        {mood.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {validationErrors.mood && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm font-semibold mt-2 flex items-center space-x-1"
                  >
                    <span>⚠</span>
                    <span>{validationErrors.mood}</span>
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-[#F10100]" />
                  <span>Cook Time</span>
                  <span className="text-[#F10100]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.cookTime}
                    onChange={(e) => handleInputChange("cookTime", e.target.value)}
                    onKeyUp={(e) => handleInputChange("cookTime", e.target.value)}
                    placeholder="e.g., 30 minutes"
                    className={`w-full px-6 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 text-lg font-medium bg-white/50 backdrop-blur-sm ${
                      validationErrors.cookTime 
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50/50' 
                        : 'border-gray-200 focus:ring-[#F10100]/20 focus:border-[#F10100] hover:border-gray-300'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
                {validationErrors.cookTime && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm font-semibold mt-2 flex items-center space-x-1"
                  >
                    <span>⚠</span>
                    <span>{validationErrors.cookTime}</span>
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-[#F10100]" />
                  <span>Servings</span>
                  <span className="text-[#F10100]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={formData.servings}
                    onChange={(e) => handleInputChange("servings", e.target.value)}
                    onKeyUp={(e) => handleInputChange("servings", e.target.value)}
                    placeholder="Number of servings"
                    className={`w-full px-6 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 text-lg font-medium bg-white/50 backdrop-blur-sm ${
                      validationErrors.servings 
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50/50' 
                        : 'border-gray-200 focus:ring-[#F10100]/20 focus:border-[#F10100] hover:border-gray-300'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                {validationErrors.servings && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm font-semibold mt-2 flex items-center space-x-1"
                  >
                    <span>⚠</span>
                    <span>{validationErrors.servings}</span>
                  </motion.p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Difficulty Level
                </label>
                <div className="flex space-x-4">
                  {difficulties.map((difficulty, index) => (
                    <motion.button
                      key={difficulty}
                      type="button"
                      onClick={() => handleInputChange("difficulty", difficulty)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 relative overflow-hidden ${
                        formData.difficulty === difficulty
                          ? "bg-gradient-to-r from-[#F10100] to-[#FF4444] text-white shadow-2xl transform scale-105"
                          : "bg-white/70 text-gray-700 hover:bg-white/90 border-2 border-gray-200 hover:border-[#F10100]/30 hover:shadow-lg backdrop-blur-sm"
                      }`}
                    >
                      {formData.difficulty === difficulty && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                        />
                      )}
                      <span className="relative z-10">{difficulty}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center space-x-2">
                  <span>Description</span>
                  <span className="text-[#F10100]">*</span>
                </label>
                <div className="relative">
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    onKeyUp={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your recipe and what makes it special..."
                    rows={5}
                    className={`w-full px-6 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 resize-none text-lg font-medium bg-white/50 backdrop-blur-sm ${
                      validationErrors.description 
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50/50' 
                        : 'border-gray-200 focus:ring-[#F10100]/20 focus:border-[#F10100] hover:border-gray-300'
                    }`}
                  />
                  <div className="absolute top-4 right-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                </div>
                {validationErrors.description && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm font-semibold mt-2 flex items-center space-x-1"
                  >
                    <span>⚠</span>
                    <span>{validationErrors.description}</span>
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Image Upload */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Recipe Photo</h2>
              <span className="text-[#F10100] text-2xl font-bold">*</span>
            </div>
            
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-3 border-dashed rounded-3xl p-12 text-center transition-all duration-500 group ${
                validationErrors.image
                  ? "border-red-400 bg-gradient-to-br from-red-50 to-red-100"
                  : dragActive
                  ? "border-[#F10100] bg-gradient-to-br from-[#F10100]/5 to-[#FF4444]/5 scale-105 shadow-2xl"
                  : "border-gray-300 hover:border-[#F10100] hover:bg-gradient-to-br hover:from-gray-50 hover:to-white hover:shadow-xl"
              }`}
            >
              {formData.image ? (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative group"
                >
                  <img
                    src={formData.image}
                    alt="Recipe preview"
                    className="w-full h-80 object-cover rounded-3xl shadow-2xl"
                  />
                  <motion.button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, image: null, imageFile: null }));
                      setValidationErrors(prev => ({ ...prev, image: null }));
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg backdrop-blur-sm"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-3xl transition-all duration-300"></div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="relative">
                    <Camera className="w-24 h-24 text-gray-400 mx-auto mb-6 group-hover:text-[#F10100] transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 border-4 border-dashed border-gray-300 rounded-full group-hover:border-[#F10100] transition-colors duration-300"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-2xl font-bold text-gray-700 group-hover:text-[#F10100] transition-colors duration-300">
                      Drop your image here, or click to browse
                    </p>
                    <p className="text-lg text-gray-500 font-medium">PNG, JPG, GIF up to 10MB</p>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>High quality images work best</span>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </motion.div>
              )}
            </div>
            {validationErrors.image && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm font-semibold mt-4 flex items-center justify-center space-x-2"
              >
                <span className="text-lg">⚠</span>
                <span>{validationErrors.image}</span>
              </motion.p>
            )}
          </motion.div>

          {/* Ingredients */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Ingredients</h2>
              <span className="text-[#F10100] text-2xl font-bold">*</span>
            </div>
            
            <div className="space-y-6">
              {formData.ingredients.map((ingredient, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleArrayChange("ingredients", index, e.target.value)}
                    placeholder={`Ingredient ${index + 1}`}
                    className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 text-lg font-medium bg-white/70 backdrop-blur-sm hover:border-gray-300"
                  />
                  {formData.ingredients.length > 1 && (
                    <motion.button
                      type="button"
                      onClick={() => removeArrayItem("ingredients", index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
            
            <motion.button
              type="button"
              onClick={() => addArrayItem("ingredients")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 flex items-center space-x-3 text-white bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-6 h-6" />
              <span>Add Ingredient</span>
            </motion.button>
            {validationErrors.ingredients && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm font-semibold mt-4 flex items-center space-x-2"
              >
                <span className="text-lg">⚠</span>
                <span>{validationErrors.ingredients}</span>
              </motion.p>
            )}
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"></div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">4</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Instructions</h2>
              <span className="text-[#F10100] text-2xl font-bold">*</span>
            </div>
            
            <div className="space-y-6">
              {formData.instructions.map((instruction, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-4 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-lg font-bold mt-1 shadow-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1 relative">
                    <textarea
                      value={instruction}
                      onChange={(e) => handleArrayChange("instructions", index, e.target.value)}
                      placeholder={`Step ${index + 1} - Describe what to do...`}
                      rows={4}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 resize-none text-lg font-medium bg-white/70 backdrop-blur-sm hover:border-gray-300"
                    />
                    <div className="absolute top-4 right-4">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                  </div>
                  {formData.instructions.length > 1 && (
                    <motion.button
                      type="button"
                      onClick={() => removeArrayItem("instructions", index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg mt-1 opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
            
            <motion.button
              type="button"
              onClick={() => addArrayItem("instructions")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 flex items-center space-x-3 text-white bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-6 h-6" />
              <span>Add Step</span>
            </motion.button>
            {validationErrors.instructions && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm font-semibold mt-4 flex items-center space-x-2"
              >
                <span className="text-lg">⚠</span>
                <span>{validationErrors.instructions}</span>
              </motion.p>
            )}
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"></div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">5</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Tags</h2>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-8">
              {formData.tags.map((tag, index) => (
                <motion.span
                  key={tag}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-2xl text-lg font-bold flex items-center space-x-3 shadow-lg group hover:shadow-xl transition-all duration-300"
                >
                  <span>{tag}</span>
                  <motion.button
                    type="button"
                    onClick={() => removeTag(tag)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </motion.span>
              ))}
            </div>
            
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add tags (e.g., vegetarian, gluten-free)..."
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 text-lg font-medium bg-white/70 backdrop-blur-sm hover:border-gray-300"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                </div>
              </div>
              <motion.button
                type="button"
                onClick={addTag}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Add Tag
              </motion.button>
            </div>
            {validationErrors.tags && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm font-semibold mt-4 flex items-center space-x-2"
              >
                <span className="text-lg">⚠</span>
                <span>{validationErrors.tags}</span>
              </motion.p>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-center relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#F10100] via-[#FF4444] to-[#F10100] rounded-3xl blur-xl opacity-30 scale-110"></div>
            <motion.button
              type="submit"
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 30px 60px rgba(241, 1, 0, 0.4)" 
              }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-gradient-to-r from-[#F10100] to-[#FF4444] text-white px-16 py-6 rounded-3xl font-black text-2xl flex items-center space-x-4 shadow-2xl hover:shadow-3xl transition-all duration-500 mx-auto group overflow-hidden"
              disabled={submitting || !user}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
              <motion.div
                animate={{ rotate: submitting ? 360 : 0 }}
                transition={{ duration: 1, repeat: submitting ? Infinity : 0 }}
              >
                <Heart className="w-8 h-8" />
              </motion.div>
              <span className="relative z-10">
                {submitting ? "Submitting Recipe..." : "Share Your Recipe"}
              </span>
              {!submitting && (
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="relative z-10"
                >
                  →
                </motion.div>
              )}
            </motion.button>
            
            {!user && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6 text-gray-600 text-lg font-medium"
              >
                Please log in to submit your recipe
              </motion.p>
            )}
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
};

export default SubmitRecipe;