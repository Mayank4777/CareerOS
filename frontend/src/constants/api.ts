export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8000/api/v1";

export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "CareerOS";

export const AUTH_ROUTES = {
  login: "/login",
  register: "/register",
  me: "/auth/me/",
  refresh: "/auth/refresh/",
} as const;
