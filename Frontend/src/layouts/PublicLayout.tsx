import React, { useEffect } from "react";
import { Layout, Button } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AppLogo } from "../components/common/AppLogo";

const { Header, Content, Footer } = Layout;

export const PublicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isLogin = location.pathname === "/login";
  const isRegister = location.pathname === "/register";
  const isLanding = location.pathname === "/";
  const isDarkTheme = isLanding;

  // Add a class to body when on landing or auth pages to apply dark mode specifically
  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.add("landing-body");
      document.body.classList.remove("dashboard-body");
    } else {
      document.body.classList.remove("landing-body");
      document.body.classList.add("dashboard-body");
    }
    return () => {
      document.body.classList.remove("landing-body");
      document.body.classList.remove("dashboard-body");
    };
  }, [isDarkTheme]);

  // If not dark theme, use standard styles
  const layoutStyle = isDarkTheme 
    ? { minHeight: "100vh", background: "transparent", position: "relative" as const, overflowX: "hidden" as const }
    : { minHeight: "100vh", background: "transparent" };

  const headerStyle = isDarkTheme
    ? { 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        background: "rgba(7, 9, 15, 0.5)", 
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "0 50px", 
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        position: "fixed" as const,
        width: "100%",
        zIndex: 1000
      }
    : { 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        background: "#fff", 
        padding: "0 50px", 
        borderBottom: "1px solid #f0f0f0" 
      };

  const contentStyle = isDarkTheme
    ? { padding: 0, flex: 1, display: "flex", flexDirection: "column" as const, marginTop: 64, position: "relative" as const, zIndex: 1 }
    : { padding: "50px", flex: 1, display: "flex", flexDirection: "column" as const };

  const footerStyle = isDarkTheme
    ? { textAlign: "center" as const, color: "rgba(255,255,255,0.5)", background: "transparent", borderTop: "1px solid rgba(255, 255, 255, 0.05)", position: "relative" as const, zIndex: 1 }
    : { textAlign: "center" as const, color: "#8c8c8c" };

  return (
    <Layout style={layoutStyle}>
      {isDarkTheme && (
        <>
          <div className="shape shape-1" style={{ position: "fixed" }}></div>
          <div className="shape shape-2" style={{ position: "fixed" }}></div>
        </>
      )}
      
      <Header style={headerStyle}>
        <div style={{ filter: isDarkTheme ? "brightness(0) invert(1)" : "none" }}>
          <AppLogo />
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <Button 
            type={isLogin ? "primary" : (isDarkTheme ? "text" : "default")} 
            onClick={() => navigate("/login")}
            style={isDarkTheme && !isLogin ? { color: "white" } : {}}
          >
            Đăng nhập
          </Button>
          <Button 
            type={isRegister ? "primary" : (isDarkTheme ? "default" : "primary")} 
            onClick={() => navigate("/register")}
            style={isDarkTheme && !isRegister ? { color: "black" } : {}}
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
      
      <Footer style={footerStyle}>
        Hệ thống Quản lý Xét tuyển Đại học ©{new Date().getFullYear()} Created by Student Team
      </Footer>
    </Layout>
  );
};
