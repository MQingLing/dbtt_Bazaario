export type VendorTier = 'starter' | 'growth' | 'pro' | 'anchor';
export type VendorVerificationStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'vendor' | 'admin';
  isDefaultPassword: boolean;
  createdAt: string;
  // Customer fields
  walletBalance?: number;
  loyaltyStamps?: number;
  qrCode?: string;
  profilePic?: string;
  // Vendor fields
  vendorTier?: VendorTier;
  vendorCategory?: string;
  verificationStatus?: VendorVerificationStatus;
  verificationRejectionReason?: string;
}

const STORAGE_KEY = 'bazaario_users_v4';

// Demo credentials loaded from .env (never committed to source control)
const DEMO_SEED = [
  { id: 'admin-001',    name: 'Super Admin',      email: 'admin@bazaario.com',    pw: import.meta.env.VITE_DEMO_ADMIN_PW    ?? '',  role: 'admin'    as const, isDefaultPassword: true  },
  { id: 'vendor-001',   name: 'The Satay Corner',  email: 'vendor@bazaario.com',   pw: import.meta.env.VITE_DEMO_VENDOR_PW   ?? '',  role: 'vendor'   as const, isDefaultPassword: false },
  { id: 'customer-001', name: 'Alex Tan',           email: 'customer@bazaario.com', pw: import.meta.env.VITE_DEMO_CUSTOMER_PW ?? '',  role: 'customer' as const, isDefaultPassword: false },
];

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function seedUsers(): Promise<void> {
  if (localStorage.getItem(STORAGE_KEY)) return;
  const users: StoredUser[] = await Promise.all(
    DEMO_SEED.map(async (u) => ({
      id:                u.id,
      name:              u.name,
      email:             u.email,
      passwordHash:      await hashPassword(u.pw),
      role:              u.role,
      isDefaultPassword: u.isDefaultPassword,
      createdAt:         new Date().toISOString(),
      // Role-specific defaults
      ...(u.role === 'customer' && {
        walletBalance: 150.00,
        loyaltyStamps: 8,
        qrCode: `QR-${u.id}`,
      }),
      ...(u.role === 'vendor' && {
        vendorTier: 'starter' as VendorTier,
        verificationStatus: 'approved' as VendorVerificationStatus,
      }),
    }))
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getUserById(id: string): StoredUser | null {
  return getUsers().find((u) => u.id === id) ?? null;
}

export async function authenticate(email: string, password: string): Promise<StoredUser | null> {
  const hash = await hashPassword(password);
  return getUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === hash
  ) ?? null;
}

export function addUser(user: StoredUser): void {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function updateUser(id: string, patch: Partial<StoredUser>): StoredUser | null {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  return users[idx];
}

export function updatePassword(id: string, hashedPassword: string): void {
  updateUser(id, { passwordHash: hashedPassword, isDefaultPassword: false });
}

export function emailExists(email: string): boolean {
  return getUsers().some((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getAllUsers(): StoredUser[] {
  return getUsers();
}

export function deleteUser(id: string): void {
  const users = getUsers().filter(u => u.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// Seed on import (async — resolves before any user interaction)
void seedUsers();
