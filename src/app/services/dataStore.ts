/**
 * dataStore.ts — localStorage persistence for mutable app data.
 * Mirrors the same pattern as authStore.ts.
 * Seeded from mockData on first load; subsequent reads/writes go to localStorage.
 */

import { APPLICATIONS, VendorApplication, ApplicationStatus, ORDERS, Order, OrderStatus, PRODUCTS, Product } from '../data/mockData';

const APPLICATIONS_KEY = 'bazaario_applications_v2';

// ── Seed ─────────────────────────────────────────────────────────────────────

function seedApplications() {
  if (!localStorage.getItem(APPLICATIONS_KEY)) {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(APPLICATIONS));
  }
}

// ── Applications ─────────────────────────────────────────────────────────────

export function getApplications(): VendorApplication[] {
  seedApplications();
  return JSON.parse(localStorage.getItem(APPLICATIONS_KEY)!);
}

export function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  extra?: Partial<VendorApplication>,
): void {
  const apps = getApplications();
  const updated = apps.map(a =>
    a.id === id ? { ...a, status, ...extra } : a,
  );
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(updated));
}

/** Reset to seed data — useful for demo resets. */
export function resetApplications(): void {
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(APPLICATIONS));
}

// ── Vouchers ──────────────────────────────────────────────────────────────────

export interface Voucher {
  id: string;          // unique code, e.g. "VOC-A1B2-C3D4"
  name: string;        // "$5 Voucher"
  discount: number;    // dollar value: 1, 5, 10, or 15
  stampsSpent: number; // stamps deducted when earned
  earnedAt: string;    // ISO
  usedAt?: string;     // ISO — present only once applied to an order
}

export const VOUCHER_TIERS: { stampsRequired: number; discount: number; name: string }[] = [
  { stampsRequired: 10, discount:  5, name: '$5 Voucher'  },
  { stampsRequired: 20, discount:  7, name: '$7 Voucher'  },
  { stampsRequired: 30, discount: 10, name: '$10 Voucher' },
  { stampsRequired: 50, discount: 15, name: '$15 Voucher' },
];

function voucherKey(userId: string) { return `bazaario_vouchers_${userId}`; }

function genVoucherId(): string {
  const a = Math.random().toString(36).slice(2, 6).toUpperCase();
  const b = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `VOC-${a}-${b}`;
}

export function getVouchers(userId: string): Voucher[] {
  try { return JSON.parse(localStorage.getItem(voucherKey(userId)) || '[]'); }
  catch { return []; }
}

export function getActiveVouchers(userId: string): Voucher[] {
  return getVouchers(userId).filter(v => !v.usedAt);
}

export function addVoucher(userId: string, tier: typeof VOUCHER_TIERS[number]): Voucher {
  const v: Voucher = { id: genVoucherId(), name: tier.name, discount: tier.discount, stampsSpent: tier.stampsRequired, earnedAt: new Date().toISOString() };
  const all = getVouchers(userId);
  all.unshift(v);
  localStorage.setItem(voucherKey(userId), JSON.stringify(all));
  return v;
}

export function markVoucherUsed(userId: string, voucherId: string): void {
  const all = getVouchers(userId).map(v => v.id === voucherId ? { ...v, usedAt: new Date().toISOString() } : v);
  localStorage.setItem(voucherKey(userId), JSON.stringify(all));
}

// ── Legacy redeemed rewards (kept for backward compat) ────────────────────────

export interface RedeemedReward {
  rewardId: string;
  rewardName: string;
  stampsSpent: number;
  redeemedAt: string;
}

export function getRedeemedRewards(userId: string): RedeemedReward[] {
  return getVouchers(userId).map(v => ({
    rewardId: v.id, rewardName: v.name, stampsSpent: v.stampsSpent, redeemedAt: v.earnedAt,
  }));
}

export function addRedeemedReward(userId: string, reward: Omit<RedeemedReward, 'redeemedAt'>): void {
  // no-op — use addVoucher instead
  void userId; void reward;
}

// ── Vendor Document Submissions ───────────────────────────────────────────────

export interface VendorDocSubmission {
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  vendorCategory: string;
  submittedAt: string;
  documents: {
    businessLicense: boolean;
    sfaLicense: boolean;
    personalId: boolean;
    pastParticipation: boolean;
  };
  notes: string;
}

const VENDOR_SUBMISSIONS_KEY = 'bazaario_vendor_submissions';

