/**
 * LocalStorage-based Auth utilities.
 * This is a simple front-end only implementation for demo/MVP.
 */

export type UserRole = "student" | "admin" | "staff";

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  address?: string;
}

type AuthResult =
  | { ok: true; user: User }
  | { ok: false; error: string };

const USERS_KEY = "hm_users";
const CURRENT_USER_KEY = "hm_current_user";

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as User[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setCurrentUser(user: User) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function isValidEmail(email: string) {
  // Simple email regex for demo
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Register a new user.
 * - Unique email required
 * - Password length >= 6
 * - If role === "student", address is required
 */
export function registerUser(params: {
  email: string;
  password: string;
  role: UserRole;
  address?: string;
}): AuthResult {
  const { email, password, role, address } = params;

  if (!isValidEmail(email)) {
    return { ok: false, error: "Invalid email format." };
  }
  if ((password ?? "").length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  if (role === "student" && !address) {
    return { ok: false, error: "Address is required for student role." };
  }

  const users = loadUsers();
  const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return { ok: false, error: "Email is already registered." };
  }

  const user: User = {
    id: genId(),
    email,
    password,
    role,
    address: role === "student" ? address : undefined,
  };
  users.push(user);
  saveUsers(users);
  return { ok: true, user };
}

/**
 * Login by email & password.
 * Sets current user on success.
 */
export function login(email: string, password: string): AuthResult {
  if (!isValidEmail(email)) {
    return { ok: false, error: "Invalid email format." };
  }
  const users = loadUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) {
    return { ok: false, error: "Invalid email or password." };
  }
  setCurrentUser(user);
  return { ok: true, user };
}

/**
 * Reset password for an existing account.
 */
export function resetPassword(email: string, newPassword: string): AuthResult {
  if (!isValidEmail(email)) {
    return { ok: false, error: "Invalid email format." };
  }
  if ((newPassword ?? "").length < 6) {
    return { ok: false, error: "New password must be at least 6 characters." };
  }
  const users = loadUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) {
    return { ok: false, error: "Email not found." };
  }
  users[idx] = { ...users[idx], password: newPassword };
  saveUsers(users);

  // If resetting currently logged-in user, update session too
  const current = getCurrentUser();
  if (current && current.email.toLowerCase() === email.toLowerCase()) {
    setCurrentUser(users[idx]);
  }

  return { ok: true, user: users[idx] };
}

/**
 * Logout: clears current session.
 */
export function logout(): void {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch {
    // ignore
  }
}

/**
 * Ensure a default admin account exists for demo purposes.
 * Email: admin@fixify.local
 * Password: admin123
 */
export function ensureDefaultAdmin(): void {
  const users = loadUsers();
  const hasAdmin = users.some((u) => u.role === "admin");
  if (!hasAdmin) {
    users.push({
      id: genId(),
      email: "admin@fixify.local",
      password: "admin123",
      role: "admin",
    });
    saveUsers(users);
  }
}
