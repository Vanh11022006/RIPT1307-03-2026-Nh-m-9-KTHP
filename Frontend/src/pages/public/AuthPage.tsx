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

  // Local state for the new login page
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRemember, setLoginRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      message.error("Vui lòng nhập email hoặc mã hồ sơ và mật khẩu.");
      return;
    }
    await onFinishLogin({
      email: loginEmail,
      password: loginPassword,
      remember: loginRemember
    });
  };

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

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      message.error("Vui lòng nhập email.");
      return;
    }
    await onFinishForgotPassword({ email: forgotEmail });
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = resetEmail || prefilledEmail;
    if (!email) {
      message.error("Vui lòng nhập email đã nhận mã khôi phục.");
      return;
    }
    if (!resetCode1 || !resetCode2 || !resetCode3 || !resetCode4) {
      message.error("Vui lòng nhập đầy đủ mã khôi phục.");
      return;
    }
    if (!resetNewPassword || !resetConfirmPassword) {
      message.error("Vui lòng nhập mật khẩu mới và xác nhận mật khẩu.");
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      message.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    await onFinishResetPassword({
      email,
      code1: resetCode1,
      code2: resetCode2,
      code3: resetCode3,
      code4: resetCode4,
      newPassword: resetNewPassword,
      confirmPassword: resetConfirmPassword,
    });
  };

  const handleCodeChange = (value: string, index: number) => {
    const cleanValue = value.replace(/\D/g, "");
    if (index === 0) setResetCode1(cleanValue);
    if (index === 1) setResetCode2(cleanValue);
    if (index === 2) setResetCode3(cleanValue);
    if (index === 3) setResetCode4(cleanValue);

    if (cleanValue && index < 3) {
      codeHtmlInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      codeHtmlInputRefs.current[index - 1]?.focus();
    }
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

  // Local state for forgot password page
  const [forgotEmail, setForgotEmail] = useState("");

  // Local state for reset password page
  const [resetEmail, setResetEmail] = useState(prefilledEmail);
  const [resetCode1, setResetCode1] = useState("");
  const [resetCode2, setResetCode2] = useState("");
  const [resetCode3, setResetCode3] = useState("");
  const [resetCode4, setResetCode4] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const codeHtmlInputRefs = useRef<Array<HTMLInputElement | null>>([]);

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
      setResetEmail(prefilledEmail);
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
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#00daf3] transition-colors text-slate-400">person</span>
                        <input 
                          className="w-full h-12 bg-white border border-slate-200/50 rounded-full pl-12 pr-6 text-slate-800 placeholder:text-slate-400 text-sm shadow-[0_4px_10px_rgba(0,0,0,0.03)] transition-all focus:border-[#00daf3] focus:ring-4 focus:ring-[#00e3fd]/10 focus:shadow-[0_4px_12px_rgba(0,227,253,0.15)]" 
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
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#00daf3] transition-colors text-slate-400">call</span>
                        <input 
                          className="w-full h-12 bg-white border border-slate-200/50 rounded-full pl-12 pr-6 text-slate-800 placeholder:text-slate-400 text-sm shadow-[0_4px_10px_rgba(0,0,0,0.03)] transition-all focus:border-[#00daf3] focus:ring-4 focus:ring-[#00e3fd]/10 focus:shadow-[0_4px_12px_rgba(0,227,253,0.15)]" 
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
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#00daf3] transition-colors text-slate-400">mail</span>
                        <input 
                          className="w-full h-12 bg-white border border-slate-200/50 rounded-full pl-12 pr-6 text-slate-800 placeholder:text-slate-400 text-sm shadow-[0_4px_10px_rgba(0,0,0,0.03)] transition-all focus:border-[#00daf3] focus:ring-4 focus:ring-[#00e3fd]/10 focus:shadow-[0_4px_12px_rgba(0,227,253,0.15)]" 
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
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#00daf3] transition-colors text-slate-400">lock</span>
                        <input 
                          className="w-full h-12 bg-white border border-slate-200/50 rounded-full pl-12 pr-6 text-slate-800 placeholder:text-slate-400 text-sm shadow-[0_4px_10px_rgba(0,0,0,0.03)] transition-all focus:border-[#00daf3] focus:ring-4 focus:ring-[#00e3fd]/10 focus:shadow-[0_4px_12px_rgba(0,227,253,0.15)]" 
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
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#00daf3] transition-colors text-slate-400">enhanced_encryption</span>
                        <input 
                          className="w-full h-12 bg-white border border-slate-200/50 rounded-full pl-12 pr-6 text-slate-800 placeholder:text-slate-400 text-sm shadow-[0_4px_10px_rgba(0,0,0,0.03)] transition-all focus:border-[#00daf3] focus:ring-4 focus:ring-[#00e3fd]/10 focus:shadow-[0_4px_12px_rgba(0,227,253,0.15)]" 
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

  if (isLogin) {
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

          {/* Right Side: Login Form */}
          <section className="w-full md:w-1/2 flex items-center justify-center px-6 py-12 md:py-24 bg-[#F8FAFC]">
            <div className="w-full max-w-md">
              <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 md:p-10 border border-slate-200/50 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden">
                {/* Glow effect inside card */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00E3FD]/5 blur-3xl rounded-full pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Chào mừng trở lại</h2>
                  <p className="text-slate-500 text-sm mb-8">Vui lòng đăng nhập để tiếp tục hành trình của bạn.</p>
                  
                  <form className="space-y-6" onSubmit={handleLoginSubmit}>
                    {/* Email/Phone */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 ml-1">Email hoặc Số điện thoại</label>
                      <div className={`relative group transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#00daf3] transition-colors text-slate-400">person</span>
                        <input 
                          className="w-full h-12 bg-white border border-slate-200/50 rounded-full pl-12 pr-6 text-slate-800 placeholder:text-slate-400 text-sm shadow-[0_4px_10px_rgba(0,0,0,0.03)] transition-all focus:border-[#00daf3] focus:ring-4 focus:ring-[#00e3fd]/10 focus:shadow-[0_4px_12px_rgba(0,227,253,0.15)]" 
                          placeholder="example@email.com" 
                          type="text"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 ml-1">Mật khẩu</label>
                      <div className={`relative group transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#00daf3] transition-colors text-slate-400">lock</span>
                        <input 
                          className="w-full h-12 bg-white border border-slate-200/50 rounded-full pl-12 pr-12 text-slate-800 placeholder:text-slate-400 text-sm shadow-[0_4px_10px_rgba(0,0,0,0.03)] transition-all focus:border-[#00daf3] focus:ring-4 focus:ring-[#00e3fd]/10 focus:shadow-[0_4px_12px_rgba(0,227,253,0.15)]" 
                          placeholder="••••••••" 
                          type={showPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                        />
                        <button 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00daf3] transition-colors bg-transparent border-0 cursor-pointer flex items-center justify-center p-0" 
                          onClick={() => setShowPassword(!showPassword)}
                          type="button"
                        >
                          <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="flex items-center justify-between px-1">
                      <label className="flex items-center gap-2 cursor-pointer group select-none">
                        <input 
                          type="checkbox" 
                          checked={loginRemember}
                          onChange={(e) => setLoginRemember(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-[#006874] focus:ring-[#006874]/20 cursor-pointer"
                        />
                        <span className="text-sm text-slate-500 group-hover:text-slate-800 transition-colors">Ghi nhớ đăng nhập</span>
                      </label>
                      <Link to="/forgot-password" className="text-sm text-[#006874] font-medium hover:text-[#006874]/80 transition-colors">
                        Quên mật khẩu?
                      </Link>
                    </div>

                    {/* CTA Button */}
                    <button 
                      type="submit" 
                      disabled={loadingLogin}
                      className="w-full mt-8 h-12 rounded-full bg-[#00e3fd] hover:bg-[#00daf3] text-[#001f24] font-bold text-base shadow-[0_8px_20px_rgba(0,227,253,0.35)] hover:shadow-[0_10px_25px_rgba(0,227,253,0.5)] active:scale-[0.98] transition-all duration-300 border-0 cursor-pointer flex items-center justify-center"
                    >
                      {loadingLogin ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                  </form>
                  <div className="mt-6 text-center text-sm text-slate-500">
                    Chưa có tài khoản?{" "}
                    <Link to="/register" className="text-[#006874] font-bold hover:text-[#006874]/80 transition-colors">
                      Đăng ký ngay
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

  if (isForgotPassword) {
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

          {/* Right Side: Forgot Password Form */}
          <section className="w-full md:w-1/2 flex items-center justify-center px-6 py-12 md:py-24 bg-[#F8FAFC]">
            <div className="w-full max-w-md">
              <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 md:p-10 border border-slate-200/50 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden">
                {/* Glow effect inside card */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00E3FD]/5 blur-3xl rounded-full pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Quên mật khẩu</h2>
                  <p className="text-slate-500 text-sm mb-8">Nhập email đã đăng ký để chúng tôi gửi mã khôi phục mật khẩu 4 chữ số.</p>
                  
                  <form className="space-y-6" onSubmit={handleForgotPasswordSubmit}>
                    {/* Email */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 ml-1">Email</label>
                      <div className={`relative group transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#00daf3] transition-colors text-slate-400">mail</span>
                        <input 
                          className="w-full h-12 bg-white border border-slate-200/50 rounded-full pl-12 pr-6 text-slate-800 placeholder:text-slate-400 text-sm shadow-[0_4px_10px_rgba(0,0,0,0.03)] transition-all focus:border-[#00daf3] focus:ring-4 focus:ring-[#00e3fd]/10 focus:shadow-[0_4px_12px_rgba(0,227,253,0.15)]" 
                          placeholder="example@email.com" 
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button 
                      type="submit" 
                      disabled={loadingForgot}
                      className="w-full mt-8 h-12 rounded-full bg-[#00e3fd] hover:bg-[#00daf3] text-[#001f24] font-bold text-base shadow-[0_8px_20px_rgba(0,227,253,0.35)] hover:shadow-[0_10px_25px_rgba(0,227,253,0.5)] active:scale-[0.98] transition-all duration-300 border-0 cursor-pointer flex items-center justify-center"
                    >
                      {loadingForgot ? "Đang gửi..." : "Gửi email khôi phục"}
                    </button>
                  </form>
                  <div className="mt-6 text-center text-sm text-slate-500">
                    <Link to="/login" className="text-[#006874] font-bold hover:text-[#006874]/80 transition-colors">
                      Quay lại đăng nhập
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

  if (isResetPassword) {
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

          {/* Right Side: Reset Password Form */}
          <section className="w-full md:w-1/2 flex items-center justify-center px-6 py-12 md:py-24 bg-[#F8FAFC]">
            <div className="w-full max-w-md">
              <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 md:p-10 border border-slate-200/50 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden">
                {/* Glow effect inside card */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00E3FD]/5 blur-3xl rounded-full pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Đặt lại mật khẩu</h2>
                  <p className="text-slate-500 text-sm mb-8">Nhập email, mã khôi phục 4 chữ số và mật khẩu mới để hoàn tất đặt lại mật khẩu.</p>
                  
                  <form className="space-y-4" onSubmit={handleResetPasswordSubmit}>
                    {/* Email */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 ml-1">Email</label>
                      <div className={`relative group transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#00daf3] transition-colors text-slate-400">mail</span>
                        <input 
                          className="w-full h-12 bg-white border border-slate-200/50 rounded-full pl-12 pr-6 text-slate-800 placeholder:text-slate-400 text-sm shadow-[0_4px_10px_rgba(0,0,0,0.03)] transition-all focus:border-[#00daf3] focus:ring-4 focus:ring-[#00e3fd]/10 focus:shadow-[0_4px_12px_rgba(0,227,253,0.15)]" 
                          placeholder="example@email.com" 
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </div>
                    </div>

                    {/* Reset Code */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 ml-1">Mã khôi phục</label>
                      <div className="grid grid-cols-4 gap-4">
                        {[0, 1, 2, 3].map((index) => {
                          const val = index === 0 ? resetCode1 : index === 1 ? resetCode2 : index === 2 ? resetCode3 : resetCode4;
                          return (
                            <input
                              key={index}
                              ref={(el) => { codeHtmlInputRefs.current[index] = el; }}
                              className="w-full h-12 bg-white border border-slate-200/50 rounded-2xl text-center text-slate-800 text-lg font-bold shadow-[0_4px_10px_rgba(0,0,0,0.03)] transition-all focus:border-[#00daf3] focus:ring-4 focus:ring-[#00e3fd]/10"
                              maxLength={1}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={val}
                              onChange={(e) => handleCodeChange(e.target.value, index)}
                              onKeyDown={(e) => handleCodeKeyDown(e, index)}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 ml-1">Mật khẩu mới</label>
                      <div className={`relative group transition-all duration-300 ${focusedField === 'newPassword' ? 'scale-[1.01]' : ''}`}>
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#00daf3] transition-colors text-slate-400">lock</span>
                        <input 
                          className="w-full h-12 bg-white border border-slate-200/50 rounded-full pl-12 pr-12 text-slate-800 placeholder:text-slate-400 text-sm shadow-[0_4px_10px_rgba(0,0,0,0.03)] transition-all focus:border-[#00daf3] focus:ring-4 focus:ring-[#00e3fd]/10 focus:shadow-[0_4px_12px_rgba(0,227,253,0.15)]" 
                          placeholder="••••••••" 
                          type={showNewPassword ? "text" : "password"}
                          value={resetNewPassword}
                          onChange={(e) => setResetNewPassword(e.target.value)}
                          onFocus={() => setFocusedField('newPassword')}
                          onBlur={() => setFocusedField(null)}
                        />
                        <button 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00daf3] transition-colors bg-transparent border-0 cursor-pointer flex items-center justify-center p-0" 
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          type="button"
                        >
                          <span className="material-symbols-outlined">{showNewPassword ? "visibility_off" : "visibility"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 ml-1">Xác nhận mật khẩu mới</label>
                      <div className={`relative group transition-all duration-300 ${focusedField === 'confirmPassword' ? 'scale-[1.01]' : ''}`}>
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#00daf3] transition-colors text-slate-400">enhanced_encryption</span>
                        <input 
                          className="w-full h-12 bg-white border border-slate-200/50 rounded-full pl-12 pr-12 text-slate-800 placeholder:text-slate-400 text-sm shadow-[0_4px_10px_rgba(0,0,0,0.03)] transition-all focus:border-[#00daf3] focus:ring-4 focus:ring-[#00e3fd]/10 focus:shadow-[0_4px_12px_rgba(0,227,253,0.15)]" 
                          placeholder="••••••••" 
                          type={showConfirmPassword ? "text" : "password"}
                          value={resetConfirmPassword}
                          onChange={(e) => setResetConfirmPassword(e.target.value)}
                          onFocus={() => setFocusedField('confirmPassword')}
                          onBlur={() => setFocusedField(null)}
                        />
                        <button 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00daf3] transition-colors bg-transparent border-0 cursor-pointer flex items-center justify-center p-0" 
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          type="button"
                        >
                          <span className="material-symbols-outlined">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                        </button>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button 
                      type="submit" 
                      disabled={loadingReset}
                      className="w-full mt-8 h-12 rounded-full bg-[#00e3fd] hover:bg-[#00daf3] text-[#001f24] font-bold text-base shadow-[0_8px_20px_rgba(0,227,253,0.35)] hover:shadow-[0_10px_25px_rgba(0,227,253,0.5)] active:scale-[0.98] transition-all duration-300 border-0 cursor-pointer flex items-center justify-center"
                    >
                      {loadingReset ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                    </button>
                  </form>
                  <div className="mt-6 text-center text-sm text-slate-500">
                    <Link to="/forgot-password" className="text-[#006874] font-bold hover:text-[#006874]/80 transition-colors">
                      Gửi lại mã khôi phục
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

  return null;
};
