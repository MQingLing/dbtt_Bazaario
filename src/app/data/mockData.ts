/**
 * mockData.ts — Shared static data for vendor portal and admin portal demo.
 * Events and vendor lists come from pasarMalamData.ts and vendors.ts.
 */

// ── PRODUCTS (Wong's Satay, vendorId: '1') ────────────────────────────────
export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  popular: boolean;
  image: string;
}

export const PRODUCTS: Product[] = [
  { id: '1', vendorId: '1', name: 'Chicken Satay (10 sticks)', description: 'Tender marinated chicken skewers grilled to perfection with our secret spice blend', price: 8.00, category: 'Satay', inStock: true, popular: true, image: 'https://images.unsplash.com/photo-1722704689022-98d1b7795589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYXRheSUyMGZvb2QlMjBzdGFsbHxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '2', vendorId: '1', name: 'Beef Satay (10 sticks)', description: 'Premium beef marinated in aromatic spices, slow-grilled over charcoal', price: 10.00, category: 'Satay', inStock: true, popular: true, image: 'https://images.unsplash.com/photo-1771804359368-0f91f81ee83b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN0cmVldCUyMGZvb2QlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '3', vendorId: '1', name: 'Lamb Satay (10 sticks)', description: 'Succulent lamb with traditional Malay spices and a smoky finish', price: 12.00, category: 'Satay', inStock: false, popular: false, image: 'https://images.unsplash.com/photo-1763621470208-efe14b618119?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5nYXBvcmUlMjBuaWdodCUyMG1hcmtldCUyMGZvb2QlMjBzdGFsbHN8ZW58MXx8fHwxNzcyNzE4OTUzfDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '4', vendorId: '1', name: 'Mixed Satay Platter (30 sticks)', description: 'Assorted chicken, beef, and lamb satay served with peanut sauce, ketupat, and cucumber', price: 25.00, category: 'Platters', inStock: true, popular: true, image: 'https://images.unsplash.com/photo-1771804359368-0f91f81ee83b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN0cmVldCUyMGZvb2QlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '5', vendorId: '1', name: 'Satay Sauce (Extra)', description: 'Our famous homemade peanut sauce — thick, rich, and perfectly spiced', price: 2.00, category: 'Extras', inStock: true, popular: false, image: 'https://images.unsplash.com/photo-1738599935343-991708a2895b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllZCUyMHNuYWNrcyUyMGZvb2R8ZW58MXx8fHwxNzcyNzE4OTU1fDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '6', vendorId: '1', name: 'Ketupat (Rice Cakes)', description: 'Traditional compressed rice cakes woven in coconut leaf, perfect with satay', price: 3.00, category: 'Extras', inStock: true, popular: true, image: 'https://images.unsplash.com/photo-1763621470208-efe14b618119?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5nYXBvcmUlMjBuaWdodCUyMG1hcmtldCUyMGZvb2QlMjBzdGFsbHN8ZW58MXx8fHwxNzcyNzE4OTUzfDA&ixlib=rb-4.1.0&q=80&w=1080' },
];

// ── ORDERS (Wong's Satay portal) ─────────────────────────────────────────────
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface OrderItem { name: string; qty: number; price: number; }

export interface Order {
  id: string;
  customer: string;
  customerId: string;
  phone: string;
  items: OrderItem[];
  total: number;
  time: string;
  status: OrderStatus;
  pickupTime: string;
}

export const ORDERS: Order[] = [
  { id: '#1245', customer: 'Sarah Tan',   customerId: 'cst-001', phone: '+65 9123 4567', items: [{ name: 'Chicken Satay (10 sticks)', qty: 2, price: 8 }, { name: 'Satay Sauce (Extra)', qty: 1, price: 2 }], total: 18.00, time: '5 mins ago',  status: 'pending',   pickupTime: '7:30 PM' },
  { id: '#1244', customer: 'Mike Chen',   customerId: 'cst-002', phone: '+65 8234 5678', items: [{ name: 'Mixed Satay Platter (30 sticks)', qty: 1, price: 25 }],                                                total: 25.00, time: '12 mins ago', status: 'preparing', pickupTime: '7:45 PM' },
  { id: '#1243', customer: 'Priya Kumar', customerId: 'cst-003', phone: '+65 9345 6789', items: [{ name: 'Beef Satay (10 sticks)', qty: 3, price: 10 }],                                                          total: 30.00, time: '18 mins ago', status: 'ready',     pickupTime: '7:15 PM' },
  { id: '#1242', customer: 'John Lim',    customerId: 'cst-004', phone: '+65 8456 7890', items: [{ name: 'Chicken Satay (10 sticks)', qty: 1, price: 8 }, { name: 'Satay Sauce (Extra)', qty: 2, price: 2 }],     total: 12.00, time: '25 mins ago', status: 'completed', pickupTime: '7:00 PM' },
  { id: '#1241', customer: 'Lisa Wong',   customerId: 'cst-005', phone: '+65 9567 8901', items: [{ name: 'Mixed Satay Platter (30 sticks)', qty: 2, price: 25 }],                                                total: 50.00, time: '32 mins ago', status: 'completed', pickupTime: '6:45 PM' },
  { id: '#1240', customer: 'David Ng',    customerId: 'cst-006', phone: '+65 8678 9012', items: [{ name: 'Lamb Satay (10 sticks)', qty: 1, price: 12 }],                                                          total: 12.00, time: '15 mins ago', status: 'cancelled', pickupTime: '8:00 PM' },
];

// ── VENDOR STATS (Wong's Satay, id '1') ───────────────────────────────────────
export const VENDOR_STATS = {
  todaySales:      285.50,
  todayOrders:     23,
  totalRevenue:    55257.00,
  totalCustomers:  156,
  pendingOrders:   5,
  completedOrders: 18,
};

// ── MAP STALLS (Geylang Serai Ramadan Bazaar, event id '1') ──────────────────
export interface MapStall {
  id: string;
  number: string;
  vendorName: string;
  category: string;
  x: number;
  y: number;
  rating: number;
}

export const MAP_STALLS: MapStall[] = [
  { id: '1',  number: 'A01', vendorName: "Wong's Satay",       category: 'Food',     x: 10, y: 15, rating: 4.9 },
  { id: '2',  number: 'A02', vendorName: 'Noodle House',        category: 'Food',     x: 25, y: 15, rating: 4.7 },
  { id: '3',  number: 'A03', vendorName: 'Spice Junction',      category: 'Food',     x: 40, y: 15, rating: 4.5 },
  { id: '4',  number: 'A04', vendorName: 'Sweet Treats',        category: 'Desserts', x: 55, y: 15, rating: 4.8 },
  { id: '5',  number: 'A05', vendorName: 'Golden Snacks',       category: 'Food',     x: 70, y: 15, rating: 4.6 },
  { id: '6',  number: 'A06', vendorName: 'Tea Corner',          category: 'Drinks',   x: 85, y: 15, rating: 4.5 },
  { id: '7',  number: 'B01', vendorName: 'Fruit Paradise',      category: 'Drinks',   x: 10, y: 35, rating: 4.7 },
  { id: '8',  number: 'B02', vendorName: 'Bubble Tea Paradise', category: 'Drinks',   x: 25, y: 35, rating: 4.7 },
  { id: '9',  number: 'B03', vendorName: 'Grilled Perfection',  category: 'Food',     x: 40, y: 35, rating: 4.8 },
  { id: '10', number: 'B04', vendorName: 'Dumpling Master',     category: 'Food',     x: 55, y: 35, rating: 4.6 },
  { id: '11', number: 'B05', vendorName: 'Spice Route',         category: 'Food',     x: 70, y: 35, rating: 4.7 },
  { id: '12', number: 'B06', vendorName: 'Fresh Juice Bar',     category: 'Drinks',   x: 85, y: 35, rating: 4.5 },
  { id: '13', number: 'C01', vendorName: 'Fashion Finds',       category: 'Products', x: 10, y: 55, rating: 4.4 },
  { id: '14', number: 'C02', vendorName: 'Accessories Hub',     category: 'Products', x: 25, y: 55, rating: 4.6 },
  { id: '15', number: 'C03', vendorName: 'Artisan Crafts',      category: 'Products', x: 40, y: 55, rating: 4.8 },
  { id: '16', number: 'C04', vendorName: 'Tech Gadgets',        category: 'Products', x: 55, y: 55, rating: 4.5 },
  { id: '17', number: 'C05', vendorName: 'Home Decor',          category: 'Products', x: 70, y: 55, rating: 4.7 },
  { id: '18', number: 'C06', vendorName: 'Fashion Hub',         category: 'Products', x: 85, y: 55, rating: 4.4 },
  { id: '19', number: 'D01', vendorName: 'Toy Paradise',        category: 'Products', x: 10, y: 75, rating: 4.5 },
  { id: '20', number: 'D02', vendorName: 'Book Nook',           category: 'Products', x: 25, y: 75, rating: 4.4 },
  { id: '21', number: 'D03', vendorName: 'Plant Shop',          category: 'Products', x: 40, y: 75, rating: 4.7 },
  { id: '22', number: 'D04', vendorName: 'Snack Haven',         category: 'Food',     x: 55, y: 75, rating: 4.8 },
  { id: '23', number: 'D05', vendorName: 'Ice Cream Joy',       category: 'Desserts', x: 70, y: 75, rating: 4.9 },
  { id: '24', number: 'D06', vendorName: 'Coffee & More',       category: 'Drinks',   x: 85, y: 75, rating: 4.6 },
];

// ── APPLICATIONS ─────────────────────────────────────────────────────────────
export type ApplicationStatus = 'draft' | 'submitted' | 'under-review' | 'approved' | 'paid' | 'waitlisted' | 'rejected' | 'cancelled';

export interface VendorApplication {
  id: string;
  applicationId: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  vendorRating: number;
  eventId: string;
  eventName: string;
  eventDate: string;
  stallCategory: string;
  stallSize: string;
  bidAmount?: number;
  fixedPrice?: number;
  notes: string;
  submittedDate: string;
  status: ApplicationStatus;
  pricingModel: 'fixed' | 'bidding';
  documents: string[];
  previousEvents: number;
}

export const APPLICATIONS: VendorApplication[] = [
  { id: '1', applicationId: 'APP001', vendorName: 'Satay King',        vendorEmail: 'satayking@example.com', vendorPhone: '+65 9123 4567', vendorRating: 4.8, eventId: '1', eventName: 'Geylang Serai Ramadan Bazaar', eventDate: '2026-02-14', stallCategory: 'Food Stall',     stallSize: 'Medium (4m x 3m)', bidAmount: 225, notes: 'Specialising in authentic Malaysian satay.', submittedDate: '2026-01-15', status: 'under-review', pricingModel: 'bidding', documents: ['food-license.pdf', 'insurance.pdf', 'menu-photos.pdf'], previousEvents: 5 },
  { id: '2', applicationId: 'APP002', vendorName: 'Nasi Lemak Express', vendorEmail: 'nasilemak@example.com', vendorPhone: '+65 9234 5678', vendorRating: 4.6, eventId: '1', eventName: 'Geylang Serai Ramadan Bazaar', eventDate: '2026-02-14', stallCategory: 'Food Stall',     stallSize: 'Large (5m x 4m)',  bidAmount: 300, notes: 'Award-winning nasi lemak.',              submittedDate: '2026-01-18', status: 'approved',     pricingModel: 'bidding', documents: ['food-license.pdf', 'insurance.pdf'], previousEvents: 8 },
  { id: '3', applicationId: 'APP003', vendorName: 'Henna Art Studio',   vendorEmail: 'hennaart@example.com',  vendorPhone: '+65 9345 6789', vendorRating: 4.9, eventId: '1', eventName: 'Geylang Serai Ramadan Bazaar', eventDate: '2026-02-14', stallCategory: 'Non-Food Stall', stallSize: 'Small (3m x 2m)',  fixedPrice: 120, notes: 'Professional henna artist, 10 years exp.', submittedDate: '2026-01-20', status: 'paid',         pricingModel: 'fixed',   documents: ['business-reg.pdf', 'insurance.pdf', 'portfolio.pdf'], previousEvents: 12 },
  { id: '4', applicationId: 'APP004', vendorName: 'Street Fashion SG',  vendorEmail: 'fashion@example.com',   vendorPhone: '+65 9456 7890', vendorRating: 4.3, eventId: '6', eventName: 'Yishun Pasar Malam',          eventDate: '2026-03-15', stallCategory: 'Non-Food Stall', stallSize: 'Medium (4m x 3m)', fixedPrice: 180, notes: 'Trendy streetwear and accessories.',      submittedDate: '2026-02-01', status: 'waitlisted',   pricingModel: 'fixed',   documents: ['business-reg.pdf'], previousEvents: 3 },
  { id: '5', applicationId: 'APP005', vendorName: 'Bubble Tea Paradise', vendorEmail: 'bubbletea@example.com', vendorPhone: '+65 8234 5678', vendorRating: 4.7, eventId: '7', eventName: 'Tampines Pasar Malam',        eventDate: '2026-03-20', stallCategory: 'Food Stall',     stallSize: 'Medium (4m x 3m)', bidAmount: 280, notes: 'Popular bubble tea brand.',              submittedDate: '2026-02-05', status: 'rejected',     pricingModel: 'bidding', documents: ['food-license.pdf', 'insurance.pdf'], previousEvents: 6 },
];

// ── ADMIN VENDOR TABLE (for AdminVendorManagement) ──────────────────────────
export interface AdminVendor {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  category: string;
  stallNumber: string;
  eventName: string;
  status: 'active' | 'pending' | 'suspended';
  rating: number;
  totalRevenue: number;
  events: number;
  joined: string;
}

export const ADMIN_VENDORS: AdminVendor[] = [
  { id: '1', name: "Wong's Satay",       owner: 'Wong Li Ming',   email: 'wong@email.com',     phone: '+65 9123 4567', category: 'Food',     stallNumber: 'A01', eventName: 'Geylang Serai Ramadan Bazaar', status: 'active',    rating: 4.9, totalRevenue: 55257, events: 12, joined: 'Jan 15, 2026' },
  { id: '2', name: 'Bubble Tea Paradise', owner: 'Sarah Tan',      email: 'sarah@email.com',    phone: '+65 8234 5678', category: 'Drinks',   stallNumber: 'B02', eventName: 'Geylang Serai Ramadan Bazaar', status: 'pending',   rating: 4.7, totalRevenue: 0,     events: 0,  joined: 'Mar 3, 2026'  },
  { id: '3', name: 'Artisan Crafts',      owner: 'Kumar Rajan',    email: 'kumar@email.com',    phone: '+65 9345 6789', category: 'Products', stallNumber: 'C03', eventName: 'Geylang Serai Ramadan Bazaar', status: 'active',    rating: 4.8, totalRevenue: 8750,  events: 2,  joined: 'Feb 28, 2026' },
  { id: '4', name: 'Golden Snacks',       owner: 'Lim Wei Jie',    email: 'lim@email.com',      phone: '+65 8456 7890', category: 'Food',     stallNumber: 'A05', eventName: 'Geylang Serai Ramadan Bazaar', status: 'active',    rating: 4.6, totalRevenue: 9200,  events: 2,  joined: 'Jan 20, 2026' },
  { id: '5', name: 'Spice Junction',      owner: 'Ahmad Ali',      email: 'ahmad@email.com',    phone: '+65 8678 9012', category: 'Food',     stallNumber: 'A03', eventName: 'Geylang Serai Ramadan Bazaar', status: 'pending',   rating: 4.5, totalRevenue: 0,     events: 0,  joined: 'Mar 4, 2026'  },
  { id: '6', name: 'Fashion Hub',         owner: 'Lisa Chen',      email: 'lisa@email.com',     phone: '+65 9567 8901', category: 'Products', stallNumber: 'C06', eventName: 'Geylang Serai Ramadan Bazaar', status: 'suspended', rating: 4.4, totalRevenue: 5300,  events: 1,  joined: 'Feb 10, 2026' },
];
