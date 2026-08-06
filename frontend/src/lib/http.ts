import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { API_BASE_URL } from "@/constants/api";
import { clearAuthSession, readAuthSession, writeAuthSession } from "@/lib/storage";
import type { ApiError } from "@/types/api";
import type { AuthSession, RefreshTokensResponse } from "@/types/auth";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const authBaseClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const session = readAuthSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
});

let refreshPromise: Promise<AuthSession> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url ?? "";
    const isAuthEndpoint = requestUrl.includes("/auth/login/") || requestUrl.includes("/auth/register/") || requestUrl.includes("/auth/refresh/");

    if (!originalRequest || originalRequest._retry || status !== 401 || isAuthEndpoint) {
      return Promise.reject(error);
    }

    const session = readAuthSession();
    if (!session?.refreshToken) {
      clearAuthSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= refreshAuthSession(session.refreshToken);
      const refreshedSession = await refreshPromise;
      refreshPromise = null;
      writeAuthSession(refreshedSession);

      originalRequest.headers.Authorization = `Bearer ${refreshedSession.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      clearAuthSession();
      return Promise.reject(refreshError);
    }
  }
);

async function refreshAuthSession(refreshToken: string): Promise<AuthSession> {
  const response = await authBaseClient.post<{ success: boolean; data: RefreshTokensResponse }>(
    "/auth/refresh/",
    {
      refresh: refreshToken,
    }
  );

  const data = response.data.data;
  const currentSession = readAuthSession();

  if (!currentSession) {
    throw new Error("Authentication session is missing.");
  }

  return {
    ...currentSession,
    accessToken: data.access,
    refreshToken: data.refresh,
  };
}
