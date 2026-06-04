package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.entity.NotificationLog;
import com.uniadmission.backend.repository.NotificationLogRepository;
import com.uniadmission.backend.repository.UserRepository;
import com.uniadmission.backend.service.NotificationLogService;
import com.uniadmission.backend.service.NotificationStreamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class NotificationLogServiceImpl implements NotificationLogService {

    private final NotificationLogRepository repository;
    private final NotificationStreamService notificationStreamService;
    private final UserRepository userRepository;

    @Override
    public NotificationLog createNotification(Long userId, String title, String message) {
        return createNotification(userId, title, message, null);
    }

    @Override
    public NotificationLog createNotification(Long userId, String title, String message, String applicationId) {
        NotificationLog log = new NotificationLog();
        log.setUserId(userId);
        log.setTitle(title);
        log.setMessage(message);
        log.setRead(false);
        log.setApplicationId(applicationId);

        try {
            userRepository.findById(userId).ifPresent(user -> {
                log.setRecipientName(user.getFullName());
                log.setRecipientEmail(user.getEmail());
            });
        } catch (Exception ex) {
            // ignore user lookup failures
        }

        NotificationLog saved = repository.save(log);
        notificationStreamService.publish(saved);
        return saved;
    }

    @Override
    public List<NotificationLog> getUserNotifications(Long userId) {
        List<NotificationLog> logs = repository.findByUserIdOrderByCreatedAtDesc(userId);
        enrichRecipientFields(logs);
        return logs;
    }

    @Override
    public List<NotificationLog> getAllNotifications() {
        List<NotificationLog> logs = repository.findAll(org.springframework.data.domain.Sort
                .by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        enrichRecipientFields(logs);
        return logs;
    }

    @Override
    public List<NotificationLog> getUnreadNotifications(Long userId) {
        List<NotificationLog> logs = repository.findByUserIdAndIsReadFalse(userId);
        enrichRecipientFields(logs);
        return logs;
    }

    private void enrichRecipientFields(List<NotificationLog> logs) {
        if (logs == null || logs.isEmpty()) {
            return;
        }

        for (NotificationLog log : logs) {
            if (log == null) {
                continue;
            }

            boolean changed = false;

            if ((log.getRecipientName() == null || log.getRecipientEmail() == null) && log.getUserId() != null) {
                try {
                    userRepository.findById(log.getUserId()).ifPresent(user -> {
                        if (log.getRecipientName() == null) {
                            log.setRecipientName(user.getFullName());
                        }
                        if (log.getRecipientEmail() == null) {
                            log.setRecipientEmail(user.getEmail());
                        }
                    });
                } catch (Exception ex) {
                    // ignore lookup failures
                }

                if (log.getRecipientName() != null || log.getRecipientEmail() != null) {
                    changed = true;
                }
            }

            if (log.getApplicationId() == null) {
                String extracted = extractApplicationCode(log.getMessage());
                if (extracted != null) {
                    log.setApplicationId(extracted);
                    changed = true;
                }
            }

            if (changed) {
                repository.save(log);
            }
        }
    }

    private String extractApplicationCode(String message) {
        if (message == null || message.trim().isEmpty()) {
            return null;
        }

        Matcher matcher = Pattern.compile("HS\\d{4,}").matcher(message);
        if (matcher.find()) {
            return matcher.group();
        }

        return null;
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
