import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Select,
  Space,
  Typography,
  message,
  Popconfirm,
  Button,
  Input,
  Badge,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { PageHeader } from "../../components/common/PageHeader";
import { formatDateTime } from "../../utils/date";
import axiosClient from "../../api/axiosClient";


const { Text } = Typography;
const { Option } = Select;

interface UserRecord {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

const ROLE_OPTIONS = [
  { value: "candidate", label: "Thí sinh", color: "blue" },
  { value: "admin", label: "Quản trị viên", color: "gold" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Hoạt động", color: "success" },
  { value: "inactive", label: "Đã khóa", color: "error" },
  { value: "pending_verification", label: "Chờ xác minh", color: "warning" },
];

const getRoleTag = (role: string) => {
  const found = ROLE_OPTIONS.find((r) => r.value === role);
  return (
    <Tag color={found?.color ?? "default"}>{found?.label ?? role}</Tag>
  );
};

const getStatusBadge = (status: string) => {
  const found = STATUS_OPTIONS.find((s) => s.value === status);
  const statusMap: Record<string, "success" | "error" | "warning" | "processing" | "default"> = {
    active: "success",
    inactive: "error",
    pending_verification: "warning",
  };
  return (
    <Badge
      status={statusMap[status] ?? "default"}
      text={found?.label ?? status}
    />
  );
};

export const UserRoleManagement: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/users");
      const data = res?.data ?? res ?? [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleChange = async (id: number, newRole: string) => {
    try {
      await axiosClient.put(`/admin/users/${id}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
      message.success("Cập nhật vai trò thành công");
    } catch {
      message.error("Cập nhật vai trò thất bại");
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await axiosClient.put(`/admin/users/${id}/status`, { status: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
      );
      message.success("Cập nhật trạng thái thành công");
    } catch {
      message.error("Cập nhật trạng thái thất bại");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: "Người dùng",
      key: "user",
      render: (_: unknown, record: UserRecord) => (
        <Space>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <UserOutlined style={{ color: "#fff", fontSize: 16 }} />
          </div>
          <div>
            <Text strong style={{ display: "block" }}>
              {record.fullName}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (v: string) => v || <Text type="secondary">—</Text>,
    },
    {
      title: "Vai trò",
      key: "role",
      render: (_: unknown, record: UserRecord) => (
        <Select
          value={record.role}
          style={{ width: 160 }}
          onChange={(val) => handleRoleChange(record.id, val)}
          size="small"
          disabled={record.email === "admin@example.com"}
        >
          {ROLE_OPTIONS.map((r) => (
            <Option key={r.value} value={r.value}>
              {getRoleTag(r.value)}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_: unknown, record: UserRecord) =>
        getStatusBadge(record.status),
    },
    {
      title: "Email xác minh",
      dataIndex: "emailVerified",
      key: "emailVerified",
      align: "center" as const,
      render: (v: boolean) =>
        v ? (
          <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 18 }} />
        ) : (
          <StopOutlined style={{ color: "#ff4d4f", fontSize: 18 }} />
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => (
        <Text type="secondary">{v ? formatDateTime(v) : "—"}</Text>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center" as const,
      render: (_: unknown, record: UserRecord) => {
        const isActive = record.status === "active";
        const isSupremeAdmin = record.email === "admin@example.com";
        return (
          <Popconfirm
            title={
              isActive
                ? "Xác nhận khóa tài khoản này?"
                : "Xác nhận kích hoạt tài khoản này?"
            }
            okText="Xác nhận"
            cancelText="Hủy"
            onConfirm={() =>
              handleStatusChange(record.id, isActive ? "inactive" : "active")
            }
            disabled={isSupremeAdmin}
          >
            <Button
              size="small"
              danger={isActive}
              type={isActive ? "default" : "primary"}
              icon={isActive ? <StopOutlined /> : <CheckCircleOutlined />}
              disabled={isSupremeAdmin}
            >
              {isActive ? "Khóa" : "Kích hoạt"}
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalActive = users.filter((u) => u.status === "active").length;
  const totalLocked = users.filter((u) => u.status === "inactive").length;

  return (
    <div>
      <PageHeader title="Quản lý tài khoản & Vai trò" />

      
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          { label: "Tổng tài khoản", value: users.length, color: "#6366f1" },
          { label: "Quản trị viên", value: totalAdmins, color: "#f59e0b" },
          { label: "Đang hoạt động", value: totalActive, color: "#10b981" },
          { label: "Đã khóa", value: totalLocked, color: "#ef4444" },
        ].map((item) => (
          <Card
            key={item.label}
            className="saas-card"
            bordered={false}
            bodyStyle={{ padding: "16px 20px" }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              {item.label}
            </Text>
            <div
              style={{ fontSize: 28, fontWeight: 700, color: item.color, marginTop: 4 }}
            >
              {item.value}
            </div>
          </Card>
        ))}
      </div>

      <Card
        className="saas-card"
        bordered={false}
        title={
          <Space>
            <UserOutlined />
            <span>Danh sách tài khoản</span>
          </Space>
        }
        extra={
          <Space>
            <Input
              placeholder="Tìm theo tên / email..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 240 }}
              allowClear
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchUsers}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => `Tổng ${t} tài khoản` }}
          scroll={{ x: true }}
          size="middle"
        />
      </Card>
    </div>
  );
};
