package com.uniadmission.backend.service;

import com.uniadmission.backend.entity.NotificationLog;
import java.util.List;

public interface NotificationLogService {
    NotificationLog createNotification(Long userId, String title, String message);

    List<NotificationLog> getUserNotifications(Long userId);

    List<NotificationLog> getUnreadNotifications(Long userId);

    void markAsRead(Long id);

    void markAllAsRead(Long userId);
}