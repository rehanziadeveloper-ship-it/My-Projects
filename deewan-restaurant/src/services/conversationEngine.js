// Conversational AI Ordering & Knowledge Engine for Deewan-E-Khaas (Namak Mandi)
// Features: E-commerce style quantity selector, Flexible menu name matching (spelling & spacing tolerance),
// Natural Roman Urdu / English comprehension, Menu Q&A, and full Dine-In checkout flow.

export const DEEWAN_MENU = [
  // Rice & Pulao
  {
    id: 'rice-1',
    name: 'Chicken Biryani',
    price: 900,
    category: 'rice',
    unit: 'Portion',
    unitPlural: 'Portions',
    aliases: ['chicken biryani', 'chiken biryani', 'chikn biryani', 'murgh biryani', 'biryani chicken', 'biryani', 'biryanis', 'briyani', 'chickenbiryani', 'chikenbiryani']
  },
  {
    id: 'rice-2',
    name: 'Simple Biryani',
    price: 500,
    category: 'rice',
    unit: 'Portion',
    unitPlural: 'Portions',
    aliases: ['simple biryani', 'sada biryani', 'plain biryani', 'simplebiryani', 'sadabiryani']
  },
  {
    id: 'rice-3',
    name: 'Kabuli Pulao',
    price: 880,
    category: 'rice',
    unit: 'Portion',
    unitPlural: 'Portions',
    aliases: ['kabuli pulao', 'afghani pulao', 'pulao kabuli', 'kabli pulao', 'kabulipulao', 'afghanipulao', 'kabuli plao']
  },
  {
    id: 'rice-4',
    name: 'Simple Pulao',
    price: 450,
    category: 'rice',
    unit: 'Portion',
    unitPlural: 'Portions',
    aliases: ['simple pulao', 'sada pulao', 'plain pulao', 'pulao', 'simplepulao', 'sadapulao', 'plao']
  },
  {
    id: 'rice-5',
    name: 'Chicken Fried Rice',
    price: 850,
    category: 'rice',
    unit: 'Portion',
    unitPlural: 'Portions',
    aliases: ['chicken fried rice', 'fried rice', 'chickenfriedrice', 'chiken fried rice', 'chikenfriedrice']
  },
  {
    id: 'rice-6',
    name: 'Egg Fried Rice',
    price: 580,
    category: 'rice',
    unit: 'Portion',
    unitPlural: 'Portions',
    aliases: ['egg fried rice', 'anday walay chawal', 'eggfriedrice', 'egg rice']
  },
  {
    id: 'rice-7',
    name: 'Vegetable Fried Rice',
    price: 570,
    category: 'rice',
    unit: 'Portion',
    unitPlural: 'Portions',
    aliases: ['vegetable fried rice', 'veg rice', 'vegetablefriedrice', 'vegrice', 'sabzi chawal']
  },

  // Tandoor
  {
    id: 'tan-1',
    name: 'Roti (Fine Wheat)',
    price: 30,
    category: 'tandoor',
    unit: 'Piece',
    unitPlural: 'Pieces',
    aliases: ['roti', 'rotis', 'rotiyan', 'rotian', 'chapati', 'chapatis', 'sada roti', 'khamiri roti', 'wheat roti', 'sadaroti']
  },
  {
    id: 'tan-2',
    name: 'Peshawari Naan',
    price: 40,
    category: 'tandoor',
    unit: 'Piece',
    unitPlural: 'Pieces',
    aliases: ['peshawari naan', 'peshori naan', 'sada naan', 'naan', 'naans', 'peshawarinaan', 'sadanaan', 'peshorinaan', 'nan']
  },
  {
    id: 'tan-3',
    name: 'Roghni Naan',
    price: 80,
    category: 'tandoor',
    unit: 'Piece',
    unitPlural: 'Pieces',
    aliases: ['roghni naan', 'roghani naan', 'roghni nan', 'roghni naans', 'roghni', 'roghninaan', 'roghaninaan']
  },

  // Karahi & Handi (with sizes)
  {
    id: 'k-1',
    name: 'Chicken Shinwari Karahi',
    category: 'karahi',
    unit: 'Portion',
    unitPlural: 'Portions',
    aliases: ['chicken shinwari karahi', 'chiken shinwari karahi', 'chicken shinwari', 'chiken shinwari', 'shinwari chicken', 'shinwari karahi', 'shinwari', 'chickenshinwari', 'shinwarikarahi', 'shinwarichicken'],
    hasSizes: true,
    sizes: {
      half: { label: 'Half', price: 950 },
      full: { label: 'Full', price: 1799 }
    }
  },
  {
    id: 'k-2',
    name: 'Mutton Shinwari Karahi',
    category: 'karahi',
    unit: 'Portion',
    unitPlural: 'Portions',
    aliases: ['mutton shinwari karahi', 'mutton shinwari', 'shinwari mutton', 'muttonshinwari', 'matan shinwari', 'gosht shinwari'],
    hasSizes: true,
    sizes: {
      half: { label: 'Half', price: 1799 },
      full: { label: 'Full', price: 3399 }
    }
  },
  {
    id: 'k-3',
    name: 'Chicken Butt Karahi',
    category: 'karahi',
    unit: 'Portion',
    unitPlural: 'Portions',
    aliases: ['chicken butt karahi', 'butt chicken karahi', 'butt chicken', 'butt karahi', 'chicken butt', 'chiken butt karahi', 'chickenbutt', 'buttkarahi'],
    hasSizes: true,
    sizes: {
      half: { label: 'Half', price: 1020 },
      full: { label: 'Full', price: 1850 }
    }
  },
  {
    id: 'k-4',
    name: 'Mutton Butt Karahi',
    category: 'karahi',
    unit: 'Portion',
    unitPlural: 'Portions',
    aliases: ['mutton butt karahi', 'butt mutton karahi', 'butt mutton', 'mutton butt', 'muttonbutt', 'matan butt karahi'],
    hasSizes: true,
    sizes: {
      half: { label: 'Half', price: 1820 },
      full: { label: 'Full', price: 3450 }
    }
  },
  {
    id: 'k-5',
    name: 'Chicken Afghani Karahi',
    category: 'karahi',
    unit: 'Portion',
    unitPlural: 'Portions',
    aliases: ['chicken afghani karahi', 'afghani chicken', 'afghani karahi', 'chicken afghani', 'chickenafghani', 'afghanikarahi'],
    hasSizes: true,
    sizes: {
      half: { label: 'Half', price: 1020 },
      full: { label: 'Full', price: 1880 }
    }
  },
  {
    id: 'k-6',
    name: 'Mutton Afghani Karahi',
    category: 'karahi',
    unit: 'Portion',
    unitPlural: 'Portions',
    aliases: ['mutton afghani karahi', 'afghani mutton', 'mutton afghani', 'muttonafghani', 'matan afghani'],
    hasSizes: true,
    sizes: {
      half: { label: 'Half', price: 1870 },
      full: { label: 'Full', price: 3550 }
    }
  },
  {
    id: 'k-7',
    name: 'Chicken White Handi',
    category: 'karahi',
    unit: 'Portion',
    unitPlural: 'Portions',
    aliases: ['chicken white handi', 'white handi', 'chicken white', 'whitehandi', 'chickenwhitehandi', 'chiken white handi', 'chikenwhitehandi', 'safaid handi'],
    hasSizes: true,
    sizes: {
      half: { label: 'Half', price: 970 },
      full: { label: 'Full', price: 1890 }
    }
  },
  {
    id: 'k-8',
    name: 'Chicken Makhni Handi',
    category: 'karahi',
    unit: 'Portion',
    unitPlural: 'Portions',
    aliases: ['chicken makhni handi', 'makhni handi', 'butter chicken', 'makhnihandi', 'chickenmakhnihandi', 'makhni chicken'],
    hasSizes: true,
    sizes: {
      half: { label: 'Half', price: 990 },
      full: { label: 'Full', price: 1850 }
    }
  },
  {
    id: 'k-9',
    name: 'Desi Murgh Karahi',
    price: 3300,
    category: 'karahi',
    unit: 'Portion',
    unitPlural: 'Portions',
    aliases: ['desi murgh karahi', 'desi chicken karahi', 'desi murgh', 'desimurghkarahi', 'desi chicken', 'desichicken']
  },
  {
    id: 'k-10',
    name: 'Desi Murgh Sobat (Painda)',
    price: 3399,
    category: 'karahi',
    unit: 'Portion',
    unitPlural: 'Portions',
    aliases: ['desi murgh sobat', 'sobat', 'painda', 'painda sobat', 'desimurghsobat', 'marwat sobat', 'di khan sobat']
  },
  {
    id: 'k-11',
    name: 'Mutton Dum Pukht',
    price: 3400,
    category: 'karahi',
    unit: 'Portion',
    unitPlural: 'Portions',
    aliases: ['mutton dum pukht', 'mutton dumpukht', 'dumpukht', 'dum pukht', 'muttondumpukht', 'matan dum pukht']
  },

  // Bar B Q
  {
    id: 'bbq-1',
    name: 'Chicken Tikka Leg Pc',
    price: 375,
    category: 'bbq',
    unit: 'Piece',
    unitPlural: 'Pieces',
    aliases: ['chicken tikka leg', 'tikka leg', 'leg piece', 'leg pc', 'tikkaleg', 'legpiece', 'chicken leg', 'chiken tikka leg']
  },
  {
    id: 'bbq-2',
    name: 'Chicken Tikka Chest Pc',
    price: 399,
    category: 'bbq',
    unit: 'Piece',
    unitPlural: 'Pieces',
    aliases: ['chicken tikka chest', 'tikka chest', 'chest piece', 'chest pc', 'tikkachest', 'chestpiece', 'chiken tikka chest']
  },
  {
    id: 'bbq-3',
    name: 'Chicken Tikka Boti',
    price: 410,
    category: 'bbq',
    unit: 'Plate',
    unitPlural: 'Plates',
    aliases: ['chicken tikka boti', 'tikka boti', 'chickentikkaboti', 'tikkaboti', 'chiken tikka boti']
  },
  {
    id: 'bbq-4',
    name: 'Chicken Malai Boti',
    price: 530,
    category: 'bbq',
    unit: 'Plate',
    unitPlural: 'Plates',
    aliases: ['chicken malai boti', 'malai boti', 'chickenmalaiboti', 'malaiboti', 'malai tikka', 'chiken malai boti']
  },
  {
    id: 'bbq-5',
    name: 'Chicken Kalmi Tikka',
    price: 499,
    category: 'bbq',
    unit: 'Piece',
    unitPlural: 'Pieces',
    aliases: ['chicken kalmi tikka', 'kalmi tikka', 'kalmi', 'chickenkalmitikka', 'kalmitikka']
  },
  {
    id: 'bbq-6',
    name: 'Chicken Seekh Kabab',
    price: 170,
    category: 'bbq',
    unit: 'Skewer',
    unitPlural: 'Skewers',
    aliases: ['chicken seekh kabab', 'chicken seekh', 'chicken kabab', 'chicken kebab', 'chickenseekhkabab', 'chiken seekh kabab']
  },
  {
    id: 'bbq-7',
    name: 'Beef Seekh Kabab',
    price: 170,
    category: 'bbq',
    unit: 'Skewer',
    unitPlural: 'Skewers',
    aliases: ['beef seekh kabab', 'beef seekh', 'beef kabab', 'beef kebab', 'beefseekhkabab', 'beef seekh kababs']
  },
  {
    id: 'bbq-8',
    name: 'Chicken Reshmi Kabab',
    price: 190,
    category: 'bbq',
    unit: 'Skewer',
    unitPlural: 'Skewers',
    aliases: ['chicken reshmi kabab', 'reshmi kabab', 'reshmi', 'chickenreshmikabab', 'reshmikabab']
  },
  {
    id: 'bbq-9',
    name: 'Meter Kabab',
    price: 899,
    category: 'bbq',
    unit: 'Skewer',
    unitPlural: 'Skewers',
    aliases: ['meter kabab', 'meter seekh kabab', 'meterkabab', '1 meter kabab', 'one meter kabab']
  },
  {
    id: 'bbq-10',
    name: 'BBQ Batair (1 Pc)',
    price: 250,
    category: 'bbq',
    unit: 'Piece',
    unitPlural: 'Pieces',
    aliases: ['bbq batair', 'batair', 'quail', 'bbqbatair', 'bater']
  },
  {
    id: 'bbq-11',
    name: 'Chicken Angara (Full)',
    price: 1450,
    category: 'bbq',
    unit: 'Portion',
    unitPlural: 'Portions',
    aliases: ['chicken angara', 'angara chicken', 'angara', 'chickenangara']
  },
  {
    id: 'bbq-12',
    name: 'Chapli Kabab',
    price: 170,
    category: 'bbq',
    unit: 'Piece',
    unitPlural: 'Pieces',
    aliases: ['chapli kabab', 'peshawari chapli kabab', 'chapli', 'chaplikabab', 'peshawarichapli']
  },
  {
    id: 'bbq-13',
    name: 'Deewan Special Platter',
    category: 'bbq',
    unit: 'Platter',
    unitPlural: 'Platters',
    aliases: ['deewan special platter', 'deewan platter', 'special platter', 'platter', 'platter deal', 'bar b q platter', 'bbq platter', 'deewanspecialplatter', 'specialplatter'],
    hasSizes: true,
    sizes: {
      half: { label: 'Half', price: 4799 },
      full: { label: 'Full', price: 7999 }
    }
  },

  // Cold Drinks
  {
    id: 'drink-coke',
    name: 'Coke',
    category: 'drinks',
    unit: 'Bottle',
    unitPlural: 'Bottles',
    aliases: ['coke', 'coca cola', 'pepsi', 'sprite', 'fanta', 'marinda', '7up', 'dew', 'cold drink', 'colddrink', 'drink', 'beverage'],
    hasSizes: true,
    sizes: {
      tin: { label: 'Tin Pack', price: 140, unit: 'Can', unitPlural: 'Cans' },
      '1ltr': { label: '1 Litre', price: 190, unit: 'Bottle', unitPlural: 'Bottles' },
      '1.5ltr': { label: '1.5 Litre', price: 250, unit: 'Bottle', unitPlural: 'Bottles' }
    }
  },
  {
    id: 'drink-1',
    name: 'Tin Pack (Coke / Sprite / Fanta)',
    price: 140,
    category: 'drinks',
    unit: 'Can',
    unitPlural: 'Cans',
    aliases: ['tin pack', 'can', 'cold drink can', 'tinpack', 'coke tin', 'sprite tin', 'fanta tin']
  },
  {
    id: 'drink-2',
    name: 'Diet Tin',
    price: 150,
    category: 'drinks',
    unit: 'Can',
    unitPlural: 'Cans',
    aliases: ['diet tin', 'diet coke', 'coke zero', 'diet sprite', 'diettin', 'dietcoke']
  },
  {
    id: 'drink-3',
    name: 'ColdDrink (1 Ltr)',
    price: 190,
    category: 'drinks',
    unit: 'Bottle',
    unitPlural: 'Bottles',
    aliases: ['cold drink 1 ltr', '1 ltr cold drink', '1 litre', '1ltr', '1 litre bottle']
  },
  {
    id: 'drink-4',
    name: 'ColdDrink (1.5 Ltr)',
    price: 250,
    category: 'drinks',
    unit: 'Bottle',
    unitPlural: 'Bottles',
    aliases: ['cold drink 1.5 ltr', '1.5 ltr cold drink', '1.5 litre', '1.5', '1.5ltr', '1.5 litre bottle', 'bari coke']
  },
  {
    id: 'drink-5',
    name: 'Mineral Water (Small)',
    price: 60,
    category: 'drinks',
    unit: 'Bottle',
    unitPlural: 'Bottles',
    aliases: ['mineral water small', 'water small', 'chota pani', 'small water', 'small mineral water']
  },
  {
    id: 'drink-6',
    name: 'Mineral Water (Large)',
    price: 120,
    category: 'drinks',
    unit: 'Bottle',
    unitPlural: 'Bottles',
    aliases: ['mineral water large', 'water large', 'bara pani', 'large water', 'pani', 'water', 'mineral water']
  },
  {
    id: 'drink-7',
    name: 'Lassi Glass (Sweet / Salted)',
    price: 150,
    category: 'drinks',
    unit: 'Glass',
    unitPlural: 'Glasses',
    aliases: ['lassi glass', 'meethi lassi', 'namkeen lassi', 'lassi', 'lassiglass']
  },
  {
    id: 'drink-8',
    name: 'Lassi Jug',
    price: 450,
    category: 'drinks',
    unit: 'Jug',
    unitPlural: 'Jugs',
    aliases: ['lassi jug', 'jug lassi', 'meethi lassi jug', 'namkeen lassi jug', 'lassijug']
  },

  // Salad & Raita
  {
    id: 'sal-1',
    name: 'Raita',
    price: 69,
    category: 'salad',
    unit: 'Bowl',
    unitPlural: 'Bowls',
    aliases: ['raita', 'dahi raita', 'dahi', 'zeera raita']
  },
  {
    id: 'sal-2',
    name: 'Fresh Salad',
    price: 99,
    category: 'salad',
    unit: 'Plate',
    unitPlural: 'Plates',
    aliases: ['fresh salad', 'salad', 'kachumber', 'kachumar', 'greensalad']
  },
  {
    id: 'sal-3',
    name: 'Mint Sauce',
    price: 99,
    category: 'salad',
    unit: 'Bowl',
    unitPlural: 'Bowls',
    aliases: ['mint sauce', 'pudina chutney', 'podina sauce', 'pudina sauce', 'pudinachutney']
  },
  {
    id: 'sal-4',
    name: 'Tomato Chutney',
    price: 99,
    category: 'salad',
    unit: 'Bowl',
    unitPlural: 'Bowls',
    aliases: ['tomato chutney', 'tamatar chutney', 'tamarchutney']
  },

  // Sweets & Desserts
  {
    id: 'sw-1',
    name: 'Ice Cream Cup',
    price: 160,
    category: 'sweets',
    unit: 'Cup',
    unitPlural: 'Cups',
    aliases: ['ice cream cup', 'icecream cup', 'ice cream', 'icecream', 'icecreamcup', 'ice cup']
  },
  {
    id: 'sw-2',
    name: 'Brownie with Ice Cream',
    price: 299,
    category: 'sweets',
    unit: 'Piece',
    unitPlural: 'Pieces',
    aliases: ['brownie with ice cream', 'brownie with icecream', 'brownie', 'hot brownie']
  },
  {
    id: 'sw-3',
    name: 'Molten Lava with Ice Cream',
    price: 399,
    category: 'sweets',
    unit: 'Piece',
    unitPlural: 'Pieces',
    aliases: ['molten lava with ice cream', 'molten lava with icecream', 'molten lava', 'lava cake', 'moltenlava', 'lavacake']
  },
  {
    id: 'sw-4',
    name: 'Three Milk Cake',
    price: 380,
    category: 'sweets',
    unit: 'Piece',
    unitPlural: 'Pieces',
    aliases: ['three milk cake', '3 milk cake', 'tres leches', 'threemilkcake', 'milk cake']
  },
  {
    id: 'sw-5',
    name: 'Matilda Slice',
    price: 499,
    category: 'sweets',
    unit: 'Piece',
    unitPlural: 'Pieces',
    aliases: ['matilda slice', 'matilda cake', 'matilda', 'matildacake']
  },
  {
    id: 'sw-6',
    name: 'Lotus Cheese Cake',
    price: 599,
    category: 'sweets',
    unit: 'Piece',
    unitPlural: 'Pieces',
    aliases: ['lotus cheese cake', 'lotus cheesecake', 'lotus', 'lotuscake']
  },
  {
    id: 'sw-7',
    name: 'Shahi Kheer',
    price: 180,
    category: 'sweets',
    unit: 'Cup',
    unitPlural: 'Cups',
    aliases: ['shahi kheer', 'kheer', 'shahikheer', 'kher', 'keer']
  },
  {
    id: 'sw-8',
    name: 'Gajar Halwa',
    price: 250,
    category: 'sweets',
    unit: 'Box',
    unitPlural: 'Boxes',
    aliases: ['gajar halwa', 'gajar ka halwa', 'halwa', 'gajarhalwa']
  },

  // Special Deals
  {
    id: 'deal-1',
    name: 'Deewan Family Feast Deal',
    price: 4999,
    category: 'deals',
    unit: 'Deal',
    unitPlural: 'Deals',
    aliases: ['deewan family feast deal', 'family feast deal', 'family deal', 'deal 1', 'family feast', 'deewan family feast', 'feast deal']
  },
  {
    id: 'deal-2',
    name: 'Deewan BBQ Delight Deal',
    price: 2999,
    category: 'deals',
    unit: 'Deal',
    unitPlural: 'Deals',
    aliases: ['deewan bbq delight deal', 'bbq delight deal', 'bbq deal', 'deal 2', 'bbq delight', 'deewan bbq delight', 'delight deal']
  },
  {
    id: 'deal-3',
    name: 'Deewan Shinwari Special Deal',
    price: 3899,
    category: 'deals',
    unit: 'Deal',
    unitPlural: 'Deals',
    aliases: ['deewan shinwari special deal', 'shinwari special deal', 'shinwari deal', 'deal 3', 'shinwari special', 'deewan shinwari deal', 'shinwari feast']
  }
];

