import { create } from "zustand";
import type { NotificationLog } from "../types/notification.types";
import axiosClient from "../api/axiosClient";
import { useAuthStore } from "./auth.store";

export const normalizeNotification = (notification: any): NotificationLog => {
  const subject = String(notification?.subject ?? notification?.title ?? "Thông báo");
  const content = String(notification?.content ?? notification?.message ?? "");
  
  let type = notification?.type;
  if (!type || type === "system") {
    const lowerSubject = subject.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    if (
      lowerSubject.includes("duyệt") || 
      lowerSubject.includes("chúc mừng") || 
      lowerContent.includes("approved") || 
      lowerContent.includes("đã duyệt")
    ) {
      type = "application_approved";
    } else if (
      lowerSubject.includes("từ chối") || 
      lowerSubject.includes("hủy") || 
      lowerContent.includes("rejected") || 
      lowerContent.includes("từ chối")
    ) {
      type = "application_rejected";
    } else if (
      lowerSubject.includes("tiếp nhận") || 
      lowerSubject.includes("đã nộp") || 
      lowerSubject.includes("gửi thành công") || 
      lowerContent.includes("submitted") || 
      lowerContent.includes("đã nộp") || 
      lowerContent.includes("nộp hồ sơ")
    ) {
      type = "application_submitted";
    } else {
      type = "system";
    }
  }

  let channel = notification?.channel;
  if (!channel) {
    const lowerSubject = subject.toLowerCase();
    const lowerContent = content.toLowerCase();
    if (
      type === "application_approved" || 
      type === "application_rejected" ||
      lowerSubject.includes("email") ||
      lowerSubject.includes("gửi thư") ||
      lowerSubject.includes("thư thông báo") ||
      lowerSubject.includes("uniadmission") ||
      lowerContent.includes("kính gửi") ||
      lowerContent.includes("email")
    ) {
      channel = "email";
    } else {
      channel = "in_app";
    }
  }

  return {
    id: String(notification?.id ?? `noti_${Date.now()}`),
    recipientUserId: String(notification?.recipientUserId ?? notification?.userId ?? ""),
    recipientEmail: String(notification?.recipientEmail ?? ""),
    recipientName: String(notification?.recipientName ?? ""),
    applicationId: notification?.applicationId != null ? String(notification.applicationId) : undefined,
    type: type as any,
    channel: channel as any,
    subject,
    content,
    status: notification?.status ?? "sent",
    isRead: Boolean(notification?.isRead ?? notification?.read ?? false),
    createdAt: notification?.createdAt ?? new Date().toISOString(),
  };
};

