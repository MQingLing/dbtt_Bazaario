// ─────────────────────────────────────────────────────────────────────────────
// Synthetic vendor / item / concert generator
// Uses a seeded PRNG so the same eventId always produces the same data.
// ─────────────────────────────────────────────────────────────────────────────

export type VendorCategory =
  | 'Hot Food'
  | 'Drinks'
  | 'Desserts'
  | 'Snacks'
  | 'Trendy Food'
  | 'Household Items'
  | 'Games & Entertainment';

export interface VendorItem {
  name: string;
  price: number; // SGD
  description: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  stall: string;
  rating: number; // 3.5 – 5.0
  items: VendorItem[];
}

export interface Concert {
  artist: string;
  genre: string;
  date: string;     // YYYY-MM-DD
  time: string;
  stage: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Seeded PRNG — mulberry32
// ─────────────────────────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function strToSeed(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (Math.imul(h, 0x01000193)) >>> 0;
  }
  return h;
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickN<T>(rng: () => number, arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, n);
}

function rand(rng: () => number, min: number, max: number) {
  return Math.round((rng() * (max - min) + min) * 10) / 10;
}

// ─────────────────────────────────────────────────────────────────────────────
// Item pools
// ─────────────────────────────────────────────────────────────────────────────
const HOT_FOOD_ITEMS: VendorItem[] = [
  { name: 'Mee Goreng', price: 5, description: 'Spicy fried noodles with egg and veggies' },
  { name: 'Nasi Goreng', price: 5.5, description: 'Fragrant fried rice with chicken and sambal' },
  { name: 'Roti John', price: 6, description: 'Egg and minced meat baguette sandwich' },
  { name: 'Murtabak', price: 8, description: 'Stuffed pan-fried bread with mutton and onion' },
  { name: 'Satay (10 sticks)', price: 10, description: 'Grilled skewered meat with peanut sauce' },
  { name: 'BBQ Corn', price: 4, description: 'Chargrilled corn on the cob with butter and cheese' },
  { name: 'Grilled Stingray', price: 12, description: 'Stingray wrapped in banana leaf with sambal' },
  { name: 'Chicken Chop', price: 9, description: 'Pan-fried chicken with black pepper sauce' },
  { name: 'Ramly Burger', price: 6, description: 'Malaysian-style beef burger with egg and sauces' },
  { name: 'Popiah', price: 3.5, description: 'Fresh spring roll with turnip and prawn' },
  { name: 'Oyster Omelette', price: 7, description: 'Crispy egg omelette with fresh oysters' },
  { name: 'Curry Puff', price: 2.5, description: 'Flaky pastry stuffed with spiced potato curry' },
  { name: 'Fried Carrot Cake', price: 5, description: 'Wok-fried radish cake with egg and XO sauce' },
  { name: 'Laksa', price: 6, description: 'Coconut curry noodle soup with prawns' },
  { name: 'Naan with Curry', price: 7, description: 'Soft naan served with rich butter chicken curry' },
];

const DRINKS_ITEMS: VendorItem[] = [
  { name: 'Sugar Cane Juice', price: 2.5, description: 'Freshly pressed sweet sugar cane juice' },
  { name: 'Teh Tarik', price: 2, description: 'Frothy pulled milk tea' },
  { name: 'Bandung', price: 2, description: 'Rose syrup milk drink' },
  { name: 'Bubble Tea (Pearl)', price: 4.5, description: 'Milk tea with chewy tapioca pearls' },
  { name: 'Coconut Water', price: 3, description: 'Fresh coconut water served chilled' },
  { name: 'Watermelon Juice', price: 3, description: 'Cold-pressed fresh watermelon juice' },
  { name: 'Soursop Juice', price: 3.5, description: 'Refreshing soursop blended with ice' },
  { name: 'Milo Dinosaur', price: 3.5, description: 'Iced Milo topped with extra Milo powder' },
  { name: 'Sirap Bandung', price: 2, description: 'Rose syrup with evaporated milk over ice' },
  { name: 'Lychee Drink', price: 3, description: 'Sweet lychee syrup with lychee pieces and ice' },
];

