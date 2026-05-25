import React, { useEffect, useState } from "react";
import { Card, List, Tag, Button, Drawer, Typography, Space, Badge, Empty, message, Popconfirm } from "antd";
import { BellOutlined, CloseCircleOutlined, DeleteOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useNotificationLogStore } from "../../stores/notificationLog.store";
import { useAuthStore } from "../../stores/auth.store";
import type { NotificationLog } from "../../types/notification.types";

const { Title, Text, Paragraph } = Typography;

export const NotificationList: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { getNotificationLogsByUserId, markNotificationAsRead, deleteNotification, deleteNotificationsByUserId } = useNotificationLogStore();
  const [myLogs, setMyLogs] = useState<NotificationLog[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadNotifications = async () => {
      if (!currentUser?.id) {
        if (mounted) setMyLogs([]);
        return;
      }

      const logs = await getNotificationLogsByUserId(String(currentUser.id));
      if (mounted) {
        setMyLogs(Array.isArray(logs) ? logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : []);
      }
    };

    loadNotifications().catch((error) => {
      console.error("Failed to load candidate notifications", error);
      if (mounted) setMyLogs([]);
    });

    return () => {
      mounted = false;
    };
  }, [currentUser?.id, getNotificationLogsByUserId]);

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
      setMyLogs((current) => current.map((l) => (l.id === log.id ? { ...l, isRead: true } : l)));
      setSelectedLog({ ...log, isRead: true });
    } else {
      setSelectedLog(log);
    }
    setDetailVisible(true);
  };


  const handleDelete = async (logId: string) => {
    try {
      await deleteNotification(logId);
      setMyLogs((current) => current.filter((log) => log.id !== logId));
      if (selectedLog?.id === logId) {
        setSelectedLog(null);
        setDetailVisible(false);
      }
      message.success("Đã xóa thông báo");
    } catch (error) {
      message.error("Không thể xóa thông báo");
    }
  };

  const handleDeleteAll = async () => {
    if (!currentUser?.id) return;

    try {
      await deleteNotificationsByUserId(String(currentUser.id));
      setMyLogs([]);
      setSelectedLog(null);
      setDetailVisible(false);
      message.success("Đã xóa tất cả thông báo");
    } catch (error) {
      message.error("Không thể xóa tất cả thông báo");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 40 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Thông báo của tôi</Title>
        <Text type="secondary">Theo dõi các cập nhật liên quan đến hồ sơ xét tuyển của bạn</Text>
      </div>

      {myLogs.length > 0 && (
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="default"
            icon={<CheckCircleOutlined />}
            style={{ marginRight: 8, border: '1px solid #10B981', color: '#10B981', borderRadius: 6 }}
            onClick={async () => {
              const unread = myLogs.filter(l => !l.isRead);
              if (unread.length === 0) {
                message.info('Không có thông báo chưa đọc');
                return;
              }

              try {
                await Promise.all(unread.map(l => markNotificationAsRead(l.id)));
                setMyLogs((current) => current.map((l) => ({ ...l, isRead: true })));
                message.success('Đã đọc tất cả');
              } catch (error) {
                console.error(error);
                message.error('Không thể đánh dấu tất cả là đã đọc');
              }
            }}
          >
            Đọc tất cả
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa tất cả thông báo không?"
            description="Hành động này không thể hoàn tác."
            okText="Xóa hết"
            cancelText="Hủy"
            onConfirm={handleDeleteAll}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              Xóa tất cả
            </Button>
          </Popconfirm>
        </div>
      )}

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
                  backgroundColor: item.isRead ? "var(--bg-primary)" : "var(--bg-secondary)",
                  border: item.isRead ? "1px solid var(--border-color)" : "1px solid var(--accent-green)",
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  transition: "all 0.3s"
                }}
                actions={[
                  <Text type="secondary" key="time">
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </Text>,
                  null,
                  <Popconfirm
                    key="delete"
                    title="Bạn có chắc muốn xóa thông báo này không?"
                    description="Hành động này không thể hoàn tác."
                    okText="Xóa"
                    cancelText="Hủy"
                    onConfirm={() => handleDelete(item.id)}
                    onCancel={(e) => e && e.stopPropagation?.()}
                  >
                    <Button
                      type="link"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Xóa
                    </Button>
                  </Popconfirm>
                ]}
              >
                <div onClick={() => handleViewDetail(item)} style={{ cursor: "pointer" }}>
                  <List.Item.Meta
                    avatar={
                      <Badge dot={!item.isRead} offset={[-4, 4]}>
                        <div style={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: "50%", 
                          background: item.isRead ? "var(--border-color)" : "var(--accent-green)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: item.isRead ? "var(--text-secondary)" : "var(--text-primary)"
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
                </div>
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
          content: { background: "var(--bg-secondary)" },
          header: { background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" },
          body: { background: "var(--bg-secondary)" }
        }}
        closeIcon={<CloseCircleOutlined style={{ color: "var(--text-secondary)", fontSize: 18 }} />}
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
                background: "var(--border-color)", 
                border: "1px solid var(--border-color)",
                padding: "16px", 
                borderRadius: "8px", 
                whiteSpace: "pre-wrap",
                fontSize: "15px",
                lineHeight: "1.6"
              }}>
                {selectedLog.content}
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 16 }}>
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
