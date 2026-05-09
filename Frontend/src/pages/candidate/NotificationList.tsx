import React, { useState } from "react";
import { Card, List, Tag, Button, Drawer, Typography, Space, Badge, Empty } from "antd";
import { CheckOutlined, BellOutlined } from "@ant-design/icons";
import { useNotificationLogStore } from "../../stores/notificationLog.store";
import { useAuthStore } from "../../stores/auth.store";
import type { NotificationLog } from "../../types/notification.types";

const { Title, Text, Paragraph } = Typography;

export const NotificationList: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { getAllNotificationLogs, markNotificationAsRead } = useNotificationLogStore();
  
  const allLogs = getAllNotificationLogs();
  const safeLogs = Array.isArray(allLogs) ? allLogs : [];

  // Filter for current user. Fallback to email if userId matching fails for some reason in mock setup
  const myLogs = safeLogs.filter(log => 
    log.recipientUserId === currentUser?.id || 
    (currentUser?.email && log.recipientEmail === currentUser?.email)
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);

  // Helpers
  const getTypeTag = (type: string) => {
    switch (type) {
      case "application_submitted": return <Tag color="blue">Hồ sơ đã nộp</Tag>;
      case "application_approved": return <Tag color="success">Hồ sơ được duyệt</Tag>;
      case "application_rejected": return <Tag color="error">Hồ sơ bị từ chối</Tag>;
      case "system": return <Tag color="default">Hệ thống</Tag>;
      default: return <Tag>{type}</Tag>;
    }
  };

  const getChannelTag = (channel: string) => {
    switch (channel) {
      case "email": return <Tag color="purple">Email</Tag>;
      case "in_app": return <Tag color="cyan">Thông báo trong hệ thống</Tag>;
      default: return <Tag>{channel}</Tag>;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "sent": return "Đã gửi";
      case "failed": return "Gửi thất bại";
      case "pending": return "Chờ gửi";
      default: return status;
    }
  };

  const handleViewDetail = (log: NotificationLog) => {
    if (!log.isRead) {
      markNotificationAsRead(log.id);
    }
    setSelectedLog(log);
    setDetailVisible(true);
  };

  const handleMarkAsRead = (e: React.MouseEvent, logId: string) => {
    e.stopPropagation();
    markNotificationAsRead(logId);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 40 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Thông báo của tôi</Title>
        <Text type="secondary">Theo dõi các cập nhật liên quan đến hồ sơ xét tuyển của bạn</Text>
      </div>

      <Card bordered={false}>
        {myLogs.length === 0 ? (
          <Empty description="Bạn chưa có thông báo nào" />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={myLogs}
            renderItem={(item) => (
              <List.Item
                style={{ 
                  cursor: "pointer", 
                  backgroundColor: item.isRead ? "rgba(255,255,255,0.02)" : "rgba(0, 240, 255, 0.1)",
                  border: item.isRead ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0, 240, 255, 0.3)",
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  transition: "all 0.3s"
                }}
                onClick={() => handleViewDetail(item)}
                actions={[
                  <Text type="secondary" key="time">
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </Text>,
                  !item.isRead && (
                    <Button 
                      key="read" 
                      type="link" 
                      size="small" 
                      icon={<CheckOutlined />} 
                      onClick={(e) => handleMarkAsRead(e, item.id)}
                    >
                      Đánh dấu đã đọc
                    </Button>
                  )
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Badge dot={!item.isRead} offset={[-4, 4]}>
                      <div style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: "50%", 
                        background: item.isRead ? "rgba(255,255,255,0.1)" : "var(--neon-cyan)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: item.isRead ? "rgba(255,255,255,0.5)" : "#000"
                      }}>
                        <BellOutlined style={{ fontSize: 18 }} />
                      </div>
                    </Badge>
                  }
                  title={
                    <Space size="middle" wrap>
                      <Text strong style={{ fontSize: 16 }}>{item.subject}</Text>
                      {getTypeTag(item.type)}
                      {!item.isRead && <Tag color="processing" bordered={false}>Chưa đọc</Tag>}
                    </Space>
                  }
                  description={
                    <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0, marginTop: 8 }}>
                      {item.content}
                    </Paragraph>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Drawer
        title={<span style={{ color: "#fff" }}>Chi tiết thông báo</span>}
        placement="right"
        width={400}
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
        styles={{
          content: { background: "#0f172a" },
          header: { background: "#0f172a", borderBottom: "1px solid rgba(255,255,255,0.1)" },
          body: { background: "#0f172a" }
        }}
        closeIcon={<CloseCircleOutlined style={{ color: "rgba(255,255,255,0.6)", fontSize: 18 }} />}
      >
        {selectedLog && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Title level={4} style={{ marginTop: 0 }}>{selectedLog.subject}</Title>
              <Space wrap style={{ marginBottom: 16 }}>
                {getTypeTag(selectedLog.type)}
                {getChannelTag(selectedLog.channel)}
                <Text type="secondary">
                  Trạng thái gửi: {getStatusText(selectedLog.status)}
                </Text>
              </Space>
              
              <div style={{ 
                background: "rgba(255,255,255,0.05)", 
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "16px", 
                borderRadius: "8px", 
                whiteSpace: "pre-wrap",
                fontSize: "15px",
                lineHeight: "1.6"
              }}>
                {selectedLog.content}
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16 }}>
              <Space direction="vertical" size="small">
                <Text type="secondary">
                  Thời gian: {new Date(selectedLog.createdAt).toLocaleString("vi-VN")}
                </Text>
                {selectedLog.applicationId && (
                  <Text type="secondary">
                    Hồ sơ liên kết: <Text copyable>{selectedLog.applicationId}</Text>
                  </Text>
                )}
              </Space>
            </div>
          </Space>
        )}
      </Drawer>
    </div>
  );
};
