package com.uniadmission.backend.service;

import com.uniadmission.backend.entity.NotificationLog;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface NotificationStreamService {
    SseEmitter subscribe(Long userId);

    void publish(NotificationLog notification);
}