function getSubmissions(): VendorDocSubmission[] {
  try {
    return JSON.parse(localStorage.getItem(VENDOR_SUBMISSIONS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveVendorSubmission(submission: VendorDocSubmission): void {
  const all = getSubmissions().filter(s => s.vendorId !== submission.vendorId);
  all.unshift(submission);
  localStorage.setItem(VENDOR_SUBMISSIONS_KEY, JSON.stringify(all));
}

export function getVendorSubmission(vendorId: string): VendorDocSubmission | null {
  return getSubmissions().find(s => s.vendorId === vendorId) ?? null;
}

export function getAllVendorSubmissions(): VendorDocSubmission[] {
  return getSubmissions();
}

// ── Daily Check-in ────────────────────────────────────────────────────────────

function checkInKey(userId: string) { return `bazaario_checkin_${userId}`; }

export interface CheckInRecord {
  lastDate: string; // YYYY-MM-DD
  streak: number;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getCheckInRecord(userId: string): CheckInRecord {
  try {
    return JSON.parse(localStorage.getItem(checkInKey(userId)) || 'null') ?? { lastDate: '', streak: 0 };
  } catch { return { lastDate: '', streak: 0 }; }
}

export function canCheckInToday(userId: string): boolean {
  return getCheckInRecord(userId).lastDate !== todayISO();
}

export function doCheckIn(userId: string): CheckInRecord {
  const today     = todayISO();
  const prev      = getCheckInRecord(userId);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streak    = prev.lastDate === yesterday ? prev.streak + 1 : 1;
  const record: CheckInRecord = { lastDate: today, streak };
  localStorage.setItem(checkInKey(userId), JSON.stringify(record));
  return record;
}

// ── Transactions ──────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  type: 'spent' | 'topup';
  vendor: string;
  amount: number;
  date: string;   // e.g. "Mar 5, 2026"
  time: string;   // e.g. "7:30 PM"
  status: 'completed';
  paymentMethod: string;
}

function txKey(userId: string) { return `bazaario_transactions_${userId}`; }

const SEED_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'spent', vendor: "Wong's Satay",       amount: 15.00,  date: 'Mar 5, 2026', time: '7:30 PM', status: 'completed', paymentMethod: 'Wallet' },
  { id: '2', type: 'topup', vendor: 'Credit Card',         amount: 50.00,  date: 'Mar 5, 2026', time: '6:00 PM', status: 'completed', paymentMethod: 'Credit / Debit Card' },
  { id: '3', type: 'spent', vendor: 'Bubble Tea Paradise', amount: 8.50,   date: 'Mar 4, 2026', time: '8:15 PM', status: 'completed', paymentMethod: 'Cash' },
  { id: '4', type: 'spent', vendor: 'Golden Snacks',       amount: 12.00,  date: 'Mar 4, 2026', time: '7:45 PM', status: 'completed', paymentMethod: 'Wallet' },
  { id: '5', type: 'topup', vendor: 'PayNow',              amount: 100.00, date: 'Mar 3, 2026', time: '5:00 PM', status: 'completed', paymentMethod: 'PayNow' },
  { id: '6', type: 'spent', vendor: 'Artisan Crafts',      amount: 35.00,  date: 'Mar 3, 2026', time: '8:30 PM', status: 'completed', paymentMethod: 'Wallet' },
];

export function getTransactions(userId: string): Transaction[] {
  try {
    const stored = localStorage.getItem(txKey(userId));
    return stored ? JSON.parse(stored) : [...SEED_TRANSACTIONS];
  } catch { return [...SEED_TRANSACTIONS]; }
}

export function addTransaction(userId: string, tx: Omit<Transaction, 'id'>): void {
  const all = getTransactions(userId);
  const newTx: Transaction = { ...tx, id: Date.now().toString() };
  localStorage.setItem(txKey(userId), JSON.stringify([newTx, ...all]));
}

// ── Products ──────────────────────────────────────────────────────────────────

const PRODUCTS_KEY = 'bazaario_products_vendor001';

export function getProducts(): Product[] {
  try {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    return stored ? JSON.parse(stored) : PRODUCTS;
  } catch { return [...PRODUCTS]; }
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function getProductInStock(itemName: string): boolean {
  const p = getProducts().find(p => p.name === itemName);
  return p ? p.inStock : true;
}

// ── Event Compliance (SCDF / SFA / EMA) ──────────────────────────────────────

export type PermitStatus = 'not_required' | 'pending' | 'submitted' | 'approved' | 'expired';

export interface PermitRecord {
  status: PermitStatus;
  referenceNo?: string;
  expiryDate?: string;
  notes?: string;
}

export interface EventCompliance {
  eventId: string;
  scdf: PermitRecord;
  sfa: PermitRecord;
  ema: PermitRecord;
  updatedAt: string;
}

const COMPLIANCE_KEY = 'bazaario_event_compliance';

function getComplianceMap(): Record<string, EventCompliance> {
  try { return JSON.parse(localStorage.getItem(COMPLIANCE_KEY) || '{}'); }
  catch { return {}; }
}

export function hasEventCompliance(eventId: string): boolean {
  return eventId in getComplianceMap();
}

export function getEventCompliance(eventId: string): EventCompliance {
  const map = getComplianceMap();
  return map[eventId] ?? {
    eventId,
    scdf: { status: 'pending' },
    sfa:  { status: 'pending' },
    ema:  { status: 'pending' },
    updatedAt: new Date().toISOString(),
  };
}

export function saveEventCompliance(record: EventCompliance): void {
  const map = getComplianceMap();
  map[record.eventId] = { ...record, updatedAt: new Date().toISOString() };
  localStorage.setItem(COMPLIANCE_KEY, JSON.stringify(map));
}

// ── Orders ────────────────────────────────────────────────────────────────────

const ORDERS_KEY = 'bazaario_orders';

function seedOrders() {
  if (!localStorage.getItem(ORDERS_KEY)) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(ORDERS));
  }
}

export function getOrders(): Order[] {
  seedOrders();
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY)!); }
  catch { return []; }
}

export function addOrder(order: Order): void {
  const orders = getOrders();
  localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...orders]));
}

export function advanceOrderStatus(id: string): void {
  const next: Record<string, OrderStatus> = {
    pending: 'preparing',
    preparing: 'ready',
    ready: 'completed',
  };
  const orders = getOrders();
  const updated = orders.map(o => next[o.status] ? (o.id === id ? { ...o, status: next[o.status] } : o) : o);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
}
