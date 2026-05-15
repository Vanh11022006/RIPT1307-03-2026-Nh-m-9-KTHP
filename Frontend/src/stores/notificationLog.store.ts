import { create } from "zustand";
import type { NotificationLog } from "../types/notification.types";
import axiosClient from "../api/axiosClient";

interface NotificationLogState {
  notificationLogs: NotificationLog[];
  loading: boolean;
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

  getNotificationLogs: async () => {
    set({ loading: false });
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

      set((state) => ({
        notificationLogs: [notification, ...state.notificationLogs]
      }));
    } catch (error) {
      console.error("Failed to create notification log:", error);
    }
  },
  
  getNotificationLogsByUserId: async (userId) => {
    const safeLogs = Array.isArray(get().notificationLogs) ? get().notificationLogs : [];
    return safeLogs.filter(log => String(log.recipientUserId) === String(userId));
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
