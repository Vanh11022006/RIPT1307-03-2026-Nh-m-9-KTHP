import React, { useEffect, useRef, useState } from "react";
import { Form, Input, Button, Typography, message, Card, ConfigProvider, theme, Checkbox, Tooltip } from "antd";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { LeftOutlined, LockOutlined, MailOutlined, SafetyCertificateOutlined, UserOutlined } from "@ant-design/icons";
import { useAuthStore } from "../../stores/auth.store";
import type { InputRef } from "antd";

const { Title, Text } = Typography;

export const AuthPage: React.FC = () => {
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [loadingForgot, setLoadingForgot] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const codeInputRefs = useRef<Array<InputRef | null>>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, register, requestPasswordReset, resetPassword } = useAuthStore();

  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [forgotPasswordForm] = Form.useForm();
  const [resetPasswordForm] = Form.useForm();

  const isLogin = location.pathname === "/login";
  const isRegister = location.pathname === "/register";
  const isForgotPassword = location.pathname === "/forgot-password";
  const isResetPassword = location.pathname === "/reset-password";
  const prefilledEmail = searchParams.get("email") ?? "";

  // Don't show the floating fixed back button on the login page to avoid duplicate arrows
  const showFixedBack = isRegister || isForgotPassword || isResetPassword;
  const [hoverBack, setHoverBack] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768) {
      if (isRegister) {
        document.getElementById("register-section")?.scrollIntoView({ behavior: "smooth" });
      } else {
        document.getElementById("login-section")?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [isRegister, location.pathname]);

  useEffect(() => {
    if (isResetPassword && prefilledEmail) {
      resetPasswordForm.setFieldsValue({ email: prefilledEmail });
    }
  }, [isResetPassword, prefilledEmail, resetPasswordForm]);

  const goToDashboard = () => {
    const state = useAuthStore.getState();
    if (state.currentUser?.role === "admin") {
      navigate("/admin/dashboard");
    } else if (state.currentUser?.role === "candidate") {
      navigate("/candidate/dashboard");
    }
  };

  const goBack = () => {
    // If we're on login page, go to homepage
    if (isLogin) {
      navigate("/");
      return;
    }
    // If we're on reset-password, go to forgot-password explicitly
    if (isResetPassword) {
      navigate("/forgot-password");
      return;
    }

    // If we're on forgot-password page, always go to login (do not rely on history)
    if (isForgotPassword) {
      navigate("/login");
      return;
    }

    // Otherwise try to go back in history if possible
    if (window.history.length > 1) {
      navigate(-1);
    }
  };

  const onFinishLogin = async (values: any) => {
    setLoadingLogin(true);
    const result = await login(values.email, values.password, values.remember);
    setLoadingLogin(false);

    if (result.success) {
      message.success(result.message);
      goToDashboard();
      return;
    }

    message.error(result.message);
  };

  const onFinishRegister = async (values: any) => {
    setLoadingRegister(true);
    const result = await register(values.email, values.password, values.fullName, values.phone);
    setLoadingRegister(false);

    if (result.success) {
      message.success(result.message);
      registerForm.resetFields();
      navigate("/login");
      return;
    }

    message.error(result.message);
  };

  const onFinishForgotPassword = async (values: { email: string }) => {
    setLoadingForgot(true);
    const result = await requestPasswordReset(values.email);
    setLoadingForgot(false);

    if (result.success) {
      message.success(result.message);
      forgotPasswordForm.resetFields();
      navigate(`/reset-password?email=${encodeURIComponent(values.email)}`, { replace: true });
      return;
    }

    message.error(result.message);
  };

  const onFinishResetPassword = async (values: {
    email: string;
    code1: string;
    code2: string;
    code3: string;
    code4: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const email = values.email || prefilledEmail;
    if (!email) {
      message.error("Vui lòng nhập email đã nhận mã khôi phục.");
      return;
    }

    const token = `${values.code1 ?? ""}${values.code2 ?? ""}${values.code3 ?? ""}${values.code4 ?? ""}`;
    if (token.length !== 4) {
      message.error("Vui lòng nhập mã khôi phục.");
      return;
    }

    setLoadingReset(true);
    const result = await resetPassword(email, token, values.newPassword, values.confirmPassword);
    setLoadingReset(false);

    if (result.success) {
      message.success(result.message);
      resetPasswordForm.resetFields();
      navigate("/login");
      return;
    }

    message.error(result.message);
  };

  if (!(isLogin || isRegister || isForgotPassword || isResetPassword)) {
    return null;
  }

  const isWideForm = isRegister;
  const title = isForgotPassword ? "Quên mật khẩu" : isResetPassword ? "Nhập mã khôi phục" : isLogin ? "Đăng nhập UniAdmission" : "Đăng ký tài khoản";

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm, token: { colorPrimary: "#2563eb", colorBgContainer: "#ffffff", colorText: "#1f2937", colorTextSecondary: "#4b5563", borderRadius: 12 } }}>
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
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)" }} />

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
          {isLogin && (
            <div style={{ position: "absolute", left: 12, top: 14, zIndex: 99999 }}>
              <Tooltip title="Quay lại">
                <div
                  role="button"
                  aria-label="Quay về trang chủ"
                  onClick={goBack}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.06)",
                    cursor: "pointer",
                    border: "none",
                    color: "white"
                  }}
                >
                  <LeftOutlined style={{ fontSize: 18, color: "white" }} />
                </div>
              </Tooltip>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => navigate("/")}>
            <img src="/favicon.svg" alt="UniAdmission Logo" style={{ width: 36, height: 36 }} />
            <Title level={4} style={{ margin: 0, color: "white", fontWeight: 700 }}>UniAdmission</Title>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, width: "100%" }}>
          {showFixedBack && (
            <div style={{ position: "fixed", top: 16, left: 16, zIndex: 9999 }}>
              <Tooltip title={isLogin ? "Quay về trang chủ" : "Quay lại"}>
                <div
                  role="button"
                  aria-label={isLogin ? "Quay về trang chủ" : "Quay lại"}
                  onClick={goBack}
                  onMouseEnter={() => setHoverBack(true)}
                  onMouseLeave={() => setHoverBack(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    background: hoverBack ? "rgba(255,255,255,0.08)" : "transparent",
                    boxShadow: hoverBack ? "0 8px 24px rgba(255,255,255,0.08)" : "none",
                    cursor: "pointer",
                    transition: "background 150ms ease, transform 150ms ease, box-shadow 150ms ease",
                    transform: hoverBack ? "translateY(-2px)" : "none",
                    // remove visible border
                    border: "none",
                    color: "white"
                  }}
                >
                  <LeftOutlined style={{ fontSize: 20, color: "white" }} />
                </div>
              </Tooltip>
            </div>
          )}
          <div style={{ width: "100%", maxWidth: isWideForm ? 640 : 440, position: "relative" }}>
            {/* removed inner-card back button to keep single fixed floating button */}
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
                <img src="/favicon.svg" alt="UniAdmission Logo" style={{ width: 48, height: 48, marginBottom: 16 }} />
                <Title level={3} style={{ margin: 0, color: "#111827", fontWeight: 700 }}>{title}</Title>
              </div>

              {isForgotPassword ? (
                <Form form={forgotPasswordForm} layout="vertical" onFinish={onFinishForgotPassword} requiredMark={false} size="large">
                  <Text style={{ color: "#4b5563", display: "block", marginBottom: 24, fontSize: 14, textAlign: "center" }}>
                    Nhập email đã đăng ký để chúng tôi gửi mã khôi phục mật khẩu 4 chữ số.
                  </Text>
                  <Form.Item
                    label={<span style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Email</span>}
                    name="email"
                    rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }]}
                  >
                    <Input prefix={<MailOutlined style={{ color: "#9ca3af", marginRight: 8 }} />} placeholder="Nhập email của bạn" style={{ borderRadius: 8, height: 48 }} readOnly />
                  </Form.Item>

                  <Form.Item style={{ marginTop: 8, marginBottom: 24 }}>
                    <Button type="primary" htmlType="submit" block loading={loadingForgot} style={{ height: 48, borderRadius: 8, fontWeight: 600, fontSize: 16, background: "#2563eb" }}>
                      Gửi email khôi phục
                    </Button>
                  </Form.Item>

                </Form>
              ) : isResetPassword ? (
                <Form form={resetPasswordForm} layout="vertical" onFinish={onFinishResetPassword} requiredMark={false} size="large" initialValues={{ email: prefilledEmail }}>
                  <Text style={{ color: "#4b5563", display: "block", marginBottom: 24, fontSize: 14, textAlign: "center" }}>
                    Nhập email, mã khôi phục 4 chữ số và mật khẩu mới để hoàn tất đặt lại mật khẩu.
                  </Text>

                  <Form.Item
                    label={<span style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Email</span>}
                    name="email"
                    rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }]}
                  >
                    <Input prefix={<MailOutlined style={{ color: "#9ca3af", marginRight: 8 }} />} placeholder="Nhập email của bạn" style={{ borderRadius: 8, height: 48 }} />
                  </Form.Item>

                  <Form.Item label={<span style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Mã khôi phục</span>} required>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                      {(["code1", "code2", "code3", "code4"] as const).map((fieldName, index) => (
                        <Form.Item
                          key={fieldName}
                          name={fieldName}
                          rules={[{ required: true, message: " " }, { len: 1, message: " " }]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input
                            ref={(ref) => {
                              codeInputRefs.current[index] = ref;
                            }}
                            maxLength={1}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            onChange={(event) => {
                              const value = event.target.value.replace(/\D/g, "");
                              if (value !== event.target.value) {
                                event.target.value = value;
                              }
                              if (value && index < 3) {
                                codeInputRefs.current[index + 1]?.focus();
                              }
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Backspace" && !event.currentTarget.value && index > 0) {
                                codeInputRefs.current[index - 1]?.focus();
                              }
                            }}
                            style={{ borderRadius: 8, height: 48, textAlign: "center", fontSize: 18, fontWeight: 700 }}
                          />
                        </Form.Item>
                      ))}
                    </div>
                  </Form.Item>

                  <Form.Item
                    label={<span style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Mật khẩu mới</span>}
                    name="newPassword"
                    rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
                  >
                    <Input.Password prefix={<LockOutlined style={{ color: "#9ca3af", marginRight: 8 }} />} placeholder="Nhập mật khẩu mới" style={{ borderRadius: 8, height: 48 }} />
                  </Form.Item>

                  <Form.Item
                    label={<span style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Xác nhận mật khẩu mới</span>}
                    name="confirmPassword"
                    dependencies={["newPassword"]}
                    rules={[
                      { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("newPassword") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                        },
                      }),
                    ]}
                  >
                    <Input.Password prefix={<SafetyCertificateOutlined style={{ color: "#9ca3af", marginRight: 8 }} />} placeholder="Nhập lại mật khẩu mới" style={{ borderRadius: 8, height: 48 }} />
                  </Form.Item>

                  <Form.Item style={{ marginTop: 8, marginBottom: 24 }}>
                    <Button type="primary" htmlType="submit" block loading={loadingReset} style={{ height: 48, borderRadius: 8, fontWeight: 600, fontSize: 16, background: "#2563eb" }}>
                      Đặt lại mật khẩu
                    </Button>
                  </Form.Item>

                  <div style={{ textAlign: "center" }}>
                    <Link to="/forgot-password" style={{ color: "#2563eb", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                      Chưa nhận được mã? Gửi lại
                    </Link>
                  </div>
                </Form>
              ) : isLogin ? (
                <Form form={loginForm} layout="vertical" onFinish={onFinishLogin} requiredMark={false} size="large" initialValues={{ remember: false }}>
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
                      <Checkbox style={{ color: "#4b5563", fontSize: 14 }}>Ghi nhớ đăng nhập</Checkbox>
                    </Form.Item>
                    <Link to="/forgot-password" style={{ color: "#2563eb", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Quên mật khẩu?</Link>
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
                      label={<span style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Số điện thoại</span>}
                      name="phone"
                      rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                    >
                      <Input placeholder="Nhập số điện thoại" style={{ borderRadius: 8, height: 48 }} />
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

        <div style={{ padding: "24px", marginTop: "auto", textAlign: "center", width: "100%", zIndex: 10, color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
          © 2024 UniAdmission. All rights reserved.
        </div>
      </div>
    </ConfigProvider>
  );
};
