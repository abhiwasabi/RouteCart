export type Temperature = 'ambient' | 'refrigerated' | 'frozen';

export type DepartmentDefinition = {
  temperature: Temperature;
  keywords: string[];
};

export type ClassificationResult = {
  department: string;
  temperature: Temperature;
  score: number;
};

export const OVIEDO_DEEP_LAKE_DEPARTMENTS: Record<string, DepartmentDefinition> = {
  Pets: {
    temperature: 'ambient',
    keywords: [
      'dog food', 'cat food', 'pet food', 'bird food', 'dog treats', 'cat treats',
      'pet treats', 'cat litter', 'litter', 'dog toy', 'cat toy', 'dog shampoo',
      'pet shampoo', 'cat shampoo', 'pet grooming', 'dog vitamins', 'cat vitamins',
      'pet vitamins', 'dog supplements', 'cat supplements', 'pet supplements',
      'pet', 'pets', 'dog', 'cat', 'bird food',
    ],
  },
  Cleaning: {
    temperature: 'ambient',
    keywords: [
      'cleaner', 'cleaning', 'bleach', 'disinfectant', 'lysol', 'windex', 'sponges',
      'sponge', 'dish soap', 'dishwashing liquid', 'mop', 'broom', 'dustpan',
      'trash bags', 'garbage bags', 'cleaning spray', 'all purpose cleaner',
      'air freshener', 'air fresheners', 'room freshener', 'odor eliminator',
      'clorox wipes', 'disinfecting wipes', 'disinfectant wipes', 'cleaning wipes', 'febreze', 'febreze spray', 'fabric refresher',
    ],
  },
  'Household Paper': {
    temperature: 'ambient',
    keywords: [
      'paper towels', 'paper towel', 'toilet paper', 'toilet tissue', 'toilet tissues',
      'bath tissue', 'tissues', 'facial tissue', 'facial tissues', 'napkins',
      'paper plates', 'paper cups', 'paper goods',
      'household paper',
      'paper bowl', 'paper bowls',
    ],
  },
  Baby: {
    temperature: 'ambient',
    keywords: [
      'diapers', 'diaper', 'baby wipes', 'wipes', 'baby formula', 'formula',
      'baby food', 'baby bottle', 'pacifier', 'baby shampoo', 'baby lotion',
      'baby blanket', 'baby blankets', 'crib blanket', 'swaddle blanket',
      'baby', 'toddler',
      'baby socks',
    ],
  },
  Electronics: {
    temperature: 'ambient',
    keywords: [
      'phone charger', 'charger', 'charging cable', 'usb cable', 'usb cord',
      'usb c cord', 'usb-c cord', 'usb c cable', 'usb-c cable', 'cable',
      'screen protector', 'phone case', 'headphones', 'earbuds', 'speaker',
      'television', 'tv', 'monitor', 'keyboard', 'mouse', 'gaming', 'electronics',
      'hdmi', 'battery pack', 'power bank', 'battery', 'batteries',
      'aa battery', 'aa batteries', 'aaa battery', 'aaa batteries',
      'alkaline batteries', 'household batteries',
      'airpods', 'airpods case', 'airpod case', 'earbud case', 'wireless earbud case',
    ],
  },
  'Office Supplies': {
    temperature: 'ambient',
    keywords: [
      'printer paper', 'notebook', 'notebooks', 'pen', 'pens', 'pencil', 'pencils',
      'binder', 'folders', 'folder', 'stapler', 'tape', 'scissors', 'highlighter',
      'markers', 'school backpack', 'school backpacks', 'book bag', 'bookbag',
      'office supplies', 'school supplies',
      'paper',
    ],
  },
  'Arts & Crafts': {
    temperature: 'ambient',
    keywords: [
      'paint brush', 'craft paint', 'canvas', 'craft', 'crafts', 'yarn', 'glue',
      'glitter', 'beads', 'sewing', 'fabric', 'cake decorating kit',
      'cake decorating kits', 'decorating kit', 'arts and crafts', 'art supplies',
    ],
  },
  Toys: {
    temperature: 'ambient',
    keywords: [
      'toy', 'toys', 'lego', 'doll', 'action figure', 'board game', 'puzzle',
      'hot wheels', 'nerf', 'kids game',
    ],
  },
  Sports: {
    temperature: 'ambient',
    keywords: [
      'basketball', 'football', 'soccer ball', 'baseball', 'tennis', 'pickleball',
      'sports', 'sports equipment', 'dumbbell', 'weights', 'yoga mat', 'fitness',
      'exercise',
    ],
  },
  Alcohol: {
    temperature: 'ambient',
    keywords: [
      'beer', 'wine', 'liquor', 'vodka', 'tequila', 'rum', 'whiskey', 'alcohol',
      'hard seltzer',
    ],
  },
  'Snacks & Bev': {
    temperature: 'ambient',
    keywords: [
      'coca cola', 'coca-cola', 'coke', 'pepsi', 'sprite', 'soda', 'soft drink',
      'water', 'bottled water', 'juice', 'gatorade', 'energy drink', 'sports drink',
      'chips', 'cookies', 'crackers', 'candy', 'snack', 'snacks', 'beverage',
      'beverages', 'drinks',
    ],
  },
  Grocery: {
    temperature: 'ambient',
    keywords: [
      'rice', 'pasta', 'cereal', 'oatmeal', 'flour', 'sugar', 'salt', 'pepper',
      'cooking oil', 'olive oil', 'sauce', 'ketchup', 'mustard', 'mayonnaise',
      'canned fruit', 'canned vegetables', 'canned food', 'beans', 'soup',
      'peanut butter', 'jelly', 'jam', 'coffee', 'tea', 'condensed milk',
      'table cream', 'spices', 'seasoning', 'tortilla', 'grocery',
    ],
  },
  Dairy: {
    temperature: 'refrigerated',
    keywords: [
      'milk', 'lactaid', 'lactose free milk', 'eggs', 'egg', 'butter', 'yogurt',
      'cheese', 'cream cheese', 'sour cream', 'heavy whipping cream', 'creamer',
      'dairy',
    ],
  },
  Frozen: {
    temperature: 'frozen',
    keywords: [
      'ice cream', 'frozen pizza', 'frozen', 'popsicle', 'frozen vegetables',
      'frozen fruit', 'frozen meal', 'frozen dinner', 'frozen waffles',
      'frozen fries',
    ],
  },
  'Meat & Seafood': {
    temperature: 'refrigerated',
    keywords: [
      'chicken breast', 'chicken breasts', 'chicken thigh', 'chicken thighs',
      'fresh chicken', 'raw chicken', 'whole chicken', 'ground beef', 'steak',
      'beef', 'pork', 'bacon', 'sausage', 'salmon', 'shrimp', 'fish', 'seafood',
      'meat', 'turkey meat',
      'ground turkey', 'ground chicken',
    ],
  },
  Bakery: {
    temperature: 'ambient',
    keywords: [
      'bread', 'bagel', 'bagels', 'croissant', 'croissants', 'cake', 'cakes',
      'cupcake', 'cupcakes', 'muffin', 'muffins', 'bakery', 'donuts', 'doughnuts',
      'baked bread',
    ],
  },
  Deli: {
    temperature: 'refrigerated',
    keywords: [
      'deli meat', 'sliced turkey', 'sliced ham', 'ham slices', 'turkey slices',
      'rotisserie chicken', 'deli cheese', 'prepared sandwich', 'deli',
      'sliced cheddar', 'cheddar slices', 'sliced cheese', 'cheese slices',
    ],
  },
  'Fresh Produce': {
    temperature: 'ambient',
    keywords: [
      'banana', 'bananas', 'apple', 'apples', 'orange', 'oranges', 'lemon', 'lemons',
      'lime', 'limes', 'avocado', 'avocados', 'tomato', 'tomatoes', 'lettuce',
      'spinach', 'onion', 'onions', 'potato', 'potatoes', 'garlic', 'fresh garlic',
      'garlic bulb', 'garlic bulbs', 'strawberries', 'blueberries', 'grapes',
      'watermelon', 'pineapple', 'fresh produce',
      'produce', 'fruit', 'vegetables', 'vegetable',
    ],
  },
  Seasonal: {
    temperature: 'ambient',
    keywords: [
      'seasonal', 'halloween', 'christmas', 'easter', 'valentines', "valentine's",
      'holiday decoration', 'holiday decorations', 'holiday lights', 'seasonal lights',
      'seasonal decorations',
    ],
  },
  'Party Supplies': {
    temperature: 'ambient',
    keywords: [
      'party supplies', 'party supply', 'balloons', 'balloon', 'birthday candles',
      'birthday candle', 'party decorations', 'party decoration',
      'birthday decorations', 'birthday decoration', 'birthday decor',
      'streamers', 'confetti', 'birthday banner', 'birthday plates', 'birthday cups',
      'birthday napkins', 'party plates', 'party cups', 'party napkins',
      'party favors', 'party favor',
      'birthday gift bag', 'birthday gift bags', 'gift bag', 'gift bags',
    ],
  },
  Furniture: {
    temperature: 'ambient',
    keywords: [
      'furniture', 'desk', 'office chair', 'chair', 'bookshelf', 'shelf unit',
      'storage cabinet', 'table', 'nightstand',
    ],
  },
  Laundry: {
    temperature: 'ambient',
    keywords: [
      'laundry detergent', 'detergent', 'fabric softener', 'dryer sheet', 'dryer sheets',
      'laundry basket', 'laundry hamper', 'stain remover', 'laundry',
    ],
  },
  'Bath & Shower': {
    temperature: 'ambient',
    keywords: [
      'shower curtain', 'bath towel', 'bath towels', 'bathroom towel', 'bathroom towels',
      'towel', 'towels', 'towel set', 'bath mat', 'shower mat', 'shower mats',
      'bathroom rug',
      'shower caddy', 'shower head', 'bathroom accessories',
      'bath and shower',
    ],
  },
  Bedding: {
    temperature: 'ambient',
    keywords: [
      'bed sheets', 'sheets', 'pillow', 'pillows', 'pillowcase', 'comforter',
      'blanket', 'bedspread', 'mattress pad', 'bedding',
    ],
  },
  Home: {
    temperature: 'ambient',
    keywords: [
      'home decor', 'picture frame', 'frame', 'lamp', 'curtains', 'curtain',
      'storage bin', 'storage bins', 'storage container', 'storage containers',
      'storage box', 'storage boxes', 'trash can', 'trash cans', 'wastebasket',
      'waste basket', 'scented candle', 'scented candles', 'candle', 'candles',
      'home organization', 'decor', 'home',
    ],
  },
  Kitchen: {
    temperature: 'ambient',
    keywords: [
      'pan', 'pot', 'frying pan', 'cookware', 'plate', 'plates', 'bowl', 'bowls',
      'cup', 'cups', 'mug', 'mugs', 'knife', 'knives', 'cutting board',
      'food container', 'tupperware', 'kitchen utensil', 'spatula', 'coffee maker',
      'coffee machine', 'coffee pot', 'cupcake tray', 'muffin tray', 'muffin tin',
      'cupcake pan', 'baking tray', 'baking pan', 'aluminum foil', 'aluminium foil',
      'tin foil', 'ziplock bag', 'ziplock bags', 'ziploc bag', 'ziploc bags',
      'storage bags', 'sandwich bags', 'freezer bags', 'oven mitt', 'oven mitts',
      'pot holder', 'pot holders', 'coffee filter', 'coffee filters',
      'kitchen appliance', 'kitchen',
    ],
  },
  Boys: {
    temperature: 'ambient',
    keywords: [
      'boys clothes', "boy's clothes", 'boys clothing', 'boy shirt', 'boys shirt',
      'boys pants', 'boys shorts', 'boys hoodie', 'boys jacket',
      'boys socks', 'boy socks',
    ],
  },
  Girls: {
    temperature: 'ambient',
    keywords: [
      'girls clothes', "girl's clothes", 'girls clothing', 'girl shirt', 'girls shirt',
      'girls pants', 'girls shorts', 'girls dress', 'girls leggings',
      'girls hoodie', 'girls jacket',
      'girls socks', 'girl socks',
    ],
  },
  Mens: {
    temperature: 'ambient',
    keywords: [
      'mens clothes', "men's clothes", 'mens clothing', "men's clothing",
      'mens shirt', "men's shirt", 'mens pants', "men's pants", 'mens shorts',
      "men's shorts", 'mens hoodie', "men's hoodie", 'mens jacket', "men's jacket",
      'men socks', 'mens socks', "men's socks",
    ],
  },
  Intimates: {
    temperature: 'ambient',
    keywords: [
      'bra', 'bras', 'underwear', 'panties', 'lingerie', 'intimates',
    ],
  },
  Shoes: {
    temperature: 'ambient',
    keywords: [
      'shoes', 'shoe', 'sneakers', 'sandals', 'boots', 'slippers', 'footwear',
      'nike socks', 'athletic socks', 'sports socks',
      'socks',
    ],
  },
  Womens: {
    temperature: 'ambient',
    keywords: [
      'womens clothes', "women's clothes", 'womens clothing', "women's clothing",
      'women clothes', 'women clothing', 'womens shirt', "women's shirt",
      'womens pants', "women's pants", 'womens shorts', "women's shorts",
      'womens dress', "women's dress", 'dress', 'womens leggings',
      "women's leggings", 'leggings', 'womens hoodie', "women's hoodie",
      'womens jacket', "women's jacket",
      'women socks', 'womens socks', "women's socks",
    ],
  },
  Jewelry: {
    temperature: 'ambient',
    keywords: [
      'jewelry', 'necklace', 'bracelet', 'earrings', 'earring', 'ring', 'watch',
      'watches',
    ],
  },
  Auto: {
    temperature: 'ambient',
    keywords: [
      'motor oil', 'car oil', 'windshield wipers', 'wiper blades', 'car battery',
      'car cleaner', 'car wash', 'car air freshener', 'car freshener',
      'vehicle air freshener', 'automotive air freshener', 'automotive', 'auto',
      'tire inflator', 'car accessories',
      'car wax', 'automotive wax', 'vehicle wax', 'car polish',
    ],
  },
  Hardware: {
    temperature: 'ambient',
    keywords: [
      'hammer', 'screwdriver', 'screws', 'nails', 'drill', 'tool', 'tools',
      'flashlight', 'extension cord', 'light bulb', 'light bulbs', 'led bulb',
      'led bulbs', 'hardware', 'duct tape',
      'lights',
    ],
  },
  Paint: {
    temperature: 'ambient',
    keywords: [
      'wall paint', 'paint roller', 'paint rollers', 'paint tray', 'paint brush',
      'paint brushes', 'primer', 'spray paint', 'paint',
    ],
  },
  Garden: {
    temperature: 'ambient',
    keywords: [
      'charcoal', 'garden', 'soil', 'potting soil', 'plant', 'plants', 'mulch',
      'fertilizer', 'flower pot', 'planter', 'grill', 'grilling', 'pellets',
      'garden hose', 'outdoor',
      'rose', 'roses', 'red roses', 'flowers', 'fresh flowers', 'flower bouquet', 'bouquet',
      'gloves',
    ],
  },
  Health: {
    temperature: 'ambient',
    keywords: [
      'medicine', 'medication', 'vitamin', 'vitamins', 'pain reliever', 'ibuprofen',
      'acetaminophen', 'tylenol', 'advil', 'cold medicine', 'cough medicine',
      'bandages', 'first aid', 'thermometer', 'allergy medicine', 'health',
    ],
  },
  'Personal Care': {
    temperature: 'ambient',
    keywords: [
      'shampoo', 'conditioner', 'toothpaste', 'toothbrush', 'deodorant',
      'body wash', 'bar soap', 'soap', 'razor', 'shaving cream', 'lotion',
      'mouthwash', 'floss', 'personal care', 'feminine care', 'tampons', 'pads',
    ],
  },
  Beauty: {
    temperature: 'ambient',
    keywords: [
      'makeup', 'mascara', 'lipstick', 'lip gloss', 'foundation', 'concealer',
      'eyeliner', 'nail polish', 'hair dye', 'hair color', 'hair brush', 'hairbrush',
      'hair brushes', 'face cream', 'facial cream', 'face moisturizer', 'beauty',
      'cosmetics', 'skincare', 'face wash', 'moisturizer',
      'brush',
    ],
  },
};

