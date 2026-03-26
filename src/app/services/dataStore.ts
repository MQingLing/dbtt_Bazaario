/**
 * dataStore.ts — localStorage persistence for mutable app data.
 * Mirrors the same pattern as authStore.ts.
 * Seeded from mockData on first load; subsequent reads/writes go to localStorage.
 */

import { APPLICATIONS, VendorApplication, ApplicationStatus } from '../data/mockData';

const APPLICATIONS_KEY = 'bazaario_applications';

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
