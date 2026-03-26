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

// ── Redeemed Rewards ─────────────────────────────────────────────────────────

export interface RedeemedReward {
  rewardId: string;
  rewardName: string;
  stampsSpent: number;
  redeemedAt: string; // ISO string
}

function redeemedKey(userId: string) {
  return `bazaario_redeemed_${userId}`;
}

export function getRedeemedRewards(userId: string): RedeemedReward[] {
  try {
    return JSON.parse(localStorage.getItem(redeemedKey(userId)) || '[]');
  } catch {
    return [];
  }
}

export function addRedeemedReward(userId: string, reward: Omit<RedeemedReward, 'redeemedAt'>): void {
  const history = getRedeemedRewards(userId);
  history.unshift({ ...reward, redeemedAt: new Date().toISOString() });
  localStorage.setItem(redeemedKey(userId), JSON.stringify(history));
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