const CORAL_RIDGE_DEPARTMENT_NAMES = [
  'Alcohol',
  'Dairy',
  'Deli',
  'Meat & Seafood',
  'Grocery',
  'Frozen',
  'Bakery',
  'Fresh Produce',
  'Pets',
  'Cleaning',
  'Household Paper',
  'Office Supplies',
  'Electronics',
  'Toys',
  'Sports',
  'Baby',
  'Girls',
  'Boys',
  'Arts & Crafts',
  'Jewelry',
  'Shoes',
  'Womens',
  'Intimates',
  'Mens',
  'Party Supplies',
  'Seasonal',
  'Home',
  'Furniture',
  'Bedding',
  'Bath & Shower',
  'Laundry',
  'Kitchen',
  'Auto',
  'Hardware',
  'Paint',
  'Garden',
  'Health',
  'Personal Care',
  'Beauty',
] as const;

export const CORAL_RIDGE_DEPARTMENTS: Record<string, DepartmentDefinition> =
  CORAL_RIDGE_DEPARTMENT_NAMES.reduce((departments, department) => {
    const definition = OVIEDO_DEEP_LAKE_DEPARTMENTS[department];
    if (definition) departments[department] = definition;
    return departments;
  }, {} as Record<string, DepartmentDefinition>);