const DESSERTS_ITEMS: VendorItem[] = [
  { name: 'Ice Kacang', price: 4, description: 'Shaved ice with red beans, jelly and syrup' },
  { name: 'Chendol', price: 4, description: 'Pandan jelly, coconut milk and palm sugar' },
  { name: 'Durian Puff', price: 6, description: 'Choux pastry filled with durian cream' },
  { name: 'Kueh Lapis', price: 3, description: 'Layered steamed rainbow rice cake' },
  { name: 'Ondeh Ondeh', price: 4, description: 'Pandan rice balls with palm sugar and coconut' },
  { name: 'Putu Piring', price: 3.5, description: 'Steamed rice flour cake with palm sugar' },
  { name: 'Goreng Pisang', price: 2.5, description: 'Crispy battered deep-fried banana' },
  { name: 'Waffle with Ice Cream', price: 5, description: 'Crispy pandan waffle with a scoop of ice cream' },
  { name: 'Tang Yuan', price: 4, description: 'Glutinous rice balls in sweet ginger broth' },
  { name: 'Ais Batu Campur', price: 4, description: 'Mixed shaved ice dessert with toppings' },
];

const SNACKS_ITEMS: VendorItem[] = [
  { name: 'Murukku', price: 2, description: 'Crunchy spiral-shaped Indian snack' },
  { name: 'Keropok Lekor', price: 5, description: 'Fish crackers from Terengganu, fried or steamed' },
  { name: 'Prawn Crackers', price: 3, description: 'Puffed and light shrimp chips' },
  { name: 'Nut Mix', price: 4, description: 'Roasted mixed nuts with dried fruit' },
  { name: 'Dried Mango', price: 5, description: 'Sweet and tangy dehydrated mango slices' },
  { name: 'Popcorn (Caramel)', price: 3, description: 'Crunchy caramel-coated popcorn' },
  { name: 'Chilli Padi Prawn Roll', price: 6, description: 'Crispy prawn rolls with a spicy kick' },
  { name: 'Ngoh Hiang', price: 6, description: 'Five-spice meat rolls, fried golden' },
  { name: 'Pineapple Tarts', price: 5, description: 'Buttery pastry topped with pineapple jam' },
  { name: 'Bak Kwa', price: 8, description: 'Sweet grilled pork jerky' },
];

const TRENDY_FOOD_ITEMS: VendorItem[] = [
  { name: 'Mala Xiang Guo', price: 12, description: 'Spicy numbing stir-fry with your choice of ingredients' },
  { name: 'Dirty Fries', price: 8, description: 'Loaded fries with cheese sauce, jalapeños and bacon bits' },
  { name: 'Korean Corn Dog', price: 6, description: 'Crispy battered sausage on a stick with tteok and cheese' },
  { name: 'Takoyaki', price: 6, description: 'Japanese octopus balls with bonito flakes and mayo' },
  { name: 'Tornado Potato', price: 5, description: 'Spiral-cut potato on a skewer, seasoned and fried' },
  { name: 'Cheese Tea', price: 6, description: 'Light tea topped with a salted cream cheese foam' },
  { name: 'Croffle', price: 5.5, description: 'Croissant dough pressed in a waffle iron, crispy & flaky' },
  { name: 'Dalgona Candy', price: 3, description: 'Korean honeycomb toffee with fun shapes to carve' },
  { name: 'Tteokbokki', price: 8, description: 'Spicy-sweet Korean rice cakes in gochujang sauce' },
  { name: 'Injeolmi Toast', price: 7, description: 'Thick toast topped with roasted soybean powder and cream' },
  { name: 'Salt & Pepper Squid', price: 9, description: 'Crispy fried squid rings with spicy salt seasoning' },
  { name: 'Smash Burger', price: 11, description: 'Double smash beef patty with American cheese' },
];

