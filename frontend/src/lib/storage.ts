import { THEME_STORAGE_KEY, type ThemeMode } from "@/constants/theme";
import type { AuthSession } from "@/types/auth";

const AUTH_STORAGE_KEY = "careeros.auth.session";
const AUTH_SESSION_EVENT = "careeros-auth-change";

export function readTheme(): ThemeMode | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (value === "dark" || value === "light") {
    return value;
  }
  return null;
}

export function writeTheme(theme: ThemeMode): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function readAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function writeAuthSession(session: AuthSession): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function subscribeAuthSession(listener: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleEvent = () => listener();

  window.addEventListener(AUTH_SESSION_EVENT, handleEvent);
  window.addEventListener("storage", handleEvent);

  return () => {
    window.removeEventListener(AUTH_SESSION_EVENT, handleEvent);
    window.removeEventListener("storage", handleEvent);
  };
}