// Coral Ridge labels the beverage/snack section differently from Oviedo.
CORAL_RIDGE_DEPARTMENTS['Snacks & Beverages'] =
  OVIEDO_DEEP_LAKE_DEPARTMENTS['Snacks & Bev'];


// E Colonial uses the same core Walmart department taxonomy as Oviedo,
// plus Books and Clearance areas that appear on this store's map.
export const ORLANDO_E_COLONIAL_DEPARTMENTS: Record<string, DepartmentDefinition> = {
  ...OVIEDO_DEEP_LAKE_DEPARTMENTS,
  Books: {
    temperature: 'ambient',
    keywords: [
      'book', 'books', 'novel', 'novels', 'paperback', 'paperbacks',
      'hardcover', 'hardcovers', 'magazine', 'magazines', 'comic book',
      'comic books', 'manga',
    ],
  },
  Clearance: {
    temperature: 'ambient',
    keywords: [
      'clearance', 'clearance item', 'clearance items',
    ],
  },
};

function normalizeItemText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s&-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeMatchToken(token: string): string {
  if (token.length > 4 && token.endsWith('ies')) return `${token.slice(0, -3)}y`;
  if (token.length > 4 && token.endsWith('es')) return token.slice(0, -2);
  if (token.length > 3 && token.endsWith('s') && !token.endsWith('ss')) return token.slice(0, -1);
  return token;
}

