export type NotificationType =
  | "application_approved"
  | "application_rejected"
  | "application_submitted"
  | "system";

export type NotificationChannel = "email" | "in_app";

export type NotificationStatus = "sent" | "failed" | "pending";

export interface NotificationLog {
  id: string;
  recipientUserId: string;
  recipientEmail: string;
  recipientName: string;
  applicationId?: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject: string;
  content: string;
  status: NotificationStatus;
  isRead?: boolean;
  createdAt: string;
}
