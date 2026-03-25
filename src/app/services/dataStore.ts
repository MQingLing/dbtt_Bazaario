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
