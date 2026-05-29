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
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { ApplicationStatusTag } from "../../components/status/ApplicationStatusTag";
import { useCandidateStore } from "../../stores/candidate.store";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";
import { useApplicationStore } from "../../stores/application.store";
import { useAdmissionRoundStore } from "../../stores/admissionRound.store";
import { useAuthStore } from "../../stores/auth.store";
import { formatDate } from "../../utils/date";
import { loadAdminDashboardData } from "../../utils/dataLoader";
import type { Application } from "../../types/application.types";

const { Title, Text } = Typography;
const { Option } = Select;

type AdminApplicationBreakdownRow = {
  id: string;
  code?: string;
  name: string;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
};

type AdminApplicationStatistics = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  byUniversity: AdminApplicationBreakdownRow[];
  byMajor: AdminApplicationBreakdownRow[];
  byAdmissionRound: AdminApplicationBreakdownRow[];
};

type BreakdownMeta = {
  id: string;
  code?: string;
  name: string;
};

const emptyBreakdownRows: AdminApplicationBreakdownRow[] = [];

const buildBreakdownRows = (
  applications: Application[],
  resolveMeta: (application: Application) => BreakdownMeta | null
): AdminApplicationBreakdownRow[] => {
  const rows = new Map<string, AdminApplicationBreakdownRow>();

  applications.forEach((application) => {
    const meta = resolveMeta(application);
    if (!meta) {
      return;
    }

    if (!rows.has(meta.id)) {
      rows.set(meta.id, {
        id: meta.id,
        code: meta.code,
        name: meta.name,
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0,
      });
    }

    const next = rows.get(meta.id);
    if (!next) {
      return;
    }

    next.total += 1;
    if (application.status === "pending") next.pending += 1;
    if (application.status === "approved") next.approved += 1;
    if (application.status === "rejected") next.rejected += 1;
    if (application.status === "cancelled") next.cancelled += 1;
  });

  return Array.from(rows.values()).sort((left, right) => {
    if (right.total !== left.total) {
      return right.total - left.total;
    }

    return left.name.localeCompare(right.name, "vi");
  });
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [adminApplicationStats, setAdminApplicationStats] = useState<AdminApplicationStatistics | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { candidates, loading: candidatesLoading, getCandidateById, getCandidates } = useCandidateStore();
  const { universities, loading: universitiesLoading, getUniversityById, getUniversities } = useUniversityStore();
  const { majors, loading: majorsLoading, getMajorById, getMajors } = useMajorStore();
  const { applications, loading: applicationsLoading, getApplications, getAdminApplicationStatistics } = useApplicationStore();
  const { admissionRounds, loading: admissionRoundsLoading, getAdmissionRounds, getAdmissionRoundById } = useAdmissionRoundStore();

  // Fetch all data in parallel using Promise.all for faster load times
  // ⏱️ Optimization: Instead of sequential calls (~1500ms), load in parallel (~300-400ms)
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadAdminDashboardData();
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    };
    loadData();
  }, [getCandidates, getUniversities, getMajors, getApplications, getAdmissionRounds]);

  const [selectedAdmissionRoundId, setSelectedAdmissionRoundId] = useState<string>("all");
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>("all");
  const [selectedMajorId, setSelectedMajorId] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;

    const loadStatistics = async () => {
      try {
        const nextStats = await getAdminApplicationStatistics({
          universityId: selectedUniversityId,
          majorId: selectedMajorId,
          admissionRoundId: selectedAdmissionRoundId,
        });

        if (!cancelled) {
          setAdminApplicationStats(nextStats);
        }
      } catch (error) {
        if (!cancelled) {
          setAdminApplicationStats(null);
        }
      }
    };

    loadStatistics();

    return () => {
      cancelled = true;
    };
  }, [getAdminApplicationStatistics, selectedUniversityId, selectedAdmissionRoundId, selectedMajorId]);

  const safeCandidates = Array.isArray(candidates) ? candidates : [];
  const safeUniversities = Array.isArray(universities) ? universities : [];
  const safeMajors = Array.isArray(majors) ? majors : [];
  const safeApplications = Array.isArray(applications) ? applications : [];
  const safeAdmissionRounds = Array.isArray(admissionRounds) ? admissionRounds : [];

  const loading = candidatesLoading || universitiesLoading || majorsLoading || applicationsLoading || admissionRoundsLoading;

  if (loading && safeCandidates.length === 0 && safeUniversities.length === 0 && safeMajors.length === 0 && safeApplications.length === 0 && safeAdmissionRounds.length === 0) {
    return <LoadingScreen fullScreen tip="Đang tải bảng điều khiển..." />;
  }

  const filteredApplications = useMemo(() => {
    return safeApplications.filter(app => {
      const matchRound = selectedAdmissionRoundId === "all" || app.admissionRoundId === selectedAdmissionRoundId;
      const matchUni = selectedUniversityId === "all" || app.universityId === selectedUniversityId;
      const matchMajor = selectedMajorId === "all" || app.majorId === selectedMajorId;
      return matchRound && matchUni && matchMajor;
    });
  }, [safeApplications, selectedAdmissionRoundId, selectedUniversityId, selectedMajorId]);

  const localStats = useMemo(() => {
    return {
      total: filteredApplications.length,
      pending: filteredApplications.filter(a => a.status === 'pending').length,
      approved: filteredApplications.filter(a => a.status === 'approved').length,
      rejected: filteredApplications.filter(a => a.status === 'rejected').length,
      cancelled: filteredApplications.filter(a => a.status === 'cancelled').length,
      byUniversity: emptyBreakdownRows,
      byMajor: emptyBreakdownRows,
      byAdmissionRound: emptyBreakdownRows,
    };
  }, [filteredApplications]);

  const stats = adminApplicationStats ?? localStats;

  const latestApplications = useMemo(() => {
    return filteredApplications
      .slice()
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 8);
  }, [filteredApplications]);

  const percentPending = stats.total > 0 ? (stats.pending / stats.total) * 100 : 0;
  const percentApproved = stats.total > 0 ? (stats.approved / stats.total) * 100 : 0;
  const percentRejected = stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0;
  const percentCancelled = stats.total > 0 ? (stats.cancelled / stats.total) * 100 : 0;

  const universityBreakdown = useMemo(() => {
    if (adminApplicationStats?.byUniversity?.length) {
      return adminApplicationStats.byUniversity;
    }

    return buildBreakdownRows(filteredApplications, (application) => {
      const university = getUniversityById(application.universityId);
      if (!university) {
        return null;
      }

      return {
        id: university.id,
        code: university.code,
        name: university.name || "Chưa cập nhật",
      };
    });
  }, [adminApplicationStats, filteredApplications, getUniversityById]);

  const majorBreakdown = useMemo(() => {
    if (adminApplicationStats?.byMajor?.length) {
      return adminApplicationStats.byMajor;
    }

    return buildBreakdownRows(filteredApplications, (application) => {
      const major = getMajorById(application.majorId);
      if (!major) {
        return null;
      }

      return {
        id: major.id,
        code: major.code,
        name: major.name || "Chưa cập nhật",
      };
    });
  }, [adminApplicationStats, filteredApplications, getMajorById]);

  const admissionRoundBreakdown = useMemo(() => {
    if (adminApplicationStats?.byAdmissionRound?.length) {
      return adminApplicationStats.byAdmissionRound;
    }

    return buildBreakdownRows(filteredApplications, (application) => {
      const round = getAdmissionRoundById(application.admissionRoundId ?? "");
      if (!round) {
        return null;
      }

      return {
        id: round.id,
        code: round.code,
        name: round.name || "Chưa cập nhật",
      };
    });
  }, [adminApplicationStats, filteredApplications, getAdmissionRoundById]);

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
    { title: "Đã hủy", dataIndex: "cancelled", key: "cancelled", align: "center" as const, render: (val: number) => <Tag color="purple" bordered={false}>{val}</Tag> },
  ];

  const breakdownColumns = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: AdminApplicationBreakdownRow) => (
        <div>
          <Text strong>{text}</Text>
          {record.code ? <div><Text type="secondary" style={{ fontSize: 12 }}>{record.code}</Text></div> : null}
        </div>
      ),
    },
    ...commonStatColumns,
    {
      title: "Tỷ lệ",
      key: "ratio",
      align: "center" as const,
      render: (_: unknown, record: AdminApplicationBreakdownRow) => (
        <Tag color="processing" bordered={false} style={{ borderRadius: 12 }}>
          {stats.total > 0 ? `${((record.total / stats.total) * 100).toFixed(1)}%` : "0%"}
        </Tag>
      ),
    },
  ];

  const renderBreakdownCard = (
    title: string,
    description: string,
    dataSource: AdminApplicationBreakdownRow[]
  ) => (
    <Card
      className="saas-card"
      title={
        <div>
          <Title level={5} style={{ margin: 0 }}>{title}</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>{description}</Text>
        </div>
      }
      extra={<Tag color="processing" bordered={false} style={{ borderRadius: 12 }}>{dataSource.length} nhóm</Tag>}
      bordered={false}
      style={{ height: '100%' }}
    >
      {dataSource.length > 0 ? (
        <Table
          columns={breakdownColumns}
          dataSource={dataSource.map((item) => ({ ...item, key: item.id }))}
          pagination={{ pageSize: 4, position: ["bottomCenter"] }}
          size="middle"
          scroll={{ x: true }}
        />
      ) : (
        <EmptyState description="Không có dữ liệu breakdown phù hợp" />
      )}
    </Card>
  );

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
            <Col xs={24} sm={12} md={6}>
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
            <Col xs={24} sm={12} md={6}>
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
            <Col xs={24} sm={12} md={6}>
              <div style={{ marginBottom: 8 }}><Text type="secondary" strong>Lọc theo Ngành</Text></div>
              <Select
                size="large"
                style={{ width: '100%' }}
                value={selectedMajorId}
                onChange={setSelectedMajorId}
                dropdownStyle={{ borderRadius: 12 }}
                showSearch
                filterOption={(input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}
                disabled={safeMajors.length === 0}
              >
                <Option value="all">Tất cả ngành</Option>
                {safeMajors.map(m => (
                  <Option key={m.id} value={m.id}>{m.name}</Option>
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
                  setSelectedMajorId("all");
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
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Space><div style={{ width: 8, height: 8, borderRadius: '50%', background: "#A855F7" }}></div><Text type="secondary">Đã hủy</Text></Space>
                <Text strong>{stats.cancelled} ({percentCancelled.toFixed(1)}%)</Text>
              </div>
              <Progress percent={percentCancelled} strokeColor="#A855F7" showInfo={false} trailColor="var(--admin-hover)" strokeWidth={8} />
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={16}>
          <Card className="saas-card" bordered={false} style={{ height: '100%' }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={8}>
                <div style={{ padding: 20, borderRadius: 18, background: "linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(56, 189, 248, 0.04))", border: "1px solid rgba(37, 99, 235, 0.12)" }}>
                  <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>Trường</Text>
                  <Title level={3} style={{ margin: 0 }}>{universityBreakdown.length}</Title>
                  <Text type="secondary">nhóm đang có hồ sơ</Text>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ padding: 20, borderRadius: 18, background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(34, 197, 94, 0.04))", border: "1px solid rgba(16, 185, 129, 0.12)" }}>
                  <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>Ngành</Text>
                  <Title level={3} style={{ margin: 0 }}>{majorBreakdown.length}</Title>
                  <Text type="secondary">nhóm đang có hồ sơ</Text>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ padding: 20, borderRadius: 18, background: "linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(244, 114, 182, 0.04))", border: "1px solid rgba(168, 85, 247, 0.12)" }}>
                  <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>Đợt</Text>
                  <Title level={3} style={{ margin: 0 }}>{admissionRoundBreakdown.length}</Title>
                  <Text type="secondary">nhóm đang có hồ sơ</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* BREAKDOWN TABLES */}
      <div style={{ marginBottom: 32, display: "flex", flexDirection: "column", gap: 24 }}>
        {renderBreakdownCard("Breakdown theo trường", "Số hồ sơ và trạng thái theo từng trường", universityBreakdown)}
        {renderBreakdownCard("Breakdown theo ngành", "Số hồ sơ và trạng thái theo từng ngành", majorBreakdown)}
        {renderBreakdownCard("Breakdown theo đợt", "Số hồ sơ và trạng thái theo từng đợt xét tuyển", admissionRoundBreakdown)}
      </div>

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