function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;

    for (let j = 1; j <= b.length; j += 1) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + substitutionCost,
      );
    }

    for (let j = 0; j <= b.length; j += 1) {
      previous[j] = current[j];
    }
  }

  return previous[b.length];
}

function fuzzyPhraseScore(value: string, phrase: string): number {
  const compactValue = value.replace(/\s+/g, '');
  const compactPhrase = phrase.replace(/\s+/g, '');

  if (!compactValue || !compactPhrase) return 0;

  // Handles spacing differences such as "icecream" vs "ice cream".
  if (compactValue === compactPhrase) return 700 + compactPhrase.length;

  const longest = Math.max(value.length, phrase.length);
  const compactLongest = Math.max(compactValue.length, compactPhrase.length);
  if (longest < 5 || compactLongest < 5) return 0;

  const phraseDistance = editDistance(value, phrase);
  const compactDistance = editDistance(compactValue, compactPhrase);
  const distance = Math.min(phraseDistance, compactDistance);
  const comparisonLength = distance === compactDistance ? compactLongest : longest;

  // One typo is accepted for normal words/phrases. Longer phrases can tolerate
  // two edits, while the similarity floor prevents unrelated items from matching.
  const allowedEdits = comparisonLength >= 12 ? 2 : 1;
  const similarity = 1 - distance / comparisonLength;

  if (distance <= allowedEdits && similarity >= 0.84) {
    return 360 + Math.round(similarity * 100);
  }

  return 0;
}