const HOUSEHOLD_ITEMS: VendorItem[] = [
  { name: 'Phone Case (Universal)', price: 8, description: 'Protective TPU case, various designs' },
  { name: 'Phone Stand & Charger Bundle', price: 15, description: 'Foldable phone stand with 20W fast charger' },
  { name: 'Cotton Pyjama Set', price: 20, description: 'Comfortable cotton loungewear in fun prints' },
  { name: 'Boxer Shorts (3-pack)', price: 12, description: 'Breathable cotton boxer shorts' },
  { name: 'Cotton Underwear Set (5-pack)', price: 15, description: 'Everyday cotton underwear, assorted colours' },
  { name: 'Pillow Case (Pair)', price: 10, description: 'Soft microfibre pillow cases' },
  { name: 'Table Runner', price: 12, description: 'Batik-print table runner for festive decoration' },
  { name: 'Fairy Lights (5 m)', price: 10, description: 'Warm white LED string lights on copper wire' },
  { name: 'Scented Candle', price: 9, description: 'Soy wax candle in jasmine or sandalwood scent' },
  { name: 'Kitchen Towel Set', price: 8, description: 'Pack of 4 absorbent cotton kitchen towels' },
  { name: 'Storage Basket', price: 14, description: 'Woven rattan-style storage basket with handles' },
  { name: 'Doormat', price: 12, description: 'Non-slip coir doormat with printed design' },
];

