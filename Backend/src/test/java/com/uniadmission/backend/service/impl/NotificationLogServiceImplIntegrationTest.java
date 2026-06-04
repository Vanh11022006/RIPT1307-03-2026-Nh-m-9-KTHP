package com.uniadmission.backend.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

import com.uniadmission.backend.entity.NotificationLog;
import com.uniadmission.backend.repository.NotificationLogRepository;
import com.uniadmission.backend.service.NotificationLogService;
import com.uniadmission.backend.service.NotificationStreamService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

@DataJpaTest
@Import(NotificationLogServiceImpl.class)
@org.springframework.test.context.ActiveProfiles("test")
class NotificationLogServiceImplIntegrationTest {

    @Autowired
    private NotificationLogService notificationLogService;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @MockBean
    private NotificationStreamService notificationStreamService;

    @Test
    void createNotification_persistsAndPublishes() {
        NotificationLog created = notificationLogService.createNotification(
                42L,
                "Hồ sơ đã được tiếp nhận",
                "Hệ thống đã ghi nhận hồ sơ của bạn.");

        assertThat(created.getId()).isNotNull();
        assertThat(created.isRead()).isFalse();
        assertThat(created.getCreatedAt()).isNotNull();

        List<NotificationLog> unread = notificationLogService.getUnreadNotifications(42L);
        assertThat(unread).hasSize(1);
        assertThat(unread.get(0).getId()).isEqualTo(created.getId());

        verify(notificationStreamService).publish(any(NotificationLog.class));
    }

    @Test
    void markAllAsRead_updatesPersistedNotifications() {
        notificationLogService.createNotification(7L, "Thông báo 1", "Nội dung 1");
        notificationLogService.createNotification(7L, "Thông báo 2", "Nội dung 2");

        notificationLogService.markAllAsRead(7L);

        List<NotificationLog> unread = notificationLogService.getUnreadNotifications(7L);
        assertThat(unread).isEmpty();

        List<NotificationLog> all = notificationLogService.getUserNotifications(7L);
        assertThat(all).hasSize(2);
        assertThat(all).allMatch(NotificationLog::isRead);
    }
}
