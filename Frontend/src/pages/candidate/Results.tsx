import React, { useMemo } from "react";
import { Card, Result, Button, Row, Col, Typography, Alert } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { useAuthStore } from "../../stores/auth.store";
import { useCandidateStore } from "../../stores/candidate.store";
import { useApplicationStore } from "../../stores/application.store";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";

const { Title, Text, Paragraph } = Typography;

export const Results: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { getCandidateByUserId } = useCandidateStore();
  const { getApplicationsByCandidateId } = useApplicationStore();
  const { universities } = useUniversityStore();
  const { majors } = useMajorStore();

  const candidate = useMemo(() => {
    if (!currentUser) return null;
    return getCandidateByUserId(currentUser.id);
  }, [currentUser, getCandidateByUserId]);

  const applications = useMemo(() => {
    if (!candidate) return [];
    return getApplicationsByCandidateId(candidate.id).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [candidate, getApplicationsByCandidateId]);

  const getUniversityName = (id: string) => {
    return universities.find(u => u.id === id)?.name || "N/A";
  };

  const getMajorName = (id: string) => {
    return majors.find(m => m.id === id)?.name || "N/A";
  };

  if (applications.length === 0) {
    return (
      <div>
        <PageHeader title="Kết quả xét tuyển" />
        <Card>
          <EmptyState 
            description="Bạn chưa nộp hồ sơ nào nên chưa có kết quả xét tuyển." 
            actionText="Nộp hồ sơ ngay"
            onAction={() => navigate("/candidate/apply")}
          />
        </Card>
      </div>
    );
  }

  // Group applications by status
  const approvedApps = applications.filter(app => app.status === "approved");
  const rejectedApps = applications.filter(app => app.status === "rejected");
  const pendingApps = applications.filter(app => app.status === "pending");

  return (
    <div>
      <PageHeader title="Kết quả xét tuyển" />
      
      {approvedApps.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ color: "#52c41a" }}><CheckCircleOutlined /> Trúng tuyển ({approvedApps.length})</Title>
          <Row gutter={[16, 16]}>
            {approvedApps.map(app => (
              <Col xs={24} md={12} key={app.id}>
                <Card 
                  style={{ borderColor: "rgba(16, 185, 129, 0.3)", background: "rgba(16, 185, 129, 0.1)" }}
                  actions={[
                    <Button type="link" onClick={() => navigate(`/candidate/applications/${app.id}`)}>Xem chi tiết hồ sơ</Button>
                  ]}
                >
                  <Result
                    icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                    status="success"
                    title="Chúc mừng bạn đã trúng tuyển!"
                    subTitle={
                      <div style={{ marginTop: 16, textAlign: "left" }}>
                        <Paragraph><strong>Trường:</strong> {getUniversityName(app.universityId)}</Paragraph>
                        <Paragraph><strong>Ngành:</strong> {getMajorName(app.majorId)}</Paragraph>
                        <Paragraph>
                          <strong>Tổ hợp:</strong> {app.subjectGroupCode} (
                          Tổng điểm: <Text type="danger" strong>{(Number(app.finalScore ?? (Number(app.totalScore ?? 0) + Number(app.priorityScore ?? 0)))).toFixed(2)}</Text>)
                        </Paragraph>
                      </div>
                    }
                  />
                  {app.adminNote && (
                    <Alert message="Lời nhắn từ trường" description={app.adminNote} type="info" showIcon />
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {pendingApps.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ color: "#faad14" }}><ClockCircleOutlined /> Đang chờ duyệt ({pendingApps.length})</Title>
          <Row gutter={[16, 16]}>
            {pendingApps.map(app => (
              <Col xs={24} md={12} key={app.id}>
                <Card
                  style={{ borderColor: "rgba(0, 240, 255, 0.2)", background: "rgba(0, 240, 255, 0.05)" }}
                  actions={[
                    <Button type="link" onClick={() => navigate(`/candidate/applications/${app.id}`)}>Xem chi tiết hồ sơ</Button>
                  ]}
                >
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <ClockCircleOutlined style={{ fontSize: 32, color: "#faad14" }} />
                    <div>
                      <Title level={5}>Hồ sơ đang được xem xét</Title>
                      <Paragraph><strong>Trường:</strong> {getUniversityName(app.universityId)}</Paragraph>
                      <Paragraph><strong>Ngành:</strong> {getMajorName(app.majorId)}</Paragraph>
                      <Text type="secondary">Vui lòng kiên nhẫn chờ đợi kết quả từ hội đồng tuyển sinh.</Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {rejectedApps.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ color: "#ff4d4f" }}><CloseCircleOutlined /> Không trúng tuyển ({rejectedApps.length})</Title>
          <Row gutter={[16, 16]}>
            {rejectedApps.map(app => (
              <Col xs={24} md={12} key={app.id}>
                <Card
                  style={{ borderColor: "rgba(239, 68, 68, 0.3)", background: "rgba(239, 68, 68, 0.1)" }}
                  actions={[
                    <Button type="link" onClick={() => navigate(`/candidate/applications/${app.id}`)}>Xem chi tiết hồ sơ</Button>
                  ]}
                >
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
                    <CloseCircleOutlined style={{ fontSize: 32, color: "#ff4d4f" }} />
                    <div>
                      <Title level={5}>Rất tiếc, bạn không trúng tuyển</Title>
                      <Paragraph><strong>Trường:</strong> {getUniversityName(app.universityId)}</Paragraph>
                      <Paragraph><strong>Ngành:</strong> {getMajorName(app.majorId)}</Paragraph>
                    </div>
                  </div>
                  <Alert 
                    message="Lý do từ chối" 
                    description={app.adminNote || "Điểm xét tuyển không đạt yêu cầu của ngành."} 
                    type="error" 
                    showIcon 
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};
