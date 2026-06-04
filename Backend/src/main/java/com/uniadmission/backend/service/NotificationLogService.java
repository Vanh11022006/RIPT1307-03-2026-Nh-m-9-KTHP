package com.uniadmission.backend.service;

import com.uniadmission.backend.entity.NotificationLog;
import java.util.List;

public interface NotificationLogService {
    NotificationLog createNotification(Long userId, String title, String message);

    NotificationLog createNotification(Long userId, String title, String message, String applicationId);

    List<NotificationLog> getUserNotifications(Long userId);

    List<NotificationLog> getAllNotifications();

    List<NotificationLog> getUnreadNotifications(Long userId);

    void markAsRead(Long id);

    void deleteNotification(Long id);

    void deleteNotificationsByUserId(Long userId);

    void markAllAsRead(Long userId);
}