const GAMES_ITEMS: VendorItem[] = [
  { name: 'Dart Balloon Burst (3 throws)', price: 3, description: 'Pop 3 balloons with darts to win a prize' },
  { name: 'Dart Balloon Burst (6 throws)', price: 5, description: 'More chances — pop 3 of 6 for a bigger prize' },
  { name: 'Claw Machine (1 play)', price: 2, description: 'Try your luck at the claw machine for plushies' },
  { name: 'Claw Machine (3 plays)', price: 5, description: 'Three tries to grab a cuddly toy' },
  { name: 'Ring Toss (5 rings)', price: 3, description: 'Toss rings onto bottles to claim prizes' },
  { name: 'Shooting Gallery (6 shots)', price: 4, description: 'Knock down targets with a foam-ball shooter' },
  { name: 'Duck Pond (kids)', price: 2, description: 'Pick a rubber duck and reveal your prize' },
  { name: 'Hook-a-Duck (5 tries)', price: 3, description: 'Fish for numbered ducks and match your prize' },
  { name: 'Knock-down Cans (3 balls)', price: 3, description: 'Throw soft balls to topple the can pyramid' },
  { name: 'Lucky Draw Ticket', price: 5, description: 'Scratch card with cash or prize redemptions' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Vendor name pools
// ─────────────────────────────────────────────────────────────────────────────
const VENDOR_NAMES: Record<VendorCategory, string[]> = {
  'Hot Food': [
    "Wong's Satay", 'Kampung Wok', 'Uncle Razali Grill', 'Mak Cik Stall',
    'Nasi Lemak Bros', "Ali's Kitchen", 'Abang Burger', 'Wok This Way',
    'Spice Route', 'The Murtabak House', 'Grill Street', 'Mama Zubaidah',
    'Kedai Makan Pak Long', 'Taman Selera', 'Village BBQ',
  ],
  'Drinks': [
    'Sugar Rush', 'The Juice Lab', 'Coconut Grove', 'Boba World',
    'Kopi Kaki', 'Teh Tarik Station', 'Tropical Sips', 'Chillz Drinks',
    'Thirst Quenchers', 'Sirap Palace',
  ],
  'Desserts': [
    'Sweet Spot', 'Dessert Alley', 'Jelly Bliss', 'Durian Heaven',
    'Ice Ice Baby', 'Kueh Corner', 'The Waffle Stall', 'Chendol Paradise',
    'Sugar & Spice', 'Ondeh Ondeh House',
  ],
  'Snacks': [
    'Munchies Corner', 'Crunch Time', 'Snack Attack', 'Kacang Queen',
    'The Bak Kwa Bar', 'Keropok King', 'Crispy Delights', 'Dried Goods Co.',
    'Nutty Corner', 'Pineapple Express Tarts',
  ],
  'Trendy Food': [
    'Mala Majik', 'K-Food Craze', 'Street Fusion', 'Tornado Bites',
    'Cheese Me', 'Trendy Bites', 'The Smash Co.', 'Dalgona Dreams',
    'Yum Street', 'Seoul Kitchen', 'Tokyo Snacks SG', 'TikTok Eats',
  ],
  'Household Items': [
    'Home & More', 'Everyday Essentials', 'Casa Living', 'The Linen Store',
    'Happy Home', 'Budget Bazaar', 'Cozy Corner', 'The Phone Stall',
    'Deco Dreams', 'Comfort Living',
  ],
  'Games & Entertainment': [
    'Win It Stall', 'Fun Zone', 'Game On!', 'Lucky Strike',
    'Arcade Corner', 'Prize Mania', 'Play & Win', 'Balloon Blast',
    'Claw Masters', 'Carnival Station',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Concert artist pool
// ─────────────────────────────────────────────────────────────────────────────
const CONCERT_ARTISTS = [
  { artist: 'Siti Nurhaliza', genre: 'Malay Pop / R&B' },
  { artist: 'Hazama', genre: 'Malay Pop' },
  { artist: 'Amy Search', genre: 'Malay Rock' },
  { artist: 'Faizal Tahir', genre: 'Malay Pop Rock' },
  { artist: 'Yuna', genre: 'Indie Pop / R&B' },
  { artist: 'Hael Husaini', genre: 'Malay Pop' },
  { artist: 'Noh Salleh', genre: 'Indie Rock' },
  { artist: 'Shila Amzah', genre: 'Mandopop / Malay Pop' },
  { artist: 'Aliff Aziz', genre: 'Malay Pop' },
  { artist: 'Sheila Majid', genre: 'Jazz / Malay Pop' },
  { artist: 'Jaclyn Victor', genre: 'R&B / Pop' },
  { artist: 'Jamal Abdillah', genre: 'Classic Malay Pop' },
  { artist: 'Dato Sri Siti Nurhaliza Orchestra', genre: 'Orchestra Fusion' },
  { artist: 'Dick Lee', genre: 'Singapore Pop' },
  { artist: 'Taufik Batisah', genre: 'R&B / Soul' },
  { artist: 'Sun Ho', genre: 'Mandopop' },
  { artist: 'Stefanie Sun', genre: 'Mandopop' },
  { artist: 'Jonathan Leong', genre: 'Singapore Indie' },
  { artist: 'The Sam Willows', genre: 'Pop' },
  { artist: 'Benjamin Kheng', genre: 'Singapore Indie Pop' },
  { artist: 'Gentle Bones', genre: 'Singer-Songwriter' },
  { artist: 'Charlie Lim', genre: 'Art Pop' },
  { artist: 'Linying', genre: 'Dream Pop' },
  { artist: 'Pleasantry', genre: 'Indie Folk' },
];

const CONCERT_STAGES = [
  'Main Stage', 'Heritage Stage', 'Community Stage', 'Carnival Stage',
];

const CONCERT_TIMES = [
  '7:30 PM – 9:00 PM', '8:00 PM – 10:00 PM', '7:00 PM – 8:30 PM', '8:30 PM – 10:30 PM',
];

// ─────────────────────────────────────────────────────────────────────────────
// Stall label generator
// ─────────────────────────────────────────────────────────────────────────────
function stallLabel(rng: () => number, index: number): string {
  const row = String.fromCharCode(65 + Math.floor(rng() * 6)); // A–F
  const num = String(1 + (index % 30)).padStart(2, '0');
  return `${row}${num}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// getEventVendors — deterministic from eventId
// ─────────────────────────────────────────────────────────────────────────────
export function getEventVendors(eventId: string): Vendor[] {
  const rng = mulberry32(strToSeed(`vendors:${eventId}`));

  const categoryDistribution: VendorCategory[] = [
    'Hot Food', 'Hot Food', 'Hot Food',
    'Drinks', 'Drinks',
    'Desserts', 'Desserts',
    'Snacks',
    'Trendy Food', 'Trendy Food',
    'Household Items',
    'Games & Entertainment',
  ];

  // between 12 and 20 vendors
  const count = 12 + Math.floor(rng() * 9);
  const vendors: Vendor[] = [];

  for (let i = 0; i < count; i++) {
    const category = pick(rng, categoryDistribution);
    const namePool = VENDOR_NAMES[category];
    const usedNames = vendors.filter(v => v.category === category).map(v => v.name);
    const available = namePool.filter(n => !usedNames.includes(n));
    const name = available.length ? pick(rng, available) : pick(rng, namePool) + ` ${i + 1}`;

    const itemPool = getItemPool(category);
    const itemCount = 3 + Math.floor(rng() * 4); // 3–6 items
    const items = pickN(rng, itemPool, Math.min(itemCount, itemPool.length));

    vendors.push({
      id: `${eventId}-v${i + 1}`,
      name,
      category,
      stall: stallLabel(rng, i),
      rating: parseFloat((3.5 + rng() * 1.5).toFixed(1)),
      items,
    });
  }

  return vendors;
}

function getItemPool(category: VendorCategory): VendorItem[] {
  switch (category) {
    case 'Hot Food': return HOT_FOOD_ITEMS;
    case 'Drinks': return DRINKS_ITEMS;
    case 'Desserts': return DESSERTS_ITEMS;
    case 'Snacks': return SNACKS_ITEMS;
    case 'Trendy Food': return TRENDY_FOOD_ITEMS;
    case 'Household Items': return HOUSEHOLD_ITEMS;
    case 'Games & Entertainment': return GAMES_ITEMS;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getEventConcert — ~35% of events have a concert; hardcoded for major ones
// ─────────────────────────────────────────────────────────────────────────────
const HARDCODED_CONCERTS: Record<string, Concert> = {
  '1': { artist: 'Siti Nurhaliza', genre: 'Malay Pop / R&B', date: '2026-03-08', time: '8:00 PM – 10:00 PM', stage: 'Main Stage' },
  '6': { artist: 'Hazama', genre: 'Malay Pop', date: '2026-03-20', time: '7:30 PM – 9:00 PM', stage: 'Heritage Stage' },
  '7': { artist: 'Amy Search', genre: 'Malay Rock', date: '2026-03-22', time: '8:00 PM – 10:00 PM', stage: 'Main Stage' },
};

export function getEventConcert(eventId: string, eventStartDate?: string): Concert | null {
  if (HARDCODED_CONCERTS[eventId]) return HARDCODED_CONCERTS[eventId];

  const rng = mulberry32(strToSeed(`concert:${eventId}`));
  if (rng() > 0.35) return null; // ~65% no concert

  const { artist, genre } = pick(rng, CONCERT_ARTISTS);
  const stage = pick(rng, CONCERT_STAGES);
  const time = pick(rng, CONCERT_TIMES);

  // Use event start date + a few days as the concert date
  let date = eventStartDate || '2026-01-01';
  try {
    const d = new Date(date);
    d.setDate(d.getDate() + Math.floor(rng() * 5));
    date = d.toISOString().slice(0, 10);
  } catch {
    // keep original date if parse fails
  }

  return { artist, genre, date, time, stage };
}
