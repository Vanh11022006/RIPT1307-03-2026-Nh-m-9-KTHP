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
    set({ loading: true });
    try {
      const response = await axiosClient.get("/notification-logs");
      if (response && response.data) {
        set({ notificationLogs: response.data });
      }
    } catch (error) {
      console.error("Failed to fetch notification logs:", error);
    } finally {
      set({ loading: false });
    }
  },
  
  createNotificationLog: async (data) => {
    try {
      const response = await axiosClient.post("/notification-logs", data);
      if (response && response.data) {
        set((state) => ({
          notificationLogs: [response.data, ...state.notificationLogs]
        }));
      }
    } catch (error) {
      console.error("Failed to create notification log:", error);
    }
  },
  
  getNotificationLogsByUserId: async (userId) => {
    try {
      const response = await axiosClient.get(`/notification-logs/user/${userId}`);
      if (response && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch notification logs by user:", error);
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
      const response = await axiosClient.put(`/notification-logs/${notificationId}/read`);
      if (response && response.data) {
        set((state) => ({
          notificationLogs: state.notificationLogs.map(log => 
            log.id === notificationId ? response.data : log
          )
        }));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }
}));
