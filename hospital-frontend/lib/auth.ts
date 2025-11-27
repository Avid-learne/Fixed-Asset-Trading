// hospital-frontend/lib/auth.ts
"use client";

import { hash, compare } from "bcryptjs";

export type Session = {
  userId?: string;
  role: "patient" | "bank" | "hospital" | string;
  name?: string;
  address?: string;
  timestamp?: number;
};

export interface User {
  id: string;
  address: string;
  role: "patient" | "bank" | "hospital";
  passwordHash: string;
  name?: string;
  createdAt: number;
}

const USERS_KEY = "hospital_users";
const SESSION_KEY = "hospital_session";

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 10);
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  return await compare(password, hashed);
}

export function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveUsers(users: User[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function registerUser(
  address: string,
  password: string,
  role: User["role"],
  name?: string
): Promise<{ success: boolean; error?: string }> {
  if (typeof window === "undefined") return { success: false, error: "No window" };

  const users = getUsers();
  if (users.find((u) => u.address.toLowerCase() === address.toLowerCase())) {
    return { success: false, error: "Address already registered" };
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
  role: User["role"]
): Promise<{ success: boolean; user?: Omit<User, "passwordHash">; error?: string }> {
  if (typeof window === "undefined") return { success: false, error: "No window" };

  const users = getUsers();
  const user = users.find((u) => u.address.toLowerCase() === address.toLowerCase() && u.role === role);
  if (!user) return { success: false, error: "Invalid credentials" };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { success: false, error: "Invalid credentials" };

  const session: Session = {
    userId: user.id,
    role: user.role,
    name: user.name,
    address: user.address,
    timestamp: Date.now(),
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  const { passwordHash, ...userNoPw } = user;
  return { success: true, user: userNoPw };
}

export function setSession(session: Session) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Session;
    if (s.timestamp && Date.now() - s.timestamp > 24 * 60 * 60 * 1000) {
      logout();
      return null;
    }
    return s;
  } catch (e) {
    return null;
  }
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export function createSessionForRole(role: Session["role"], address?: string, name?: string) {
  const s: Session = { role, address, name, timestamp: Date.now() };
  setSession(s);
  return s;
}

export function requireAuth(role?: User["role"]) {
  const s = getSession();
  if (!s) return null;
  if (role && s.role !== role) return null;
  return s;
}

export function getCurrentUser() {
  return getSession();
}