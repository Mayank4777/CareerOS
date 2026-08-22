import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sliders, Shield, BellRing, KeyRound, Save } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";
import { useUserSettings, useUpdateUserSettings, useChangePassword } from "../hooks/use-settings";
import type { UserSettingsFormValues, ChangePasswordValues } from "../types";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export function SettingsPage() {
  const toast = useToast();
  const { data: settings, isLoading, isError, refetch } = useUserSettings();
  const updateSettingsMutation = useUpdateUserSettings();
  const changePasswordMutation = useChangePassword();

  const {
    register: registerPref,
    handleSubmit: handleSubmitPref,
    reset: resetPref,
  } = useForm<UserSettingsFormValues>();

  const {
    register: registerPass,
    handleSubmit: handleSubmitPass,
    reset: resetPass,
    formState: { errors: passErrors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (settings) {
      resetPref({
        theme: settings.theme,
        timezone: settings.timezone,
        language: settings.language,
        emailNotifications: settings.emailNotifications,
      });
    }
  }, [settings, resetPref]);

  const onSavePreferences = async (values: UserSettingsFormValues) => {
    try {
      await updateSettingsMutation.mutateAsync(values);
      toast.success("Preferences updated successfully.");
    } catch {
      toast.error("Failed to update preferences.");
    }
  };

  const onChangePasswordSubmit = async (values: ChangePasswordValues) => {
    try {
      await changePasswordMutation.mutateAsync(values);
      toast.success("Password changed successfully.");
      resetPass();
    } catch {
      toast.error("Failed to change password. Please check your current password.");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 py-6">
      <PageHeader
        title="Settings & System Preferences"
        description="Configure your workspace appearance, timezone, automated notifications, and account credentials."
      />

      {isLoading ? (
        <LoadingState label="Loading workspace preferences..." />
      ) : isError ? (
        <ErrorState title="Failed to load settings" description="Could not fetch user preferences." onRetry={refetch} />
      ) : (
        <div className="space-y-6">
          <Card className="p-6 space-y-5 border-indigo-500/20 bg-card/90">
            <h3 className="text-base font-bold text-primary flex items-center gap-2.5 border-b border-border/60 pb-3.5">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sliders className="w-4 h-4" />
              </span>
              Application & System Preferences
            </h3>

            <form onSubmit={handleSubmitPref(onSavePreferences)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Appearance Theme Mode" htmlFor="set-theme">
                  <select
                    id="set-theme"
                    {...registerPref("theme")}
                    className="w-full px-3.5 py-2.5 text-xs bg-surface/90 border border-border/80 rounded-xl text-primary focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="system">Obsidian System Dark (Default)</option>
                    <option value="dark">Pure Dark Mode</option>
                    <option value="light">Clean Light Mode</option>
                  </select>
                </FormField>

                <FormField label="Preferred Workspace Timezone" htmlFor="set-tz">
                  <select
                    id="set-tz"
                    {...registerPref("timezone")}
                    className="w-full px-3.5 py-2.5 text-xs bg-surface/90 border border-border/80 rounded-xl text-primary focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </FormField>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-surface/60 rounded-2xl border border-border/60">
                <BellRing className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <label htmlFor="set-email-noti" className="text-xs font-semibold text-primary block cursor-pointer">
                    Enable Email Notifications & Interview Reminders
                  </label>
                  <p className="text-[11px] text-secondary mt-0.5">
                    Receive automated alerts for scheduled technical rounds, status changes, and AI coaching insights.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="set-email-noti"
                  {...registerPref("emailNotifications")}
                  className="h-4 w-4 ml-auto rounded border-border text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-border/60">
                <Button type="submit" variant="gradient" disabled={updateSettingsMutation.isPending} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {updateSettingsMutation.isPending ? "Saving..." : "Save Workspace Preferences"}
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6 space-y-5 border-border/80 bg-card/90">
            <h3 className="text-base font-bold text-primary flex items-center gap-2.5 border-b border-border/60 pb-3.5">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Shield className="w-4 h-4" />
              </span>
              Security & Credentials
            </h3>

            <form onSubmit={handleSubmitPass(onChangePasswordSubmit)} className="space-y-4 max-w-md">
              <FormField label="Current Password" htmlFor="pass-current" error={passErrors.currentPassword?.message} required>
                <Input id="pass-current" type="password" placeholder="••••••••" {...registerPass("currentPassword")} />
              </FormField>

              <FormField label="New Password" htmlFor="pass-new" error={passErrors.newPassword?.message} required>
                <Input id="pass-new" type="password" placeholder="••••••••" {...registerPass("newPassword")} />
              </FormField>

              <div className="flex justify-start pt-2">
                <Button type="submit" variant="outline" disabled={changePasswordMutation.isPending} className="flex items-center gap-2 border-indigo-500/30">
                  <KeyRound className="w-4 h-4 text-indigo-400" />
                  {changePasswordMutation.isPending ? "Updating Password..." : "Update Security Password"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
