import React, { useMemo } from "react";
import { Card, Row, Col, Statistic, Table, Alert, Button, Space, Typography, Progress, Empty, Tag } from "antd";
import { 
  FileTextOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  PlusOutlined,
  FolderOpenOutlined,
  UserOutlined,
  EyeOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { ApplicationStatusTag } from "../../components/status/ApplicationStatusTag";
import { useAuthStore } from "../../stores/auth.store";
import { useCandidateStore } from "../../stores/candidate.store";
import { useApplicationStore } from "../../stores/application.store";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";
import { useAdmissionRoundStore } from "../../stores/admissionRound.store";
import { formatDate } from "../../utils/date";

const { Title, Text, Paragraph } = Typography;

export const CandidateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { getCandidateByUserId } = useCandidateStore();
  const { getApplicationsByCandidateId } = useApplicationStore();
  const { universities } = useUniversityStore();
  const { majors } = useMajorStore();
  const { admissionRounds } = useAdmissionRoundStore();

  const safeUniversities = Array.isArray(universities) ? universities : [];
  const safeMajors = Array.isArray(majors) ? majors : [];
  const safeAdmissionRounds = Array.isArray(admissionRounds) ? admissionRounds : [];

  const candidate = useMemo(() => {
    if (!currentUser) return null;
    return getCandidateByUserId(currentUser.id);
  }, [currentUser, getCandidateByUserId]);

  const safeApplications = useMemo(() => {
    if (!candidate) return [];
    const apps = getApplicationsByCandidateId(candidate.id);
    return Array.isArray(apps) ? apps : [];
  }, [candidate, getApplicationsByCandidateId]);

  const stats = useMemo(() => {
    return {
      total: safeApplications.length,
      pending: safeApplications.filter(a => a.status === "pending").length,
      approved: safeApplications.filter(a => a.status === "approved").length,
      rejected: safeApplications.filter(a => a.status === "rejected").length,
    };
  }, [safeApplications]);

  const getUniversityName = (id: string) => {
    return safeUniversities.find(u => u.id === id)?.name || "Không rõ trường";
  };

  const getMajorName = (id: string) => {
    return safeMajors.find(m => m.id === id)?.name || "Không rõ ngành";
  };

  const getRoundName = (id?: string) => {
    if (!id) return "Chưa xác định";
    const round = safeAdmissionRounds.find(r => r.id === id);
    return round ? `${round.code}` : "Chưa xác định";
  };

  const percentPending = stats.total > 0 ? (stats.pending / stats.total) * 100 : 0;
  const percentApproved = stats.total > 0 ? (stats.approved / stats.total) * 100 : 0;
  const percentRejected = stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0;

  const columns = [
    {
      title: "Mã hồ sơ",
      dataIndex: "applicationCode",
      key: "applicationCode",
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: "Đợt xét tuyển",
      dataIndex: "admissionRoundId",
      key: "admissionRoundId",
      render: (id?: string) => getRoundName(id)
    },
    {
      title: "Trường",
      dataIndex: "universityId",
      key: "universityId",
      render: (id: string) => getUniversityName(id)
    },
    {
      title: "Ngành",
      dataIndex: "majorId",
      key: "majorId",
      render: (id: string) => getMajorName(id)
    },
    {
      title: "Tổng điểm",
      dataIndex: "totalScore",
      key: "totalScore",
      align: "center" as const,
      render: (score: number) => score?.toFixed(2)
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: any) => <ApplicationStatusTag status={status} />
    },
    {
      title: "Ngày nộp",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (date: string) => formatDate(date)
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => navigate(`/candidate/applications/${record.id}`)}
        >
          Xem chi tiết
        </Button>
      )
    }
  ];

  return (
    <div>
      <PageHeader title="Bảng điều khiển" />
      
      {!candidate && (
        <Alert 
          message="Chưa cập nhật thông tin cá nhân" 
          description="Vui lòng cập nhật thông tin cá nhân của bạn trong phần Thông tin cá nhân trước khi nộp hồ sơ." 
          type="warning" 
          showIcon 
          style={{ marginBottom: 24, borderRadius: 8 }}
        />
      )}

      {/* 1. Premium hero section */}
      <Card 
        className="premium-card"
        style={{ 
          marginBottom: 24, 
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(0, 240, 255, 0.15) 100%)",
          border: "1px solid rgba(0, 240, 255, 0.2)",
        }}
      >
        <Row align="middle" justify="space-between">
          <Col xs={24} md={16}>
            <Title level={3} style={{ marginTop: 0, color: "#fff", textShadow: "0 2px 10px rgba(0,240,255,0.3)" }}>
              Xin chào, {currentUser?.fullName || "Thí sinh"}!
            </Title>
            <Paragraph style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 24 }}>
              Theo dõi hồ sơ xét tuyển, kết quả và cập nhật thông tin cá nhân một cách dễ dàng.
            </Paragraph>
            <Space size="middle" wrap>
              <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate("/candidate/apply")}>
                Nộp hồ sơ ngay
              </Button>
              <Button size="large" icon={<FolderOpenOutlined />} onClick={() => navigate("/candidate/applications")}>
                Xem hồ sơ của tôi
              </Button>
            </Space>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: "right", marginTop: 24 }}>
            {stats.pending > 0 ? (
              <Tag color="gold" style={{ padding: "8px 16px", fontSize: 14, borderRadius: 20 }}>
                <ClockCircleOutlined /> Bạn có {stats.pending} hồ sơ đang chờ duyệt
              </Tag>
            ) : (
              <Tag color="blue" style={{ padding: "8px 16px", fontSize: 14, borderRadius: 20 }}>
                <InfoCircleOutlined /> Hệ thống xét tuyển đang mở
              </Tag>
            )}
          </Col>
        </Row>
      </Card>

      {/* 2. Premium statistic cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <Statistic 
              title={<Text type="secondary">Tổng hồ sơ đã nộp</Text>} 
              value={stats.total} 
              prefix={<FileTextOutlined style={{ color: "#1677ff" }} />} 
              valueStyle={{ fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <Statistic 
              title={<Text type="secondary">Đang chờ duyệt</Text>} 
              value={stats.pending} 
              prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />} 
              valueStyle={{ color: "#faad14", fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <Statistic 
              title={<Text type="secondary">Đã duyệt</Text>} 
              value={stats.approved} 
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />} 
              valueStyle={{ color: "#52c41a", fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <Statistic 
              title={<Text type="secondary">Từ chối</Text>} 
              value={stats.rejected} 
              prefix={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />} 
              valueStyle={{ color: "#ff4d4f", fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {/* 3. Quick actions section */}
        <Col xs={24} lg={16}>
          <Card title={<Title level={5} style={{ margin: 0 }}>Thao tác nhanh</Title>} style={{ borderRadius: 12, height: "100%" }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card 
                  hoverable 
                  onClick={() => navigate("/candidate/apply")}
                  style={{ textAlign: "center", background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.2)" }}
                >
                  <PlusOutlined style={{ fontSize: 32, color: "var(--neon-cyan)", marginBottom: 12 }} />
                  <Title level={5} style={{ margin: "0 0 8px 0" }}>Nộp hồ sơ mới</Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>Đăng ký xét tuyển vào các trường đại học</Text>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card 
                  hoverable 
                  onClick={() => navigate("/candidate/applications")}
                  style={{ textAlign: "center", background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.2)" }}
                >
                  <FolderOpenOutlined style={{ fontSize: 32, color: "#10b981", marginBottom: 12 }} />
                  <Title level={5} style={{ margin: "0 0 8px 0" }}>Hồ sơ của tôi</Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>Quản lý và theo dõi trạng thái hồ sơ</Text>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card 
                  hoverable 
                  onClick={() => navigate("/candidate/profile")}
                  style={{ textAlign: "center", background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.2)" }}
                >
                  <UserOutlined style={{ fontSize: 32, color: "var(--neon-purple)", marginBottom: 12 }} />
                  <Title level={5} style={{ margin: "0 0 8px 0" }}>Thông tin cá nhân</Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>Cập nhật thông tin và điểm số</Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 4. Application status overview section */}
        <Col xs={24} lg={8}>
          <Card title={<Title level={5} style={{ margin: 0 }}>Tình trạng hồ sơ</Title>} style={{ borderRadius: 12, height: "100%" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: "rgba(255,255,255,0.8)" }}>Chờ duyệt</Text>
                <Text strong style={{ color: "#fff" }}>{stats.pending} ({percentPending.toFixed(1)}%)</Text>
              </div>
              <Progress percent={percentPending} strokeColor="#00F0FF" showInfo={false} size="small" trailColor="rgba(255,255,255,0.1)" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: "rgba(255,255,255,0.8)" }}>Đã duyệt</Text>
                <Text strong style={{ color: "#fff" }}>{stats.approved} ({percentApproved.toFixed(1)}%)</Text>
              </div>
              <Progress percent={percentApproved} strokeColor="#10b981" showInfo={false} size="small" trailColor="rgba(255,255,255,0.1)" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: "rgba(255,255,255,0.8)" }}>Từ chối</Text>
                <Text strong style={{ color: "#fff" }}>{stats.rejected} ({percentRejected.toFixed(1)}%)</Text>
              </div>
              <Progress percent={percentRejected} strokeColor="#ef4444" showInfo={false} size="small" trailColor="rgba(255,255,255,0.1)" />
            </div>
            
            {/* 6. Optional support info block */}
            <div style={{ marginTop: 24, padding: 12, background: "rgba(0, 240, 255, 0.1)", borderRadius: 8, border: "1px solid rgba(0, 240, 255, 0.3)" }}>
              <Space align="start">
                <InfoCircleOutlined style={{ color: "var(--neon-cyan)", marginTop: 4 }} />
                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                  Hãy kiểm tra kỹ thông tin và minh chứng trước khi nộp hồ sơ. Theo dõi trạng thái thường xuyên để không bỏ lỡ cập nhật mới.
                </Text>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 5. Improve recent applications section */}
      <Card title={<Title level={5} style={{ margin: 0 }}>Hồ sơ gần đây</Title>} style={{ borderRadius: 12 }}>
        {safeApplications.length > 0 ? (
          <Table 
            dataSource={[...safeApplications].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).slice(0, 5)} 
            columns={columns} 
            rowKey="id" 
            pagination={false}
            scroll={{ x: true }}
            size="middle"
          />
        ) : (
          /* 7. Better empty states */
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                Bạn chưa có hồ sơ nào
              </span>
            }
          >
            <Button type="primary" onClick={() => navigate("/candidate/apply")}>Nộp hồ sơ ngay</Button>
          </Empty>
        )}
      </Card>
    </div>
  );
};
