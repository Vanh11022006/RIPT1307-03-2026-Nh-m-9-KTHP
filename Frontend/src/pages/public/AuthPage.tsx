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

  // Local state for the new register page
  const [regFullName, setRegFullName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regPhone || !regEmail || !regPassword || !regConfirmPassword) {
      message.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      message.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    await onFinishRegister({
      fullName: regFullName,
      phone: regPhone,
      email: regEmail,
      password: regPassword
    });
  };

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

  useEffect(() => {
    const handleMouseMoveCards = (e: MouseEvent) => {
      const cards = document.querySelectorAll(".landing-page-root .glass-panel.transform-card");
      const x = (window.innerWidth / 2 - e.pageX) / 80;
      const y = (window.innerHeight / 2 - e.pageY) / 80;

      cards.forEach((card) => {
        (card as HTMLElement).style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    if (isRegister && window.innerWidth >= 768) {
      document.addEventListener("mousemove", handleMouseMoveCards);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMoveCards);
    };
  }, [isRegister]);

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

  if (isRegister) {
    return (
      <div className="landing-page-root w-full min-h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-x-hidden relative">
        {/* TopNavBar */}
        <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-4 bg-transparent">
          <div 
            onClick={() => navigate("/")}
            className="font-bold text-2xl text-[#00616d] tracking-tight cursor-pointer"
          >
            UniAdmission
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a className="text-slate-600 font-medium hover:text-[#00616d] transition-colors duration-300" href="/">Support</a>
            <button 
              className="bg-[#00616d] text-white px-6 py-2.5 rounded-full font-semibold hover:scale-95 transition-transform duration-200 border-0 cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Apply Now
            </button>
          </div>
        </header>

        <main className="min-h-screen flex flex-col md:flex-row relative">
          {/* Left Side: Cinematic Background (Lightened) */}
          <section className="relative w-full md:w-1/2 min-h-[50vh] md:min-h-screen overflow-hidden bg-white flex flex-col justify-center">
            <div className="absolute inset-0">
              <img 
                alt="University Campus" 
                className="w-full h-full object-cover opacity-40" 
                style={{ height: "100%", objectFit: "cover" }}
                src="https://lh3.googleusercontent.com/aida/AP1WRLvN0Sk4JKTdaEUCkpCz9iZqfPmM3Tfg7bwTrY79ZnGUAxKMXrMiG6k_y0Z36iqX3RHeXoAMo6uBIpjPpeYl1S3Js8NzKF6HkVYonDszcLDZohmR4DjT1d7gaEEcZ2kOxZ8VlmlVtsP-sA2rOAiGWN6WTOyU5l9xqmbrSYPxrZviLCxeG0SXfWsPbjlR94JQQAIxQ6toT_rJaPB_hX-jMuPc1xJUa44TanghrYzdst_GgIrE8gqN4S84VqCh"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"></div>
            </div>
            
            {/* Content Overlay */}
            <div className="relative h-full flex flex-col justify-center px-6 md:px-20 z-10 py-20 md:py-0">
              <div className="max-w-xl">
                <h1 className="text-4xl md:text-6xl text-slate-800 mb-6 leading-tight font-extrabold">
                  Chạm tay <br/>
                  vào <br/>
                  <span className="bg-gradient-to-r from-[#00616d] to-[#00daf3] bg-clip-text text-transparent font-extrabold">tương lai</span>
                </h1>
                <p className="text-lg text-slate-600 mb-8 max-w-md">
                  Gia nhập cộng đồng hơn 1 triệu sinh viên đang tìm kiếm cơ hội học tập tốt nhất.
                </p>
                
                {/* Success Indicators (Floating Cards) */}
                <div className="flex flex-col gap-4">
                  <div className="glass-panel transform-card p-4 rounded-2xl flex items-center gap-4 transform hover:-translate-y-1 transition-all w-fit shadow-lg border border-white/20 bg-white/40 backdrop-blur-xl">
                    <div className="w-12 h-12 rounded-full bg-[#00616d] text-white flex items-center justify-center shadow-md shrink-0">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-lg">98% Success Rate</div>
                      <div className="text-xs font-medium text-slate-500">Top University Admissions 2023</div>
                    </div>
                  </div>
                  
                  <div className="glass-panel transform-card p-4 rounded-2xl flex items-center gap-4 transform hover:-translate-y-1 transition-all w-fit ml-0 md:ml-12 shadow-lg border border-white/20 bg-white/40 backdrop-blur-xl">
                    <div className="w-12 h-12 rounded-full bg-[#6b00af] text-white flex items-center justify-center shadow-md shrink-0">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>diversity_3</span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-lg">Active Community</div>
                      <div className="text-xs font-medium text-slate-500">1M+ Students Globally</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Background Atmosphere */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#00E3FD]/10 blur-3xl rounded-full pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#F2DAFF]/10 blur-3xl rounded-full pointer-events-none"></div>
          </section>

          {/* Right Side: Registration Form */}
          <section className="w-full md:w-1/2 flex items-center justify-center px-6 py-12 md:py-24 bg-[#F8FAFC]">
            <div className="w-full max-w-md">
              <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 md:p-10 border border-slate-200/50 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden">
                {/* Glow effect inside card */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00E3FD]/5 blur-3xl rounded-full pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Tạo tài khoản mới</h2>
                  <p className="text-slate-500 text-sm mb-8">Bắt đầu hành trình chinh phục ước mơ học thuật của bạn.</p>
                  
                  <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 ml-1">Họ và tên</label>
                      <div className={`relative group transition-all duration-300 ${focusedField === 'fullName' ? 'scale-[1.01]' : ''}`}>
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#006874] transition-colors text-slate-400">person</span>
                        <input 
                          className="w-full h-12 bg-white border border-slate-200 rounded-full pl-12 pr-6 text-slate-800 placeholder:text-slate-400 text-sm transition-all focus:border-[#006874] focus:ring-2 focus:ring-[#006874]/10" 
                          placeholder="Nguyễn Văn A" 
                          type="text"
                          value={regFullName}
                          onChange={(e) => regFullName !== e.target.value && setRegFullName(e.target.value)}
                          onFocus={() => setFocusedField('fullName')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 ml-1">Số điện thoại</label>
                      <div className={`relative group transition-all duration-300 ${focusedField === 'phone' ? 'scale-[1.01]' : ''}`}>
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#006874] transition-colors text-slate-400">call</span>
                        <input 
                          className="w-full h-12 bg-white border border-slate-200 rounded-full pl-12 pr-6 text-slate-800 placeholder:text-slate-400 text-sm transition-all focus:border-[#006874] focus:ring-2 focus:ring-[#006874]/10" 
                          placeholder="0901 234 567" 
                          type="tel"
                          value={regPhone}
                          onChange={(e) => regPhone !== e.target.value && setRegPhone(e.target.value)}
                          onFocus={() => setFocusedField('phone')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 ml-1">Email</label>
                      <div className={`relative group transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#006874] transition-colors text-slate-400">mail</span>
                        <input 
                          className="w-full h-12 bg-white border border-slate-200 rounded-full pl-12 pr-6 text-slate-800 placeholder:text-slate-400 text-sm transition-all focus:border-[#006874] focus:ring-2 focus:ring-[#006874]/10" 
                          placeholder="example@email.com" 
                          type="email"
                          value={regEmail}
                          onChange={(e) => regEmail !== e.target.value && setRegEmail(e.target.value)}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 ml-1">Mật khẩu</label>
                      <div className={`relative group transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#006874] transition-colors text-slate-400">lock</span>
                        <input 
                          className="w-full h-12 bg-white border border-slate-200 rounded-full pl-12 pr-6 text-slate-800 placeholder:text-slate-400 text-sm transition-all focus:border-[#006874] focus:ring-2 focus:ring-[#006874]/10" 
                          placeholder="••••••••" 
                          type="password"
                          value={regPassword}
                          onChange={(e) => regPassword !== e.target.value && setRegPassword(e.target.value)}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 ml-1">Xác nhận mật khẩu</label>
                      <div className={`relative group transition-all duration-300 ${focusedField === 'confirmPassword' ? 'scale-[1.01]' : ''}`}>
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#006874] transition-colors text-slate-400">enhanced_encryption</span>
                        <input 
                          className="w-full h-12 bg-white border border-slate-200 rounded-full pl-12 pr-6 text-slate-800 placeholder:text-slate-400 text-sm transition-all focus:border-[#006874] focus:ring-2 focus:ring-[#006874]/10" 
                          placeholder="••••••••" 
                          type="password"
                          value={regConfirmPassword}
                          onChange={(e) => regConfirmPassword !== e.target.value && setRegConfirmPassword(e.target.value)}
                          onFocus={() => setFocusedField('confirmPassword')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button 
                      type="submit" 
                      disabled={loadingRegister}
                      className="w-full mt-8 h-12 rounded-full bg-[#00e3fd] hover:bg-[#00daf3] text-[#001f24] font-bold text-base shadow-[0_8px_20px_rgba(0,227,253,0.35)] hover:shadow-[0_10px_25px_rgba(0,227,253,0.5)] active:scale-[0.98] transition-all duration-300 border-0 cursor-pointer flex items-center justify-center"
                    >
                      {loadingRegister ? "Đang đăng ký..." : "Đăng ký"}
                    </button>
                  </form>
                  <div className="mt-6 text-center text-sm text-slate-500">
                    Đã có tài khoản?{" "}
                    <Link to="/login" className="text-[#006874] font-bold hover:text-[#006874]/80 transition-colors">
                      Đăng nhập ngay
                    </Link>
                  </div>
                </div>
              </div>

              {/* Footer Links */}
              <footer className="mt-8 flex justify-between items-center text-xs text-slate-400">
                <div className="flex gap-4">
                  <a className="hover:text-[#006874] transition-colors" href="#">Privacy Policy</a>
                  <a className="hover:text-[#006874] transition-colors" href="#">Terms</a>
                </div>
                <div>© 2024 UniAdmission</div>
              </footer>
            </div>
          </section>
        </main>

        {/* Floating Atmosphere Elements */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#00E3FD]/5 blur-3xl pointer-events-none -z-10"></div>
        <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-[#F2DAFF]/5 blur-3xl pointer-events-none -z-10"></div>
      </div>
    );
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
