import type { NotificationType, NotificationChannel, NotificationStatus } from "../types/notification.types";

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  application_approved: "Hồ sơ được duyệt",
  application_rejected: "Hồ sơ bị từ chối",
  application_submitted: "Hồ sơ đã nộp",
  system: "Hệ thống"
};

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  email: "Email",
  in_app: "Thông báo trong hệ thống"
};

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
  sent: "Đã gửi",
  failed: "Gửi thất bại",
  pending: "Chờ gửi"
};

export const getNotificationTypeLabel = (type: NotificationType | string): string => {
  return NOTIFICATION_TYPE_LABELS[type as NotificationType] || "Không xác định";
};

export const getNotificationChannelLabel = (channel: NotificationChannel | string): string => {
  return NOTIFICATION_CHANNEL_LABELS[channel as NotificationChannel] || "Không xác định";
};

export const getNotificationStatusLabel = (status: NotificationStatus | string): string => {
  return NOTIFICATION_STATUS_LABELS[status as NotificationStatus] || "Không xác định";
};
