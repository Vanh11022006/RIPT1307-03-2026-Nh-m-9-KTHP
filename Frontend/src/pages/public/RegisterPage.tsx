import React, { useState } from "react";
import { Form, Input, Button, Typography, message, Divider } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOutlined, FacebookOutlined } from "@ant-design/icons";
import { useAuthStore } from "../../stores/auth.store";

const { Title, Text } = Typography;

export const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const onFinish = async (values: any) => {
    setLoading(true);
    const { email, password } = values;
    
    const result = await register(email, password);
    setLoading(false);
    
    if (result.success) {
      message.success(result.message);
      navigate("/login");
    } else {
      message.error(result.message);
    }
  };

  const handleSocialLogin = () => {
    message.info("Tính năng đăng ký qua Mạng xã hội đang được phát triển.");
  };

  return (
    <div className="glass-card animate-fade-up" style={{ width: 480, padding: "40px", marginTop: "20px", marginBottom: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Title level={2} style={{ color: "white", marginBottom: 8 }}>Bắt đầu hành trình</Title>
        <Text style={{ color: "rgba(255,255,255,0.6)" }}>Tạo tài khoản xét tuyển đại học của bạn ngay hôm nay</Text>
      </div>

      <Form layout="vertical" onFinish={onFinish} className="dark-form" requiredMark={false}>
        <div style={{ display: "flex", gap: "16px" }}>
          <Form.Item 
            label="Họ và tên" 
            name="fullName" 
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            style={{ flex: 1 }}
          >
            <Input className="glass-input" size="large" placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item 
            label="Số điện thoại" 
            name="phone" 
            rules={[{ required: true, message: "Vui lòng nhập SĐT" }]}
            style={{ flex: 1 }}
          >
            <Input className="glass-input" size="large" placeholder="0987654321" />
          </Form.Item>
        </div>

        <Form.Item 
          label="Email" 
          name="email" 
          rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }]}
        >
          <Input className="glass-input" size="large" placeholder="Nhập địa chỉ email của bạn" />
        </Form.Item>
        
        <Form.Item 
          label="Mật khẩu" 
          name="password" 
          rules={[{ required: true, message: "Vui lòng tạo mật khẩu" }]}
        >
          <Input.Password className="glass-input" size="large" placeholder="Tạo mật khẩu bảo mật" />
        </Form.Item>
        
        <Form.Item 
          label="Xác nhận mật khẩu" 
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
          <Input.Password className="glass-input" size="large" placeholder="Nhập lại mật khẩu" />
        </Form.Item>

        <Form.Item style={{ marginTop: 24, marginBottom: 16 }}>
          <Button className="btn-glow-purple" size="large" htmlType="submit" block loading={loading} style={{ height: "50px", fontSize: "16px", fontWeight: 600 }}>
            Tạo Tài Khoản
          </Button>
        </Form.Item>

        <Divider style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }} plain>Đăng ký nhanh</Divider>

        <div style={{ display: "flex", gap: "16px" }}>
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

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Text style={{ color: "rgba(255,255,255,0.6)" }}>Đã có tài khoản? </Text>
        <Link to="/login" style={{ color: "var(--neon-purple)", fontWeight: 600 }}>Đăng nhập ngay</Link>
      </div>
    </div>
  );
};
