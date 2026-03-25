export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'vendor' | 'admin';
  isDefaultPassword: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'bazaario_users';

const SEED_USERS: StoredUser[] = [
  {
    id: 'admin-001',
    name: 'Super Admin',
    email: 'admin@bazaario.com',
    password: 'Admin@123',
    role: 'admin',
    isDefaultPassword: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vendor-001',
    name: 'The Satay Corner',
    email: 'vendor@bazaario.com',
    password: 'Vendor@123',
    role: 'vendor',
    isDefaultPassword: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'customer-001',
    name: 'Alex Tan',
    email: 'customer@bazaario.com',
    password: 'Customer@123',
    role: 'customer',
    isDefaultPassword: false,
    createdAt: new Date().toISOString(),
  },
];

export function seedUsers(): void {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_USERS));
  }
}

export function getUsers(): StoredUser[] {
  seedUsers();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getUserById(id: string): StoredUser | null {
  return getUsers().find((u) => u.id === id) ?? null;
}

export function authenticate(email: string, password: string): StoredUser | null {
  const user = getUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  return user ?? null;
}

export function addUser(user: StoredUser): void {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function updatePassword(id: string, newPassword: string): void {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx !== -1) {
    users[idx].password = newPassword;
    users[idx].isDefaultPassword = false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }
}

export function emailExists(email: string): boolean {
  return getUsers().some((u) => u.email.toLowerCase() === email.toLowerCase());
}

// Call seed immediately on module import
seedUsers();
