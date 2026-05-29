import React, { useState } from "react";
import { Layout, Menu, Dropdown, Avatar, Space, Badge, Button } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  DashboardOutlined, 
  UserOutlined, 
  BankOutlined, 
  FormOutlined, 
  FolderOpenOutlined, 
  CheckCircleOutlined,
  LogoutOutlined,
  BellOutlined,
  BulbOutlined,
  MoonOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from "@ant-design/icons";

import { useAuthStore } from "../stores/auth.store";
import { useTheme } from "../contexts/ThemeContext";
import { useNotificationLogStore } from "../stores/notificationLog.store";
import { useNotificationStream } from "../hooks/useNotificationStream";

const { Header, Sider, Content } = Layout;

export const CandidateLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuthStore();
  const notificationLogs = useNotificationLogStore((state) => state.notificationLogs);
  useNotificationStream();
  const unreadCount = notificationLogs.filter(
    (log) => String(log.recipientUserId) === String(currentUser?.id) && !log.isRead
  ).length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { key: "/candidate/dashboard", icon: <DashboardOutlined />, label: "Bảng điều khiển" },
    { key: "/candidate/profile", icon: <UserOutlined />, label: "Thông tin cá nhân" },
    { key: "/candidate/universities", icon: <BankOutlined />, label: "Danh sách trường" },
    { key: "/candidate/apply", icon: <FormOutlined />, label: "Nộp hồ sơ" },
    { key: "/candidate/applications", icon: <FolderOpenOutlined />, label: "Hồ sơ của tôi" },
    {
      key: "/candidate/notifications",
      icon: (
        <Badge count={unreadCount} size="small" offset={[6, -2]} overflowCount={99}>
          <BellOutlined />
        </Badge>
      ),
      label: <span>Thông báo {unreadCount > 0 ? `(${unreadCount})` : ""}</span>,
    },
    { key: "/candidate/results", icon: <CheckCircleOutlined />, label: "Kết quả xét tuyển" },
  ];

  const userMenu = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Hồ sơ",
        onClick: () => navigate("/candidate/profile")
      },
      { type: "divider" as const },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Đăng xuất",
        onClick: handleLogout,
        danger: true
      }
    ]
  };

  return (
    <>
      {/* Ambient Background Orbs */}
      <div className="ambient-background">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <Layout style={{ minHeight: "100vh", background: "transparent", position: "relative", zIndex: 1 }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        theme="light"
        className="floating-sidebar"
        width={260}
        trigger={null}
      >
        <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center" 
            }}>
              <img src="/favicon.svg" alt="Logo" style={{ width: 32, height: 32 }} />
            </div>
            {!collapsed && <span style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text-primary)" }}>UniAdmission</span>}
          </div>
        </div>
        <Menu 
          theme={isDarkMode ? "dark" : "light"}
          mode="inline" 
          selectedKeys={[location.pathname]} 
          items={menuItems} 
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: "none", padding: "0 12px", background: "transparent" }}
        />
      </Sider>
      
      <Layout style={{ background: "transparent" }}>
        <Header className="glass-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 24px" }}>
          <Button
            type="text"
            onClick={() => setCollapsed((value) => !value)}
            icon={collapsed ? <MenuUnfoldOutlined style={{ fontSize: 18 }} /> : <MenuFoldOutlined style={{ fontSize: 18 }} />}
            aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            style={{
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 12,
              background: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
              border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)"
            }}
          />

          <Space size="large">
            {/* Nút Toggle Sáng/Tối */}
            <div 
              onClick={toggleTheme}
              style={{ 
                cursor: "pointer", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                color: isDarkMode ? "#eab308" : "#64748b",
                transition: "all 0.3s"
              }}
            >
              {isDarkMode ? <BulbOutlined style={{ fontSize: 18 }} /> : <MoonOutlined style={{ fontSize: 18 }} />}
            </div>

            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <Space style={{ cursor: "pointer", padding: "4px 12px", borderRadius: "30px", transition: "background 0.3s" }} className="hover-bg-gray">
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#1677ff" }} />
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{currentUser?.fullName}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content style={{ margin: "24px 16px", display: "flex", flexDirection: "column" }}>
          {/* Welcome Banner */}
          <div style={{ flex: 1 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
    </>
  );
};
