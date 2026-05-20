import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message, Card, ConfigProvider, theme } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserOutlined, LockOutlined, MailOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { GraduationCap } from "lucide-react";
import { useAuthStore } from "../../stores/auth.store";

const { Title, Text } = Typography;

export const AuthPage: React.FC = () => {
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuthStore();
  
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [forgotPasswordForm] = Form.useForm();

  const isLogin = location.pathname === "/login";
  const isRegister = location.pathname === "/register";

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

  const onFinishForgotPassword = () => {
    message.success("Đã gửi yêu cầu khôi phục mật khẩu. Vui lòng kiểm tra email hoặc SMS của bạn.");
    setIsForgotPassword(false);
    forgotPasswordForm.resetFields();
  };

  if (isLogin || isRegister) {
    return (
      <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm, token: { colorPrimary: '#2563eb', colorBgContainer: '#ffffff', colorText: '#1f2937', colorTextSecondary: '#4b5563', borderRadius: 12 } }}>
        <div style={{ 
          minHeight: "100vh", 
          backgroundImage: "url(/university_bg.png)", 
          backgroundSize: "cover", 
          backgroundPosition: "center",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Inter', sans-serif"
        }}>
          {/* Dim Overlay */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)" }} />
          
          {/* Top Navbar */}
          <div style={{ 
            width: "100%",
            height: 72, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            padding: "0 24px", 
            zIndex: 10,
            borderBottom: "1px solid rgba(255,255,255,0.15)",
            position: "relative"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => navigate("/")}>
              <GraduationCap size={36} color="white" />
              <Title level={4} style={{ margin: 0, color: "white", fontWeight: 700 }}>UniAdmission</Title>
            </div>
          </div>

          {/* Center Card */}
          <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, width: "100%" }}>
            <div style={{ width: "100%", maxWidth: isLogin ? 440 : 640 }}>
              <Card 
                bordered={false} 
                style={{ 
                  borderRadius: 16, 
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  background: "rgba(255, 255, 255, 0.98)",
                  padding: "8px"
                }}
                bodyStyle={{ padding: "32px" }}
              >
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <GraduationCap size={48} color="#2563eb" style={{ marginBottom: 16 }} />
                  <Title level={3} style={{ margin: 0, color: "#111827", fontWeight: 700 }}>
                    {isForgotPassword ? "Quên mật khẩu" : isLogin ? "Đăng nhập UniAdmission" : "Đăng ký tài khoản"}
                  </Title>
                </div>

                {isForgotPassword ? (
                  <Form form={forgotPasswordForm} layout="vertical" onFinish={onFinishForgotPassword} requiredMark={false} size="large">
                    <Text style={{ color: "#4b5563", display: "block", marginBottom: 24, fontSize: 14, textAlign: "center" }}>
                      Vui lòng nhập Email hoặc Số CMND/CCCD đã đăng ký để khôi phục mật khẩu.
                    </Text>
                    <Form.Item 
                      label={<span style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Email hoặc Số CMND/CCCD</span>} 
                      name="identifier" 
                      rules={[{ required: true, message: "Vui lòng nhập Email hoặc Số CMND/CCCD" }]}
                    >
                      <Input prefix={<UserOutlined style={{ color: "#9ca3af", marginRight: 8 }} />} placeholder="Nhập Email hoặc Số CMND/CCCD" style={{ borderRadius: 8, height: 48 }} />
                    </Form.Item>
                    
                    <Form.Item style={{ marginTop: 8, marginBottom: 24 }}>
                      <Button type="primary" htmlType="submit" block style={{ height: 48, borderRadius: 8, fontWeight: 600, fontSize: 16, background: "#2563eb" }}>
                        Gửi yêu cầu
                      </Button>
                    </Form.Item>

                    <div style={{ textAlign: "center" }}>
                      <a onClick={() => setIsForgotPassword(false)} style={{ color: "#2563eb", fontWeight: 600, fontSize: 14, cursor: "pointer", textDecoration: "none" }}>
                        Quay lại Đăng nhập
                      </a>
                    </div>
                  </Form>
                ) : isLogin ? (
                  <Form form={loginForm} layout="vertical" onFinish={onFinishLogin} requiredMark={false} size="large">
                    <Form.Item 
                      label={<span style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Email hoặc Mã hồ sơ</span>} 
                      name="email" 
                      rules={[{ required: true, message: "Vui lòng nhập email hoặc mã hồ sơ" }]}
                    >
                      <Input prefix={<MailOutlined style={{ color: "#9ca3af", marginRight: 8 }} />} placeholder="Nhập email / mã hồ sơ" style={{ borderRadius: 8, height: 48 }} />
                    </Form.Item>

                    <Form.Item 
                      label={<span style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Mật khẩu</span>} 
                      name="password" 
                      rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                      style={{ marginBottom: 16 }}
                    >
                      <Input.Password prefix={<LockOutlined style={{ color: "#9ca3af", marginRight: 8 }} />} placeholder="Nhập mật khẩu" style={{ borderRadius: 8, height: 48 }} />
                    </Form.Item>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                      <Form.Item name="remember" valuePropName="checked" noStyle>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#4b5563", fontSize: 14 }}>
                          <input type="checkbox" style={{ cursor: "pointer", accentColor: "#2563eb", width: 16, height: 16 }} />
                          Ghi nhớ đăng nhập
                        </label>
                      </Form.Item>
                      <a onClick={() => setIsForgotPassword(true)} style={{ color: "#2563eb", fontSize: 14, fontWeight: 500, cursor: "pointer", textDecoration: "none" }}>Quên mật khẩu?</a>
                    </div>

                    <Form.Item style={{ marginBottom: 24 }}>
                      <Button type="primary" htmlType="submit" block loading={loadingLogin} style={{ height: 48, borderRadius: 8, fontWeight: 600, fontSize: 16, background: "#2563eb" }}>
                        Đăng nhập
                      </Button>
                    </Form.Item>
                    
                    <div style={{ textAlign: "center", display: "flex", justifyContent: "center", gap: 6 }}>
                      <Text style={{ color: "#6b7280", fontSize: 14 }}>Chưa có tài khoản?</Text>
                      <Link to="/register" style={{ color: "#2563eb", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                        Đăng ký ngay
                      </Link>
                    </div>
                  </Form>
                ) : (
                  <Form form={registerForm} layout="vertical" onFinish={onFinishRegister} requiredMark={false} size="large">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "0 16px" }}>
                      <Form.Item 
                        label={<span style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Họ và tên</span>} 
                        name="fullName" 
                        rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                      >
                        <Input prefix={<UserOutlined style={{ color: "#9ca3af", marginRight: 8 }} />} placeholder="Nhập họ và tên" style={{ borderRadius: 8, height: 48 }} />
                      </Form.Item>

                      <Form.Item 
                        label={<span style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Email</span>} 
                        name="email" 
                        rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }]}
                      >
                        <Input prefix={<MailOutlined style={{ color: "#9ca3af", marginRight: 8 }} />} placeholder="Nhập email của bạn" style={{ borderRadius: 8, height: 48 }} />
                      </Form.Item>
                      
                      <Form.Item 
                        label={<span style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Mật khẩu</span>} 
                        name="password" 
                        rules={[{ required: true, message: "Vui lòng tạo mật khẩu" }]}
                      >
                        <Input.Password prefix={<LockOutlined style={{ color: "#9ca3af", marginRight: 8 }} />} placeholder="Nhập mật khẩu" style={{ borderRadius: 8, height: 48 }} />
                      </Form.Item>
                      
                      <Form.Item 
                        label={<span style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Xác nhận mật khẩu</span>} 
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
                        <Input.Password prefix={<SafetyCertificateOutlined style={{ color: "#9ca3af", marginRight: 8 }} />} placeholder="Nhập lại mật khẩu" style={{ borderRadius: 8, height: 48 }} />
                      </Form.Item>
                    </div>

                    <Form.Item style={{ marginTop: 8, marginBottom: 24 }}>
                      <Button type="primary" htmlType="submit" block loading={loadingRegister} style={{ height: 48, borderRadius: 8, fontWeight: 600, fontSize: 16, background: "#2563eb" }}>
                        Đăng ký
                      </Button>
                    </Form.Item>

                    <div style={{ textAlign: "center", display: "flex", justifyContent: "center", gap: 6 }}>
                      <Text style={{ color: "#6b7280", fontSize: 14 }}>Đã có tài khoản?</Text>
                      <Link to="/login" style={{ color: "#2563eb", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                        Đăng nhập ngay
                      </Link>
                    </div>
                  </Form>
                )}
              </Card>
            </div>
          </div>

          {/* Footer Text */}
          <div style={{ padding: "24px", marginTop: "auto", textAlign: "center", width: "100%", zIndex: 10, color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
            © 2024 UniAdmission. All rights reserved.
          </div>
        </div>
      </ConfigProvider>
    );
  }

  return null;
};
