// Simple single-user gate. Replace with Supabase Auth later.
const KEY = "aios_authed";
const PASSWORD = (import.meta.env.VITE_APP_PASSWORD as string) || "ai-growth";

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}

export function login(password: string): boolean {
  if (password === PASSWORD) {
    localStorage.setItem(KEY, "1");
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(KEY);
}
