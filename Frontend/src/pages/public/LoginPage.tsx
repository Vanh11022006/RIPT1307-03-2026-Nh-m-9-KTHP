import React, { useState } from "react";
import { Form, Input, Button, Typography, message, Divider, Checkbox } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOutlined, FacebookOutlined } from "@ant-design/icons";
import { useAuthStore } from "../../stores/auth.store";

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const onFinish = async (values: any) => {
    setLoading(true);
    const { email, password, remember } = values;
    
    const result = await login(email, password, remember);
    setLoading(false);
    
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

  const handleSocialLogin = () => {
    message.info("Tính năng đăng nhập qua Mạng xã hội đang được phát triển.");
  };

  return (
    <div className="glass-card animate-fade-up" style={{ width: 420, padding: "40px", marginTop: "40px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Title level={2} style={{ color: "white", marginBottom: 8 }}>Chào mừng trở lại</Title>
        <Text style={{ color: "rgba(255,255,255,0.6)" }}>Đăng nhập để tiếp tục hành trình của bạn</Text>
      </div>

      <Form layout="vertical" onFinish={onFinish} className="dark-form" requiredMark={false} initialValues={{ remember: false }}>
        <Form.Item 
          label="Email" 
          name="email" 
          rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }]}
        >
          <Input className="glass-input" size="large" placeholder="Nhập email của bạn" />
        </Form.Item>

        <Form.Item 
          label="Mật khẩu" 
          name="password" 
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          style={{ marginBottom: 16 }}
        >
          <Input.Password className="glass-input" size="large" placeholder="Nhập mật khẩu" />
        </Form.Item>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox style={{ color: "rgba(255,255,255,0.8)" }}>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>
          <Link to="/forgot-password" style={{ color: "var(--neon-cyan)" }}>Quên mật khẩu?</Link>
        </div>

        <Form.Item style={{ marginBottom: 16 }}>
          <Button className="btn-glow" size="large" htmlType="submit" block loading={loading} style={{ height: "50px", fontSize: "16px", fontWeight: 600 }}>
            Đăng Nhập Ngay
          </Button>
        </Form.Item>

        <Divider style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }} plain>Hoặc tiếp tục với</Divider>

        <div style={{ display: "flex", gap: "16px", marginBottom: 24 }}>
          <Button 
            block 
            size="large" 
            icon={<GoogleOutlined />} 
            onClick={handleSocialLogin}
            style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "white" }}
          >
            Google
          </Button>
          <Button 
            block 
            size="large" 
            icon={<FacebookOutlined />} 
            onClick={handleSocialLogin}
            style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "white" }}
          >
            Facebook
          </Button>
        </div>
      </Form>

      <div style={{ textAlign: "center", marginTop: 24, padding: "16px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
        <Text style={{ color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 8, fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>Tài khoản Demo Nhanh</Text>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "var(--neon-purple)" }}>Quản trị viên</Text>
            <Text style={{ color: "white", fontSize: "12px" }}>admin@example.com / 123456</Text>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "var(--neon-cyan)" }}>Thí sinh</Text>
            <Text style={{ color: "white", fontSize: "12px" }}>candidate@example.com / 123456</Text>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Text style={{ color: "rgba(255,255,255,0.6)" }}>Chưa có tài khoản? </Text>
        <Link to="/register" style={{ color: "var(--neon-cyan)", fontWeight: 600 }}>Tạo tài khoản mới</Link>
      </div>
    </div>
  );
};
