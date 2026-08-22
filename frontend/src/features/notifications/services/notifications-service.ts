import { NOTIFICATIONS_ROUTES } from "@/constants/api";
import { apiClient } from "@/lib/http";
import type { ApiResponse } from "@/types/api";
import type { Notification } from "../types";

interface NotificationApiRecord {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

function normalizeNotification(record: NotificationApiRecord | undefined): Notification {
  if (!record) {
    throw new Error("Notification record was undefined");
  }

  return {
    id: record.id ?? "",
    type: (record.type as Notification["type"]) || "system",
    title: record.title ?? "",
    message: record.message ?? "",
    isRead: Boolean(record.is_read),
    link: record.link ?? "",
    createdAt: record.created_at ?? "",
  };
}

export async function fetchNotifications(): Promise<Notification[]> {
  const response = await apiClient.get<ApiResponse<NotificationApiRecord[]>>(NOTIFICATIONS_ROUTES.root);
  return (response.data.data ?? []).map(normalizeNotification);
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
  const response = await apiClient.patch<ApiResponse<NotificationApiRecord>>(NOTIFICATIONS_ROUTES.read(id));
  return normalizeNotification(response.data.data);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiClient.patch(NOTIFICATIONS_ROUTES.readAll);
}

export async function deleteNotification(id: string): Promise<void> {
  await apiClient.delete(NOTIFICATIONS_ROUTES.detail(id));
}
