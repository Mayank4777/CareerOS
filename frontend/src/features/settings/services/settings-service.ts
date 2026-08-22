import { SETTINGS_ROUTES } from "@/constants/api";
import { apiClient } from "@/lib/http";
import type { ApiResponse } from "@/types/api";
import type { UserSettings, UserSettingsFormValues, ChangePasswordValues } from "../types";

interface UserSettingsApiRecord {
  id: string;
  theme: string;
  timezone: string;
  language: string;
  email_notifications: boolean;
  ai_preferences?: Record<string, unknown>;
  updated_at: string;
}

function normalizeSettings(record: UserSettingsApiRecord | undefined): UserSettings {
  if (!record) {
    throw new Error("UserSettings record was undefined");
  }

  return {
    id: record.id ?? "",
    theme: (record.theme as UserSettings["theme"]) || "system",
    timezone: record.timezone ?? "UTC",
    language: record.language ?? "en",
    emailNotifications: Boolean(record.email_notifications),
    aiPreferences: record.ai_preferences ?? {},
    updatedAt: record.updated_at ?? "",
  };
}

export async function fetchUserSettings(): Promise<UserSettings> {
  const response = await apiClient.get<ApiResponse<UserSettingsApiRecord>>(SETTINGS_ROUTES.root);
  return normalizeSettings(response.data.data);
}

export async function updateUserSettings(payload: UserSettingsFormValues): Promise<UserSettings> {
  const response = await apiClient.patch<ApiResponse<UserSettingsApiRecord>>(SETTINGS_ROUTES.root, {
    theme: payload.theme,
    timezone: payload.timezone,
    language: payload.language,
    email_notifications: payload.emailNotifications,
    ai_preferences: payload.aiPreferences,
  });
  return normalizeSettings(response.data.data);
}

export async function changePassword(payload: ChangePasswordValues): Promise<void> {
  await apiClient.post(`${SETTINGS_ROUTES.root}change-password/`, {
    current_password: payload.currentPassword,
    new_password: payload.newPassword,
  });
}
