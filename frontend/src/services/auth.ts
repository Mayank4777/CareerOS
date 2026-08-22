import { apiClient } from "@/lib/http";
import type { ApiResponse } from "@/types/api";
import type {
  AuthSession,
  AuthTokens,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const response = await apiClient.post<ApiResponse<AuthTokens>>("/auth/login/", payload);
  return mapSession(response.data.data);
}

export async function register(payload: RegisterPayload): Promise<AuthSession> {
  const response = await apiClient.post<ApiResponse<AuthTokens>>("/auth/register/", payload);
  return mapSession(response.data.data);
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.get<ApiResponse<AuthUser>>("/auth/me/");
  return response.data.data as AuthUser;
}

function mapSession(data: AuthTokens | undefined): AuthSession {
  if (!data) {
    throw new Error("Authentication response was empty.");
  }

  return {
    accessToken: data.access,
    refreshToken: data.refresh,
    user: data.user,
  };
}
