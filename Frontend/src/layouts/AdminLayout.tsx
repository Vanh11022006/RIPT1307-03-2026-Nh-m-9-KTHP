import React, { useState, useEffect } from "react";
import { Layout, Menu, Dropdown, Avatar, Space, Button, Badge } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  DashboardOutlined, 
  BankOutlined, 
  BookOutlined, 
  TeamOutlined, 
  FolderOpenOutlined,
  UserOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  BellOutlined,
  BulbOutlined,
  BulbFilled
} from "@ant-design/icons";

import { useAuthStore } from "../stores/auth.store";
import { useTheme } from "../contexts/ThemeContext";

const { Header, Sider, Content } = Layout;


export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    document.body.classList.add("dashboard-body");
    return () => {
      document.body.classList.remove("dashboard-body");
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { key: "/admin/dashboard", icon: <DashboardOutlined />, label: "Bảng điều khiển" },
    { key: "/admin/universities", icon: <BankOutlined />, label: "Quản lý trường" },
    { key: "/admin/majors", icon: <BookOutlined />, label: "Quản lý ngành" },
    { key: "/admin/subject-groups", icon: <AppstoreOutlined />, label: "Quản lý tổ hợp" },
    { key: "/admin/candidates", icon: <TeamOutlined />, label: "Quản lý thí sinh" },
    { key: "/admin/applications", icon: <FolderOpenOutlined />, label: "Quản lý hồ sơ" },
    { key: "/admin/notifications", icon: <BellOutlined />, label: "Trung tâm thông báo" },
    { key: "/admin/admission-rounds", icon: <CalendarOutlined />, label: "Quản lý đợt" },
  ];

  const userMenu = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Hồ sơ cá nhân",
      },
      {
        type: "divider" as const
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Đăng xuất",
        onClick: handleLogout,
        danger: true
      }
    ]
  };

  // Modern SVG Icon for Graduation Cap
  const ModernGraduationCap = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="28" 
      height="28" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="url(#grad1)" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#38BDF8", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#818CF8", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path d="M21.42 10.922a2 2 0 0 1-.01 3.016l-7.1 7.255a2 2 0 0 1-2.815 0l-7.1-7.255a2 2 0 0 1-.01-3.016l7.1-7.255a2 2 0 0 1 2.815 0l7.1 7.255z"/>
      <path d="m14 18 4-4"/>
      <path d="M7 10v4.5a2.5 2.5 0 0 0 5 0V10"/>
      <path d="M22 10v6"/>
    </svg>
  );

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        width={260}
        className="saas-sidebar"
        trigger={null}
      >
        <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px", cursor: "pointer" }} onClick={() => navigate("/admin/dashboard")}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              background: isDarkMode ? "rgba(255,255,255,0.05)" : "#F1F5F9", 
              borderRadius: "12px", 
              padding: "8px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              border: isDarkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E2E8F0"
            }}>
              <ModernGraduationCap />
            </div>
            {!collapsed && (
              <span style={{ 
                fontSize: "20px", 
                fontWeight: 800, 
                letterSpacing: "-0.5px",
                background: "linear-gradient(90deg, #2563EB, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                UniAdmission
              </span>
            )}
          </div>
        </div>
        
        <Menu 
          mode="inline" 
          selectedKeys={[location.pathname]} 
          items={menuItems} 
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: "none", padding: "12px 12px", background: "transparent" }}
        />
      </Sider>
      
      <Layout style={{ background: "transparent" }}>
        <Header 
          className="saas-header" 
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 10,
            height: 72,
            background: isDarkMode ? "rgba(17, 24, 39, 0.7)" : "rgba(255, 255, 255, 0.8)",
          }}
        >
          {/* LEFT: Spacer to maintain layout */}
          <div style={{ display: "flex", alignItems: "center" }}></div>

          {/* CENTER: Spacer */}
          <div style={{ flex: 1 }}></div>

          {/* RIGHT: Actions */}
          <Space size="large" align="center">
            <Button 
              type="text" 
              icon={isDarkMode ? <BulbFilled style={{ color: "#F59E0B", fontSize: 18 }} /> : <BulbOutlined style={{ fontSize: 18 }} />} 
              onClick={toggleTheme}
              style={{ color: "var(--admin-text-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}
            />
            


            <Dropdown menu={userMenu} placement="bottomRight" arrow trigger={['click']}>
              <Space style={{ cursor: "pointer", padding: "4px 8px", borderRadius: "30px", border: "1px solid var(--admin-border)", background: "var(--admin-bg)" }}>
                <Badge dot color="#10B981" offset={[-4, 28]}>
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#2563EB" }} />
                </Badge>
                <span style={{ fontWeight: 600, color: "var(--admin-text-primary)", paddingRight: 4 }}>{currentUser?.fullName}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content style={{ margin: "24px", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, position: "relative", zIndex: 2 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
