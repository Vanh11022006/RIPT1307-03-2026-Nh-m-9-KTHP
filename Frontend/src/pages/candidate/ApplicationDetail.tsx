import React, { useEffect, useState } from "react";
import { Card, Result, Button, Descriptions, Typography, Tag, Alert, Row, Col, Steps, Table, Space, Empty } from "antd";
import { PageHeader } from "../../components/common/PageHeader";
import { useParams, useNavigate } from "react-router-dom";
import { ApplicationStatusTag } from "../../components/status/ApplicationStatusTag";
import { useAuthStore } from "../../stores/auth.store";
import { useCandidateStore } from "../../stores/candidate.store";
import { useApplicationStore } from "../../stores/application.store";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";
import { useAdmissionRoundStore } from "../../stores/admissionRound.store";
import { formatDateTime } from "../../utils/date";
import { formatFileSize } from "../../utils/file";
import { getPriorityGroupLabel } from "../../constants/priorityGroups";
import { getEvidenceCategoryLabel } from "../../constants/evidenceCategories";
import { PaperClipOutlined, CheckCircleOutlined, SyncOutlined, CloseCircleOutlined, UploadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { currentUser } = useAuthStore();
  const { getCandidateByUserId, getProfile } = useCandidateStore();
  const { getApplicationById, fetchApplicationById } = useApplicationStore();
  const { getUniversityById } = useUniversityStore();
  const { getMajorById } = useMajorStore();
  const { getAdmissionRoundById } = useAdmissionRoundStore();

  const [candidate, setCandidate] = useState(() => (currentUser ? getCandidateByUserId(currentUser.id) : null));
  const [application, setApplication] = useState(() => (id ? getApplicationById(id) : undefined));
  const [loading, setLoading] = useState<boolean>(!application || (!!currentUser && !candidate));

  useEffect(() => {
    let mounted = true;

    const loadCandidate = async () => {
      if (!currentUser?.id) {
        if (mounted) {
          setCandidate(null);
        }
        return;
      }

      const cachedCandidate = getCandidateByUserId(currentUser.id);
      if (cachedCandidate) {
        if (mounted) {
          setCandidate(cachedCandidate);
        }
        return;
      }

      const fetchedCandidate = await getProfile(currentUser.id);
      if (mounted) {
        setCandidate(fetchedCandidate);
      }
    };

    loadCandidate().catch((error) => {
      console.error("Failed to load candidate profile", error);
    });

    return () => {
      mounted = false;
    };
  }, [currentUser?.id, getCandidateByUserId, getProfile]);

  useEffect(() => {
    let mounted = true;

    const loadApplication = async () => {
      if (!id) {
        if (mounted) {
          setApplication(undefined);
          setLoading(false);
        }
        return;
      }

      const cachedApplication = getApplicationById(id);
      if (cachedApplication) {
        if (mounted) {
          setApplication(cachedApplication);
          setLoading(false);
        }
        return;
      }

      if (mounted) {
        setLoading(true);
      }

      const fetchedApplication = await fetchApplicationById(id);

      if (mounted) {
        setApplication(fetchedApplication ?? undefined);
        setLoading(false);
      }
    };

    loadApplication().catch((error) => {
      console.error("Failed to load application detail", error);
      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [id, getApplicationById, fetchApplicationById]);

  useEffect(() => {
    if (loading && currentUser?.id) {
      return;
    }

    if (application && candidate) {
      setLoading(false);
    }
  }, [application, candidate, currentUser?.id, loading]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Card loading />
      </div>
    );
  }

  if (!candidate || !application || String(application.candidateId) !== String(candidate.id)) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Result
            status="404"
            title="Hồ sơ không tồn tại"
            subTitle="Hồ sơ bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền truy cập."
            extra={<Button type="primary" onClick={() => navigate("/candidate/applications")}>Quay lại danh sách</Button>}
          />
        </Card>
      </div>
    );
  }

  const university = getUniversityById(application.universityId);
  const major = getMajorById(application.majorId);
  const admissionRound = application.admissionRoundId ? getAdmissionRoundById(application.admissionRoundId) : undefined;

  const subjectNames: Record<string, string> = {
    math: "Toán học",
    physics: "Vật lý",
    chemistry: "Hóa học",
    literature: "Ngữ văn",
    english: "Tiếng Anh",
    biology: "Sinh học",
    history: "Lịch sử",
    geography: "Địa lý",
    civicEducation: "Giáo dục công dân"
  };

  const safeEvidenceFiles = Array.isArray(application.evidenceFiles) ? application.evidenceFiles : [];

  const evidenceColumns = [
    {
      title: "Tên file",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => {
        const fileUrl = record?.url;

        return (
          <Space>
            {fileUrl ? (
              <a href={fileUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <PaperClipOutlined />
                <span>{text || "Chưa cập nhật"}</span>
              </a>
            ) : (
              <>
                <PaperClipOutlined />
                <Text>{text || "Chưa cập nhật"}</Text>
              </>
            )}
          </Space>
        );
      }
    },
    { 
      title: "Loại minh chứng", 
      dataIndex: "category", 
      key: "category",
      render: (category: string) => getEvidenceCategoryLabel(category)
    },
    { 
      title: "Định dạng", 
      dataIndex: "type", 
      key: "type",
      render: (type: string) => type ? type.toUpperCase() : "Chưa cập nhật"
    },
    { 
      title: "Dung lượng", 
      dataIndex: "size", 
      key: "size",
      render: (size: number) => formatFileSize(size)
    },
    { 
      title: "Ngày tải lên", 
      dataIndex: "uploadedAt", 
      key: "uploadedAt",
      render: (date: string) => date ? formatDateTime(date) : "Chưa cập nhật"
    },
  ];

  const priorityGroup = application.priorityGroup ?? "none";
  const priorityScore = application.priorityScore ?? 0;
  const examTotalScore = application.totalScore ?? 0;
  const finalAdmissionScore = application.finalScore ?? (examTotalScore + priorityScore);

  const getStepCurrent = (status: string) => {
    if (status === "pending") return 1;
    if (status === "approved" || status === "rejected") return 2;
    return 0;
  };

  const getStepStatus = (status: string) => {
    if (status === "rejected") return "error";
    if (status === "approved") return "finish";
    return "process";
  };

  return (
    <div>
      <PageHeader 
        title="Chi tiết hồ sơ xét tuyển" 
        breadcrumbs={[
          { title: "Hồ sơ của tôi", href: "/candidate/applications" }, 
          { title: application.applicationCode }
        ]}
      />

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <Title level={4} style={{ margin: 0,  }}>Mã hồ sơ: {application.applicationCode}</Title>
                <Text type="secondary">Đã nộp vào: {formatDateTime(application.submittedAt)}</Text>
              </div>
              <div>
                <ApplicationStatusTag status={application.status} />
              </div>
            </div>

            <div style={{ marginBottom: 32, padding: "24px", background: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
              <Title level={5} style={{ marginBottom: 24,  }}>Tiến trình hồ sơ</Title>
              <Steps 
                current={getStepCurrent(application.status)} 
                status={getStepStatus(application.status)}
                className="cyber-steps"
                items={[
                  { 
                    title: 'Đã nộp hồ sơ', 
                    description: 'Hệ thống đã ghi nhận',
                    icon: <UploadOutlined />
                  },
                  { 
                    title: 'Đang xét duyệt', 
                    description: 'Hội đồng đang đánh giá',
                    icon: application.status === "pending" ? <SyncOutlined spin /> : undefined
                  },
                  { 
                    title: 'Kết quả', 
                    description: application.status === 'approved' ? 'Trúng tuyển' : application.status === 'rejected' ? 'Từ chối' : 'Chưa có kết quả',
                    icon: application.status === 'approved' ? <CheckCircleOutlined /> : application.status === 'rejected' ? <CloseCircleOutlined /> : undefined
                  },
                ]} 
              />
            </div>

            {application.status === "rejected" && application.adminNote && (
              <Alert 
                message="Lý do từ chối" 
                description={application.adminNote} 
                type="error" 
                showIcon 
                style={{ marginBottom: 24 }} 
              />
            )}

            {application.status === "approved" && (
              <Alert 
                message="Chúc mừng bạn đã trúng tuyển!" 
                description={application.adminNote || "Hồ sơ của bạn đã được duyệt thành công."} 
                type="success" 
                showIcon 
                style={{ marginBottom: 24 }} 
              />
            )}

            <Descriptions title="Thông tin thí sinh" bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Họ và tên">{candidate.fullName}</Descriptions.Item>
              <Descriptions.Item label="Số CCCD">{candidate.citizenId}</Descriptions.Item>
              <Descriptions.Item label="Email">{candidate.email}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{candidate.phone}</Descriptions.Item>
              <Descriptions.Item label="Trường THPT" span={2}>{candidate.highSchool}</Descriptions.Item>
            </Descriptions>

            <Descriptions title="Thông tin nguyện vọng" bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Đợt xét tuyển" span={2}>
                <Text strong>{admissionRound ? `${admissionRound.code} - ${admissionRound.name}` : "Chưa xác định đợt xét tuyển"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trường đại học" span={2}>
                <Text strong>{university?.name || "N/A"}</Text> ({university?.code})
              </Descriptions.Item>
              <Descriptions.Item label="Ngành học" span={2}>
                <Text strong>{major?.name || "N/A"}</Text> ({major?.code})
              </Descriptions.Item>
              <Descriptions.Item label="Tổ hợp xét tuyển">
                <Tag color="blue">{application.subjectGroupCode}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Đối tượng ưu tiên">
                <Text strong>{getPriorityGroupLabel(priorityGroup)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng điểm thi">
                <Text strong>{examTotalScore.toFixed(2)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Điểm ưu tiên">
                <Text strong>{priorityScore}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng điểm xét tuyển">
                <Text type="danger" strong>{finalAdmissionScore.toFixed(2)}</Text>
              </Descriptions.Item>
            </Descriptions>

            <Title level={5}>Điểm thành phần</Title>
            <div style={{ marginBottom: 12 }}>
              <Tag color="cyan">Tổ hợp: {application.subjectGroupCode || "Chưa cập nhật"}</Tag>
            </div>
            <Card type="inner" style={{ marginBottom: 24 }}>
              {Object.keys(application.scores || {}).length > 0 ? (
                <Row gutter={[16, 16]}>
                  {Object.entries(application.scores || {}).map(([subject, score]) => (
                    <Col xs={12} sm={8} md={6} key={subject}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <Text type="secondary">{subjectNames[subject] || subject}</Text>
                        <Text strong style={{ fontSize: 16 }}>{score !== undefined ? score.toFixed(2) : "-"}</Text>
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description="Chưa có dữ liệu điểm" />
              )}
            </Card>

            <Title level={5}>Minh chứng đính kèm</Title>
            {safeEvidenceFiles.length > 0 ? (
              <Table 
                columns={evidenceColumns} 
                dataSource={safeEvidenceFiles} 
                rowKey={(record) => record.id || Math.random().toString()}
                pagination={false}
                size="small"
                scroll={{ x: true }}
              />
            ) : (
              <Empty description="Chưa có file minh chứng" />
            )}

            {application.candidateNote && (
              <div style={{ marginTop: 24 }}>
                <Title level={5}>Ghi chú của thí sinh</Title>
                <Card type="inner">
                  <Text>{application.candidateNote}</Text>
                </Card>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
