import { create } from "zustand";
import type { NotificationLog } from "../types/notification.types";
import axiosClient from "../api/axiosClient";

interface NotificationLogState {
  notificationLogs: NotificationLog[];
  loading: boolean;
  _normalize: (raw: any) => NotificationLog;
  getNotificationLogs: () => Promise<void>;
  createNotificationLog: (data: Omit<NotificationLog, "id" | "createdAt" | "status"> & { status?: NotificationLog["status"] }) => Promise<void>;
  getNotificationLogsByUserId: (userId: string) => Promise<NotificationLog[]>;
  getNotificationLogsByApplicationId: (applicationId: string) => NotificationLog[];
  getAllNotificationLogs: () => NotificationLog[];
  markNotificationAsRead: (notificationId: string) => Promise<void>;
}

export const useNotificationLogStore = create<NotificationLogState>((set, get) => ({
  notificationLogs: [],
  loading: false,
  // Normalize backend notification shape to frontend `NotificationLog`
  // Backend returns: { id, userId, title, message, isRead, createdAt }
  _normalize: (raw: any): NotificationLog => {
    const subject = raw.title ?? raw.subject ?? "";
    const content = raw.message ?? raw.content ?? "";
    // infer type from title/content (best-effort)
    const lower = (subject + " " + content).toLowerCase();
    let type: any = "system";
    if (lower.includes("nộp hồ sơ") || lower.includes("đã nộp")) type = "application_submitted";
    else if (lower.includes("duyệt") || lower.includes("approved")) type = "application_approved";
    else if (lower.includes("từ chối") || lower.includes("bị từ chối") || lower.includes("rejected")) type = "application_rejected";

    const normalized: NotificationLog = {
      id: String(raw.id ?? `noti_${Date.now()}`),
      recipientUserId: String(raw.userId ?? raw.recipientUserId ?? ""),
      recipientEmail: raw.recipientEmail ?? "",
      recipientName: raw.recipientName ?? "",
      applicationId: raw.applicationId ?? undefined,
      type,
      channel: (raw.channel as any) ?? "in_app",
      subject,
      content,
      status: (raw.status as any) ?? "sent",
      isRead: raw.isRead ?? raw.read ?? false,
      createdAt: raw.createdAt ?? new Date().toISOString(),
    };

    return normalized;
  },

  getNotificationLogs: async () => {
    try {
      set({ loading: true });
      // Try to read current user from localStorage (auth store persists it there)
      const stored = localStorage.getItem("currentUser");
      if (!stored) {
        set({ notificationLogs: [], loading: false });
        return;
      }
      const user = JSON.parse(stored);
      const userId = user?.id;
      if (!userId) {
        set({ notificationLogs: [], loading: false });
        return;
      }

      const resp = await axiosClient.get(`/notifications/user/${userId}`);
      // axiosClient response interceptor returns { success, message, data }
      const payload = resp?.data ?? resp;
      const raw = payload?.data ?? payload ?? [];
      const normalized = Array.isArray(raw) ? raw.map((r: any) => get()._normalize(r)) : [];
      // debug
      // eslint-disable-next-line no-console
      console.debug('[notificationLog.store] loaded', normalized.length, normalized);
      set({ notificationLogs: normalized, loading: false });
    } catch (error) {
      console.error("Failed to load notification logs", error);
      set({ loading: false });
    }
  },
  
  createNotificationLog: async (data) => {
    try {
      const notification: NotificationLog = {
        id: `noti_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        recipientUserId: data.recipientUserId,
        recipientEmail: data.recipientEmail,
        recipientName: data.recipientName,
        applicationId: data.applicationId,
        type: data.type,
        channel: data.channel,
        subject: data.subject,
        content: data.content,
        status: data.status ?? "sent",
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      // Optimistically add to local list so user sees it immediately.
      set((state) => ({
        notificationLogs: [notification, ...state.notificationLogs]
      }));
      // The backend creates notifications server-side for application events.
      // If you later add a POST endpoint, you can send the payload here to persist.
    } catch (error) {
      console.error("Failed to create notification log:", error);
    }
  },
  
  getNotificationLogsByUserId: async (userId) => {
    try {
      const resp = await axiosClient.get(`/notifications/user/${userId}`);
      const payload = resp?.data ?? resp;
      const raw = payload?.data ?? payload ?? [];
      return Array.isArray(raw) ? raw.map((r: any) => get()._normalize(r)) : [];
    } catch (error) {
      const safeLogs = Array.isArray(get().notificationLogs) ? get().notificationLogs : [];
      return safeLogs.filter(log => String(log.recipientUserId) === String(userId));
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
      // Call backend to mark as read if possible
      try {
        await axiosClient.put(`/notifications/${notificationId}/read`);
      } catch (err) {
        // ignore - still update locally
        console.warn('Failed to mark notification read on server', err);
      }

      set((state) => ({
        notificationLogs: state.notificationLogs.map(log => 
          log.id === notificationId ? { ...log, isRead: true } : log
        )
      }));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }
}));
