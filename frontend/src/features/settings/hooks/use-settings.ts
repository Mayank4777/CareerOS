import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserSettings, updateUserSettings, changePassword } from "../services/settings-service";
import type { UserSettingsFormValues, ChangePasswordValues } from "../types";

export const SETTINGS_QUERY_KEY = ["user-settings"];

export function useUserSettings() {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: fetchUserSettings,
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserSettingsFormValues) => updateUserSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordValues) => changePassword(payload),
  });
}
