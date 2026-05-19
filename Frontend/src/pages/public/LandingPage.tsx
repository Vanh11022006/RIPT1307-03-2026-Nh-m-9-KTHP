import React from "react";
import { Typography, Button, Space, Row, Col, Card, Avatar, Steps, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { 
  RocketOutlined, 
  SafetyCertificateOutlined, 
  AreaChartOutlined,
  CheckCircleOutlined,
  FileDoneOutlined,
  ClockCircleOutlined,
  BellOutlined,
  UserOutlined,
  EnvironmentOutlined,
  ReadOutlined,
  RightOutlined
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const mockUniversities = [
    {
      id: 1,
      name: "Đại học Bách Khoa Hà Nội",
      location: "Hai Bà Trưng, Hà Nội",
      majors: 65,
      type: "Kỹ thuật - Công nghệ",
      status: "Đang nhận hồ sơ"
    },
    {
      id: 2,
      name: "Đại học Kinh tế Quốc dân",
      location: "Hai Bà Trưng, Hà Nội",
      majors: 42,
      type: "Kinh tế - Quản lý",
      status: "Sắp mở đợt 2"
    },
    {
      id: 3,
      name: "Đại học Quốc gia Hà Nội",
      location: "Cầu Giấy, Hà Nội",
      majors: 112,
      type: "Đa ngành",
      status: "Đang nhận hồ sơ"
    }
  ];

  const mockTestimonials = [
    {
      id: 1,
      name: "Nguyễn Văn An",
      university: "Trúng tuyển ĐH Bách Khoa HN",
      quote: "Hệ thống UniAdmission giúp mình tiết kiệm rất nhiều thời gian nộp hồ sơ. Giao diện trực quan và dễ sử dụng!"
    },
    {
      id: 2,
      name: "Trần Thị Bé",
      university: "Trúng tuyển ĐH Kinh tế Quốc dân",
      quote: "Mình rất thích tính năng theo dõi trạng thái hồ sơ realtime. Không còn phải thấp thỏm chờ đợi kết quả nữa."
    },
    {
      id: 3,
      name: "Lê Hoàng Cường",
      university: "Trúng tuyển ĐH FPT",
      quote: "Tuyệt vời! Việc quản lý nhiều nguyện vọng cùng lúc chưa bao giờ dễ dàng đến thế."
    }
  ];

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden", paddingBottom: "0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        
        {/* HERO SECTION */}
        <Row align="middle" style={{ minHeight: "80vh", paddingTop: "80px", paddingBottom: "80px" }}>
          <Col xs={24} lg={12} className="animate-fade-up">
            <div style={{ display: "inline-block", padding: "6px 16px", background: "rgba(56, 189, 248, 0.1)", borderRadius: "30px", border: "1px solid rgba(56, 189, 248, 0.2)", marginBottom: "24px" }}>
              <span style={{ color: "#38BDF8", fontWeight: 600, fontSize: "14px", letterSpacing: "1px" }}>
                TUYỂN SINH THẾ HỆ MỚI 2026
              </span>
            </div>
            
            <h1 style={{ 
              fontSize: "clamp(2.5rem, 4vw, 4rem)", 
              fontWeight: 800, 
              lineHeight: 1.2,
              margin: "0 0 24px 0",
              letterSpacing: "-1px",
              color: "white"
            }}>
              Khởi tạo tương lai <br />
              <span className="glowing-text">đại học của bạn</span>
            </h1>
            
            <Paragraph style={{ 
              fontSize: "1.2rem", 
              color: "rgba(255, 255, 255, 0.7)", 
              maxWidth: 500, 
              margin: "0 0 40px",
              lineHeight: 1.6
            }}>
              Nộp hồ sơ nhanh chóng, theo dõi minh bạch và kết nối với các trường đại học phù hợp chỉ trong vài phút.
            </Paragraph>
            
            <Space size="middle" wrap>
              <Button 
                className="btn-glow" 
                size="large" 
                onClick={() => navigate("/register")} 
                style={{ height: "54px", padding: "0 32px", fontSize: "16px", fontWeight: 600, borderRadius: 12, color: "white" }}
              >
                Bắt đầu đăng ký
              </Button>
              <Button 
                size="large" 
                onClick={() => navigate("/universities")} 
                style={{ 
                  height: "54px", 
                  padding: "0 32px", 
                  fontSize: "16px", 
                  fontWeight: 600, 
                  background: "rgba(255,255,255,0.05)", 
                  borderColor: "rgba(255,255,255,0.1)", 
                  color: "white",
                  borderRadius: 12
                }}
              >
                Xem danh sách trường
              </Button>
            </Space>
          </Col>
          
          <Col xs={24} lg={12} className="animate-fade-up delay-200" style={{ display: "flex", justifyContent: "center", marginTop: window.innerWidth < 992 ? 60 : 0 }}>
            {/* Hero Illustration - Mock Dashboard Card */}
            <div style={{ 
              position: "relative", 
              width: "100%", 
              maxWidth: 500, 
              aspectRatio: "4/3",
              background: "linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))",
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              padding: 24,
              overflow: "hidden"
            }}>
              {/* Fake UI Elements inside the card */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#38bdf8" }} />
                  <div>
                    <div style={{ width: 120, height: 12, background: "rgba(255,255,255,0.2)", borderRadius: 6, marginBottom: 6 }}></div>
                    <div style={{ width: 80, height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4 }}></div>
                  </div>
                </div>
                <Tag color="success" style={{ borderRadius: 12, border: "none", background: "rgba(16, 185, 129, 0.2)", color: "#34d399" }}>Đã duyệt</Tag>
              </div>
              
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>Nguyện vọng 1</span>
                  <span style={{ color: "white", fontWeight: 500 }}>ĐH Bách Khoa</span>
                </div>
                <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: "85%", height: "100%", background: "#38bdf8", borderRadius: 3 }}></div>
                </div>
              </div>
              
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>Nguyện vọng 2</span>
                  <span style={{ color: "white", fontWeight: 500 }}>ĐH Quốc Gia</span>
                </div>
                <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: "45%", height: "100%", background: "#8b5cf6", borderRadius: 3 }}></div>
                </div>
              </div>

              {/* Decorative floating shapes */}
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "radial-gradient(circle, rgba(56, 189, 248, 0.2), transparent)", borderRadius: "50%", filter: "blur(20px)" }}></div>
              <div style={{ position: "absolute", bottom: -20, left: -20, width: 120, height: 120, background: "radial-gradient(circle, rgba(139, 92, 246, 0.2), transparent)", borderRadius: "50%", filter: "blur(20px)" }}></div>
            </div>
          </Col>
        </Row>

        {/* METRICS SECTION */}
        <Row gutter={[24, 24]} justify="center" style={{ padding: "40px 0 80px" }} className="animate-fade-up">
          <Col xs={12} md={6}>
            <div className="glass-card" style={{ padding: "30px 20px", textAlign: "center", borderRadius: 20 }}>
              <Title level={2} style={{ color: "#38bdf8", margin: "0 0 8px" }}>10K+</Title>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", fontWeight: 500 }}>Hồ sơ đã duyệt</Text>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="glass-card" style={{ padding: "30px 20px", textAlign: "center", borderRadius: 20 }}>
              <Title level={2} style={{ color: "#8b5cf6", margin: "0 0 8px" }}>45</Title>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", fontWeight: 500 }}>Trường đối tác</Text>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="glass-card" style={{ padding: "30px 20px", textAlign: "center", borderRadius: 20 }}>
              <Title level={2} style={{ color: "#38bdf8", margin: "0 0 8px" }}>120+</Title>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", fontWeight: 500 }}>Ngành học đa dạng</Text>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="glass-card" style={{ padding: "30px 20px", textAlign: "center", borderRadius: 20 }}>
              <Title level={2} style={{ color: "#8b5cf6", margin: "0 0 8px" }}>99%</Title>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", fontWeight: 500 }}>Hài lòng hệ thống</Text>
            </div>
          </Col>
        </Row>

        {/* PROCESS SECTION */}
        <div style={{ padding: "60px 0" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <Title level={2} style={{ color: "white", fontSize: "2.5rem", marginBottom: 16 }}>Quy trình xét tuyển đơn giản</Title>
            <Paragraph style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.1rem", maxWidth: 600, margin: "0 auto" }}>
              Chỉ với 4 bước cơ bản, bạn đã hoàn tất thủ tục xét tuyển đại học trực tuyến.
            </Paragraph>
          </div>

          <div style={{ background: "rgba(30, 41, 59, 0.3)", borderRadius: 24, padding: "40px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <Steps
              direction={window.innerWidth < 768 ? "vertical" : "horizontal"}
              current={-1}
              className="custom-dark-steps"
              items={[
                {
                  title: <span style={{ color: "white", fontSize: 16 }}>1. Tạo tài khoản</span>,
                  description: <span style={{ color: "rgba(255,255,255,0.5)" }}>Đăng ký miễn phí bằng Email</span>,
                  icon: <UserOutlined style={{ fontSize: 24, color: "#38bdf8" }} />
                },
                {
                  title: <span style={{ color: "white", fontSize: 16 }}>2. Hoàn thiện hồ sơ</span>,
                  description: <span style={{ color: "rgba(255,255,255,0.5)" }}>Điền thông tin cá nhân & điểm</span>,
                  icon: <FileDoneOutlined style={{ fontSize: 24, color: "#8b5cf6" }} />
                },
                {
                  title: <span style={{ color: "white", fontSize: 16 }}>3. Nộp nguyện vọng</span>,
                  description: <span style={{ color: "rgba(255,255,255,0.5)" }}>Chọn trường và ngành học</span>,
                  icon: <RocketOutlined style={{ fontSize: 24, color: "#38bdf8" }} />
                },
                {
                  title: <span style={{ color: "white", fontSize: 16 }}>4. Theo dõi kết quả</span>,
                  description: <span style={{ color: "rgba(255,255,255,0.5)" }}>Nhận thông báo khi có kết quả</span>,
                  icon: <CheckCircleOutlined style={{ fontSize: 24, color: "#10b981" }} />
                },
              ]}
            />
          </div>
        </div>

        {/* FEATURES SECTION */}
        <div style={{ padding: "80px 0" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <Title level={2} style={{ color: "white", fontSize: "2.5rem", marginBottom: 16 }}>Trải nghiệm Tuyệt đỉnh</Title>
            <Paragraph style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.1rem", maxWidth: 600, margin: "0 auto" }}>
              Nền tảng của chúng tôi được thiết kế để mang lại sự tiện lợi và minh bạch tối đa.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div className="glass-card" style={{ padding: "32px", height: "100%", borderRadius: 20 }}>
                <RocketOutlined style={{ fontSize: 36, color: "#38bdf8", marginBottom: 20 }} />
                <h3 style={{ fontSize: "1.25rem", color: "white", marginBottom: "12px", fontWeight: 600 }}>Nộp hồ sơ nhanh chóng</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>
                  Thao tác đơn giản, upload minh chứng dễ dàng. Không còn phải xếp hàng nộp hồ sơ giấy.
                </p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="glass-card" style={{ padding: "32px", height: "100%", borderRadius: 20 }}>
                <SafetyCertificateOutlined style={{ fontSize: 36, color: "#8b5cf6", marginBottom: 20 }} />
                <h3 style={{ fontSize: "1.25rem", color: "white", marginBottom: "12px", fontWeight: 600 }}>Bảo mật dữ liệu</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>
                  Dữ liệu của bạn được mã hóa an toàn trên hệ thống máy chủ hiện đại, đạt chuẩn bảo mật quốc tế.
                </p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="glass-card" style={{ padding: "32px", height: "100%", borderRadius: 20 }}>
                <AreaChartOutlined style={{ fontSize: 36, color: "#38bdf8", marginBottom: 20 }} />
                <h3 style={{ fontSize: "1.25rem", color: "white", marginBottom: "12px", fontWeight: 600 }}>Theo dõi real-time</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>
                  Mọi thay đổi trạng thái hồ sơ đều được cập nhật tức thì trên bảng điều khiển cá nhân.
                </p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="glass-card" style={{ padding: "32px", height: "100%", borderRadius: 20 }}>
                <CheckCircleOutlined style={{ fontSize: 36, color: "#10b981", marginBottom: 20 }} />
                <h3 style={{ fontSize: "1.25rem", color: "white", marginBottom: "12px", fontWeight: 600 }}>Minh bạch trạng thái</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>
                  Biết rõ hồ sơ đang ở khâu nào, ai xử lý và lý do nếu bị từ chối, đảm bảo sự công bằng tối đa.
                </p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="glass-card" style={{ padding: "32px", height: "100%", borderRadius: 20 }}>
                <ReadOutlined style={{ fontSize: 36, color: "#f59e0b", marginBottom: 20 }} />
                <h3 style={{ fontSize: "1.25rem", color: "white", marginBottom: "12px", fontWeight: 600 }}>Quản lý nhiều nguyện vọng</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>
                  Sắp xếp, thay đổi thứ tự và nộp nhiều nguyện vọng vào các trường khác nhau trên cùng một giao diện.
                </p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="glass-card" style={{ padding: "32px", height: "100%", borderRadius: 20 }}>
                <BellOutlined style={{ fontSize: 36, color: "#f43f5e", marginBottom: 20 }} />
                <h3 style={{ fontSize: "1.25rem", color: "white", marginBottom: "12px", fontWeight: 600 }}>Nhận thông báo kịp thời</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>
                  Thông báo ngay lập tức qua email và hệ thống khi có kết quả duyệt, bổ sung hồ sơ hay trúng tuyển.
                </p>
              </div>
            </Col>
          </Row>
        </div>

        {/* FEATURED UNIVERSITIES SECTION */}
        <div style={{ padding: "80px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
            <div>
              <Title level={2} style={{ color: "white", fontSize: "2rem", margin: 0 }}>Trường đại học nổi bật</Title>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.1rem" }}>Các trường đối tác hàng đầu đang tuyển sinh</Text>
            </div>
            <Button type="link" onClick={() => navigate("/universities")} style={{ color: "#38bdf8", padding: 0 }}>
              Xem tất cả <RightOutlined />
            </Button>
          </div>

          <Row gutter={[24, 24]}>
            {mockUniversities.map((uni) => (
              <Col xs={24} md={8} key={uni.id}>
                <Card
                  className="glass-card"
                  bordered={false}
                  style={{ borderRadius: 20, overflow: "hidden" }}
                  bodyStyle={{ padding: 24 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                    <Avatar size={48} src={`https://api.dicebear.com/7.x/initials/svg?seed=${uni.name}&backgroundColor=0f172a`} />
                    <div>
                      <h4 style={{ color: "white", margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>{uni.name}</h4>
                      <Tag color="blue" style={{ marginTop: 4, border: "none", background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8" }}>{uni.type}</Tag>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                    <div style={{ display: "flex", gap: 8, color: "rgba(255,255,255,0.6)" }}>
                      <EnvironmentOutlined />
                      <span>{uni.location}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, color: "rgba(255,255,255,0.6)" }}>
                      <ReadOutlined />
                      <span>{uni.majors} ngành đào tạo</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, color: "rgba(255,255,255,0.6)" }}>
                      <ClockCircleOutlined />
                      <span style={{ color: uni.status === "Đang nhận hồ sơ" ? "#34d399" : "#f59e0b" }}>{uni.status}</span>
                    </div>
                  </div>

                  <Button block style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "white", borderRadius: 8, height: 40 }}>
                    Xem chi tiết
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* TESTIMONIALS SECTION */}
        <div style={{ padding: "80px 0" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <Title level={2} style={{ color: "white", fontSize: "2.5rem", marginBottom: 16 }}>Thí sinh nói gì về UniAdmission</Title>
          </div>

          <Row gutter={[24, 24]}>
            {mockTestimonials.map((testi) => (
              <Col xs={24} md={8} key={testi.id}>
                <div className="glass-card" style={{ padding: "32px", height: "100%", borderRadius: 20, display: "flex", flexDirection: "column" }}>
                  <div style={{ flex: 1 }}>
                    <Text style={{ color: "white", fontSize: "1.1rem", fontStyle: "italic", lineHeight: 1.6 }}>
                      "{testi.quote}"
                    </Text>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <Avatar size={40} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${testi.name}`} />
                    <div>
                      <div style={{ color: "white", fontWeight: 600 }}>{testi.name}</div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>{testi.university}</div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* CTA BOTTOM SECTION */}
        <div className="glass-card" style={{ 
          marginTop: "60px", 
          marginBottom: "100px",
          padding: "60px 40px", 
          textAlign: "center", 
          borderRadius: 32,
          background: "linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)", color: "white", marginBottom: "20px", fontWeight: 800 }}>Sẵn sàng bắt đầu hành trình đại học?</h2>
          <Paragraph style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.15rem", maxWidth: 600, margin: "0 auto 40px" }}>
            Tham gia cùng hàng ngàn thí sinh khác và chinh phục cánh cửa đại học mơ ước ngay hôm nay.
          </Paragraph>
          <Space size="middle" wrap style={{ display: "flex", justifyContent: "center" }}>
            <Button 
              className="btn-glow-purple" 
              size="large" 
              onClick={() => navigate("/register")} 
              style={{ height: "54px", padding: "0 40px", fontSize: "16px", fontWeight: 600, borderRadius: 12, color: "white" }}
            >
              Tạo tài khoản miễn phí
            </Button>
            <Button 
              type="text"
              size="large" 
              onClick={() => navigate("/login")} 
              style={{ height: "54px", padding: "0 40px", fontSize: "16px", fontWeight: 500, color: "rgba(255,255,255,0.8)" }}
            >
              Đăng nhập nếu đã có tài khoản
            </Button>
          </Space>
        </div>

      </div>
    </div>
  );
};
