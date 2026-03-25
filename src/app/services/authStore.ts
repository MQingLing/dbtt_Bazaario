export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'vendor' | 'admin';
  isDefaultPassword: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'bazaario_users_v2';

// Demo credentials — not real accounts, hashed before storage
const DEMO_SEED = [
  { id: 'admin-001',    name: 'Super Admin',      email: 'admin@bazaario.com',    pw: 'Admin@123',    role: 'admin'    as const, isDefaultPassword: true  },
  { id: 'vendor-001',   name: 'The Satay Corner',  email: 'vendor@bazaario.com',   pw: 'Vendor@123',   role: 'vendor'   as const, isDefaultPassword: false },
  { id: 'customer-001', name: 'Alex Tan',           email: 'customer@bazaario.com', pw: 'Customer@123', role: 'customer' as const, isDefaultPassword: false },
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

export function updatePassword(id: string, hashedPassword: string): void {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx !== -1) {
    users[idx].passwordHash      = hashedPassword;
    users[idx].isDefaultPassword = false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }
}

export function emailExists(email: string): boolean {
  return getUsers().some((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getAllUsers(): StoredUser[] {
  return getUsers();
}

// Seed on import (async — resolves before any user interaction)
void seedUsers();