function fuzzyTokenScore(value: string, phrase: string): number {
  const valueTokens = value
    .split(' ')
    .filter(Boolean)
    .map(normalizeMatchToken);

  const phraseTokens = phrase
    .split(' ')
    .filter(Boolean)
    .map(normalizeMatchToken);

  if (!valueTokens.length || !phraseTokens.length) return 0;

  const usedValueTokens = new Set<number>();
  let fuzzyMatches = 0;

  for (const phraseToken of phraseTokens) {
    let bestIndex = -1;
    let bestSimilarity = 0;
    let bestWasExact = false;

    valueTokens.forEach((valueToken, index) => {
      if (usedValueTokens.has(index)) return;

      if (valueToken === phraseToken) {
        if (1 > bestSimilarity) {
          bestIndex = index;
          bestSimilarity = 1;
          bestWasExact = true;
        }
        return;
      }

      const longest = Math.max(valueToken.length, phraseToken.length);

      // Keep typo matching conservative so short unrelated words do not collide.
      if (
        Math.min(valueToken.length, phraseToken.length) < 5 ||
        valueToken[0] !== phraseToken[0]
      ) {
        return;
      }

      const distance = editDistance(valueToken, phraseToken);
      const allowedEdits = longest >= 9 ? 2 : 1;
      const similarity = 1 - distance / longest;

      if (
        distance <= allowedEdits &&
        similarity >= 0.82 &&
        similarity > bestSimilarity
      ) {
        bestIndex = index;
        bestSimilarity = similarity;
        bestWasExact = false;
      }
    });

    if (bestIndex < 0) return 0;

    usedValueTokens.add(bestIndex);
    if (!bestWasExact) fuzzyMatches += 1;
  }

  // If every token was exact, the normal token matcher already handles it.
  if (!fuzzyMatches) return 0;

  return phraseTokens.length > 1
    ? 180 + phraseTokens.length * 25
    : 140;
}

