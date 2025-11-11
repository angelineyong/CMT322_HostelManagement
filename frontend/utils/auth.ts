/* LocalStorage-based auth and staff management utilities */

export type UserRole = "student" | "admin";

export interface User {
  email: string;
  password: string; // demo-only (plain text for simplicity)
  role: UserRole;
  address?: string; // required when role === "student"
  createdAt: string;
}

export type StaffStatus = "active" | "inactive";

export interface StaffProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  status: StaffStatus;
  createdAt: string;
}

const USERS_KEY = "hm_users";
const CURRENT_USER_KEY = "hm_current_user";
const STAFF_PROFILES_KEY = "hm_staff_profiles";

/* ---------- Generic helpers ---------- */

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function genId(prefix = "id"): string {
  const rand = Math.random().toString(36).slice(2, 8);
  const ts = Date.now().toString(36);
  return `${prefix}_${ts}_${rand}`;
}

/* ---------- Users ---------- */

export function getUsers(): User[] {
  return readJSON<User[]>(USERS_KEY, []);
}

export function saveUsers(users: User[]): void {
  writeJSON<User[]>(USERS_KEY, users);
}

export function findUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function registerUser(input: {
  email: string;
  password: string;
  role: UserRole;
  address?: string;
}): { ok: true } | { ok: false; error: string } {
  const email = input.email.trim();
  const password = input.password.trim();
  const role = input.role;
  const address = input.address?.trim();

  if (!email) return { ok: false, error: "Email is required." };
  if (!/\S+@\S+\.\S+/.test(email)) return { ok: false, error: "Invalid email format." };
  if (!password || password.length < 6)
    return { ok: false, error: "Password must be at least 6 characters." };
  if (role !== "student" && role !== "admin")
    return { ok: false, error: "Role must be student or admin." };
  if (role === "student" && !address)
    return { ok: false, error: "Address is required for student." };

  const existing = findUserByEmail(email);
  if (existing) {
    return { ok: false, error: "Email already registered." };
  }

  const users = getUsers();
  users.push({
    email,
    password,
    role,
    address,
    createdAt: new Date().toISOString(),
  });
  saveUsers(users);
  return { ok: true };
}

export function login(email: string, password: string): { ok: true; user: User } | { ok: false; error: string } {
  const user = findUserByEmail(email.trim());
  if (!user) return { ok: false, error: "User not found." };
  if (user.password !== password.trim()) return { ok: false, error: "Incorrect password." };
  setCurrentUser(user);
  return { ok: true, user };
}

export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser(): User | null {
  return readJSON<User | null>(CURRENT_USER_KEY, null);
}

export function setCurrentUser(user: User): void {
  writeJSON<User>(CURRENT_USER_KEY, user);
}

export function resetPassword(email: string, newPassword: string): { ok: true } | { ok: false; error: string } {
  const trimmedEmail = email.trim();
  const trimmedPwd = newPassword.trim();
  if (!trimmedEmail) return { ok: false, error: "Email is required." };
  if (!trimmedPwd || trimmedPwd.length < 6)
    return { ok: false, error: "New password must be at least 6 characters." };

  const users = getUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === trimmedEmail.toLowerCase());
  if (idx < 0) return { ok: false, error: "User not found." };
  users[idx] = { ...users[idx], password: trimmedPwd };
  saveUsers(users);
  return { ok: true };
}

/* ---------- Staff Profiles (Admin) ---------- */

export function getStaffProfiles(): StaffProfile[] {
  return readJSON<StaffProfile[]>(STAFF_PROFILES_KEY, []);
}

export function saveStaffProfiles(list: StaffProfile[]): void {
  writeJSON<StaffProfile[]>(STAFF_PROFILES_KEY, list);
}

export function addStaffProfile(input: {
  name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  status?: StaffStatus;
}): { ok: true; profile: StaffProfile } | { ok: false; error: string } {
  const name = input.name.trim();
  const email = input.email.trim();
  const phone = input.phone?.trim();
  const position = input.position?.trim();
  const department = input.department?.trim();
  const status: StaffStatus = input.status ?? "active";

  if (!name) return { ok: false, error: "Name is required." };
  if (!email) return { ok: false, error: "Email is required." };
  if (!/\S+@\S+\.\S+/.test(email)) return { ok: false, error: "Invalid email format." };

  const list = getStaffProfiles();
  const duplicate = list.find((p) => p.email.toLowerCase() === email.toLowerCase());
  if (duplicate) return { ok: false, error: "Staff with this email already exists." };

  const profile: StaffProfile = {
    id: genId("staff"),
    name,
    email,
    phone,
    position,
    department,
    status,
    createdAt: new Date().toISOString(),
  };
  list.push(profile);
  saveStaffProfiles(list);
  return { ok: true, profile };
}

export function toggleStaffProfileStatus(id: string): StaffProfile[] {
  const list = getStaffProfiles();
  const next: StaffProfile[] = list.map((p) =>
    p.id === id
      ? { ...p, status: (p.status === "active" ? "inactive" : "active") as StaffStatus }
      : p
  );
  saveStaffProfiles(next);
  return next;
}

export function deleteStaffProfile(id: string): StaffProfile[] {
  const next: StaffProfile[] = getStaffProfiles().filter((p) => p.id !== id);
  saveStaffProfiles(next);
  return next;
}