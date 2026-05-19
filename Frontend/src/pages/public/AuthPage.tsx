import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message, Card, ConfigProvider, theme } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { InfoCircleOutlined, UserOutlined, LockOutlined, MailOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useAuthStore } from "../../stores/auth.store";

const { Title, Text } = Typography;

export const AuthPage: React.FC = () => {
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuthStore();
  
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const isLogin = location.pathname === "/login";

  // Scroll to respective form on mobile if accessed via direct URL
  useEffect(() => {
    if (window.innerWidth < 768) {
      if (location.pathname === "/register") {
        document.getElementById("register-section")?.scrollIntoView({ behavior: "smooth" });
      } else {
        document.getElementById("login-section")?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.pathname]);

  const onFinishLogin = async (values: any) => {
    setLoadingLogin(true);
    const result = await login(values.email, values.password);
    setLoadingLogin(false);
    
    if (result.success) {
      message.success(result.message);
      const state = useAuthStore.getState();
      if (state.currentUser?.role === "admin") {
        navigate("/admin/dashboard");
      } else if (state.currentUser?.role === "candidate") {
        navigate("/candidate/dashboard");
      }
    } else {
      message.error(result.message);
    }
  };

  const onFinishRegister = async (values: any) => {
    setLoadingRegister(true);
    const result = await register(values.email, values.password);
    setLoadingRegister(false);
    
    if (result.success) {
      message.success(result.message);
      registerForm.resetFields();
      if (window.innerWidth < 768) {
        navigate("/login");
      } else {
        message.info("Vui lòng đăng nhập với tài khoản vừa tạo.");
      }
    } else {
      message.error(result.message);
    }
  };

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm, token: { colorPrimary: '#2563eb', colorBgContainer: '#ffffff', colorText: '#1f2937', colorTextSecondary: '#4b5563', borderRadius: 12 } }}>
      <div className="auth-light-container" data-theme="light" style={{ display: "flex", flexDirection: "column", background: "#f8fafc", color: "#1f2937", borderRadius: "24px", overflow: "hidden", width: "100%", maxWidth: "560px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
          
          {/* Header Logo */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
              <img src="/favicon.svg" alt="Logo" style={{ width: 40, height: 40 }} />
              <Title level={2} style={{ margin: 0, fontWeight: 800, color: "#1f2937" }}>UniAdmission</Title>
            </div>
            <Text style={{ fontSize: 16, color: "#4b5563" }}>Hệ thống tuyển sinh đại học</Text>
          </div>

          {/* Form Container */}
          <div style={{ width: "100%", maxWidth: 480 }}>
            {isLogin ? (
              /* Login Pane */
              <div id="login-section">
                <Card 
                  bordered={false} 
                  style={{ 
                    height: "100%", 
                    borderRadius: 12, 
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                    border: "1px solid #e2e8f0"
                  }}
                  bodyStyle={{ padding: "32px 24px" }}
                >
                  <Title level={3} style={{ marginTop: 0, marginBottom: 8, color: "#111827" }}>Đăng nhập</Title>
                  <Text style={{ color: "#4b5563", display: "block", marginBottom: 32 }}>Chào mừng bạn quay trở lại!</Text>

                  <Form form={loginForm} layout="vertical" onFinish={onFinishLogin} requiredMark={false} size="large">
                    <Form.Item 
                      label={<span style={{ fontWeight: 600, fontSize: 13, color: "#374151" }}>Email</span>} 
                      name="email" 
                      rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }]}
                    >
                      <Input prefix={<MailOutlined style={{ color: "#9ca3af", marginRight: 8 }} />} placeholder="Nhập email của bạn" style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item 
                      label={<span style={{ fontWeight: 600, fontSize: 13, color: "#374151" }}>Mật khẩu</span>} 
                      name="password" 
                      rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                      style={{ marginBottom: 12 }}
                    >
                      <Input.Password prefix={<LockOutlined style={{ color: "#9ca3af", marginRight: 8 }} />} placeholder="Nhập mật khẩu" style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <div style={{ textAlign: "right", marginBottom: 24 }}>
                      <a style={{ color: "#2563eb", fontSize: 13, fontWeight: 500 }}>Quên mật khẩu?</a>
                    </div>

                    <Form.Item style={{ marginBottom: 16 }}>
                      <Button type="primary" htmlType="submit" block loading={loadingLogin} style={{ height: 44, borderRadius: 8, fontWeight: 600, fontSize: 15 }}>
                        Đăng nhập
                      </Button>
                    </Form.Item>
                    
                    <div style={{ textAlign: "center", display: "flex", justifyContent: "center", gap: 4 }}>
                      <Text style={{ color: "#6b7280", fontSize: 14 }}>Chưa có tài khoản?</Text>
                      <Link to="/register" onClick={(e) => {
                        if (window.innerWidth >= 768) {
                          e.preventDefault();
                          registerForm.getFieldInstance("fullName")?.focus();
                        }
                      }} style={{ color: "#2563eb", fontWeight: 600, fontSize: 14 }}>
                        Đăng ký ngay
                      </Link>
                    </div>
                  </Form>
                </Card>
              </div>
            ) : (
              /* Register Pane */
              <div id="register-section">
                <Card 
                  bordered={false} 
                  style={{ 
                    height: "100%", 
                    borderRadius: 12, 
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                    border: "1px solid #e2e8f0"
                  }}
                  bodyStyle={{ padding: "32px 24px" }}
                >
                  <Title level={3} style={{ marginTop: 0, marginBottom: 8, color: "#111827" }}>Đăng ký</Title>
                  <Text style={{ color: "#4b5563", display: "block", marginBottom: 32 }}>Tạo tài khoản mới để bắt đầu</Text>

                  <Form form={registerForm} layout="vertical" onFinish={onFinishRegister} requiredMark={false} size="large">
                    <Form.Item 
                      label={<span style={{ fontWeight: 600, fontSize: 13, color: "#374151" }}>Họ và tên</span>} 
                      name="fullName" 
                      rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                    >
                      <Input prefix={<UserOutlined style={{ color: "#9ca3af", marginRight: 8 }} />} placeholder="Nhập họ và tên" style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item 
                      label={<span style={{ fontWeight: 600, fontSize: 13, color: "#374151" }}>Email</span>} 
                      name="email" 
                      rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }]}
                    >
                      <Input prefix={<MailOutlined style={{ color: "#9ca3af", marginRight: 8 }} />} placeholder="Nhập email của bạn" style={{ borderRadius: 8 }} />
                    </Form.Item>
                    
                    <Form.Item 
                      label={<span style={{ fontWeight: 600, fontSize: 13, color: "#374151" }}>Mật khẩu</span>} 
                      name="password" 
                      rules={[{ required: true, message: "Vui lòng tạo mật khẩu" }]}
                    >
                      <Input.Password prefix={<LockOutlined style={{ color: "#9ca3af", marginRight: 8 }} />} placeholder="Nhập mật khẩu" style={{ borderRadius: 8 }} />
                    </Form.Item>
                    
                    <Form.Item 
                      label={<span style={{ fontWeight: 600, fontSize: 13, color: "#374151" }}>Xác nhận mật khẩu</span>} 
                      name="confirmPassword" 
                      dependencies={["password"]}
                      rules={[
                        { required: true, message: "Vui lòng xác nhận mật khẩu" },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                          },
                        }),
                      ]}
                    >
                      <Input.Password prefix={<SafetyCertificateOutlined style={{ color: "#9ca3af", marginRight: 8 }} />} placeholder="Nhập lại mật khẩu" style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 24, marginBottom: 16 }}>
                      <Button type="primary" htmlType="submit" block loading={loadingRegister} style={{ height: 44, borderRadius: 8, fontWeight: 600, fontSize: 15 }}>
                        Đăng ký
                      </Button>
                    </Form.Item>

                    <div style={{ textAlign: "center", display: "flex", justifyContent: "center", gap: 4 }}>
                      <Text style={{ color: "#6b7280", fontSize: 14 }}>Đã có tài khoản?</Text>
                      <Link to="/login" onClick={(e) => {
                        if (window.innerWidth >= 768) {
                          e.preventDefault();
                          loginForm.getFieldInstance("email")?.focus();
                        }
                      }} style={{ color: "#2563eb", fontWeight: 600, fontSize: 14 }}>
                        Đăng nhập ngay
                      </Link>
                    </div>
                  </Form>
                </Card>
              </div>
            )}
            
            {/* Demo Account Banner */}
            <Card 
              bordered={false} 
              style={{ 
                marginTop: 24, 
                borderRadius: 12, 
                background: "#f1f5f9", 
                border: "1px solid #e2e8f0" 
              }}
              bodyStyle={{ padding: "20px 24px" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <InfoCircleOutlined style={{ color: "#2563eb" }} />
                  <Text style={{ color: "#2563eb", fontWeight: 700, fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase" }}>Tài khoản Demo Nhanh</Text>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, width: 120 }}>
                      <SafetyCertificateOutlined style={{ color: "#3b82f6" }} />
                      <Text style={{ fontWeight: 600, color: "#1f2937" }}>Quản trị viên</Text>
                    </div>
                    <Text style={{ color: "#4b5563" }}>admin@example.com / 123456</Text>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, width: 120 }}>
                      <UserOutlined style={{ color: "#3b82f6" }} />
                      <Text style={{ fontWeight: 600, color: "#1f2937" }}>Thí sinh</Text>
                    </div>
                    <Text style={{ color: "#4b5563" }}>candidate@example.com / 123456</Text>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ textAlign: "center", padding: "24px", color: "#9ca3af", fontSize: 13 }}>
          © 2024 UniAdmission. All rights reserved.
        </div>
      </div>
    </ConfigProvider>
  );
};
