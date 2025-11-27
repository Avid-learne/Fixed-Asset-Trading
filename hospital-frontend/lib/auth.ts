// hospital-frontend/lib/auth.ts
import { hash, compare } from 'bcryptjs';

export interface User {
  id: string;
  address: string;
  role: 'patient' | 'bank' | 'hospital';
  passwordHash: string;
  name?: string;
  createdAt: number;
}

// In a real application, this would be a database
// For demo purposes, we'll use localStorage with encryption
const USERS_KEY = 'hospital_users';
const SESSION_KEY = 'hospital_session';

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await compare(password, hash);
}

export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function registerUser(
  address: string,
  password: string,
  role: User['role'],
  name?: string
): Promise<{ success: boolean; error?: string }> {
  const users = getUsers();
  
  if (users.find(u => u.address.toLowerCase() === address.toLowerCase())) {
    return { success: false, error: 'Address already registered' };
  }

  const passwordHash = await hashPassword(password);
  const newUser: User = {
    id: crypto.randomUUID(),
    address: address.toLowerCase(),
    role,
    passwordHash,
    name,
    createdAt: Date.now(),
  };

  users.push(newUser);
  saveUsers(users);
  
  return { success: true };
}

export async function loginUser(
  address: string,
  password: string,
  role: User['role']
): Promise<{ success: boolean; user?: Omit<User, 'passwordHash'>; error?: string }> {
  const users = getUsers();
  const user = users.find(
    u => u.address.toLowerCase() === address.toLowerCase() && u.role === role
  );

  if (!user) {
    return { success: false, error: 'Invalid credentials' };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { success: false, error: 'Invalid credentials' };
  }

  const session = {
    userId: user.id,
    address: user.address,
    role: user.role,
    name: user.name,
    timestamp: Date.now(),
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  const { passwordHash, ...userWithoutPassword } = user;
  return { success: true, user: userWithoutPassword };
}

export function getSession() {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return null;
  
  const session = JSON.parse(data);
  // Check if session is older than 24 hours
  if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
    logout();
    return null;
  }
  
  return session;
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export function requireAuth(role?: User['role']) {
  const session = getSession();
  if (!session) return null;
  if (role && session.role !== role) return null;
  return session;
}