interface NotificationLogState {
  notificationLogs: NotificationLog[];
  loading: boolean;
  getNotificationLogs: () => Promise<void>;
  createNotificationLog: (data: Omit<NotificationLog, "id" | "createdAt" | "status"> & { status?: NotificationLog["status"] }) => Promise<void>;
  appendNotificationLog: (notification: NotificationLog) => void;
  getNotificationLogsByUserId: (userId: string) => Promise<NotificationLog[]>;
  getNotificationLogsByApplicationId: (applicationId: string) => NotificationLog[];
  getAllNotificationLogs: () => NotificationLog[];
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: (userId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteNotificationsByUserId: (userId: string) => Promise<void>;
}

export const useNotificationLogStore = create<NotificationLogState>((set, get) => ({
  notificationLogs: [],
  loading: false,

  // Tải các thông báo ban đầu từ localStorage nếu có sẵn
  // Điều này cung cấp cơ chế lưu trữ dự phòng khi backend không lưu trữ thông báo
  // một cách an toàn trong quá trình phát triển.
  ...(function() {
    try {
      const raw = localStorage.getItem('notificationLogs');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return { notificationLogs: parsed.map(normalizeNotification) };
        }
      }
    } catch (e) {
    }
    return {};
  })(),

  getNotificationLogs: async () => {
    set({ loading: true });
    try {
      const url = "/notifications";
      let response;
      try {
        response = await axiosClient.get(url);
      } catch (err) {
        const currentUser = useAuthStore.getState().currentUser;
        const fallbackUrl = `/notifications/user/${currentUser?.id ?? 0}`;
        // eslint-disable-next-line no-console
        console.warn('[notificationLog.store] GET', url, 'failed, falling back to', fallbackUrl, 'error:', err);
        response = await axiosClient.get(fallbackUrl);
      }

      const data = response?.data?.data ?? response?.data ?? [];
      const logs = Array.isArray(data) ? data.map(normalizeNotification) : [];
      set({ notificationLogs: logs });
      try { localStorage.setItem('notificationLogs', JSON.stringify(logs)); } catch(e){}
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      set({ loading: false });
    }
  },
  
  createNotificationLog: async (data) => {
    try {
      const response = await axiosClient.post("/notifications", {
        userId: data.recipientUserId,
        title: data.subject,
        message: data.content,
      });

      const notification = normalizeNotification(response?.data?.data ?? response?.data);
      const nextLogs = [notification, ...get().notificationLogs.filter((item) => item.id !== notification.id)];
      set({ notificationLogs: nextLogs });
      try { localStorage.setItem('notificationLogs', JSON.stringify(nextLogs)); } catch(e){}
    } catch (error) {
      console.error("Failed to create notification log:", error);
    }
  },

  appendNotificationLog: (notification) => {
    const normalized = normalizeNotification(notification);
    const nextLogs = [normalized, ...get().notificationLogs.filter((item) => item.id !== normalized.id)];
    set({ notificationLogs: nextLogs });
    try { localStorage.setItem('notificationLogs', JSON.stringify(nextLogs)); } catch(e){}
  },
  
  getNotificationLogsByUserId: async (userId) => {
    try {
      const url = `/notifications/user/${userId}`;
      const response = await axiosClient.get(url);
      const data = response?.data?.data ?? response?.data ?? [];
      const logs = Array.isArray(data) ? data.map(normalizeNotification) : [];

      const nextLogs = [
        ...logs,
        ...get().notificationLogs.filter((item) => !logs.some((log) => log.id === item.id)),
      ];
      set({ notificationLogs: nextLogs });
      try { localStorage.setItem('notificationLogs', JSON.stringify(nextLogs)); } catch(e){}

      return logs;
    } catch (error) {
      console.error("Failed to fetch notifications by user:", error);
      return [];
    }
  },
  
  getNotificationLogsByApplicationId: (applicationId) => {
    const safeLogs = Array.isArray(get().notificationLogs) ? get().notificationLogs : [];
    return safeLogs.filter(log => log.applicationId === applicationId);
  },
  
  getAllNotificationLogs: () => {
    const safeLogs = Array.isArray(get().notificationLogs) ? get().notificationLogs : [];
    return safeLogs;
  },
  
  markNotificationAsRead: async (notificationId) => {
    try {
      if (!notificationId.startsWith("noti_")) {
        await axiosClient.put(`/notifications/${notificationId}/read`);
      }
      const nextLogs = get().notificationLogs.map(log =>
        log.id === notificationId ? { ...log, isRead: true } : log
      );
      set({ notificationLogs: nextLogs });
      try { localStorage.setItem('notificationLogs', JSON.stringify(nextLogs)); } catch(e){}
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  },

  markAllNotificationsAsRead: async (userId) => {
    try {
      await axiosClient.put(`/notifications/user/${userId}/read-all`);
      const nextLogs = get().notificationLogs.map(log =>
        String(log.recipientUserId) === String(userId) ? { ...log, isRead: true } : log
      );
      set({ notificationLogs: nextLogs });
      try { localStorage.setItem('notificationLogs', JSON.stringify(nextLogs)); } catch(e){}
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      if (!notificationId.startsWith("noti_")) {
        await axiosClient.delete(`/notifications/${notificationId}`);
      }
      const nextLogs = get().notificationLogs.filter(log => log.id !== notificationId);
      set({ notificationLogs: nextLogs });
      try { localStorage.setItem('notificationLogs', JSON.stringify(nextLogs)); } catch(e){}
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  },

  deleteNotificationsByUserId: async (userId) => {
    try {
      await axiosClient.delete(`/notifications/user/${userId}`);
      const nextLogs = get().notificationLogs.filter(log => String(log.recipientUserId) !== String(userId));
      set({ notificationLogs: nextLogs });
      try { localStorage.setItem('notificationLogs', JSON.stringify(nextLogs)); } catch(e){}
    } catch (error) {
      console.error("Failed to delete notifications by user:", error);
    }
  }
}));
