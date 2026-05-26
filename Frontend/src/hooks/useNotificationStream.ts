import { useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { useAuthStore } from "../stores/auth.store";
import { useNotificationLogStore } from "../stores/notificationLog.store";

export const useNotificationStream = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const getNotificationLogsByUserId = useNotificationLogStore((state) => state.getNotificationLogsByUserId);
  const appendNotificationLog = useNotificationLogStore((state) => state.appendNotificationLog);

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }

    let isActive = true;
    const baseUrl = axiosClient.defaults.baseURL || "http://localhost:8080/api";

    getNotificationLogsByUserId(String(currentUser.id)).catch((error) => {
      console.error("Failed to bootstrap notification stream data", error);
    });

    const eventSource = new EventSource(`${baseUrl}/notifications/stream/${currentUser.id}`);

    eventSource.addEventListener("notification", (event) => {
      if (!isActive) return;

      try {
        const payload = JSON.parse((event as MessageEvent).data as string);
        appendNotificationLog(payload);
      } catch (error) {
        console.error("Failed to parse realtime notification event", error);
      }
    });

    eventSource.onerror = (error) => {
      if (!isActive) return;
      console.warn("Notification stream disconnected", error);
    };

    return () => {
      isActive = false;
      eventSource.close();
    };
  }, [appendNotificationLog, currentUser?.id, getNotificationLogsByUserId]);
};
