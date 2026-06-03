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
    const baseUrl = axiosClient.defaults.baseURL || "https://backend-production-eb2d.up.railway.app/api";

    getNotificationLogsByUserId(String(currentUser.id)).catch((error) => {
      console.error("Failed to bootstrap notification stream data", error);
    });

    // Try to attach JWT as query param because EventSource cannot set headers
    const storedToken = sessionStorage.getItem("access_token") ?? localStorage.getItem("access_token");
    const tokenQuery = storedToken ? `?token=${encodeURIComponent(storedToken)}` : "";
    const eventSource = new EventSource(`${baseUrl}/notifications/stream/${currentUser.id}${tokenQuery}`);

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