function phraseScore(value: string, phrase: string): number {
  const normalizedPhrase = normalizeItemText(phrase);
  if (!normalizedPhrase) return 0;
  if (value === normalizedPhrase) return 1000 + normalizedPhrase.length;
  if (value.includes(normalizedPhrase)) return 500 + normalizedPhrase.length;

  const compactScore = fuzzyPhraseScore(value, normalizedPhrase);
  if (compactScore > 0) return compactScore;

  const valueTokens = new Set(
    value.split(' ').filter(Boolean).map(normalizeMatchToken),
  );
  const phraseTokens = normalizedPhrase
    .split(' ')
    .filter(Boolean)
    .map(normalizeMatchToken);

  if (!phraseTokens.length) return 0;

  const matches = phraseTokens.filter((token) => valueTokens.has(token)).length;
  if (matches === phraseTokens.length && matches > 1) return 250 + matches * 20;
  if (matches >= 1 && phraseTokens.length === 1 && normalizedPhrase.length >= 4) return 80;

  const typoTokenScore = fuzzyTokenScore(value, normalizedPhrase);
  if (typoTokenScore > 0) return typoTokenScore;

  return 0;
}


export function classifyDepartment(
  name: string,
  departments: Record<string, DepartmentDefinition>,
): ClassificationResult {
  const value = normalizeItemText(name);
  let bestDepartment = 'Grocery';
  let bestScore = 0;

  Object.entries(departments).forEach(([department, definition]) => {
    let score = phraseScore(value, department);

    definition.keywords.forEach((keyword) => {
      score = Math.max(score, phraseScore(value, keyword));
    });

    if (score > bestScore) {
      bestScore = score;
      bestDepartment = department;
    }
  });

  const definition = departments[bestDepartment] ?? departments.Grocery;

  return {
    department: bestDepartment,
    temperature: definition?.temperature ?? 'ambient',
    score: bestScore,
  };
}

export function parseItemLine(line: string): { name: string; quantity?: number } | null {
  const cleaned = line.trim().replace(/^[-•*]\s*/, '');
  if (!cleaned) return null;

  const trailingQuantity = cleaned.match(/\((\d+)\)\s*$/);
  const xQuantity = cleaned.match(/\s+[x×](\d+)\s*$/i);
  const quantity = Number(trailingQuantity?.[1] ?? xQuantity?.[1] ?? 1);
  const name = cleaned
    .replace(/\s*\(\d+\)\s*$/, '')
    .replace(/\s+[x×]\d+\s*$/i, '')
    .trim();

  return name ? { name, quantity: quantity > 1 ? quantity : undefined } : null;
}

