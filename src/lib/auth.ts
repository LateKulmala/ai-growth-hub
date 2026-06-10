// Single-user private gate.
// Three factors: allowed email + password + private access key.
// All checked against environment variables (never the database).
const KEY = "aios_authed";

const ALLOWED_EMAIL = ((import.meta.env.VITE_ALLOWED_USER_EMAIL as string) || "")
  .trim()
  .toLowerCase();
const ACCESS_KEY = (import.meta.env.VITE_APP_ACCESS_KEY as string) || "";
const PASSWORD = (import.meta.env.VITE_APP_PASSWORD as string) || "";

export type LoginResult =
  | { ok: true }
  | { ok: false; reason: "email" | "password" | "key" | "config" };

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}

export function login(email: string, password: string, accessKey: string): LoginResult {
  if (!ALLOWED_EMAIL || !ACCESS_KEY || !PASSWORD) {
    return { ok: false, reason: "config" };
  }
  if (email.trim().toLowerCase() !== ALLOWED_EMAIL) {
    return { ok: false, reason: "email" };
  }
  if (password !== PASSWORD) {
    return { ok: false, reason: "password" };
  }
  if (accessKey !== ACCESS_KEY) {
    return { ok: false, reason: "key" };
  }
  localStorage.setItem(KEY, "1");
  return { ok: true };
}

export function logout() {
  localStorage.removeItem(KEY);
}

export function getAllowedEmail() {
  return ALLOWED_EMAIL;
}
