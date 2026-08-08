export interface UserSettings {
  id: string;
  theme: "light" | "dark" | "system";
  timezone: string;
  language: string;
  emailNotifications: boolean;
  aiPreferences?: Record<string, unknown>;
  updatedAt: string;
}

export interface UserSettingsFormValues {
  theme?: "light" | "dark" | "system";
  timezone?: string;
  language?: string;
  emailNotifications?: boolean;
  aiPreferences?: Record<string, unknown>;
}

export interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
}
