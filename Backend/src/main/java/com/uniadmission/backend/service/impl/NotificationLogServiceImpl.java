package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.entity.NotificationLog;
import com.uniadmission.backend.repository.NotificationLogRepository;
import com.uniadmission.backend.service.NotificationLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationLogServiceImpl implements NotificationLogService {

    private final NotificationLogRepository repository;

    @Override
    public NotificationLog createNotification(Long userId, String title, String message) {
        NotificationLog log = new NotificationLog();
        log.setUserId(userId);
        log.setTitle(title);
        log.setMessage(message);
        log.setRead(false);
        return repository.save(log);
    }

    @Override
    public List<NotificationLog> getUserNotifications(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public List<NotificationLog> getUnreadNotifications(Long userId) {
        return repository.findByUserIdAndIsReadFalse(userId);
    }

    @Override
    public void markAsRead(Long id) {
        NotificationLog log = repository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        log.setRead(true);
        repository.save(log);
    }

    @Override
    public void deleteNotification(Long id) {
        repository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        repository.deleteById(id);
    }

    @Override
    public void deleteNotificationsByUserId(Long userId) {
        List<NotificationLog> logs = repository
                .findByUserIdOrderByCreatedAtDesc(java.util.Objects.requireNonNull(userId));
        if (logs == null) {
            return;
        }

        for (NotificationLog log : logs) {
            if (log != null && log.getId() != null) {
                repository.deleteById(java.util.Objects.requireNonNull(log.getId()));
            }
        }
    }

    @Override
    public void markAllAsRead(Long userId) {
        List<NotificationLog> unreadLogs = repository.findByUserIdAndIsReadFalse(userId);
        unreadLogs.forEach(log -> log.setRead(true));
        repository.saveAll(unreadLogs);
    }
}
