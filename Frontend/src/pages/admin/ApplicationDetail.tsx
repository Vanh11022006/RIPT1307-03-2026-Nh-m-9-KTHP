import React, { useEffect, useRef, useState } from "react";
import { Card, Descriptions, Table, Tag, Button, Space, Alert, Result, Typography, Row, Col, Divider, Modal, Form, Input, InputNumber, message, Popconfirm, List } from "antd";
import { ArrowLeftOutlined, PaperClipOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { ApplicationStatusTag } from "../../components/status/ApplicationStatusTag";
import { useApplicationStore } from "../../stores/application.store";
import { useCandidateStore } from "../../stores/candidate.store";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";
import { useAdmissionRoundStore } from "../../stores/admissionRound.store";
import { useAuthStore } from "../../stores/auth.store";
import { useNotificationLogStore } from "../../stores/notificationLog.store";
import { formatDate, formatDateTime } from "../../utils/date";
import { formatFileSize } from "../../utils/file";
import { getPriorityGroupLabel } from "../../constants/priorityGroups";
import { getEvidenceCategoryLabel } from "../../constants/evidenceCategories";
import { Empty } from "antd";

const { Title, Text } = Typography;

export const AdminApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { getApplicationById, fetchApplicationById, approveApplication, rejectApplication, getApplicationReviewSummary, getApplicationReviewLogs, submitApplicationReviewScore } = useApplicationStore();
  const { getCandidateById, getCandidates } = useCandidateStore();
  const { getUniversityById, getUniversities } = useUniversityStore();
  const { getMajorById, getMajors } = useMajorStore();
  const { getAdmissionRoundById, getAdmissionRounds } = useAdmissionRoundStore();
  const { createNotificationLog } = useNotificationLogStore();
  const { currentUser } = useAuthStore();

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [reviewForm] = Form.useForm();
  const [form] = Form.useForm();
  const [application, setApplication] = useState(() => (id ? getApplicationById(id) : undefined));
  const [loading, setLoading] = useState<boolean>(!application);
  const [reviewSummary, setReviewSummary] = useState<any>(null);
  const [reviewLogs, setReviewLogs] = useState<any[]>([]);
  const [reviewLogsLoading, setReviewLogsLoading] = useState(false);
  const [reviewLogsLoaded, setReviewLogsLoaded] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    let mounted = true;
    mountedRef.current = true;

    getCandidates();
    getUniversities();
    getMajors();
    getAdmissionRounds();

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
          // show cached immediately, then attempt to refresh in background
          setLoading(false);
        }

        // Refresh from server to ensure full details (evidence, related refs) are present
        try {
          const refreshed = await fetchApplicationById(id);
          if (mounted && refreshed) {
            setApplication(refreshed);
          }
        } catch (err) {
          console.error("Failed to refresh application detail", err);
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

    const loadReviewSummary = async () => {
      if (!id) return;
      setReviewLoading(true);
      try {
        const summary = await getApplicationReviewSummary(id, 3);
        if (mounted) {
          setReviewSummary(summary);
        }
      } finally {
        if (mounted) {
          setReviewLoading(false);
        }
      }
    };

    loadApplication().catch((error) => {
      console.error("Failed to load application detail", error);
      if (mounted) {
        setLoading(false);
      }
    });

    loadReviewSummary().catch((error) => {
      console.error("Failed to load review summary", error);
    });

    return () => {
      mounted = false;
      mountedRef.current = false;
    };
  }, [id, getApplicationById, fetchApplicationById, getApplicationReviewSummary, getCandidates, getUniversities, getMajors, getAdmissionRounds]);

  if (!id) return null;

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Card loading />
      </div>
    );
  }

  if (!application) {
    return (
      <Result
        status="404"
        title="Không tìm thấy hồ sơ"
        subTitle="Hồ sơ xét tuyển này không tồn tại hoặc đã bị xóa."
        extra={<Button type="primary" onClick={() => navigate("/admin/applications")}>Quay lại danh sách</Button>}
      />
    );
  }

  const candidate = getCandidateById(application.candidateId);
  const candidateName = application.candidateName || candidate?.fullName || "Không rõ thí sinh";
  const candidateEmail = application.candidateEmail || candidate?.email || "Chưa cập nhật";
  const candidatePhone = application.candidatePhone || candidate?.phone || "Chưa cập nhật";
  const candidateDateOfBirth = application.candidateDateOfBirth || candidate?.dateOfBirth || "";
  const candidateGender = application.candidateGender || candidate?.gender || "";
  const candidateCitizenId = application.candidateCitizenId || candidate?.citizenId || "";
  const candidateAddress = application.candidateAddress || candidate?.address || "";
  const candidateCity = application.candidateCity || candidate?.city || "";
  const candidateHighSchool = application.candidateHighSchool || candidate?.highSchool || "";
  const candidateGraduationYear = application.candidateGraduationYear || candidate?.graduationYear || undefined;
  const university = getUniversityById(application.universityId);
  const major = getMajorById(application.majorId);
  const admissionRound = application.admissionRoundId ? getAdmissionRoundById(application.admissionRoundId) : undefined;

  const genderMap: Record<string, string> = {
    male: "Nam",
    female: "Nữ",
    other: "Khác"
  };

  const safeScores = application.scores ?? {};
  const scoreData = Object.entries(safeScores).map(([subject, score]) => ({
    subject,
    score: Number(score)
  })).filter((item) => Number.isFinite(item.score));

  const scoreColumns = [
    { title: "Môn thi", dataIndex: "subject", key: "subject" },
    {
      title: "Điểm",
      dataIndex: "score",
      key: "score",
      align: "center" as const,
      render: (val: number | string | undefined) => <Text strong>{Number(val ?? 0).toFixed(2)}</Text>
    }
  ];

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
      title: "Kích thước",
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

  const handleApprove = async () => {
    if (!currentUser) {
      message.error("Không xác định được quản trị viên đang đăng nhập");
      return;
    }
    try {
      const updated = await approveApplication(application.id, currentUser.id);
      if (updated) {
        // if backend didn't populate reviewedAt/reviewedBy, set them locally for immediate UI feedback
        if (!updated.reviewedAt || !updated.reviewedBy) {
          const patched = { ...updated, reviewedAt: new Date().toISOString(), reviewedBy: currentUser.fullName ?? String(currentUser.id) };
          setApplication(patched);
        } else {
          setApplication(updated);
        }
      }
    } catch (e) {
      console.error('Approve failed', e);
    }

    try {
      if (candidate) {
        const uniName = university?.name || "Không rõ trường";
        const majorName = major?.name || "Không rõ ngành";

        createNotificationLog({
          recipientUserId: candidate.id,
          recipientEmail: candidate.email || "unknown@example.com",
          recipientName: candidate.fullName || "Không rõ thí sinh",
          applicationId: application.id,
          type: "application_approved",
          channel: "email",
          subject: "Hồ sơ xét tuyển của bạn đã được duyệt",
          content: `Mã hồ sơ: ${application.applicationCode || "Chưa cập nhật"}\nTrường: ${uniName}\nNgành: ${majorName}\nNgày duyệt: ${formatDateTime(new Date().toISOString())}`,
        });
      }
    } catch (error) {
      console.error("Failed to create notification log", error);
    }

    message.success("Duyệt hồ sơ thành công");
  };

  const handleRejectSubmit = async (values: { reason: string }) => {
    if (!currentUser) {
      message.error("Không xác định được quản trị viên đang đăng nhập");
      return;
    }
    try {
      const updated = await rejectApplication(application.id, currentUser.id, values.reason);
      if (updated) {
        if (!updated.reviewedAt || !updated.reviewedBy) {
          const patched = { ...updated, reviewedAt: new Date().toISOString(), reviewedBy: currentUser.fullName ?? String(currentUser.id) };
          setApplication(patched);
        } else {
          setApplication(updated);
        }
      }
    } catch (e) {
      console.error('Reject failed', e);
    }

    try {
      if (candidate) {
        const uniName = university?.name || "Không rõ trường";
        const majorName = major?.name || "Không rõ ngành";

        createNotificationLog({
          recipientUserId: candidate.id,
          recipientEmail: candidate.email || "unknown@example.com",
          recipientName: candidate.fullName || "Không rõ thí sinh",
          applicationId: application.id,
          type: "application_rejected",
          channel: "email",
          subject: "Hồ sơ xét tuyển của bạn bị từ chối",
          content: `Mã hồ sơ: ${application.applicationCode || "Chưa cập nhật"}\nTrường: ${uniName}\nNgành: ${majorName}\nLý do: ${values.reason}`,
        });
      }
    } catch (error) {
      console.error("Failed to create notification log", error);
    }

    setIsRejectModalOpen(false);
    form.resetFields();
    message.success("Từ chối hồ sơ thành công");
  };

  const renderStatusAlert = () => {
    switch (application.status) {
      case "pending":
        return <Alert className="status-alert" message="Hồ sơ đang chờ quản trị viên xử lý." type="warning" showIcon />;
      case "approved":
        return <Alert className="status-alert" message="Hồ sơ đã được duyệt." type="success" showIcon />;
      case "rejected":
        return <Alert className="status-alert" message="Hồ sơ đã bị từ chối." type="error" showIcon />;
      default:
        return null;
    }
  };

  const priorityGroup = application.priorityGroup ?? "none";
  const priorityScore = Number(application.priorityScore ?? 0);
  const examTotalScore = Number(application.totalScore ?? 0);
  const finalAdmissionScore = Number(application.finalScore ?? (examTotalScore + priorityScore));
  const reviewAverage = reviewSummary?.averageReviewScore ?? application.reviewScoreAverage;
  const reviewCount = reviewSummary?.reviewCount ?? application.reviewCount;
  const reviewedBy = reviewSummary?.reviewedBy ?? application.reviewedBy;
  const reviewedAt = reviewSummary?.reviewedAt ?? application.reviewedAt;
  const visibleReviewLogs = reviewLogs.slice(0, 3);

  const truncate = (text: string | undefined, length = 120) => {
    if (!text) return undefined;
    return text.length > length ? `${text.substring(0, length).trim()}…` : text;
  };

  const getReviewActionLabel = (item?: any) => {
    if (!item) return "Hành động: Không rõ";

    const action = String(item.actionType ?? "").toUpperCase();
    switch (action) {
      case "REVIEW_ASSIGNMENT":
        return `Đã phân công reviewer${item.assignedReviewerName ? `: ${item.assignedReviewerName}` : ""}`;
      case "REVIEW_SCORE":
        return item.reviewScore != null
          ? `Gửi điểm review: ${Number(item.reviewScore).toFixed(2)}`
          : "Gửi điểm review";
      case "STATUS_UPDATE":
        return item.newStatus ? `Cập nhật trạng thái: ${item.newStatus}` : "Cập nhật trạng thái";
      case "PRIORITY_UPDATE":
        return item.newStatus ? `Cập nhật ưu tiên: ${item.newStatus}` : "Cập nhật ưu tiên";
      default:
        // Fallbacks: prefer a short notes preview, then raw actionType, otherwise show id
        const notePreview = truncate(item.notes);
        if (notePreview) return `Ghi chú: ${notePreview}`;
        if (item.actionType) return `Hành động: ${item.actionType}`;
        if (item.id) return `Hành động không rõ (bản ghi #${item.id})`;
        return `Hành động: Không rõ`;
    }
  };

  const handleReviewSubmit = async (values: { reviewScore: number; notes?: string }) => {
    if (!currentUser) {
      message.error("Không xác định được người đang đăng nhập");
      return;
    }

    setReviewSubmitting(true);
    try {
      const summary = await submitApplicationReviewScore(application.id, {
        reviewerId: currentUser.id,
        reviewScore: values.reviewScore,
        notes: values.notes,
      }, 3);

      if (summary) {
        setReviewSummary(summary);
        setReviewLogs([]);
        setReviewLogsLoaded(false);
      }

      const refreshed = await fetchApplicationById(application.id);
      if (refreshed) {
        setApplication(refreshed);
      }

      message.success("Gửi điểm review thành công");
      reviewForm.resetFields();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Gửi review thất bại";
      message.error(errorMessage);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const loadReviewLogs = async () => {
    if (!id || reviewLogsLoading || reviewLogsLoaded) {
      return;
    }

    setReviewLogsLoading(true);
    try {
      const logs = await getApplicationReviewLogs(id);
      if (mountedRef.current) {
        setReviewLogs(Array.isArray(logs) ? logs : []);
        setReviewLogsLoaded(true);
      }
    } finally {
      if (mountedRef.current) {
        setReviewLogsLoading(false);
      }
    }
  };

  return (
    <div className="admin-application-detail">
      <PageHeader
        title="Chi tiết hồ sơ xét tuyển"
        breadcrumbs={[
          { title: "Quản lý hồ sơ" },
          { title: "Chi tiết" }
        ]}
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/applications")}>
            Quay lại danh sách
          </Button>
        }
      />

      <Card style={{ marginBottom: 24 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={4} style={{ margin: 0 }}>Mã hồ sơ: {application.applicationCode || "Chưa cập nhật"}</Title>
          </Col>
          <Col>
            <ApplicationStatusTag status={application.status} />
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Thông tin thí sinh" style={{ marginBottom: 24 }}>
            {candidate || candidateName ? (
              <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Họ tên" span={2}><strong>{candidateName}</strong></Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">{candidateDateOfBirth ? formatDate(candidateDateOfBirth) : "Chưa cập nhật"}</Descriptions.Item>
                <Descriptions.Item label="Giới tính">{candidateGender ? genderMap[candidateGender] : "Chưa cập nhật"}</Descriptions.Item>
                <Descriptions.Item label="CCCD">{candidateCitizenId || "Chưa cập nhật"}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{candidatePhone}</Descriptions.Item>
                <Descriptions.Item label="Email" span={2}>{candidateEmail}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>{candidateAddress || "Chưa cập nhật"}</Descriptions.Item>
                <Descriptions.Item label="Thành phố">{candidateCity || "Chưa cập nhật"}</Descriptions.Item>
                <Descriptions.Item label="Trường THPT">{candidateHighSchool || "Chưa cập nhật"}</Descriptions.Item>
                <Descriptions.Item label="Năm tốt nghiệp">{candidateGraduationYear || "Chưa cập nhật"}</Descriptions.Item>
              </Descriptions>
            ) : (
              <EmptyState description="Không rõ thí sinh" />
            )}
          </Card>

          <Card title="Thông tin nguyện vọng" style={{ marginBottom: 24 }}>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Đợt xét tuyển">
                <Text strong>{admissionRound ? `${admissionRound.code} - ${admissionRound.name}` : "Chưa xác định đợt xét tuyển"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trường đại học">
                <strong>{university?.name || "Không rõ trường"}</strong> <Text type="secondary">({university?.code || "Chưa cập nhật"})</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngành học">
                <strong>{major?.name || "Không rõ ngành"}</strong> <Text type="secondary">({major?.code || "Chưa cập nhật"})</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tổ hợp xét tuyển">
                <Tag color="blue">{application.subjectGroupCode || "Chưa cập nhật"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Điểm sàn ngành">
                {major?.minScore !== undefined ? <Text strong>{major.minScore}</Text> : "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Đối tượng ưu tiên">
                <Text strong>{getPriorityGroupLabel(priorityGroup)}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Minh chứng">
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
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Thông tin hồ sơ" style={{ marginBottom: 24 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Ngày nộp">
                {application.submittedAt ? formatDateTime(application.submittedAt) : "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày xử lý">
                {application.reviewedAt ? formatDateTime(application.reviewedAt) : "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Người xử lý">
                {application.reviewedBy || "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Điểm review trung bình">
                {reviewAverage != null ? Number(reviewAverage).toFixed(2) : "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượt review">
                {reviewCount != null ? reviewCount : "Chưa cập nhật"}
              </Descriptions.Item>
            </Descriptions>
            <Divider style={{ margin: "12px 0" }} />
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: "block", marginBottom: 8, color: "rgba(255,255,255,0.65)" }}>Trạng thái xử lý:</Text>
              {renderStatusAlert()}

              {application.status === "pending" && (
                <Space style={{ marginTop: 16, width: "100%", justifyContent: "center" }}>
                  <Popconfirm
                    title="Bạn có chắc muốn duyệt hồ sơ này?"
                    okText="Xác nhận"
                    cancelText="Hủy"
                    onConfirm={handleApprove}
                  >
                    <Button type="primary">Duyệt hồ sơ</Button>
                  </Popconfirm>
                  <Button danger onClick={() => setIsRejectModalOpen(true)}>Từ chối hồ sơ</Button>
                </Space>
              )}
            </div>
            <div>
              <Text strong style={{ display: "block", marginBottom: 8, color: "rgba(255,255,255,0.65)" }}>Ghi chú thí sinh:</Text>
              <Text style={{ color: "rgba(255,255,255,0.92)" }}>{application.candidateNote || "Không có ghi chú"}</Text>
            </div>
            <div style={{ marginTop: 16 }}>
              <Text strong style={{ display: "block", marginBottom: 8, color: "rgba(255,255,255,0.65)" }}>Ghi chú admin:</Text>
              <Text style={{ color: "rgba(255,255,255,0.92)" }}>{application.adminNote || "Không có ghi chú"}</Text>
            </div>
          </Card>

          <Card title="Submit review" style={{ marginBottom: 24 }}>
            <Form
              form={reviewForm}
              layout="vertical"
              onFinish={handleReviewSubmit}
              disabled={reviewSubmitting}
            >
              <Form.Item
                name="reviewScore"
                label="Điểm review"
                rules={[
                  { required: true, message: "Vui lòng nhập điểm review" },
                ]}
              >
                <InputNumber
                  min={0}
                  max={10}
                  step={0.1}
                  style={{ width: "100%" }}
                  placeholder="Nhập điểm từ 0 đến 10"
                />
              </Form.Item>
              <Form.Item name="notes" label="Ghi chú review">
                <Input.TextArea rows={4} placeholder="Nhập ghi chú cho lần review này" />
              </Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={reviewSubmitting}>
                  Gửi review
                </Button>
                <Button onClick={() => reviewForm.resetFields()} disabled={reviewSubmitting}>
                  Xóa form
                </Button>
              </Space>
            </Form>
          </Card>

          <Card title="Danh sách reviewer" style={{ marginBottom: 24 }} loading={reviewLoading}>
            <List
              dataSource={reviewSummary?.assignedReviewers ?? []}
              locale={{ emptyText: "Chưa có reviewer được gán" }}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.fullName || "Chưa cập nhật"}
                    description={item.email || "Chưa cập nhật"}
                  />
                </List.Item>
              )}
            />
            <Divider />
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Người review gần nhất">
                {reviewedBy || "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Thời điểm review gần nhất">
                {reviewedAt ? formatDateTime(reviewedAt) : "Chưa cập nhật"}
              </Descriptions.Item>
            </Descriptions>
            {reviewCount != null && reviewCount > 0 && (
              <Alert
                type="success"
                showIcon
                message="Đã review hồ sơ này"
                description={`Có ${reviewCount} lượt review${reviewedBy ? `, người review gần nhất: ${reviewedBy}` : ""}.`}
                style={{ marginTop: 12 }}
              />
            )}
            <Divider />
            <Space style={{ marginBottom: 12 }}>
              <Button onClick={loadReviewLogs} loading={reviewLogsLoading}>
                Tải lịch sử review
              </Button>
              {reviewLogsLoaded && reviewLogs.length > 0 && (
                <Text type="secondary">Đã tải {reviewLogs.length} bản ghi</Text>
              )}
            </Space>
            {reviewLogsLoaded && (
              <List
                size="small"
                locale={{ emptyText: "Chưa có lịch sử review" }}
                dataSource={visibleReviewLogs}
                renderItem={(item: any) => (
                  <List.Item>
                    <Text>
                      {getReviewActionLabel(item)}
                      {item.reviewerName ? ` · ${item.reviewerName}` : ""}
                      {item.createdAt ? ` · ${formatDateTime(item.createdAt)}` : ""}
                    </Text>
                  </List.Item>
                )}
              />
            )}
          </Card>

          <Card title="Điểm xét tuyển">
            <div style={{ marginBottom: 12 }}>
              <Tag color="cyan">Tổ hợp: {application.subjectGroupCode || "Chưa cập nhật"}</Tag>
            </div>
            {scoreData.length > 0 ? (
              <>
                <Table
                  columns={scoreColumns}
                  dataSource={scoreData}
                  rowKey="subject"
                  pagination={false}
                  size="small"
                  bordered
                />
                <div style={{ marginTop: 16, textAlign: "right" }}>
                  <Text style={{ fontSize: 14, display: "block" }}>Điểm thi: {examTotalScore.toFixed(2)}</Text>
                  <Text style={{ fontSize: 14, display: "block" }}>Điểm ưu tiên: {priorityScore}</Text>
                  <Divider style={{ margin: "8px 0" }} />
                  <Text style={{ fontSize: 16 }}>Tổng điểm xét tuyển: </Text>
                  <Text type="danger" strong style={{ fontSize: 20 }}>
                    {finalAdmissionScore.toFixed(2)}
                  </Text>
                </div>
              </>
            ) : (
              <EmptyState description="Chưa có dữ liệu điểm" />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        className="reject-application-modal"
        rootClassName="reject-application-modal-root"
        title="Từ chối hồ sơ"
        open={isRejectModalOpen}
        onCancel={() => {
          setIsRejectModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
        modalRender={(modal) => (
          <div className="reject-application-modal-wrapper">
            {modal}
          </div>
        )}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRejectSubmit}
        >
          <Form.Item
            name="reason"
            label="Lý do từ chối"
            rules={[
              { required: true, message: "Vui lòng nhập lý do từ chối" },
              {
                validator: (_, value) => {
                  if (value && value.trim().length < 5) {
                    return Promise.reject(new Error("Lý do từ chối phải có ít nhất 5 ký tự"));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input.TextArea rows={4} placeholder="Nhập lý do từ chối hồ sơ..." />
          </Form.Item>
          <Space style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => setIsRejectModalOpen(false)}>Hủy</Button>
            <Button type="primary" danger htmlType="submit">Xác nhận từ chối</Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};
