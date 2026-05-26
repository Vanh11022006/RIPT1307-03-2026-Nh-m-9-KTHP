import { create } from "zustand";
import type { NotificationLog } from "../types/notification.types";
import axiosClient from "../api/axiosClient";

export const normalizeNotification = (notification: any): NotificationLog => ({
  id: String(notification?.id ?? `noti_${Date.now()}`),
  recipientUserId: String(notification?.recipientUserId ?? notification?.userId ?? ""),
  recipientEmail: String(notification?.recipientEmail ?? ""),
  recipientName: String(notification?.recipientName ?? ""),
  applicationId: notification?.applicationId != null ? String(notification.applicationId) : undefined,
  type: notification?.type ?? "system",
  channel: notification?.channel ?? "in_app",
  subject: String(notification?.subject ?? notification?.title ?? "Thông báo"),
  content: String(notification?.content ?? notification?.message ?? ""),
  status: notification?.status ?? "sent",
  isRead: Boolean(notification?.isRead ?? notification?.read ?? false),
  createdAt: notification?.createdAt ?? new Date().toISOString(),
});

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
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteNotificationsByUserId: (userId: string) => Promise<void>;
}

export const useNotificationLogStore = create<NotificationLogState>((set, get) => ({
  notificationLogs: [],
  loading: false,

  // Load initial notifications from localStorage if available
  // This provides a fallback persistence when backend doesn't store notifications
  // safely during development.
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
      // ignore
    }
    return {};
  })(),

  getNotificationLogs: async () => {
    set({ loading: true });
    try {
      const response = await axiosClient.get("/notifications/user/0");
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
      const response = await axiosClient.get(`/notifications/user/${userId}`);
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
      await axiosClient.put(`/notifications/${notificationId}/read`);
      const nextLogs = get().notificationLogs.map(log =>
        log.id === notificationId ? { ...log, isRead: true } : log
      );
      set({ notificationLogs: nextLogs });
      try { localStorage.setItem('notificationLogs', JSON.stringify(nextLogs)); } catch(e){}
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      await axiosClient.delete(`/notifications/${notificationId}`);
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
