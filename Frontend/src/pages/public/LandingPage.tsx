import React from "react";
import { Typography, Button, Space, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { 
  RocketOutlined, 
  SafetyCertificateOutlined, 
  AreaChartOutlined
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden", paddingBottom: "100px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        
        {/* HERO SECTION */}
        <div style={{ textAlign: "center", paddingTop: "120px", paddingBottom: "80px" }} className="animate-fade-up">
          <div style={{ display: "inline-block", padding: "8px 16px", background: "rgba(0, 240, 255, 0.1)", borderRadius: "30px", border: "1px solid rgba(0, 240, 255, 0.2)", marginBottom: "24px" }}>
            <span style={{ color: "var(--neon-cyan)", fontWeight: 600, fontSize: "14px", letterSpacing: "1px" }}>
              TUYỂN SINH THẾ HỆ MỚI 2026
            </span>
          </div>
          
          <h1 style={{ 
            fontSize: "clamp(2.5rem, 5vw, 4.5rem)", 
            fontWeight: 800, 
            lineHeight: 1.1,
            margin: "0 0 24px 0",
            letterSpacing: "-1px",
            color: "white"
          }}>
            Khởi Tạo Tương Lai Của Bạn <br />
            Tại <span className="glowing-text">Cổng Không Gian Học Thuật</span>
          </h1>
          
          <Paragraph style={{ 
            fontSize: "clamp(1.1rem, 2vw, 1.25rem)", 
            color: "rgba(255, 255, 255, 0.7)", 
            maxWidth: 700, 
            margin: "0 auto 48px",
            lineHeight: 1.6
          }}>
            Hệ thống xét tuyển đại học tiên tiến nhất. Nộp hồ sơ nhanh chóng, theo dõi minh bạch và bước chân vào cánh cửa đại học mơ ước chỉ với vài cú click.
          </Paragraph>
          
          <Space size="large" wrap style={{ display: "flex", justifyContent: "center" }}>
            <Button 
              className="btn-glow" 
              size="large" 
              onClick={() => navigate("/register")} 
              style={{ height: "54px", padding: "0 40px", fontSize: "16px", fontWeight: 600 }}
            >
              Bắt Đầu Đăng Ký
            </Button>
            <Button 
              type="text"
              size="large" 
              onClick={() => navigate("/universities")} 
              style={{ color: "white", height: "54px", padding: "0 40px", fontSize: "16px" }}
            >
              Tìm hiểu các ngành học →
            </Button>
          </Space>
        </div>

        {/* METRICS SECTION */}
        <Row gutter={[24, 24]} justify="center" style={{ marginBottom: "100px" }} className="animate-fade-up delay-100">
          <Col xs={12} md={6}>
            <div className="glass-card" style={{ padding: "24px", textAlign: "center" }}>
              <Title level={2} style={{ color: "var(--neon-cyan)", margin: 0 }}>10K+</Title>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>Hồ sơ đã duyệt</Text>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="glass-card" style={{ padding: "24px", textAlign: "center" }}>
              <Title level={2} style={{ color: "var(--neon-purple)", margin: 0 }}>45</Title>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>Trường đối tác</Text>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="glass-card" style={{ padding: "24px", textAlign: "center" }}>
              <Title level={2} style={{ color: "var(--neon-cyan)", margin: 0 }}>120+</Title>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>Ngành học đa dạng</Text>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="glass-card" style={{ padding: "24px", textAlign: "center" }}>
              <Title level={2} style={{ color: "var(--neon-purple)", margin: 0 }}>99%</Title>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>Hài lòng hệ thống</Text>
            </div>
          </Col>
        </Row>

        {/* FEATURES SECTION */}
        <div style={{ textAlign: "center", marginBottom: "60px" }} className="animate-fade-up delay-200">
          <Title level={2} style={{ color: "white", fontSize: "2.5rem" }}>Trải nghiệm Tuyệt đỉnh</Title>
          <Paragraph style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.1rem", maxWidth: 600, margin: "0 auto" }}>
            Chúng tôi xóa bỏ mọi rào cản thủ tục giấy tờ, mang đến một nền tảng xét tuyển kỹ thuật số toàn diện.
          </Paragraph>
        </div>

        <Row gutter={[32, 32]} justify="center" className="animate-fade-up delay-300">
          <Col xs={24} md={8}>
            <div className="glass-card" style={{ padding: "40px 30px", height: "100%" }}>
              <RocketOutlined style={{ fontSize: 48, color: "var(--neon-cyan)", marginBottom: 24, filter: "drop-shadow(0 0 10px rgba(0, 240, 255, 0.5))" }} />
              <h3 style={{ fontSize: "1.5rem", color: "white", marginBottom: "16px" }}>Tốc độ Ánh sáng</h3>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", lineHeight: 1.6 }}>
                Nộp hồ sơ mọi lúc, mọi nơi. Hệ thống xử lý tự động hóa giúp bạn nhận kết quả xét tuyển trong thời gian ngắn nhất.
              </p>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="glass-card" style={{ padding: "40px 30px", height: "100%" }}>
              <SafetyCertificateOutlined style={{ fontSize: 48, color: "var(--neon-purple)", marginBottom: 24, filter: "drop-shadow(0 0 10px rgba(138, 43, 226, 0.5))" }} />
              <h3 style={{ fontSize: "1.5rem", color: "white", marginBottom: "16px" }}>Bảo mật Tối đa</h3>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", lineHeight: 1.6 }}>
                Mọi thông tin cá nhân và điểm số của bạn được mã hóa đa tầng, đảm bảo tính minh bạch và an toàn tuyệt đối.
              </p>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="glass-card" style={{ padding: "40px 30px", height: "100%" }}>
              <AreaChartOutlined style={{ fontSize: 48, color: "var(--neon-cyan)", marginBottom: 24, filter: "drop-shadow(0 0 10px rgba(0, 240, 255, 0.5))" }} />
              <h3 style={{ fontSize: "1.5rem", color: "white", marginBottom: "16px" }}>Theo dõi Real-time</h3>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", lineHeight: 1.6 }}>
                Cập nhật trạng thái hồ sơ theo thời gian thực. Không còn nỗi lo chờ đợi trong vô vọng.
              </p>
            </div>
          </Col>
        </Row>
        
        {/* CTA BOTTOM SECTION */}
        <div className="glass-card animate-fade-up delay-400" style={{ marginTop: "100px", padding: "60px 40px", textAlign: "center", background: "linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(138, 43, 226, 0.05) 100%)" }}>
          <h2 style={{ fontSize: "2.5rem", color: "white", marginBottom: "24px" }}>Sẵn sàng mở khóa tương lai?</h2>
          <Paragraph style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.2rem", maxWidth: 600, margin: "0 auto 40px" }}>
            Hàng ngàn thí sinh đã trúng tuyển vào các trường đại học hàng đầu qua hệ thống của chúng tôi. Bạn đã sẵn sàng chưa?
          </Paragraph>
          <Button 
            className="btn-glow-purple" 
            size="large" 
            onClick={() => navigate("/register")} 
            style={{ height: "60px", padding: "0 50px", fontSize: "18px", fontWeight: 700 }}
          >
            Tạo Tài Khoản Ngay Mất 1 Phút
          </Button>
        </div>

      </div>
    </div>
  );
};

// Simple Text component since we destructured Title and Paragraph but not Text from Typography above
const Text = ({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) => (
  <span style={style}>{children}</span>
);
