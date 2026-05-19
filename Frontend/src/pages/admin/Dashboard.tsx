import React, { useMemo, useState, useEffect } from "react";
import { Card, Statistic, Row, Col, Table, Typography, Button, Progress, Tag, Select, Space, Avatar } from "antd";
import { 
  TeamOutlined, 
  BankOutlined, 
  BookOutlined, 
  FileTextOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  RightOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../../components/common/EmptyState";
import { ApplicationStatusTag } from "../../components/status/ApplicationStatusTag";
import { useCandidateStore } from "../../stores/candidate.store";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";
import { useApplicationStore } from "../../stores/application.store";
import { useAdmissionRoundStore } from "../../stores/admissionRound.store";
import { useAuthStore } from "../../stores/auth.store";
import { formatDate } from "../../utils/date";

const { Title, Text } = Typography;
const { Option } = Select;

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { candidates, getCandidateById } = useCandidateStore();
  const { universities, getUniversityById } = useUniversityStore();
  const { majors, getMajorById } = useMajorStore();
  const { applications } = useApplicationStore();
  const { admissionRounds } = useAdmissionRoundStore();

  const [selectedAdmissionRoundId, setSelectedAdmissionRoundId] = useState<string>("all");
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>("all");

  const safeCandidates = Array.isArray(candidates) ? candidates : [];
  const safeUniversities = Array.isArray(universities) ? universities : [];
  const safeMajors = Array.isArray(majors) ? majors : [];
  const safeApplications = Array.isArray(applications) ? applications : [];
  const safeAdmissionRounds = Array.isArray(admissionRounds) ? admissionRounds : [];

  const filteredApplications = useMemo(() => {
    return safeApplications.filter(app => {
      const matchRound = selectedAdmissionRoundId === "all" || app.admissionRoundId === selectedAdmissionRoundId;
      const matchUni = selectedUniversityId === "all" || app.universityId === selectedUniversityId;
      return matchRound && matchUni;
    });
  }, [safeApplications, selectedAdmissionRoundId, selectedUniversityId]);

  const stats = useMemo(() => {
    return {
      total: filteredApplications.length,
      pending: filteredApplications.filter(a => a.status === 'pending').length,
      approved: filteredApplications.filter(a => a.status === 'approved').length,
      rejected: filteredApplications.filter(a => a.status === 'rejected').length,
    };
  }, [filteredApplications]);

  const latestApplications = useMemo(() => {
    return filteredApplications
      .slice()
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 8);
  }, [filteredApplications]);

  const percentPending = stats.total > 0 ? (stats.pending / stats.total) * 100 : 0;
  const percentApproved = stats.total > 0 ? (stats.approved / stats.total) * 100 : 0;
  const percentRejected = stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0;

  const universityStats = useMemo(() => {
    return safeUniversities.map(uni => {
      const apps = filteredApplications.filter(a => a.universityId === uni.id);
      return {
        id: uni.id,
        name: uni.name,
        total: apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        approved: apps.filter(a => a.status === 'approved').length,
        rejected: apps.filter(a => a.status === 'rejected').length,
      };
    }).sort((a, b) => b.total - a.total).filter(stat => stat.total > 0);
  }, [safeUniversities, filteredApplications]);

  const columns = [
    {
      title: "Mã hồ sơ",
      dataIndex: "applicationCode",
      key: "applicationCode",
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: "Thí sinh",
      dataIndex: "candidateId",
      key: "candidateId",
      render: (id: string) => {
        const candidate = getCandidateById(id);
        return candidate ? <Space><Avatar size="small" src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.fullName}`} /> {candidate.fullName}</Space> : "Không rõ thí sinh";
      }
    },
    {
      title: "Trường",
      dataIndex: "universityId",
      key: "universityId",
      render: (id: string) => {
        const university = getUniversityById(id);
        return university ? university.name : "Không rõ trường";
      }
    },
    {
      title: "Ngành",
      dataIndex: "majorId",
      key: "majorId",
      render: (id: string) => {
        const major = getMajorById(id);
        return major ? major.name : "Không rõ ngành";
      }
    },
    {
      title: "Tổng điểm",
      dataIndex: "totalScore",
      key: "totalScore",
      align: "center" as const,
      render: (score: number, record: any) => {
        const final = record?.finalScore ?? (Number(score ?? 0) + Number(record?.priorityScore ?? 0));
        return final !== undefined ? <Text strong style={{ color: "var(--admin-accent)" }}>{(final ?? 0).toFixed(2)}</Text> : "-";
      }
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (status: any) => <ApplicationStatusTag status={status} />
    },
    {
      title: "Ngày nộp",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (date: string) => <Text type="secondary">{formatDate(date)}</Text>
    },
    {
      title: "",
      key: "action",
      render: (_: any, record: any) => (
        <Button type="text" style={{ color: "var(--admin-accent)" }} onClick={() => navigate(`/admin/applications/${record.id}`)}>
          Chi tiết <RightOutlined />
        </Button>
      )
    }
  ];

  const commonStatColumns = [
    { title: "Tổng", dataIndex: "total", key: "total", align: "center" as const, render: (val: number) => <Text strong>{val}</Text> },
    { title: "Chờ duyệt", dataIndex: "pending", key: "pending", align: "center" as const, render: (val: number) => <Tag color="warning" bordered={false}>{val}</Tag> },
    { title: "Đã duyệt", dataIndex: "approved", key: "approved", align: "center" as const, render: (val: number) => <Tag color="success" bordered={false}>{val}</Tag> },
    { title: "Từ chối", dataIndex: "rejected", key: "rejected", align: "center" as const, render: (val: number) => <Tag color="error" bordered={false}>{val}</Tag> },
  ];

  return (
    <div style={{ paddingBottom: 40 }} className="animate-fade-up">
      {/* Hero Banner Section */}
      <div style={{ 
        background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)",
        borderRadius: "24px", 
        padding: "40px",
        marginBottom: "32px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}>
        {/* Background glow effects */}
        <div style={{ position: "absolute", top: "-50px", right: "10%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(56,189,248,0.2) 0%, rgba(0,0,0,0) 70%)", borderRadius: "50%", filter: "blur(40px)" }}></div>
        <div style={{ position: "absolute", bottom: "-100px", right: "25%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, rgba(0,0,0,0) 70%)", borderRadius: "50%", filter: "blur(60px)" }}></div>
        
        <Row justify="space-between" align="middle" style={{ position: "relative", zIndex: 1 }}>
          <Col xs={24} md={16}>
            <Title level={2} style={{ color: "#F8FAFC", margin: "0 0 16px 0", fontWeight: 700 }}>
              Chào mừng trở lại, {currentUser?.fullName}! 👋
            </Title>
            <Text style={{ color: "#94A3B8", fontSize: "16px", display: "block", marginBottom: 24, maxWidth: 600 }}>
              Theo dõi và quản lý toàn bộ hệ thống xét tuyển. Bạn có <strong style={{ color: "#38BDF8" }}>{stats.pending}</strong> hồ sơ đang chờ phê duyệt hôm nay.
            </Text>
            
            <Space size="middle" wrap>
              <Button 
                type="primary"
                size="large"
                style={{ 
                  background: "linear-gradient(90deg, #2563EB, #06B6D4)", 
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 600,
                  boxShadow: "0 4px 14px 0 rgba(6, 182, 212, 0.39)"
                }}
                onClick={() => navigate("/admin/applications")}
              >
                Xử lý hồ sơ ngay
              </Button>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(255,255,255,0.05)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 10px #10B981" }}></div>
                <Text style={{ color: "#E2E8F0" }}>Hệ thống ổn định</Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", display: "inline-block", backdropFilter: "blur(10px)" }}>
              <Title level={4} style={{ color: "#F8FAFC", margin: 0, fontWeight: 700 }}>
                {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </Title>
              <Text style={{ color: "#94A3B8" }}>
                {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </div>
          </Col>
        </Row>
      </div>

      {/* FILTER SECTION */}
      <div className="saas-filter-card" style={{ marginBottom: 32 }}>
        <Row gutter={[24, 24]} align="bottom">
          <Col xs={24} sm={12} md={9}>
            <div style={{ marginBottom: 8 }}><Text type="secondary" strong>Lọc theo Đợt xét tuyển</Text></div>
            <Select 
              size="large"
              style={{ width: '100%' }} 
              value={selectedAdmissionRoundId}
              onChange={setSelectedAdmissionRoundId}
              dropdownStyle={{ borderRadius: 12 }}
            >
              <Option value="all">Tất cả đợt xét tuyển</Option>
              {safeAdmissionRounds.map(round => (
                <Option key={round.id} value={round.id}>
                  {round.code} - {round.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={9}>
            <div style={{ marginBottom: 8 }}><Text type="secondary" strong>Lọc theo Trường đại học</Text></div>
            <Select 
              size="large"
              style={{ width: '100%' }} 
              value={selectedUniversityId}
              onChange={setSelectedUniversityId}
              dropdownStyle={{ borderRadius: 12 }}
            >
              <Option value="all">Tất cả trường</Option>
              {safeUniversities.map(uni => (
                <Option key={uni.id} value={uni.id}>
                  {uni.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={6}>
            <Button 
              size="large"
              block
              icon={<ReloadOutlined />} 
              onClick={() => {
                setSelectedAdmissionRoundId("all");
                setSelectedUniversityId("all");
              }}
              style={{ borderRadius: 8, fontWeight: 500 }}
            >
              Đặt lại bộ lọc
            </Button>
          </Col>
        </Row>
      </div>

      {/* STATISTIC CARDS */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="saas-card" bordered={false} bodyStyle={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ background: "rgba(56, 189, 248, 0.15)", padding: 12, borderRadius: 16 }}>
                <TeamOutlined style={{ fontSize: 24, color: "#38BDF8" }} />
              </div>
              <Tag color="success" bordered={false} style={{ borderRadius: 12 }}><ArrowUpOutlined /> 12%</Tag>
            </div>
            <Statistic 
              title={<Text type="secondary" style={{ fontSize: 14 }}>Tổng thí sinh</Text>}
              value={safeCandidates.length} 
              valueStyle={{ fontWeight: 700, fontSize: "2rem", marginTop: 4 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="saas-card" bordered={false} bodyStyle={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ background: "rgba(139, 92, 246, 0.15)", padding: 12, borderRadius: 16 }}>
                <BankOutlined style={{ fontSize: 24, color: "#8B5CF6" }} />
              </div>
              <Tag color="success" bordered={false} style={{ borderRadius: 12 }}><ArrowUpOutlined /> 8%</Tag>
            </div>
            <Statistic 
              title={<Text type="secondary" style={{ fontSize: 14 }}>Tổng trường ĐH</Text>}
              value={safeUniversities.length} 
              valueStyle={{ fontWeight: 700, fontSize: "2rem", marginTop: 4 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="saas-card" bordered={false} bodyStyle={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ background: "rgba(16, 185, 129, 0.15)", padding: 12, borderRadius: 16 }}>
                <BookOutlined style={{ fontSize: 24, color: "#10B981" }} />
              </div>
              <Tag color="error" bordered={false} style={{ borderRadius: 12 }}><ArrowDownOutlined /> 2%</Tag>
            </div>
            <Statistic 
              title={<Text type="secondary" style={{ fontSize: 14 }}>Ngành đào tạo</Text>}
              value={safeMajors.length} 
              valueStyle={{ fontWeight: 700, fontSize: "2rem", marginTop: 4 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="saas-card" bordered={false} bodyStyle={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ background: "rgba(245, 158, 11, 0.15)", padding: 12, borderRadius: 16 }}>
                <FileTextOutlined style={{ fontSize: 24, color: "#F59E0B" }} />
              </div>
              <Tag color="success" bordered={false} style={{ borderRadius: 12 }}><ArrowUpOutlined /> 24%</Tag>
            </div>
            <Statistic 
              title={<Text type="secondary" style={{ fontSize: 14 }}>Tổng hồ sơ</Text>}
              value={stats.total} 
              valueStyle={{ fontWeight: 700, fontSize: "2rem", marginTop: 4 }}
            />
          </Card>
        </Col>
      </Row>

      {/* DETAILED STATS */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={8}>
          <Card className="saas-card" title={<Title level={5} style={{ margin: 0 }}>Trạng thái xét duyệt</Title>} bordered={false} style={{ height: '100%' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Space><div style={{ width: 8, height: 8, borderRadius: '50%', background: "#38BDF8" }}></div><Text type="secondary">Chờ duyệt</Text></Space>
                <Text strong>{stats.pending} ({percentPending.toFixed(1)}%)</Text>
              </div>
              <Progress percent={percentPending} strokeColor="#38BDF8" showInfo={false} trailColor="var(--admin-hover)" strokeWidth={8} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Space><div style={{ width: 8, height: 8, borderRadius: '50%', background: "#10B981" }}></div><Text type="secondary">Đã duyệt</Text></Space>
                <Text strong>{stats.approved} ({percentApproved.toFixed(1)}%)</Text>
              </div>
              <Progress percent={percentApproved} strokeColor="#10B981" showInfo={false} trailColor="var(--admin-hover)" strokeWidth={8} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Space><div style={{ width: 8, height: 8, borderRadius: '50%', background: "#EF4444" }}></div><Text type="secondary">Từ chối</Text></Space>
                <Text strong>{stats.rejected} ({percentRejected.toFixed(1)}%)</Text>
              </div>
              <Progress percent={percentRejected} strokeColor="#EF4444" showInfo={false} trailColor="var(--admin-hover)" strokeWidth={8} />
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={16}>
          <Card className="saas-card" title={<Title level={5} style={{ margin: 0 }}>Thống kê theo trường</Title>} bordered={false} style={{ height: '100%' }}>
            {universityStats.length > 0 ? (
              <Table
                columns={[
                  { title: "Trường Đại học", dataIndex: "name", key: "name", render: text => <Text strong>{text}</Text> },
                  ...commonStatColumns
                ]}
                dataSource={universityStats}
                rowKey="id"
                pagination={{ pageSize: 4, position: ["bottomCenter"] }}
                size="middle"
                scroll={{ x: true }}
              />
            ) : (
              <EmptyState description="Không có hồ sơ phù hợp" />
            )}
          </Card>
        </Col>
      </Row>

      {/* LATEST APPLICATIONS */}
      <Card className="saas-card" title={<Title level={5} style={{ margin: 0 }}>Hồ sơ mới nộp gần đây</Title>} bordered={false}>
        {latestApplications.length > 0 ? (
          <Table 
            columns={columns} 
            dataSource={latestApplications} 
            rowKey="id"
            pagination={false}
            size="middle"
            scroll={{ x: true }}
          />
        ) : (
          <EmptyState description="Chưa có hồ sơ nào" />
        )}
      </Card>
    </div>
  );
};
