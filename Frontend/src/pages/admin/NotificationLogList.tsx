import React, { useState } from "react";
import { 
  Card, Table, Input, Select, Tag, Button, message,
  Drawer, Descriptions, Row, Col, Statistic, Typography 
} from "antd";
import { SearchOutlined, BellOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { useNotificationLogStore } from "../../stores/notificationLog.store";
import type { NotificationLog } from "../../types/notification.types";

const { Title, Text } = Typography;

export const NotificationLogList: React.FC = () => {
  const safeLogs = useNotificationLogStore(state => state.notificationLogs);
  const markNotificationAsRead = useNotificationLogStore(state => state.markNotificationAsRead);
  const safeLogsArr = Array.isArray(safeLogs) ? safeLogs : [];

  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);

  // Statistics
  const totalLogs = safeLogs.length;
  const sentLogs = safeLogs.filter(log => log.status === "sent").length;
  const pendingLogs = safeLogs.filter(log => log.status === "pending").length;
  const failedLogs = safeLogs.filter(log => log.status === "failed").length;

  // Filtering
  const filteredLogs = safeLogs.filter((log) => {
    const matchSearch = 
      log.recipientName?.toLowerCase().includes(searchText.toLowerCase()) ||
      log.recipientEmail?.toLowerCase().includes(searchText.toLowerCase()) ||
      log.subject?.toLowerCase().includes(searchText.toLowerCase()) ||
      log.content?.toLowerCase().includes(searchText.toLowerCase()) ||
      log.applicationId?.toLowerCase().includes(searchText.toLowerCase());

    const matchType = typeFilter === "all" || log.type === typeFilter;
    const matchChannel = channelFilter === "all" || log.channel === channelFilter;
    const matchStatus = statusFilter === "all" || log.status === statusFilter;

    return matchSearch && matchType && matchChannel && matchStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
      case "in_app": return <Tag color="cyan">Hệ thống</Tag>;
      default: return <Tag>{channel}</Tag>;
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "sent": return <Tag icon={<CheckCircleOutlined />} color="success">Đã gửi</Tag>;
      case "failed": return <Tag icon={<CloseCircleOutlined />} color="error">Gửi thất bại</Tag>;
      case "pending": return <Tag icon={<ClockCircleOutlined />} color="warning">Chờ gửi</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const handleViewDetail = (log: NotificationLog) => {
    // mark as read if not already, then open detail
    (async () => {
      try {
        if (!log.isRead) {
          await markNotificationAsRead(log.id);
        }
      } catch (e) {
        console.error('Failed to mark admin notification as read', e);
      }
      setSelectedLog({ ...log, isRead: true });
      setDetailVisible(true);
    })();
  };

  const columns = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleString("vi-VN"),
    },
    {
      title: "Người nhận",
      key: "recipient",
      render: (_: any, record: NotificationLog) => (
        <div>
          <Text strong>{record.recipientName || "Chưa cập nhật"}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>{record.recipientEmail || "Chưa cập nhật"}</Text>
        </div>
      )
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: string) => getTypeTag(type),
    },
    {
      title: "Kênh",
      dataIndex: "channel",
      key: "channel",
      width: "12%",
      render: (channel: string) => getChannelTag(channel),
    },
    {
      title: "Tiêu đề",
      dataIndex: "subject",
      key: "subject",
      ellipsis: true,
      width: "25%",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Đã đọc",
      dataIndex: "isRead",
      key: "isRead",
      render: (isRead: boolean) => isRead ? <Tag color="success">Đã đọc</Tag> : <Tag color="default">Chưa đọc</Tag>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: NotificationLog) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          size="small" 
          onClick={() => handleViewDetail(record)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Trung tâm thông báo</Title>
        <Text type="secondary">Quản lý và theo dõi các thông báo/email giả lập trong hệ thống</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)", borderRadius: 20, boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.4)" }} bodyStyle={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 64, height: 64, background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0, border: "2px solid rgba(255,255,255,0.1)" }}>
                <BellOutlined style={{ fontSize: 28, color: "#fff" }} />
              </div>
              <Statistic 
                title={<span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600, fontSize: 16 }}>Tổng thông báo</span>}
                value={totalLogs} 
                valueStyle={{ color: "#fff", fontWeight: 800, fontSize: "32px", lineHeight: 1 }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: "linear-gradient(135deg, #10B981 0%, #047857 100%)", borderRadius: 20, boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)" }} bodyStyle={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 64, height: 64, background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0, border: "2px solid rgba(255,255,255,0.1)" }}>
                <CheckCircleOutlined style={{ fontSize: 28, color: "#fff" }} />
              </div>
              <Statistic 
                title={<span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600, fontSize: 16 }}>Đã gửi</span>}
                value={sentLogs} 
                valueStyle={{ color: "#fff", fontWeight: 800, fontSize: "32px", lineHeight: 1 }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: "linear-gradient(135deg, #F59E0B 0%, #B45309 100%)", borderRadius: 20, boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.4)" }} bodyStyle={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 64, height: 64, background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0, border: "2px solid rgba(255,255,255,0.1)" }}>
                <ClockCircleOutlined style={{ fontSize: 28, color: "#fff" }} />
              </div>
              <Statistic 
                title={<span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600, fontSize: 16 }}>Chờ gửi</span>}
                value={pendingLogs} 
                valueStyle={{ color: "#fff", fontWeight: 800, fontSize: "32px", lineHeight: 1 }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: "linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)", borderRadius: 20, boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.4)" }} bodyStyle={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 64, height: 64, background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0, border: "2px solid rgba(255,255,255,0.1)" }}>
                <CloseCircleOutlined style={{ fontSize: 28, color: "#fff" }} />
              </div>
              <Statistic 
                title={<span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600, fontSize: 16 }}>Gửi thất bại</span>}
                value={failedLogs} 
                valueStyle={{ color: "#fff", fontWeight: 800, fontSize: "32px", lineHeight: 1 }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {safeLogsArr.length > 0 && (
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="default"
            icon={<CheckCircleOutlined />}
            style={{ marginRight: 8, border: '1px solid #10B981', color: '#10B981', borderRadius: 6 }}
            onClick={async () => {
              const unread = safeLogsArr.filter(l => !l.isRead);
              if (unread.length === 0) {
                message.info('Không có thông báo chưa đọc');
                return;
              }

              try {
                await Promise.all(unread.map(l => markNotificationAsRead(l.id)));
                message.success('Đã đọc tất cả');
              } catch (error) {
                console.error(error);
                message.error('Không thể đánh dấu tất cả là đã đọc');
              }
            }}
          >
            Đọc tất cả
          </Button>
        </div>
      )}

      <Card title="Lọc thông báo" bordered={false} style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm kiếm người nhận, email, tiêu đề..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={5}>
            <Select
              style={{ width: "100%" }}
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: "all", label: "Tất cả loại" },
                { value: "application_submitted", label: "Hồ sơ đã nộp" },
                { value: "application_approved", label: "Hồ sơ được duyệt" },
                { value: "application_rejected", label: "Hồ sơ bị từ chối" },
                { value: "system", label: "Hệ thống" },
              ]}
            />
          </Col>
          <Col xs={24} sm={8} md={5}>
            <Select
              style={{ width: "100%" }}
              value={channelFilter}
              onChange={setChannelFilter}
              options={[
                { value: "all", label: "Tất cả kênh" },
                { value: "email", label: "Email" },
                { value: "in_app", label: "Thông báo trong hệ thống" },
              ]}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "sent", label: "Đã gửi" },
                { value: "failed", label: "Gửi thất bại" },
                { value: "pending", label: "Chờ gửi" },
              ]}
            />
          </Col>
        </Row>
      </Card>

      <Card bordered={false}>
        <Table 
          columns={columns} 
          dataSource={filteredLogs} 
          rowKey="id"
          locale={{ emptyText: "Không tìm thấy thông báo phù hợp" }}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Drawer
        title={<span style={{ color: "#fff" }}>Chi tiết thông báo</span>}
        placement="right"
        width={500}
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
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Người nhận">{selectedLog.recipientName || "Chưa cập nhật"}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedLog.recipientEmail || "Chưa cập nhật"}</Descriptions.Item>
            <Descriptions.Item label="Loại thông báo">{getTypeTag(selectedLog.type)}</Descriptions.Item>
            <Descriptions.Item label="Kênh">{getChannelTag(selectedLog.channel)}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">{getStatusTag(selectedLog.status)}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái đọc">
              {selectedLog.isRead ? <Tag color="success">Đã đọc</Tag> : <Tag color="default">Chưa đọc</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="Hồ sơ liên kết (Application ID)">
              {selectedLog.applicationId ? (
                <Text copyable>{selectedLog.applicationId}</Text>
              ) : (
                <Text type="secondary">Không liên kết hồ sơ</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian tạo">
              {new Date(selectedLog.createdAt).toLocaleString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Tiêu đề" span={1}>
              <Text strong>{selectedLog.subject}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Nội dung" span={1}>
              <div style={{ whiteSpace: "pre-wrap", background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "4px" }}>
                {selectedLog.content}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};
