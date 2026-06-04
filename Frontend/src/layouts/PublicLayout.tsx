import React, { useEffect } from "react";
import { Layout, Button, Row, Col, Space, Typography } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AppLogo } from "../components/common/AppLogo";
import { GithubOutlined, TwitterOutlined, LinkedinOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from "@ant-design/icons";

const { Header, Content, Footer } = Layout;
const { Text, Title } = Typography;

export const PublicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isLogin = location.pathname === "/login";
  const isRegister = location.pathname === "/register";
  const isLanding = location.pathname === "/";
  const isDarkTheme = false; // Landing page uses a light theme now

  if (isLogin || isRegister) {
    return <Outlet />;
  }

  // Add a class to body when on landing or auth pages to apply dark mode specifically
  useEffect(() => {
    if (isLanding) {
      document.body.classList.add("landing-new-body");
      document.body.classList.remove("landing-body");
      document.body.classList.remove("dashboard-body");
    } else if (isDarkTheme) {
      document.body.classList.add("landing-body");
      document.body.classList.remove("dashboard-body");
      document.body.classList.remove("landing-new-body");
    } else {
      document.body.classList.remove("landing-body");
      document.body.classList.add("dashboard-body");
      document.body.classList.remove("landing-new-body");
    }
    return () => {
      document.body.classList.remove("landing-body");
      document.body.classList.remove("dashboard-body");
      document.body.classList.remove("landing-new-body");
    };
  }, [isLanding, isDarkTheme]);

<<<<<<< Updated upstream
=======
  if (isLogin || isRegister || isForgotPassword || isResetPassword) {
    return <Outlet />;
  }

  if (isLanding) {
    return <Outlet />;
  }

>>>>>>> Stashed changes
  const layoutStyle = isDarkTheme 
    ? { minHeight: "100vh", background: "transparent", position: "relative" as const, overflowX: "hidden" as const }
    : { minHeight: "100vh", background: "transparent" };

  const headerStyle = isDarkTheme
    ? { 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        background: "rgba(15, 23, 42, 0.6)", 
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "0 50px", 
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        position: "fixed" as const,
        width: "100%",
        zIndex: 1000,
        height: 72
      }
    : { 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        background: "#fff", 
        padding: "0 50px", 
        borderBottom: "1px solid #f0f0f0",
        height: 72
      };

  const contentStyle = isDarkTheme
    ? { padding: 0, flex: 1, display: "flex", flexDirection: "column" as const, marginTop: 72, position: "relative" as const, zIndex: 1 }
    : { padding: "50px", flex: 1, display: "flex", flexDirection: "column" as const };

  const footerStyle = isDarkTheme
    ? { color: "rgba(255,255,255,0.6)", background: "#0B1120", borderTop: "1px solid rgba(255, 255, 255, 0.05)", position: "relative" as const, zIndex: 1, padding: "60px 50px 24px" }
    : { color: "#475569", background: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "60px 50px 24px" };

  return (
    <Layout style={layoutStyle}>
      {isDarkTheme && (
        <>
          <div className="shape shape-1" style={{ position: "fixed" }}></div>
          <div className="shape shape-2" style={{ position: "fixed" }}></div>
        </>
      )}
      
      <Header style={headerStyle}>
        <div style={{ filter: isDarkTheme ? "brightness(0) invert(1)" : "none", cursor: "pointer" }} onClick={() => navigate("/")}>
          <AppLogo />
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Button 
            type={isLogin ? "primary" : "text"} 
            onClick={() => navigate("/login")}
            style={{ 
              color: isLogin ? "white" : (isDarkTheme ? "rgba(255,255,255,0.85)" : "#475569"),
              fontWeight: 500,
              borderRadius: 8
            }}
          >
            Đăng nhập
          </Button>
          <Button 
            className={isDarkTheme && !isRegister ? "btn-glow" : ""}
            type={isRegister ? "primary" : (isDarkTheme ? "primary" : "default")} 
            onClick={() => navigate("/register")}
            style={{
              fontWeight: 600,
              borderRadius: 8,
              background: isDarkTheme && !isRegister ? "linear-gradient(90deg, #0284C7, #2563EB)" : undefined,
              border: isDarkTheme && !isRegister ? "none" : undefined,
              color: isDarkTheme && !isRegister ? "white" : undefined,
            }}
          >
            Đăng ký
          </Button>
        </div>
      </Header>
      
      <Content style={contentStyle}>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: isLanding ? "flex-start" : "center" }}>
          <Outlet />
        </div>
      </Content>
      
      {isLanding ? (
        <Footer style={footerStyle}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Row gutter={[48, 32]}>
              <Col xs={24} md={8}>
                <div style={{ filter: isDarkTheme ? "brightness(0) invert(1)" : "none", marginBottom: 24 }}>
                  <AppLogo />
                </div>
                <p style={{ marginBottom: 24, lineHeight: 1.6 }}>
                  Hệ thống xét tuyển đại học trực tuyến hàng đầu, kết nối thí sinh với các trường đại học uy tín trên toàn quốc một cách nhanh chóng và minh bạch.
                </p>
                <Space size="middle">
                  <Button shape="circle" icon={<TwitterOutlined />} type={isDarkTheme ? "text" : "default"} style={isDarkTheme ? { color: "white", background: "rgba(255,255,255,0.1)" } : {}} />
                  <Button shape="circle" icon={<GithubOutlined />} type={isDarkTheme ? "text" : "default"} style={isDarkTheme ? { color: "white", background: "rgba(255,255,255,0.1)" } : {}} />
                  <Button shape="circle" icon={<LinkedinOutlined />} type={isDarkTheme ? "text" : "default"} style={isDarkTheme ? { color: "white", background: "rgba(255,255,255,0.1)" } : {}} />
                </Space>
              </Col>
              
              <Col xs={24} sm={12} md={5}>
                <Title level={5} style={{ color: isDarkTheme ? "white" : "#0f172a", marginBottom: 24 }}>Liên Kết Nhanh</Title>
                <Space direction="vertical" size="middle">
                  <a style={{ color: isDarkTheme ? "rgba(255,255,255,0.6)" : "#475569" }}>Về chúng tôi</a>
                  <a style={{ color: isDarkTheme ? "rgba(255,255,255,0.6)" : "#475569" }}>Danh sách trường</a>
                  <a style={{ color: isDarkTheme ? "rgba(255,255,255,0.6)" : "#475569" }}>Hướng dẫn nộp hồ sơ</a>
                  <a style={{ color: isDarkTheme ? "rgba(255,255,255,0.6)" : "#475569" }}>Tin tức & Sự kiện</a>
                </Space>
              </Col>
              
              <Col xs={24} sm={12} md={5}>
                <Title level={5} style={{ color: isDarkTheme ? "white" : "#0f172a", marginBottom: 24 }}>Hỗ Trợ</Title>
                <Space direction="vertical" size="middle">
                  <a style={{ color: isDarkTheme ? "rgba(255,255,255,0.6)" : "#475569" }}>Trung tâm trợ giúp</a>
                  <a style={{ color: isDarkTheme ? "rgba(255,255,255,0.6)" : "#475569" }}>Câu hỏi thường gặp</a>
                  <a style={{ color: isDarkTheme ? "rgba(255,255,255,0.6)" : "#475569" }}>Chính sách bảo mật</a>
                  <a style={{ color: isDarkTheme ? "rgba(255,255,255,0.6)" : "#475569" }}>Điều khoản dịch vụ</a>
                </Space>
              </Col>
              
              <Col xs={24} md={6}>
                <Title level={5} style={{ color: isDarkTheme ? "white" : "#0f172a", marginBottom: 24 }}>Liên Hệ</Title>
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <EnvironmentOutlined style={{ marginTop: 4, color: isDarkTheme ? "#38bdf8" : "#2563eb" }} />
                    <span style={{ color: isDarkTheme ? "rgba(255,255,255,0.6)" : "#475569" }}>Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội</span>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <PhoneOutlined style={{ marginTop: 4, color: isDarkTheme ? "#38bdf8" : "#2563eb" }} />
                    <span style={{ color: isDarkTheme ? "rgba(255,255,255,0.6)" : "#475569" }}>1900 1234</span>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <MailOutlined style={{ marginTop: 4, color: isDarkTheme ? "#38bdf8" : "#2563eb" }} />
                    <span style={{ color: isDarkTheme ? "rgba(255,255,255,0.6)" : "#475569" }}>support@uniadmission.edu.vn</span>
                  </div>
                </Space>
              </Col>
            </Row>
            
            <div style={{ 
              marginTop: 48, 
              paddingTop: 24, 
              borderTop: isDarkTheme ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0", 
              display: "flex", 
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16
            }}>
              <Text style={{ color: isDarkTheme ? "rgba(255,255,255,0.5)" : "#64748b" }}>
                © {new Date().getFullYear()} UniAdmission. All rights reserved.
              </Text>
              <Space>
                <a style={{ color: isDarkTheme ? "rgba(255,255,255,0.5)" : "#64748b", fontSize: 13 }}>Tiếng Việt</a>
                <span style={{ color: isDarkTheme ? "rgba(255,255,255,0.2)" : "#cbd5e1" }}>|</span>
                <a style={{ color: isDarkTheme ? "rgba(255,255,255,0.5)" : "#64748b", fontSize: 13 }}>English</a>
              </Space>
            </div>
          </div>
        </Footer>
      ) : (
        <Footer style={{ textAlign: "center", color: "#8c8c8c", background: "transparent" }}>
          © {new Date().getFullYear()} UniAdmission. All rights reserved.
        </Footer>
      )}
    </Layout>
  );
};
