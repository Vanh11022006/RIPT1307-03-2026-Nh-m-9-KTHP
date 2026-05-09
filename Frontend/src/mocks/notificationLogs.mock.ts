import type { NotificationLog } from "../types/notification.types";

export const mockNotificationLogs: NotificationLog[] = [
  {
    id: "notif_001",
    recipientUserId: "user_002", // candidate_001 (Nguyễn Văn An)
    recipientEmail: "candidate@example.com",
    recipientName: "Nguyễn Văn An",
    applicationId: "application_001",
    type: "application_submitted",
    channel: "email",
    subject: "Xác nhận nộp hồ sơ xét tuyển thành công",
    content: "Chào bạn, hệ thống đã nhận được hồ sơ xét tuyển của bạn cho ngành Khoa học Máy tính. Chúng tôi sẽ thông báo kết quả trong thời gian sớm nhất.",
    status: "sent",
    isRead: true,
    createdAt: "2026-05-03T10:05:00.000Z"
  },
  {
    id: "notif_002",
    recipientUserId: "user_003", // candidate_002 (Trần Thị Bình)
    recipientEmail: "binh.tran@example.com",
    recipientName: "Trần Thị Bình",
    applicationId: "application_002",
    type: "application_approved",
    channel: "email",
    subject: "Chúc mừng! Hồ sơ xét tuyển của bạn đã được duyệt",
    content: "Chào Trần Thị Bình, hồ sơ đăng ký ngành Quản trị kinh doanh của bạn đã được duyệt thành công. Vui lòng kiểm tra cổng thông tin để biết các bước tiếp theo.",
    status: "sent",
    isRead: false,
    createdAt: "2026-05-05T08:05:00.000Z"
  },
  {
    id: "notif_003",
    recipientUserId: "user_002", // candidate_001
    recipientEmail: "candidate@example.com",
    recipientName: "Nguyễn Văn An",
    applicationId: "application_003",
    type: "application_rejected",
    channel: "email",
    subject: "Thông báo kết quả xét tuyển",
    content: "Rất tiếc phải thông báo rằng hồ sơ của bạn chưa đủ điều kiện trúng tuyển ngành Quản trị kinh doanh. Chúc bạn may mắn ở các đợt xét tuyển khác.",
    status: "sent",
    isRead: true,
    createdAt: "2026-05-04T14:35:00.000Z"
  },
  {
    id: "notif_004",
    recipientUserId: "user_002",
    recipientEmail: "candidate@example.com",
    recipientName: "Nguyễn Văn An",
    type: "system",
    channel: "in_app",
    subject: "Cập nhật hệ thống tuyển sinh năm 2026",
    content: "Hệ thống vừa cập nhật thêm tính năng theo dõi trạng thái hồ sơ qua ứng dụng di động. Bạn có thể tải app để trải nghiệm.",
    status: "sent",
    isRead: false,
    createdAt: "2026-05-01T09:00:00.000Z"
  },
  {
    id: "notif_005",
    recipientUserId: "user_003",
    recipientEmail: "binh.tran@example.com",
    recipientName: "Trần Thị Bình",
    applicationId: "application_004",
    type: "application_submitted",
    channel: "email",
    subject: "Xác nhận nộp hồ sơ xét tuyển thành công",
    content: "Hồ sơ đăng ký ngành CNTT HCM của bạn đã được ghi nhận. Hệ thống đang tiến hành xử lý.",
    status: "pending",
    isRead: false,
    createdAt: "2026-05-05T09:01:00.000Z"
  },
  {
    id: "notif_006",
    recipientUserId: "user_004",
    recipientEmail: "unknown@example.com",
    recipientName: "Người dùng Khách",
    type: "system",
    channel: "email",
    subject: "Xác thực tài khoản",
    content: "Vui lòng click vào link sau để xác thực tài khoản của bạn.",
    status: "failed",
    isRead: false,
    createdAt: "2026-05-02T15:30:00.000Z"
  }
];