// Helper to get formatted unit label based on quantity
export function getItemUnitLabel(item, qty = 1) {
  const unit = item.unit || 'Portion';
  const unitPlural = item.unitPlural || (unit.endsWith('s') ? unit : `${unit}s`);
  return qty === 1 ? unit : unitPlural;
}

// -------------------------------------------------------------
// FLEXIBLE MENU NAME MATCHING & NORMALIZATION ENGINE
// -------------------------------------------------------------

// Strips all non-alphanumeric characters and lowercase
export function squashString(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Phonetic and Roman Urdu / English spelling normalizer
export function normalizePhonetic(str) {
  let s = (str || '').toLowerCase();
  // Remove punctuation
  s = s.replace(/[^a-z0-9\s]/g, ' ');
  // Common phonetic / Roman Urdu replacements
  s = s.replace(/\b(chiken|chikn|chkn|chikin|murgh|murg)\b/g, 'chicken');
  s = s.replace(/\b(matan|muton|muttan|gosht|ghost)\b/g, 'mutton');
  s = s.replace(/\b(krahi|karai|kadhai|karhai|karahii|krahie)\b/g, 'karahi');
  s = s.replace(/\b(briyani|biryany|biriyani|baryani)\b/g, 'biryani');
  s = s.replace(/\b(plao|palaw|polao)\b/g, 'pulao');
  s = s.replace(/\b(nan|naans|nans)\b/g, 'naan');
  s = s.replace(/\b(rotis|rotiyan|rotian|chapati|chapatis)\b/g, 'roti');
  s = s.replace(/\b(barbq|bar b q|bar bq|bar-b-q|barbeque|barbecue)\b/g, 'bbq');
  s = s.replace(/\b(kebab|kabaabs|kbab|kababs)\b/g, 'kabab');
  s = s.replace(/\b(haandi|handee)\b/g, 'handi');
  s = s.replace(/\b(shinvari|shinwaree|shinwary)\b/g, 'shinwari');
  s = s.replace(/\b(colddrink|cold drink|drnk|cold-drink)\b/g, 'drink');
  s = s.replace(/\b(meetha|metha|mithai|dessert)\b/g, 'sweets');
  s = s.replace(/\b(kher|keer|kheere)\b/g, 'kheer');
  s = s.replace(/\b(paindah|sobaat)\b/g, 'sobat');
  s = s.replace(/\b(dumpukht|dampukht)\b/g, 'dum pukht');
  return s.replace(/\s+/g, ' ').trim();
}

// Levenshtein distance for fuzzy typo tolerance
export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Extract quantity from text (digits and Roman Urdu word numbers)
export function extractQuantity(text) {
  if (!text) return null;
  const t = text.toLowerCase().trim();

  // 1. Look for digits (e.g. "8 rotis", "10 roti", "2 biryani", "8")
  // Do NOT match "1.5" or "1 litre" as quantity if it's the drink size
  const digitMatch = t.match(/\b([1-9]\d?)\b(?!\s*(?:\.|\/|litre|ltr|l\b))/i);
  if (digitMatch) {
    return parseInt(digitMatch[1], 10);
  }

  // 2. Word numbers (Roman Urdu & English)
  const wordMap = {
    'ek': 1, 'aik': 1, 'one': 1,
    'do': 2, 'two': 2,
    'teen': 3, 'three': 3,
    'char': 4, 'chaar': 4, 'four': 4,
    'panch': 5, 'paanch': 5, 'five': 5,
    'che': 6, 'chhay': 6, 'six': 6,
    'saat': 7, 'seven': 7,
    'aath': 8, 'ath': 8, 'eight': 8,
    'nau': 9, 'no': 9, 'nine': 9,
    'das': 10, 'dus': 10, 'ten': 10,
    'gyarah': 11, 'barah': 12, 'terah': 13, 'chaudah': 14, 'pandrah': 15,
    'solah': 16, 'satrah': 17, 'atharah': 18, 'unnees': 19, 'bees': 20
  };

  for (const [word, val] of Object.entries(wordMap)) {
    const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
    if (wordRegex.test(t)) {
      return val;
    }
  }

  return null;
}

// Clean user input from common ordering filler words for cleaner matching
export function cleanOrderText(text) {
  let s = (text || '').toLowerCase();
  // Strip quantities already extracted
  s = s.replace(/\b([1-9]\d?)\b(?!\s*(?:\.|\/|litre|ltr|l\b))/gi, ' ');
  s = s.replace(/\b(ek|aik|one|do|two|teen|three|char|chaar|four|panch|paanch|five|che|chhay|six|saat|seven|aath|ath|eight|nau|no|nine|das|dus|ten)\b/gi, ' ');
  // Strip filler words
  s = s.replace(/\b(mujhe|humein|humay|chahiye|aur|bhi|la|do|doh|bhejo|karo|kar|dena|karein|order|please|plate|plates|piece|pieces|adad|packet)\b/gi, ' ');
  return s.replace(/\s+/g, ' ').trim();
}

// Flexible Matcher: returns { item, chosenSize, isAmbiguous, options, category }
export function matchMenuFlexible(text) {
  const raw = (text || '').trim();
  const lower = raw.toLowerCase();

  // If text is a table selection (e.g. "table 2", "2", "table 5"), DO NOT match as food!
  if (/^(table\s*\d+|\d+)$/i.test(raw)) {
    return null;
  }
  // Pure category keywords should be handled by category browsers, not item matchers!
  if (/^(karahi|handi|salan|biryani|pulao|rice|chawal|bbq|bar b q|barbq|drink|drinks|cold drink|colddrink|roti|naan|nan|sweets|sweet|meetha|dessert|desserts|platters|platter|deals|deal|salad|raita)$/i.test(raw)) {
    return null;
  }

  const cleaned = cleanOrderText(lower);
  const squashedCleaned = squashString(cleaned);
  const normalizedCleaned = normalizePhonetic(cleaned);
  const squashedNormalized = squashString(normalizedCleaned);

  // 1. Check for Ambiguous Category Mentions that have multiple specific variants
  // E.g. user typed "chicken karahi" or "chiken karahi" without specifying Shinwari / Butt / Afghani
  if (
    (squashedNormalized === 'chickenkarahi' || squashedNormalized === 'chikenkarahi') ||
    (/^(chicken\s+karahi|chiken\s+karahi)$/i.test(normalizedCleaned))
  ) {
    return {
      isAmbiguous: true,
      category: 'karahi',
      message: 'Humare paas Chicken Karahi ke yeh behtareen options hain. Aap kaunsi pasand karenge? 😊',
      options: [
        { label: '🍗 Chicken Shinwari', payload: 'chicken shinwari' },
        { label: '🍗 Chicken Butt Karahi', payload: 'chicken butt' },
        { label: '🍗 Chicken Afghani', payload: 'chicken afghani' },
        { label: '🍗 Desi Murgh Karahi', payload: 'desi murgh karahi' }
      ]
    };
  }

  // E.g. user typed "chicken handi" or "handi"
  if (
    squashedNormalized === 'chickenhandi' ||
    squashedNormalized === 'handi' ||
    /^(chicken\s+handi|handi)$/i.test(normalizedCleaned)
  ) {
    return {
      isAmbiguous: true,
      category: 'karahi',
      message: 'Humare paas Handi ke yeh options hain. Aap kaunsi pasand karenge? 😊',
      options: [
        { label: '🍲 Chicken White Handi', payload: 'white handi' },
        { label: '🍲 Chicken Makhni Handi', payload: 'makhni handi' }
      ]
    };
  }

  // E.g. user typed "seekh kabab" without specifying Chicken or Beef
  if (
    squashedNormalized === 'seekhkabab' ||
    squashedNormalized === 'seekhkebab' ||
    /^(seekh\s+kabab|seekh\s+kebab)$/i.test(normalizedCleaned)
  ) {
    return {
      isAmbiguous: true,
      category: 'bbq',
      message: 'Aapko Chicken Seekh Kabab chahiye ya Beef Seekh Kabab? 😊',
      options: [
        { label: '🍢 Chicken Seekh Kabab (Rs. 170)', payload: 'chicken seekh kabab' },
        { label: '🥩 Beef Seekh Kabab (Rs. 170)', payload: 'beef seekh kabab' }
      ]
    };
  }

  // 2. High-Priority Direct Matching across DEEWAN_MENU
  // Sort items by longest match first so specific items ("chicken shinwari", "roghni naan") match before generic ("naan", "roti")
  const sortedMenu = [...DEEWAN_MENU].sort((a, b) => {
    const maxA = Math.max(...a.aliases.map((al) => al.length));
    const maxB = Math.max(...b.aliases.map((al) => al.length));
    return maxB - maxA;
  });

  // Size indicators in the text
  const isHalf = /\b(half|choti|aadha|chota|h)\b/i.test(lower);
  const isFull = /\b(full|bari|bara|poori|f)\b/i.test(lower);
  const is15 = /\b(1\.5|1\.5ltr|1\.5litre|bari)\b/i.test(lower);
  const is1ltr = /\b(1ltr|1litre|1 litre)\b/i.test(lower);
  const isTin = /\b(tin|can|tinpack)\b/i.test(lower);

  let bestMatch = null;
  let bestScore = 0;

  for (const item of sortedMenu) {
    for (const alias of item.aliases) {
      const aliasSquashed = squashString(alias);
      const aliasNormalized = normalizePhonetic(alias);
      const aliasNormalizedSquashed = squashString(aliasNormalized);

      let score = 0;

      // Exact match
      if (lower === alias.toLowerCase() || cleaned === alias.toLowerCase()) {
        score = 100;
      }
      // Squashed match (e.g. "barbq" === "barbq", "chickenkarahi" === "chickenkarahi")
      else if (squashedCleaned === aliasSquashed || squashedNormalized === aliasNormalizedSquashed) {
        score = 95;
      }
      // Word boundary match in user input
      else if (new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(lower)) {
        score = 90;
      }
      // Word boundary match with normalized phonetic string
      else if (new RegExp(`\\b${aliasNormalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(normalizedCleaned)) {
        score = 88;
      }
      // Substring containment (both squashed)
      else if (
        aliasNormalizedSquashed.length >= 5 &&
        squashedNormalized.length >= 5 &&
        (squashedNormalized.includes(aliasNormalizedSquashed) || (aliasNormalizedSquashed.startsWith(squashedNormalized) && squashedNormalized.length >= 5))
      ) {
        score = 80;
      }
      // Levenshtein fuzzy match on squashed string
      else if (squashedNormalized.length >= 5 && aliasNormalizedSquashed.length >= 5) {
        const dist = levenshtein(squashedNormalized, aliasNormalizedSquashed);
        if (dist <= 1) {
          score = 75;
        } else if (dist <= 2 && squashedNormalized.length >= 7) {
          score = 70;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }
  }

  if (bestScore >= 70 && bestMatch) {
    let chosenSize = null;
    if (bestMatch.hasSizes) {
      if (isHalf && bestMatch.sizes?.half) chosenSize = bestMatch.sizes.half;
      else if (isFull && bestMatch.sizes?.full) chosenSize = bestMatch.sizes.full;
      else if (is15 && bestMatch.sizes?.['1.5ltr']) chosenSize = bestMatch.sizes['1.5ltr'];
      else if (is1ltr && bestMatch.sizes?.['1ltr']) chosenSize = bestMatch.sizes['1ltr'];
      else if (isTin && bestMatch.sizes?.tin) chosenSize = bestMatch.sizes.tin;
    }
    return {
      isAmbiguous: false,
      item: bestMatch,
      chosenSize,
      score: bestScore
    };
  }

  return null;
}

// -------------------------------------------------------------
// MENU KNOWLEDGE BASE (Q&A for platters, specials, differences)
// -------------------------------------------------------------

export function handleMenuQuestions(lowerText) {
  const t = lowerText.toLowerCase();

  // 1a. Special Platters Inquiry
  if (
    t.includes('platter') ||
    t.includes('platters') ||
    t.includes('what is included in this platter') ||
    t.includes('platter mein kya') ||
    t.includes('platter me kya') ||
    t.includes('platter detail') ||
    t.includes('special platter')
  ) {
    if (!/^\s*(half|full)\s+(deewan\s+)?(special\s+)?platter\s*$/i.test(t)) {
      return {
        reply:
          `👑 *DEEWAN SPECIAL PLATTER (DETAILS)*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Deewan-E-Khaas ka shaandar platter 2 sizes mein pesh kiya jata hai:\n\n` +
          `🍲 *1. Full Special Platter* ── Rs. 7,999 (6–8 Afrad)\n` +
          `   • 🍢 Chicken Malai Boti (10 Pcs)\n` +
          `   • 🍢 Chicken Seekh Kabab (4 Pcs)\n` +
          `   • 🍢 Beef Seekh Kabab (4 Pcs)\n` +
          `   • 🍢 Chicken Tikka Boti (10 Pcs)\n` +
          `   • 🍢 Seekh Boti (4 Pcs)\n` +
          `   • 🐟 Tawa Fish (1 KG) ya 🍚 Kabuli Pulao (2 Plates)\n` +
          `   • 🥩 Chapli Kabab (2 Pcs)\n` +
          `   • 🍗 BBQ Batair (1 Pc)\n` +
          `   • 🥣 Mini Raita (2)\n\n` +
          `🍲 *2. Half Special Platter* ── Rs. 4,799 (3–4 Afrad)\n` +
          `   • 🍢 Chicken Malai Boti (5 Pcs)\n` +
          `   • 🍢 Chicken Seekh Kabab (2 Pcs)\n` +
          `   • 🍢 Beef Seekh Kabab (2 Pcs)\n` +
          `   • 🍢 Chicken Tikka Boti (5 Pcs)\n` +
          `   • 🍢 Seekh Boti (2 Pcs)\n` +
          `   • 🐟 Tawa Fish (1/2 KG) ya 🍚 Kabuli Pulao (1 Plate)\n` +
          `   • 🥩 Chapli Kabab (1 Pc)\n` +
          `   • 🍗 BBQ Batair (1 Pc)\n` +
          `   • 🥣 Mini Raita (1)\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Aap kaunsa Platter order karna chahenge? 😊`,
        buttons: [
          { label: '👑 Half Platter (Rs. 4,799)', payload: 'half deewan special platter' },
          { label: '👑 Full Platter (Rs. 7,999)', payload: 'full deewan special platter' },
          { label: '🔥 Deals dekhein', payload: 'deals' },
          { label: '📜 Poora Menu', payload: 'menu' }
        ]
      };
    }
  }

  // 1b. Deals Inquiry
  if (
    t.includes('deal') ||
    t.includes('deals') ||
    t.includes('what items come with this deal') ||
    t.includes('deal mein kya') ||
    t.includes('deals kya hain') ||
    t.includes('konsi deal') ||
    t.includes('deals dikhao')
  ) {
    if (!/^\s*(deal\s+[123]|.*(family feast|bbq delight|shinwari special).*)\s*$/i.test(t)) {
      return {
        reply:
          `🔥 *DEEWAN-E-KHAAS SPECIAL DEALS*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Humare paas yeh 3 mashhoor aur pur-takalluf Deals dastyab hain:\n\n` +
          `🔥 *1. Deewan Family Feast Deal* ── Rs. 4,999 (4–5 Afrad)\n` +
          `   • 🍗 1x Chicken Shinwari Karahi (Full)\n` +
          `   • 🍢 4x Chicken Seekh Kabab\n` +
          `   • 🍛 1x Kabuli Pulao\n` +
          `   • 🫓 6x Roti (Fine Wheat)\n` +
          `   • 🍾 1x Cold Drink 1.5 Ltr\n` +
          `   • 🥗 2x Fresh Salad & Raita\n\n` +
          `🔥 *2. Deewan BBQ Delight Deal* ── Rs. 2,999 (2–3 Afrad)\n` +
          `   • 🍗 1x Chicken Tikka (Leg/Chest)\n` +
          `   • 🍢 2x Chicken Seekh Kabab\n` +
          `   • 🥩 2x Beef Seekh Kabab\n` +
          `   • 🍢 1x Chicken Malai Boti (Plate)\n` +
          `   • 🧈 4x Roghni Naan\n` +
          `   • 🥫 2x Tin Pack Cold Drinks\n` +
          `   • 🥣 1x Raita & Mint Sauce\n\n` +
          `🔥 *3. Deewan Shinwari Special Deal* ── Rs. 3,899 (3–4 Afrad)\n` +
          `   • 🍗 1x Chicken Shinwari Karahi (Full)\n` +
          `   • 🍚 1x Chicken Biryani\n` +
          `   • 🥖 4x Peshawari Naan\n` +
          `   • 🍾 1x Cold Drink 1.5 Ltr\n` +
          `   • 🥗 1x Fresh Salad & Raita\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Aap kaunsi Deal order karna chahenge? 😊`,
        buttons: [
          { label: '🔥 Family Feast Deal', payload: 'deewan family feast deal' },
          { label: '🔥 BBQ Delight Deal', payload: 'deewan bbq delight deal' },
          { label: '🔥 Shinwari Deal', payload: 'deewan shinwari special deal' },
          { label: '👑 Special Platters', payload: 'platters' }
        ]
      };
    }
  }

  // 2. Shinwari vs Butt Karahi Comparison
  if (
    (t.includes('shinwari') && t.includes('butt')) ||
    t.includes('farq') ||
    t.includes('difference') ||
    t.includes('difference between')
  ) {
    return {
      reply:
        `🍗 *SHINWARI VS BUTT KARAHI FARQ:*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `▫️ *Shinwari Karahi (Namak Mandi Style):*\n` +
        `Yeh bilkul fresh tamatar, sabz mirch, namak aur khalis charbi/ghee mein baghair kisi masalay ke pakayi jati hai. Iska taste bilkul natural, juicy aur mild hota hai.\n\n` +
        `▫️ *Butt Karahi (Lahori / Gujranwala Style):*\n` +
        `Yeh makhan (pure butter/desi ghee), pyaz, gravy aur khushbodar masalon ke sath thori masaledar (spicy) aur rich gravy mein banti hai.\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Aapko kaunsi karahi pasand ayegi? 😊`,
      buttons: [
        { label: '🍗 Chicken Shinwari', payload: 'chicken shinwari' },
        { label: '🥩 Mutton Shinwari', payload: 'mutton shinwari' },
        { label: '🍗 Chicken Butt', payload: 'chicken butt' },
        { label: '🥩 Mutton Butt', payload: 'mutton butt' }
      ]
    };
  }

  // 3. Sobat / Painda Explanation
  if (t.includes('sobat') || t.includes('painda')) {
    if (!t.match(/\b(half|full|order|plate|chahiye|do|ek|1|2)\b/)) {
      return {
        reply:
          `🍲 *DESI MURGH SOBAT (PAINDA)* ── Rs. 3,399\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Sobat (Painda) Dera Ismail Khan aur Marwat ki riwayati aur sab se mashhoor tareen saugaat hai!\n\n` +
          `Is mein khalis Desi Murgh ka lazeez, khushbodar aur garma-garam shorba tayyar kiya jata hai, aur patli khamiri rotian hath se tod kar shorbe mein bhigo di jati hain. Upar desi murgh ke taze pieces sajaye jate hain. 3 se 4 afrad ke liye behtareen meal hai!\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Kya aap Desi Sobat (Painda) order karna chahenge? 😊`,
        buttons: [
          { label: '🍲 Haan, Sobat order karein', payload: 'desi murgh sobat' },
          { label: '📜 Mazeed Menu dekhein', payload: 'menu' }
        ]
      };
    }
  }

  // 4. Mutton Dum Pukht Explanation
  if (t.includes('dum pukht') || t.includes('dumpukht')) {
    if (!t.match(/\b(order|chahiye|do|ek|1|2)\b/)) {
      return {
        reply:
          `🥩 *MUTTON DUM PUKHT* ── Rs. 3,400\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Dum Pukht Namak Mandi ki tareekhi aur pur-lutf dish hai!\n\n` +
          `Is mein taza bakre ka gosht aalu, namak aur sabz mirch ke sath aate se seal shuda band handi mein halki aanch par dum par pakaya jata hai. Gosht apne hi qudrati roghan aur bhaap mein pighal kar nihayat narm aur lazeez ho jata hai.\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Kya aap Mutton Dum Pukht order karna chahenge? 😊`,
        buttons: [
          { label: '🥩 Haan, Dum Pukht order karein', payload: 'mutton dum pukht' },
          { label: '📜 Mazeed Menu dekhein', payload: 'menu' }
        ]
      };
    }
  }

  // 5. White Handi Explanation
  if (t.includes('white handi')) {
    if (!t.match(/\b(half|full|order|chahiye|do|ek|1|2)\b/)) {
      return {
        reply:
          `🍲 *CHICKEN WHITE HANDI*\n` +
          `   ├─ 🥣 Half: Rs. 970\n` +
          `   └─ 🍲 Full: Rs. 1,890\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Yeh dish boneless chicken, taza cream, dahi, safaid mirch (white pepper), aur kaju-badam ke paste ke sath tayyar ki jati hai. Yeh bilkul non-spicy, creamy aur makhmali hoti hai (bacchon aur mild pasand karne walon ke liye perfect)! 😊`,
        buttons: [
          { label: '🥣 Half White Handi', payload: 'half chicken white handi' },
          { label: '🍲 Full White Handi', payload: 'full chicken white handi' },
          { label: '📜 Poora Menu', payload: 'menu' }
        ]
      };
    }
  }

  // 6. Meter Kabab Explanation
  if (t.includes('meter kabab')) {
    if (!t.match(/\b(order|chahiye|do|ek|1|2)\b/)) {
      return {
        reply:
          `🍢 *METER KABAB* ── Rs. 899\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Meter Kabab Deewan-E-Khaas ki special bar b q peshkash hai! Yeh aik poora meter lamba seekh kabab hota hai jo koylon par slow-grill kiya jata hai aur khas lakdi ke platter par pesh hota hai. Doston aur family sharing ke liye behtareen hai! 😊`,
        buttons: [
          { label: '🍢 Haan, Meter Kabab order karein', payload: 'meter kabab' },
          { label: '🍢 Mazeed Bar B Q', payload: 'bbq' }
        ]
      };
    }
  }

  // 7. General Recommendations & "Special kya hai"
  if (
    t.includes('recommend') ||
    t.includes('mashhoor') ||
    t.includes('special kya') ||
    t.includes('kya acha') ||
    t.includes('best dish') ||
    t.includes('sab se acha') ||
    t.includes('kya khayein')
  ) {
    return {
      reply:
        `⭐ *DEEWAN-E-KHAAS KI TOP SELLER DISHES:*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `1. 🍗 *Chicken Shinwari Karahi* ── Half Rs. 950 | Full Rs. 1,799\n` +
        `2. 👑 *Deewan Special Platter* ── Half Rs. 4,799 | Full Rs. 7,999\n` +
        `3. 🍲 *Desi Murgh Sobat (Painda)* ── Rs. 3,399\n` +
        `4. 🍛 *Kabuli Pulao* ── Rs. 880\n` +
        `5. 🍨 *Shahi Kheer & Molten Lava*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Aap kya pasand karenge? 😊`,
      buttons: [
        { label: '🍗 Chicken Shinwari', payload: 'chicken shinwari' },
        { label: '👑 Special Platter', payload: 'deewan special platter' },
        { label: '🍛 Kabuli Pulao', payload: 'kabuli pulao' },
        { label: '🍨 Sweets', payload: 'sweets' }
      ]
    };
  }

  // 8. Spice Level / Mild / Kids Inquiries
  if (
    t.includes('mild') ||
    t.includes('baccho') ||
    t.includes('bacchon') ||
    t.includes('kids') ||
    t.includes('spicy nahi') ||
    t.includes('teekha nahi') ||
    t.includes('kam mirch')
  ) {
    return {
      reply:
        `👶 *MILD & LESS-SPICY OPTIONS:*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Bacchon aur mild pasand karne walon ke liye humare paas yeh behtareen options hain:\n\n` +
        `▫️ *Chicken White Handi* (Creamy & rich, no chili)\n` +
        `▫️ *Chicken Malai Boti* (Juicy & soft mild BBQ)\n` +
        `▫️ *Kabuli Pulao* (Mithas-bhari gajar & kishmish pulao)\n` +
        `▫️ *Egg Fried Rice* (Halkay masalay ke chawal)\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Kaunsa item order karna chahenge? 😊`,
      buttons: [
        { label: '🍲 White Handi', payload: 'white handi' },
        { label: '🍢 Malai Boti', payload: 'malai boti' },
        { label: '🍛 Kabuli Pulao', payload: 'kabuli pulao' },
        { label: '🍨 Sweets', payload: 'sweets' }
      ]
    };
  }

  // 9. Specific Price & Rate Query (e.g. "Shinwari Karahi kitny ki hai?", "biryani price", "roti rate")
  const isPriceQuery = /\b(price|rate|cost|kitny|kitne|kitna|kitnay|kitni|paise|pese|rupay|rupaye|bhao|hisab|charges|how much)\b/i.test(t) ||
    /(?:kitny|kitne|kitna|kitnay|kitni)\s+k[aie]\s+(?:hai|hain)/i.test(t);

  if (isPriceQuery) {
    // 9a. Check for generic category price queries first
    if (t.includes('shinwari')) {
      return {
        reply:
          `💰 *SHINWARI KARAHI PRICING:*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `🍗 *Chicken Shinwari Karahi:*\n` +
          `   ├─ 🥣 *Half*: Rs. 950\n` +
          `   └─ 🍲 *Full*: Rs. 1,799\n\n` +
          `🥩 *Mutton Shinwari Karahi:*\n` +
          `   ├─ 🥣 *Half*: Rs. 1,799\n` +
          `   └─ 🍲 *Full*: Rs. 3,399\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Yeh bilkul fresh tamatar aur namak mein banti hai. Kaunsi Karahi order karna chahenge? 😊`,
        buttons: [
          { label: '🍗 Half Chicken Shinwari (Rs. 950)', payload: 'half chicken shinwari karahi' },
          { label: '🍗 Full Chicken Shinwari (Rs. 1,799)', payload: 'full chicken shinwari karahi' },
          { label: '🥩 Half Mutton Shinwari (Rs. 1,799)', payload: 'half mutton shinwari karahi' },
          { label: '🥩 Full Mutton Shinwari (Rs. 3,399)', payload: 'full mutton shinwari karahi' }
        ]
      };
    }

    if (t.includes('butt')) {
      return {
        reply:
          `💰 *BUTT KARAHI PRICING:*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `🍗 *Chicken Butt Karahi:*\n` +
          `   ├─ 🥣 *Half*: Rs. 1,020\n` +
          `   └─ 🍲 *Full*: Rs. 1,850\n\n` +
          `🥩 *Mutton Butt Karahi:*\n` +
          `   ├─ 🥣 *Half*: Rs. 1,820\n` +
          `   └─ 🍲 *Full*: Rs. 3,450\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Makhan aur desi ghee mein tayyar ki jati hai. Kaunsi Karahi order karein? 😊`,
        buttons: [
          { label: '🍗 Half Chicken Butt (Rs. 1,020)', payload: 'half chicken butt karahi' },
          { label: '🍗 Full Chicken Butt (Rs. 1,850)', payload: 'full chicken butt karahi' },
          { label: '🥩 Half Mutton Butt (Rs. 1,820)', payload: 'half mutton butt karahi' },
          { label: '🥩 Full Mutton Butt (Rs. 3,450)', payload: 'full mutton butt karahi' }
        ]
      };
    }

    if (t.includes('handi')) {
      return {
        reply:
          `💰 *CHICKEN HANDI PRICING:*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `🍲 *Chicken White Handi:*\n` +
          `   ├─ 🥣 *Half*: Rs. 970\n` +
          `   └─ 🍲 *Full*: Rs. 1,890\n\n` +
          `🍲 *Chicken Makhni Handi:*\n` +
          `   ├─ 🥣 *Half*: Rs. 990\n` +
          `   └─ 🍲 *Full*: Rs. 1,850\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Kaunsi Handi order karna chahenge? 😊`,
        buttons: [
          { label: '🥣 Half White Handi (Rs. 970)', payload: 'half chicken white handi' },
          { label: '🍲 Full White Handi (Rs. 1,890)', payload: 'full chicken white handi' },
          { label: '🥣 Half Makhni Handi (Rs. 990)', payload: 'half chicken makhni handi' },
          { label: '🍲 Full Makhni Handi (Rs. 1,850)', payload: 'full chicken makhni handi' }
        ]
      };
    }

    if (t.includes('biryani') || (t.includes('rice') && !t.includes('fried'))) {
      return {
        reply:
          `💰 *BIRYANI & PULAO PRICING:*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `▫️ *Chicken Biryani* ── Rs. 900\n` +
          `▫️ *Kabuli Pulao* ── Rs. 880\n` +
          `▫️ *Simple Biryani* ── Rs. 500\n` +
          `▫️ *Simple Pulao* ── Rs. 450\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Aap kya order karna chahenge? 😊`,
        buttons: [
          { label: '🍗 Chicken Biryani (Rs. 900)', payload: 'chicken biryani' },
          { label: '🍛 Kabuli Pulao (Rs. 880)', payload: 'kabuli pulao' },
          { label: '🍚 Simple Biryani (Rs. 500)', payload: 'simple biryani' },
          { label: '🍚 Simple Pulao (Rs. 450)', payload: 'simple pulao' }
        ]
      };
    }

    if (t.includes('roti') || t.includes('naan') || t.includes('nan')) {
      return {
        reply:
          `💰 *ROTI & NAAN PRICING:*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `▫️ *Roti (Fine Wheat)* ── Rs. 30\n` +
          `▫️ *Peshawari Naan* ── Rs. 40\n` +
          `▫️ *Roghni Naan* ── Rs. 80\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Kaunsi aur kitni roti / naan chahiye? (maslan: "8 rotis" ya "4 roghni naan") 😊`,
        buttons: [
          { label: '🫓 Roti (Rs. 30)', payload: 'roti' },
          { label: '🥖 Peshawari Naan (Rs. 40)', payload: 'peshawari naan' },
          { label: '🧈 Roghni Naan (Rs. 80)', payload: 'roghni naan' }
        ]
      };
    }

    if (t.includes('drink') || t.includes('coke') || t.includes('cold drink') || t.includes('pepsi') || t.includes('sprite')) {
      return {
        reply:
          `💰 *COLD DRINK PRICING:*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `▫️ *Tin Pack (Can)* ── Rs. 140\n` +
          `▫️ *1 Litre Bottle* ── Rs. 190\n` +
          `▫️ *1.5 Litre Bottle* ── Rs. 250\n` +
          `▫️ *Diet Tin* ── Rs. 150\n` +
          `▫️ *Mineral Water (Small)* ── Rs. 60\n` +
          `▫️ *Mineral Water (Large)* ── Rs. 120\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Kaunsa drink add karna chahenge? 😊`,
        buttons: [
          { label: '🥫 Tin Pack (Rs. 140)', payload: 'tin pack' },
          { label: '🍾 1.5 Litre (Rs. 250)', payload: '1.5 litre' },
          { label: '🍾 1 Litre (Rs. 190)', payload: '1 litre' },
          { label: '💧 Water Large (Rs. 120)', payload: 'mineral water large' }
        ]
      };
    }

    // 9b. Check matching specific menu item
    for (const item of DEEWAN_MENU) {
      const match = item.aliases.find((a) => t.includes(a));
      if (match) {
        if (item.hasSizes) {
          const sizeText = Object.values(item.sizes)
            .map((s) => `   ├─ 🥣 *${s.label}*: Rs. ${s.price.toLocaleString()}`)
            .join('\n');
          return {
            reply:
              `💰 *${item.name.toUpperCase()} PRICING:*\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
              `${sizeText}\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
              `Kya aap iska order karna chahenge? 😊`,
            buttons: Object.values(item.sizes).map((s) => ({
              label: `${s.label} (Rs. ${s.price.toLocaleString()})`,
              payload: `${s.label.toLowerCase()} ${item.name.toLowerCase()}`
            }))
          };
        } else {
          return {
            reply:
              `💰 *${item.name}* ki qeemat *Rs. ${item.price.toLocaleString()}* per ${item.unit || 'Portion'} hai.\n\n` +
              `Kya aap isay order karna chahenge? 😊`,
            buttons: [
              { label: `➕ Order ${item.name}`, payload: item.name.toLowerCase() },
              { label: '📜 Mazeed Menu dekhein', payload: 'menu' }
            ]
          };
        }
      }
    }
  }

  // 10. Availability Query (e.g. "kya biryani available hai?", "mutton karahi mil jayegi?")
  if (
    /\b(available|dastyab|mil\s*jayeg[ai]|milta\s*hai|milti\s*hai|hai\s*kya|hai\s*bhi|milay\s*ga|milay\s*gi)\b/i.test(t)
  ) {
    for (const item of DEEWAN_MENU) {
      const match = item.aliases.find((a) => t.includes(a));
      if (match) {
        const priceStr = item.hasSizes
          ? `Half Rs. ${item.sizes.half?.price?.toLocaleString()} | Full Rs. ${item.sizes.full?.price?.toLocaleString()}`
          : `Rs. ${item.price?.toLocaleString()}`;
        return {
          reply:
            `✅ Ji haan! *${item.name}* Deewan-E-Khaas mein bilkul taza aur garam garam available hai!\n\n` +
            `💰 *Qeemat:* ${priceStr}\n\n` +
            `Kya aap isay order karna chahenge? 😊`,
          buttons: [
            { label: `➕ Haan, ${item.name} order karein`, payload: item.name.toLowerCase() },
            { label: '📜 Poora Menu', payload: 'menu' }
          ]
        };
      }
    }
  }

  return null;
}

// Helper to handle pure category menu browsing directly
export function handleCategoryMenu(lowerText, state, isBroad = false) {
  const lower = (lowerText || '').trim().toLowerCase();

  // 1. Platters
  if (/^(platters|platter|special platters|special platter|platter menu|platters menu)$/i.test(lower) || (isBroad && /platter/i.test(lower))) {
    state.lastCategory = 'platters';
    return {
      reply:
        `👑 *DEEWAN SPECIAL PLATTERS*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Deewan-E-Khaas ka shaandar Bar B Q platter:\n\n` +
        `🍲 *1. Full Special Platter* ── Rs. 7,999 (6–8 Afrad)\n` +
        `   • 🍢 Chicken Malai Boti (10 Pcs)\n` +
        `   • 🍢 Chicken Seekh Kabab (4 Pcs)\n` +
        `   • 🍢 Beef Seekh Kabab (4 Pcs)\n` +
        `   • 🍢 Chicken Tikka Boti (10 Pcs)\n` +
        `   • 🍢 Seekh Boti (4 Pcs)\n` +
        `   • 🐟 Tawa Fish (1 KG) ya 🍚 Kabuli Pulao (2 Plates)\n` +
        `   • 🥩 Chapli Kabab (2 Pcs)\n` +
        `   • 🍗 BBQ Batair (1 Pc)\n` +
        `   • 🥣 Mini Raita (2)\n\n` +
        `🍲 *2. Half Special Platter* ── Rs. 4,799 (3–4 Afrad)\n` +
        `   • 🍢 Chicken Malai Boti (5 Pcs)\n` +
        `   • 🍢 Chicken Seekh Kabab (2 Pcs)\n` +
        `   • 🍢 Beef Seekh Kabab (2 Pcs)\n` +
        `   • 🍢 Chicken Tikka Boti (5 Pcs)\n` +
        `   • 🍢 Seekh Boti (2 Pcs)\n` +
        `   • 🐟 Tawa Fish (1/2 KG) ya 🍚 Kabuli Pulao (1 Plate)\n` +
        `   • 🥩 Chapli Kabab (1 Pc)\n` +
        `   • 🍗 BBQ Batair (1 Pc)\n` +
        `   • 🥣 Mini Raita (1)\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Aap kaunsa Platter order karna chahenge? 😊`,
      buttons: [
        { label: '👑 Half Platter (Rs. 4,799)', payload: 'half deewan special platter' },
        { label: '👑 Full Platter (Rs. 7,999)', payload: 'full deewan special platter' },
        { label: '🔥 Deals dekhein', payload: 'deals' },
        { label: '📜 Poora Menu', payload: 'menu' }
      ],
      sessionState: state
    };
  }

  // 2. Deals
  if (/^(deals|deal|special deals|special deal|deals menu)$/i.test(lower) || (isBroad && /deal/i.test(lower))) {
    state.lastCategory = 'deals';
    return {
      reply:
        `🔥 *DEEWAN-E-KHAAS SPECIAL DEALS*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Peshkash hai Deewan ki 3 behtareen aur economical Deals:\n\n` +
        `🔥 *1. Deewan Family Feast Deal* ── Rs. 4,999 (4–5 Afrad)\n` +
        `   • 🍗 1x Chicken Shinwari Karahi (Full)\n` +
        `   • 🍢 4x Chicken Seekh Kabab\n` +
        `   • 🍛 1x Kabuli Pulao\n` +
        `   • 🫓 6x Roti (Fine Wheat)\n` +
        `   • 🍾 1x Cold Drink 1.5 Ltr\n` +
        `   • 🥗 2x Fresh Salad & Raita\n\n` +
        `🔥 *2. Deewan BBQ Delight Deal* ── Rs. 2,999 (2–3 Afrad)\n` +
        `   • 🍗 1x Chicken Tikka (Leg/Chest)\n` +
        `   • 🍢 2x Chicken Seekh Kabab\n` +
        `   • 🥩 2x Beef Seekh Kabab\n` +
        `   • 🍢 1x Chicken Malai Boti (Plate)\n` +
        `   • 🧈 4x Roghni Naan\n` +
        `   • 🥫 2x Tin Pack Cold Drinks\n` +
        `   • 🥣 1x Raita & Mint Sauce\n\n` +
        `🔥 *3. Deewan Shinwari Special Deal* ── Rs. 3,899 (3–4 Afrad)\n` +
        `   • 🍗 1x Chicken Shinwari Karahi (Full)\n` +
        `   • 🍚 1x Chicken Biryani\n` +
        `   • 🥖 4x Peshawari Naan\n` +
        `   • 🍾 1x Cold Drink 1.5 Ltr\n` +
        `   • 🥗 1x Fresh Salad & Raita\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Kaunsi deal order karna chahenge? 😊`,
      buttons: [
        { label: '🔥 Family Feast Deal', payload: 'deewan family feast deal' },
        { label: '🔥 BBQ Delight Deal', payload: 'deewan bbq delight deal' },
        { label: '🔥 Shinwari Deal', payload: 'deewan shinwari special deal' },
        { label: '👑 Special Platters', payload: 'platters' }
      ],
      sessionState: state
    };
  }

  // 3. Karahi & Handi
  if (/^(karahi|handi|salan|gravy|karahis|karahi menu|handi menu)$/i.test(lower) || (isBroad && /karahi|handi|sobat|salan|gravy/i.test(lower))) {
    state.lastCategory = 'karahi';
    return {
      reply:
        `🍗 *DEEWAN KARAHI & HANDI SPECIALS*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Prices & sizes compare karein:\n\n` +
        `🍲 *1. Chicken Shinwari Karahi*\n` +
        `   ├─ 🥣 Half: Rs. 950\n` +
        `   └─ 🍲 Full: Rs. 1,799\n\n` +
        `🍲 *2. Mutton Shinwari Karahi*\n` +
        `   ├─ 🥣 Half: Rs. 1,799\n` +
        `   └─ 🍲 Full: Rs. 3,399\n\n` +
        `🍲 *3. Chicken Butt Karahi*\n` +
        `   ├─ 🥣 Half: Rs. 1,020\n` +
        `   └─ 🍲 Full: Rs. 1,850\n\n` +
        `🍲 *4. Mutton Butt Karahi*\n` +
        `   ├─ 🥣 Half: Rs. 1,820\n` +
        `   └─ 🍲 Full: Rs. 3,450\n\n` +
        `🍲 *5. Chicken Afghani Karahi*\n` +
        `   ├─ 🥣 Half: Rs. 1,020\n` +
        `   └─ 🍲 Full: Rs. 1,880\n\n` +
        `🍲 *6. Mutton Afghani Karahi*\n` +
        `   ├─ 🥣 Half: Rs. 1,870\n` +
        `   └─ 🍲 Full: Rs. 3,550\n\n` +
        `🍲 *7. Chicken White Handi*\n` +
        `   ├─ 🥣 Half: Rs. 970\n` +
        `   └─ 🍲 Full: Rs. 1,890\n\n` +
        `🍲 *8. Chicken Makhni Handi*\n` +
        `   ├─ 🥣 Half: Rs. 990\n` +
        `   └─ 🍲 Full: Rs. 1,850\n\n` +
        `🍲 *9. Desi Murgh Karahi*\n` +
        `   └─ 🍲 Full: Rs. 3,300\n\n` +
        `🍲 *10. Desi Murgh Sobat (Painda)*\n` +
        `   └─ 🍲 Full: Rs. 3,399\n\n` +
        `🍲 *11. Mutton Dum Pukht*\n` +
        `   └─ 🍲 Full: Rs. 3,400\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Aap kaunsi order karna chahenge? 😊`,
      buttons: [
        { label: '🍗 Chicken Shinwari', payload: 'chicken shinwari' },
        { label: '🥩 Mutton Shinwari', payload: 'mutton shinwari' },
        { label: '🍗 Chicken Butt', payload: 'chicken butt' },
        { label: '🥩 Mutton Butt', payload: 'mutton butt' },
        { label: '🍲 White Handi', payload: 'white handi' },
        { label: '🍲 Makhni Handi', payload: 'makhni handi' },
        { label: '🍗 Desi Sobat', payload: 'desi murgh sobat' },
        { label: '🥩 Dum Pukht', payload: 'mutton dum pukht' }
      ],
      sessionState: state
    };
  }

  // 4. Rice & Biryani
  if (/^(biryani|pulao|rice|chawal|biryanis|rice menu|biryani menu)$/i.test(lower) || (isBroad && /biryani|pulao|rice|chawal/i.test(lower))) {
    state.lastCategory = 'rice';
    return {
      reply:
        `🍚 *DEEWAN RICE & BIRYANI MENU*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Humare paas yeh taza biryani & pulao dastyab hain:\n\n` +
        `▫️ *1. Chicken Biryani* ── Rs. 900\n` +
        `▫️ *2. Kabuli Pulao* ── Rs. 880\n` +
        `▫️ *3. Chicken Fried Rice* ── Rs. 850\n` +
        `▫️ *4. Egg Fried Rice* ── Rs. 580\n` +
        `▫️ *5. Vegetable Fried Rice* ── Rs. 570\n` +
        `▫️ *6. Simple Biryani* ── Rs. 500\n` +
        `▫️ *7. Simple Pulao* ── Rs. 450\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Aap kaunsi order karna chahenge? 😊`,
      buttons: [
        { label: '🍗 Chicken Biryani', payload: 'chicken biryani' },
        { label: '🍛 Kabuli Pulao', payload: 'kabuli pulao' },
        { label: '🍚 Chicken Fried Rice', payload: 'chicken fried rice' },
        { label: '🍳 Egg Fried Rice', payload: 'egg fried rice' },
        { label: '🥗 Veg Fried Rice', payload: 'vegetable fried rice' },
        { label: '🍚 Simple Biryani', payload: 'simple biryani' }
      ],
      sessionState: state
    };
  }

  // 5. BBQ
  if (/^(bbq|bar b q|barbq|bar bq|bbq menu|barbq menu)$/i.test(lower) || (isBroad && /bbq|bar b q|barbq|bar bq|tikka|kabab|kebab|boti/i.test(lower))) {
    state.lastCategory = 'bbq';
    return {
      reply:
        `🍢 *DEEWAN BAR B Q & TIKKA*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Lazeez koylon par tayyar karda Bar B Q:\n\n` +
        `▫️ *1. Chicken Tikka Leg Pc* ── Rs. 375\n` +
        `▫️ *2. Chicken Tikka Chest Pc* ── Rs. 399\n` +
        `▫️ *3. Chicken Tikka Boti* ── Rs. 410\n` +
        `▫️ *4. Chicken Malai Boti* ── Rs. 530\n` +
        `▫️ *5. Chicken Kalmi Tikka* ── Rs. 499\n` +
        `▫️ *6. Chicken Seekh Kabab* ── Rs. 170\n` +
        `▫️ *7. Beef Seekh Kabab* ── Rs. 170\n` +
        `▫️ *8. Chicken Reshmi Kabab* ── Rs. 190\n` +
        `▫️ *9. Meter Kabab* ── Rs. 899\n` +
        `▫️ *10. BBQ Batair (1 Pc)* ── Rs. 250\n` +
        `▫️ *11. Chicken Angara (Full)* ── Rs. 1,450\n` +
        `▫️ *12. Chapli Kabab* ── Rs. 170\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Kaunsa Bar B Q pasand karenge? 😊`,
      buttons: [
        { label: '🍗 Tikka Leg', payload: 'chicken tikka leg' },
        { label: '🍗 Tikka Chest', payload: 'chicken tikka chest' },
        { label: '🍢 Malai Boti', payload: 'malai boti' },
        { label: '🍢 Chicken Seekh Kabab', payload: 'chicken seekh kabab' },
        { label: '🥩 Beef Seekh Kabab', payload: 'beef seekh kabab' },
        { label: '🍢 Meter Kabab', payload: 'meter kabab' },
        { label: '🍗 BBQ Batair', payload: 'bbq batair' },
        { label: '🥩 Chapli Kabab', payload: 'chapli kabab' }
      ],
      sessionState: state
    };
  }

  // 6. Cold Drinks
  if (/^(cold drink|colddrink|drinks|drink|beverages|beverage|drinks menu|cold drink menu)$/i.test(lower) || (isBroad && /cold drink|drink|beverage|pepsi|coke|sprite|fanta|pani|water/i.test(lower))) {
    state.lastCategory = 'drinks';
    return {
      reply:
        `🥤 *DEEWAN COLD DRINKS & REFRESHMENTS*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `▫️ *Coke / Sprite / Fanta*\n` +
        `   ├─ 🥫 Tin Pack: Rs. 140\n` +
        `   ├─ 🍾 1 Litre: Rs. 190\n` +
        `   └─ 🍾 1.5 Litre: Rs. 250\n\n` +
        `▫️ *Diet Tin (Coke Zero)* ── Rs. 150\n` +
        `▫️ *Mineral Water (Small)* ── Rs. 60\n` +
        `▫️ *Mineral Water (Large)* ── Rs. 120\n` +
        `▫️ *Lassi Glass (Sweet / Salt)* ── Rs. 150\n` +
        `▫️ *Lassi Jug (Sweet / Salt)* ── Rs. 450\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Kaunsa drink pasand karenge? 😊`,
      buttons: [
        { label: '🥫 Coke Tin (Rs. 140)', payload: 'tin pack' },
        { label: '🍾 Coke 1.5 Ltr (Rs. 250)', payload: '1.5 litre' },
        { label: '🍾 Coke 1 Ltr (Rs. 190)', payload: '1 litre' },
        { label: '🥤 Diet Tin (Rs. 150)', payload: 'diet tin' },
        { label: '💧 Water Large (Rs. 120)', payload: 'mineral water large' },
        { label: '💧 Water Small (Rs. 60)', payload: 'mineral water small' },
        { label: '🥛 Lassi Glass (Rs. 150)', payload: 'lassi glass' },
        { label: '🥛 Lassi Jug (Rs. 450)', payload: 'lassi jug' }
      ],
      sessionState: state
    };
  }

  // 7. Tandoor
  if (/^(roti|naan|nan|rotis|naans|tandoor|roti menu|naan menu)$/i.test(lower) || (isBroad && /roti|naan|nan/i.test(lower))) {
    state.lastCategory = 'tandoor';
    return {
      reply:
        `🫓 *DEEWAN TANDOOR & FRESH NAAN*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `▫️ *1. Roti (Fine Wheat)* ── Rs. 30 (Piece)\n` +
        `▫️ *2. Peshawari Naan* ── Rs. 40 (Piece)\n` +
        `▫️ *3. Roghni Naan* ── Rs. 80 (Piece)\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Kaunsa aur kitni tadad mein pasand karenge? (e.g. "8 rotis" ya "4 roghni naan") 😊`,
      buttons: [
        { label: '🫓 Roti (Fine Wheat)', payload: 'roti' },
        { label: '🥖 Peshawari Naan', payload: 'peshawari naan' },
        { label: '🧈 Roghni Naan', payload: 'roghni naan' }
      ],
      sessionState: state
    };
  }

  // 8. Sweets
  if (/^(sweets|sweet|meetha|mithai|dessert|desserts|sweet menu|sweets menu)$/i.test(lower) || (isBroad && /sweet|sweets|meetha|mithai|dessert|ice cream|icecream|halwa|kheer|cake/i.test(lower))) {
    state.lastCategory = 'sweets';
    return {
      reply:
        `🍨 *DEEWAN DESSERTS & SWEETS*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Deewan-E-Khaas ke lazeez meethay:\n\n` +
        `▫️ *1. Brownie with Ice Cream* ── Rs. 299\n` +
        `▫️ *2. Molten Lava with Ice Cream* ── Rs. 399\n` +
        `▫️ *3. Three Milk Cake* ── Rs. 380\n` +
        `▫️ *4. Matilda Slice* ── Rs. 499\n` +
        `▫️ *5. Lotus Cheese Cake* ── Rs. 599\n` +
        `▫️ *6. Shahi Kheer* ── Rs. 180\n` +
        `▫️ *7. Gajar Halwa* ── Rs. 250\n` +
        `▫️ *8. Ice Cream Cup* ── Rs. 160\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Kaunsa meetha pasand karenge? 😊`,
      buttons: [
        { label: '🍫 Brownie w/ Ice Cream', payload: 'brownie' },
        { label: '🌋 Molten Lava', payload: 'molten lava' },
        { label: '🍰 Three Milk Cake', payload: 'three milk cake' },
        { label: '🍰 Lotus Cheese Cake', payload: 'lotus cheese cake' },
        { label: '🍮 Shahi Kheer', payload: 'shahi kheer' },
        { label: '🥕 Gajar Halwa', payload: 'gajar halwa' },
        { label: '🍨 Ice Cream Cup', payload: 'ice cream cup' },
        { label: '🍰 Matilda Slice', payload: 'matilda slice' }
      ],
      sessionState: state
    };
  }

  // 9. Salad & Raita
  if (/^(salad|raita|chutney|salad menu)$/i.test(lower) || (isBroad && /salad|raita|chutney|dahi/i.test(lower))) {
    state.lastCategory = 'salad';
    return {
      reply:
        `🥗 *FRESH SALAD & CHUTNEY*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `▫️ *1. Dahi Raita* ── Rs. 69\n` +
        `▫️ *2. Fresh Salad* ── Rs. 99\n` +
        `▫️ *3. Mint Sauce (Pudina)* ── Rs. 99\n` +
        `▫️ *4. Tomato Chutney* ── Rs. 99\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Kaunsa item add karna chahenge? 😊`,
      buttons: [
        { label: '🥣 Dahi Raita', payload: 'raita' },
        { label: '🥗 Fresh Salad', payload: 'fresh salad' },
        { label: '🍃 Mint Sauce', payload: 'mint sauce' },
        { label: '🍅 Tomato Chutney', payload: 'tomato chutney' }
      ],
      sessionState: state
    };
  }

  return null;
}

// -------------------------------------------------------------
// HELPER TO GENERATE CONFIRMED ORDER TICKET
// -------------------------------------------------------------
function createConfirmedOrder(state) {
  state.step = 'ORDER_COMPLETED';

  const orderNo = '#' + Math.floor(100 + Math.random() * 900);
  const total = (state.cart || []).reduce((s, i) => s + i.subtotal, 0);

  const itemsList = (state.cart || [])
    .map((i) => {
      const u = getItemUnitLabel(i, i.quantity);
      return `   • ${i.quantity} ${u} ${i.name} ── Rs. ${i.subtotal.toLocaleString()}`;
    })
    .join('\n');

  const confirmedOrder = {
    order_no: orderNo,
    table_no: state.table_no || '1',
    customer_name: state.customer_name || 'Valued Guest',
    customer_phone: state.customer_phone || '',
    total: total,
    items: state.cart,
    status: 'received',
    created_at: new Date().toISOString()
  };

  const finalReply =
    `🎉 Mubarak ${state.customer_name || 'Valued Guest'} sahib! Aapka order confirm ho chuka hai!\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📋 Order No: ${orderNo}\n` +
    `🪑 Table: Table #${state.table_no || '1'}\n` +
    `⏱️ Estimated Wait Time: 15-20 Minutes\n` +
    `────────────────────────────\n` +
    `🍽️ Ordered Items:\n${itemsList}\n` +
    `────────────────────────────\n` +
    `💰 Total Bill: Rs. ${total.toLocaleString()}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `Aapka ticket kitchen screen par pohanch chuka hai aur khana tayyar kiya ja raha hai. Deewan-E-Khaas chunnay ka shukriya! 😊`;

  return {
    reply: finalReply,
    order: confirmedOrder,
    sessionState: state
  };
}

// -------------------------------------------------------------
// MAIN CONVERSATION ENGINE (processUserChat) & CANCELLATION DETECTOR
// -------------------------------------------------------------

export const MAIN_MENU_BUTTONS = [
  { label: '👑 Special Platters', payload: 'platters' },
  { label: '🔥 Deals', payload: 'deals' },
  { label: '🍗 Karahi', payload: 'karahi' },
  { label: '🍚 Biryani', payload: 'biryani' },
  { label: '🍢 Bar B Q', payload: 'bbq' },
  { label: '🍨 Sweets', payload: 'sweets' },
  { label: '🫓 Roti / Naan', payload: 'roti' },
  { label: '🥤 Cold Drink', payload: 'cold drink' }
];

export function isCancelRequest(text) {
  if (!text) return false;
  const t = text.toLowerCase().trim();
  // English & Roman Urdu cancellation detection
  const cancelWordRegex = /\b(cancel|cancell|mansookh|khatam|rok\s*do|rokdo)\b/i;
  const orderWordRegex = /\b(order|orders|booking|khana|item)\b/i;
  const verbPhraseRegex = /\b(kar\s*do|kardo|karo|karein|karva|please|me|my|mera|humara|humaara)\b/i;

  if (cancelWordRegex.test(t)) {
    if (orderWordRegex.test(t) || verbPhraseRegex.test(t) || /^(cancel|cancell|order\s*cancel|cancel\s*order)$/i.test(t)) {
      return true;
    }
  }
  return false;
}

export function processUserChat(text, sessionState = {}) {
  const t = (text || '').trim();
  const lower = t.toLowerCase();

  let state = {
    step: sessionState.step || 'START',
    cart: sessionState.cart ? [...sessionState.cart] : [],
    pendingItem: sessionState.pendingItem || null,
    lastAddedItemId: sessionState.lastAddedItemId || null,
    lastCategory: sessionState.lastCategory || null,
    table_no: sessionState.table_no || '',
    customer_name: sessionState.customer_name || '',
    customer_phone: sessionState.customer_phone || ''
  };

  // 0. CHECK ORDER CANCELLATION INTENT FIRST
  if (isCancelRequest(lower)) {
    return {
      isCancelRequest: true,
      sessionState: state
    };
  }

  // 0b. CHECK WAITER CALL INTENT IN CHAT (e.g. "waiter ko bula do", "waiter bulao", "call waiter")
  if (
    /\b(waiter|bulao|bula\s*do|waiter\s*ko\s*bula|waiter\s*chahiye|call\s*waiter)\b/i.test(lower) &&
    !/waiter\s*screen/i.test(lower)
  ) {
    return {
      isWaiterCallRequest: true,
      sessionState: state
    };
  }

  // 0c. CHECK ACTIVE ORDER STATUS QUERY IN CHAT
  if (
    /\b(mera order|order status|order kahan|kahan pohancha|ready ho gaya|kitni dair|kitna time|kab tak|order confirm hua|order ka kya hua|khana kab ayega)\b/i.test(lower)
  ) {
    return {
      isOrderStatusQuery: true,
      sessionState: state
    };
  }

  const qty = extractQuantity(lower);

  // 1. Initial Greeting: "hi", "salam", "hello", "hey"
  if (/^(hi|hello|salam|start|hey|shuru|assalam o alaikum|aoa)$/i.test(lower)) {
    state.step = 'BROWSING';
    return {
      reply: `Welcome to Deewan-E-Khaas (Namak Mandi)! 🍖🔥\nAap kya order karna chahenge? 😊`,
      buttons: MAIN_MENU_BUTTONS,
      sessionState: state
    };
  }

  // 1b. Menu Request: "menu", "show menu", "menu dikhao", "menu dekhein" -> sends 2 menu images
  if (/^(menu|show menu|menu dekhein|menu dikhao|menu image|menu images|list)$/i.test(lower) || lower === 'menu') {
    state.step = 'BROWSING';
    return {
      reply: '',
      menuImages: ['/assets/menu_page_1.jpg', '/assets/menu_page_2.jpg'],
      buttons: [
        ...MAIN_MENU_BUTTONS,
        { label: '🛎️ Waiter Bulao', payload: 'waiter' }
      ],
      sessionState: state
    };
  }

  // 2. CHECK MENU KNOWLEDGE BASE (Platters, deals, dish details, ingredients, comparisons, prices, recommendations)
  const qaResult = handleMenuQuestions(lower);
  if (qaResult) {
    return {
      reply: qaResult.reply,
      buttons: qaResult.buttons,
      sessionState: state
    };
  }

  // 3. User indicates checkout / done: "done", "confirm", "checkout", "bas", "aur kuch nahi"
  if (
    /^(no|nahi|aur kuch nahi|kuch nahi|bas|that's all|done|confirm|checkout|bill)$/i.test(lower) ||
    lower.includes('aur kuch nahi') ||
    lower.includes('bas theek hai') ||
    lower.includes('order confirm')
  ) {
    if (!state.cart || state.cart.length === 0) {
      return {
        reply: 'Aapki cart abhi khali hai! Pehle menu se koi dish select karein (maslan: "8 rotis", "2 biryani", "half shinwari"). 😊',
        buttons: MAIN_MENU_BUTTONS,
        sessionState: state
      };
    }

    state.step = 'AWAITING_CONFIRMATION';
    const itemsList = state.cart
      .map((i) => {
        const u = getItemUnitLabel(i, i.quantity);
        return `   • ${i.quantity} ${u} ${i.name} ── Rs. ${i.subtotal.toLocaleString()}`;
      })
      .join('\n');
    const total = state.cart.reduce((s, i) => s + i.subtotal, 0);

    return {
      reply:
        `📋 *AAPKA ORDER SUMMARY*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `${itemsList}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 *Total Bill: Rs. ${total.toLocaleString()}*\n\n` +
        `Kya aapka order confirm kar doon? 😊`,
      buttons: [
        { label: '✅ Haan, Confirm karein', payload: 'yes' },
        { label: '➕ Mazeed item add karein', payload: 'menu' }
      ],
      sessionState: state
    };
  }

  // 4. Order Confirmation State: "yes", "haan", "theek hai", "ok"
  if (state.step === 'AWAITING_CONFIRMATION') {
    if (/^(yes|haan|theek hai|ok|sure|ji|y|jee|kar do|bhejo|confirm)$/i.test(lower)) {
      if (!state.table_no) {
        state.step = 'COLLECT_TABLE';
        return {
          reply: 'Shukriya! Barah-e-karam apna Table number batayein (maslan: Table 1, Table 2, ya Table 5): 🪑',
          buttons: [
            { label: '🪑 Table 1', payload: '1' },
            { label: '🪑 Table 2', payload: '2' },
            { label: '🪑 Table 3', payload: '3' },
            { label: '🪑 Table 5', payload: '5' },
            { label: '🪑 Table 8', payload: '8' },
            { label: '🪑 Table 10', payload: '10' }
          ],
          sessionState: state
        };
      } else if (!state.customer_name) {
        state.step = 'COLLECT_NAME';
        return {
          reply: `Table #${state.table_no} note ho gaya! Barah-e-karam apna naam batayein:`,
          sessionState: state
        };
      } else if (!state.customer_phone) {
        state.step = 'COLLECT_PHONE';
        return {
          reply: `Shukriya ${state.customer_name} sahib! Apna mobile number share karein taake order updates mil sakein (maslan: 03001234567): 📱`,
          sessionState: state
        };
      } else {
        return createConfirmedOrder(state);
      }
    } else {
      state.step = 'BROWSING';
      return {
        reply: 'Koi masla nahi! Aap mazeed dishes add kar sakte hain ya quantity tabdeel kar sakte hain. Kya chahiye? 😊',
        buttons: MAIN_MENU_BUTTONS,
        sessionState: state
      };
    }
  }

  // 4b. Change or Switch Table Request (e.g. "change table", "table badlo", "table", "switch table")
  if (/^(change\s*table|table\s*badlo|switch\s*table|table\s*change|select\s*table)$/i.test(lower) || lower === 'table') {
    state.step = 'COLLECT_TABLE';
    return {
      reply: 'Aap kaunsa table number select karna chahte hain? (Neeche se chunein ya type karein maslan: "Table 5"): 🪑',
      buttons: [
        { label: '🪑 Table 1', payload: '1' },
        { label: '🪑 Table 2', payload: '2' },
        { label: '🪑 Table 3', payload: '3' },
        { label: '🪑 Table 5', payload: '5' },
        { label: '🪑 Table 8', payload: '8' },
        { label: '🪑 Table 10', payload: '10' }
      ],
      sessionState: state
    };
  }

  // 4c. Explicit Table Command at any time (e.g. "table 5", "table 12", "table 2")
  if (/^table\s*([1-9]\d?)$/i.test(lower)) {
    const tableMatch = lower.match(/\b([1-9]\d?)\b/);
    if (tableMatch) {
      state.table_no = tableMatch[1];
      if (!state.customer_name) {
        state.step = 'COLLECT_NAME';
        return {
          reply: `Table #${state.table_no} note ho gaya! Barah-e-karam apna naam batayein:`,
          sessionState: state
        };
      } else {
        return {
          reply: `Table tabdeel kar ke *Table #${state.table_no}* kar diya gaya hai! 🪑\n\nAap kya order karna chahenge? 😊`,
          buttons: MAIN_MENU_BUTTONS,
          sessionState: state
        };
      }
    }
  }

  // 5. Details Step 1: COLLECT_TABLE (Supports ALL tables in the restaurant)
  if (state.step === 'COLLECT_TABLE' || (!state.table_no && state.step !== 'BROWSING' && state.step !== 'START' && /^(table\s*\d+|\d+)$/i.test(t))) {
    const tableMatch = lower.match(/\b([1-9]\d?)\b/);
    if (tableMatch) {
      state.table_no = tableMatch[1];
      state.step = 'COLLECT_NAME';
      return {
        reply: `Table #${state.table_no} note ho gaya! Barah-e-karam apna naam batayein:`,
        sessionState: state
      };
    } else {
      return {
        reply: 'Barah-e-karam apna Table number batayein (maslan: Table 1, Table 2, ya Table 5): 🪑',
        buttons: [
          { label: '🪑 Table 1', payload: '1' },
          { label: '🪑 Table 2', payload: '2' },
          { label: '🪑 Table 3', payload: '3' },
          { label: '🪑 Table 5', payload: '5' },
          { label: '🪑 Table 8', payload: '8' },
          { label: '🪑 Table 10', payload: '10' }
        ],
        sessionState: state
      };
    }
  }

  // 6. Details Step 2: COLLECT_NAME
  if (state.step === 'COLLECT_NAME') {
    const cleanName = t.replace(/^(my name is|mera naam|i am|name is|naam)\s*/i, '').trim();
    state.customer_name = cleanName || 'Valued Guest';
    state.step = 'COLLECT_PHONE';
    return {
      reply: `Shukriya ${state.customer_name} sahib! Apna mobile number share karein taake order updates mil sakein (maslan: 03001234567): 📱`,
      sessionState: state
    };
  }

  // 7. Details Step 3: COLLECT_PHONE -> FINAL CONFIRMED TICKET
  if (state.step === 'COLLECT_PHONE') {
    const cleanPhone = lower.replace(/[^0-9]/g, '');
    if (cleanPhone.length >= 10) {
      state.customer_phone = cleanPhone;

      if (state.cart && state.cart.length > 0) {
        return createConfirmedOrder(state);
      } else {
        state.step = 'BROWSING';
        return {
          reply: `Shukriya ${state.customer_name} sahib! Aapki details note ho gayin. Welcome to Deewan-E-Khaas (Namak Mandi)! 🍖🔥\nAap kya order karna chahenge? 😊`,
          buttons: MAIN_MENU_BUTTONS,
          sessionState: state
        };
      }
    } else {
      return {
        reply: `Shukriya ${state.customer_name} sahib! Barah-e-karam sahi Pakistani mobile number (11 digits, maslan 03001234567) darj karein: 📱`,
        sessionState: state
      };
    }
  }



  // 8. DIRECT NUMERIC INPUT FOR LATEST ADDED ITEM (e.g. user just types "5" or "8" to set quantity directly)
  if (qty !== null && /^\s*(\d+|ek|aik|do|teen|char|chaar|panch|paanch|che|chhay|saat|aath|ath|nau|das|dus)\s*(?:chahiye|piece|pieces|adad|plates|plate|portion|portions)?\s*$/i.test(lower)) {
    if (state.lastAddedItemId) {
      const itemIndex = state.cart.findIndex((i) => i.id === state.lastAddedItemId);
      if (itemIndex !== -1) {
        state.cart[itemIndex].quantity = qty;
        state.cart[itemIndex].subtotal = state.cart[itemIndex].price * qty;
        const targetItem = state.cart[itemIndex];
        const u = getItemUnitLabel(targetItem, qty);

        return {
          reply: `Aapne *${targetItem.name}* ki quantity update kar ke *${qty} ${u}* (Rs. ${targetItem.subtotal.toLocaleString()}) kar di hai! 🛒\n\nMazeed kya add karna chahenge? 😊`,
          itemCard: { ...targetItem },
          buttons: [
            { label: '➕ Aur add karein', payload: 'menu' },
            { label: '🫓 Roti / Naan', payload: 'roti' },
            { label: '🍨 Sweets', payload: 'sweets' },
            { label: '🥤 Cold Drink', payload: 'cold drink' },
            { label: '✅ Order Confirm karein', payload: 'done' }
          ],
          sessionState: state
        };
      }
    }
  }

  // 9. PENDING SIZE SELECTION (e.g. user previously chose an item with sizes like Karahi or Coke)
  if (state.step === 'AWAITING_SIZE' && state.pendingItem) {
    const item = state.pendingItem;
    const sizes = item.sizes || {};

    let selectedSize = null;
    if (/half|h\b|choti/i.test(lower) && sizes.half) {
      selectedSize = sizes.half;
    } else if (/full|f\b|bari/i.test(lower) && sizes.full) {
      selectedSize = sizes.full;
    } else if (/1\.5|1\.5ltr|1\.5 litre|bari/i.test(lower) && sizes['1.5ltr']) {
      selectedSize = sizes['1.5ltr'];
    } else if (/1ltr|1 litre/i.test(lower) && sizes['1ltr']) {
      selectedSize = sizes['1ltr'];
    } else if (/tin|can|pack/i.test(lower) && sizes.tin) {
      selectedSize = sizes.tin;
    }

    if (selectedSize) {
      const displayName = `${selectedSize.label} ${item.name}`;
      const effectiveQty = item.pendingQuantity || qty || 1;
      const unit = selectedSize.unit || item.unit || 'Portion';
      const unitPlural = selectedSize.unitPlural || item.unitPlural || `${unit}s`;
      const lineId = `${item.id}-${selectedSize.label}`;

      // Check if item already exists in cart
      const existingIdx = state.cart.findIndex((i) => i.id === lineId);
      if (existingIdx !== -1) {
        state.cart[existingIdx].quantity += effectiveQty;
        state.cart[existingIdx].subtotal = state.cart[existingIdx].price * state.cart[existingIdx].quantity;
        state.lastAddedItemId = lineId;
      } else {
        const orderLine = {
          id: lineId,
          name: displayName,
          price: selectedSize.price,
          quantity: effectiveQty,
          subtotal: selectedSize.price * effectiveQty,
          unit,
          unitPlural
        };
        state.cart.push(orderLine);
        state.lastAddedItemId = lineId;
      }

      state.pendingItem = null;
      state.step = 'BROWSING';
      const targetItem = state.cart.find((i) => i.id === lineId);
      const u = getItemUnitLabel(targetItem, targetItem.quantity);

      return {
        reply: `Aapne *${targetItem.name}* (Rs. ${targetItem.subtotal.toLocaleString()}) add kar liya hai! 🛒\n\nQuantity buttons se tadad barha ya ghata sakte hain. Mazeed kya chahiye? 😊`,
        itemCard: { ...targetItem },
        buttons: [
          { label: '➕ Aur add karein', payload: 'menu' },
          { label: '🫓 Roti / Naan', payload: 'roti' },
          { label: '🍨 Sweets', payload: 'sweets' },
          { label: '🥤 Cold Drink', payload: 'cold drink' },
          { label: '✅ Order Confirm karein', payload: 'done' }
        ],
        sessionState: state
      };
    } else {
      const sizeOptionsText = Object.values(sizes)
        .map((s) => `   ├─ 🥣 *${s.label}*: Rs. ${s.price.toLocaleString()}`)
        .join('\n');
      const sizeButtons = Object.values(sizes).map((s) => ({
        label: `${s.label} (Rs. ${s.price.toLocaleString()})`,
        payload: s.label.toLowerCase()
      }));
      return {
        reply: `Barah-e-karam in mein se size select karein:\n\n${sizeOptionsText}\n\nKaunsa size pasand karenge? 😊`,
        buttons: sizeButtons,
        sessionState: state
      };
    }
  }

  // 9b. DIRECT CATEGORY BROWSING (e.g. user clicked category button or typed "karahi", "deals", "sweets", etc.)
  const categoryResult = handleCategoryMenu(lower, state);
  if (categoryResult) {
    return categoryResult;
  }

  // 10. FLEXIBLE MENU ITEM MATCHING (Spelling, Spacing & Typo Tolerant)
  const matchResult = matchMenuFlexible(lower);

  if (matchResult) {
    // 10a. Ambiguous match requiring customer clarification
    if (matchResult.isAmbiguous) {
      return {
        reply: matchResult.message,
        buttons: matchResult.options,
        sessionState: state
      };
    }

    // 10b. Direct item match!
    const item = matchResult.item;
    const effectiveQty = qty || 1;

    // Check if item has sizes and size was NOT identified in the text
    if (item.hasSizes) {
      let chosenSize = matchResult.chosenSize;
      if (!chosenSize) {
        // Prompt for size selection
        state.pendingItem = { ...item, pendingQuantity: effectiveQty };
        state.step = 'AWAITING_SIZE';

        const sizeList = Object.values(item.sizes)
          .map((s) => `   ├─ 🥣 *${s.label}*: Rs. ${s.price.toLocaleString()}`)
          .join('\n');
        const sizeButtons = Object.values(item.sizes).map((s) => ({
          label: `${s.label} — Rs. ${s.price.toLocaleString()}`,
          payload: s.label.toLowerCase()
        }));

        return {
          reply:
            `🍲 *${item.name}*\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `Aapko kaunsa size pasand hai? Available sizes:\n\n` +
            `${sizeList}\n\n` +
            `Neeche button se size select karein: 😊`,
          buttons: sizeButtons,
          sessionState: state
        };
      } else {
        // Size was given in the same message (e.g. "half chicken shinwari" or "1.5 coke")
        const displayName = `${chosenSize.label} ${item.name}`;
        const unit = chosenSize.unit || item.unit || 'Portion';
        const unitPlural = chosenSize.unitPlural || item.unitPlural || `${unit}s`;
        const lineId = `${item.id}-${chosenSize.label}`;

        const existingIdx = state.cart.findIndex((i) => i.id === lineId);
        if (existingIdx !== -1) {
          state.cart[existingIdx].quantity += effectiveQty;
          state.cart[existingIdx].subtotal = state.cart[existingIdx].price * state.cart[existingIdx].quantity;
          state.lastAddedItemId = lineId;
        } else {
          const orderLine = {
            id: lineId,
            name: displayName,
            price: chosenSize.price,
            quantity: effectiveQty,
            subtotal: chosenSize.price * effectiveQty,
            unit,
            unitPlural
          };
          state.cart.push(orderLine);
          state.lastAddedItemId = lineId;
        }

        state.step = 'BROWSING';
        const targetItem = state.cart.find((i) => i.id === lineId);
        const u = getItemUnitLabel(targetItem, targetItem.quantity);

        return {
          reply: `Aapne *${targetItem.name}* (Rs. ${targetItem.subtotal.toLocaleString()}) add kar liya hai! 🛒\n\nNeeche quantity buttons ya chat se tadad tabdeel kar sakte hain. Mazeed kya chahiye? 😊`,
          itemCard: { ...targetItem },
          buttons: [
            { label: '➕ Aur add karein', payload: 'menu' },
            { label: '🫓 Roti / Naan', payload: 'roti' },
            { label: '🍨 Sweets', payload: 'sweets' },
            { label: '🥤 Cold Drink', payload: 'cold drink' },
            { label: '✅ Order Confirm karein', payload: 'done' }
          ],
          sessionState: state
        };
      }
    }

    // Fixed price item (e.g. Roti, Biryani, Tikka Leg, Shahi Kheer, Brownie)
    const lineId = item.id;
    const existingIdx = state.cart.findIndex((i) => i.id === lineId);
    if (existingIdx !== -1) {
      state.cart[existingIdx].quantity += effectiveQty;
      state.cart[existingIdx].subtotal = state.cart[existingIdx].price * state.cart[existingIdx].quantity;
      state.lastAddedItemId = lineId;
    } else {
      const orderLine = {
        id: lineId,
        name: item.name,
        price: item.price,
        quantity: effectiveQty,
        subtotal: item.price * effectiveQty,
        unit: item.unit || 'Portion',
        unitPlural: item.unitPlural || 'Portions'
      };
      state.cart.push(orderLine);
      state.lastAddedItemId = lineId;
    }

    state.step = 'BROWSING';
    const targetItem = state.cart.find((i) => i.id === lineId);
    const u = getItemUnitLabel(targetItem, targetItem.quantity);

    return {
      reply: `Aapne *${targetItem.name}* (Rs. ${targetItem.subtotal.toLocaleString()}) add kar liya hai! 🛒\n\nNeeche buttons ya chat se quantity tabdeel kar sakte hain. Mazeed kya chahiye? 😊`,
      itemCard: { ...targetItem },
      buttons: [
        { label: '➕ Aur add karein', payload: 'menu' },
        { label: '🫓 Roti / Naan', payload: 'roti' },
        { label: '🍨 Sweets', payload: 'sweets' },
        { label: '🥤 Cold Drink', payload: 'cold drink' },
        { label: '✅ Order Confirm karein', payload: 'done' }
      ],
      sessionState: state
    };
  }

  // 11. GENERAL CATEGORY BROWSING FALLBACK (Only triggered when NO specific dish or custom quantity was entered)
  const broadCategoryResult = handleCategoryMenu(lower, state, true);
  if (broadCategoryResult) {
    return broadCategoryResult;
  }

  // 12. Fallback: Prompt user politely with options
  return {
    reply:
      `Barah-e-karam batayein aap kya order karna chahte hain? Humare paas Biryani, Karahi, Bar B Q, Naan, Cold Drinks, Meetha, Deals aur Special Platters dastyab hain. (Maslan: "8 rotis", "2 biryani", "half shinwari"). 😊`,
    buttons: MAIN_MENU_BUTTONS,
    sessionState: state
  };
}
