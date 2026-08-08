export type NotificationType = "system" | "application" | "interview" | "ai_suggestion";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}
