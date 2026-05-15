import React, { useState, useEffect, useMemo } from "react";
import { 
  Card, Form, Select, Input, InputNumber, Button, Upload, 
  Checkbox, Alert, message, Typography, Row, Col, Space,
  Divider, Statistic
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { useAuthStore } from "../../stores/auth.store";
import { useCandidateStore } from "../../stores/candidate.store";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";
import { useApplicationStore } from "../../stores/application.store";
import { useAdmissionRoundStore } from "../../stores/admissionRound.store";
import { useNotificationLogStore } from "../../stores/notificationLog.store";
import { useSubjectGroupStore } from "../../stores/subjectGroup.store";
import { calculateTotalScore } from "../../utils/calculate";
import { PRIORITY_GROUPS, getPriorityScore } from "../../constants/priorityGroups";
import { EVIDENCE_CATEGORIES } from "../../constants/evidenceCategories";
import type { Application, EvidenceFile } from "../../types/application.types";
import type { UploadFile } from "antd/es/upload/interface";

const { Text } = Typography;
const { Option } = Select;

export const ApplicationForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultUniversityId = searchParams.get("universityId");
  const editId = searchParams.get("editId");

  const { currentUser } = useAuthStore();
  const { getCandidateByUserId } = useCandidateStore();
  const { getActiveUniversities } = useUniversityStore();
  const { majors } = useMajorStore();
  const { getActiveMajorsByUniversityId } = useMajorStore();
  const { applications, createApplication } = useApplicationStore();
  const { admissionRounds, getAdmissionRoundById } = useAdmissionRoundStore();
  const { createNotificationLog } = useNotificationLogStore();
  const { getUniversityById } = useUniversityStore();
  const { getMajorById } = useMajorStore();
  const { subjectGroups } = useSubjectGroupStore();
  const { fetchApplicationById, cancelApplication } = useApplicationStore();

  const activeRounds = useMemo(() => {
    const safeRounds = Array.isArray(admissionRounds) ? admissionRounds : [];
    return safeRounds.filter(r => r.status === "active");
  }, [admissionRounds]);

  const [selectedUniversityId, setSelectedUniversityId] = useState<string | undefined>(defaultUniversityId || undefined);
  const [selectedMajorId, setSelectedMajorId] = useState<string | undefined>();
  const [selectedSubjectGroupCode, setSelectedSubjectGroupCode] = useState<string | undefined>();
  const [selectedPriorityGroup, setSelectedPriorityGroup] = useState<string>("none");
  const [selectedEvidenceCategory, setSelectedEvidenceCategory] = useState<string>("other");
  const [totalScore, setTotalScore] = useState<number>(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const candidate = currentUser ? getCandidateByUserId(currentUser.id) : null;

  const isProfileComplete = useMemo(() => {
    if (!candidate) return false;
    return !!(candidate.citizenId && candidate.phone && candidate.address && candidate.highSchool);
  }, [candidate]);

  const activeUniversities = getActiveUniversities();
  
  const availableMajors = useMemo(() => {
    if (!selectedUniversityId) return [];
    return getActiveMajorsByUniversityId(selectedUniversityId);
  }, [selectedUniversityId, majors, getActiveMajorsByUniversityId]);

  const availableSubjectGroups = useMemo(() => {
    if (!selectedMajorId) return [];
    const major = availableMajors.find(m => m.id === selectedMajorId);
    if (!major) return [];
    
    // Fallback if missing
    const codes = Array.isArray(major.subjectGroupCodes) ? major.subjectGroupCodes : [];
    const safeSubjectGroups = Array.isArray(subjectGroups) ? subjectGroups : [];
    if (codes.length === 0) {
      return safeSubjectGroups;
    }
    return safeSubjectGroups.filter(sg => codes.includes(sg.code ?? ""));
  }, [selectedMajorId, availableMajors, subjectGroups]);

  const requiredSubjects = useMemo(() => {
    if (!selectedSubjectGroupCode) return [];
    const safeSubjectGroups = Array.isArray(subjectGroups) ? subjectGroups : [];
    const group = safeSubjectGroups.find(g => g.code === selectedSubjectGroupCode);
    return group ? group.subjects : [];
  }, [selectedSubjectGroupCode, subjectGroups]);

  useEffect(() => {
    if (defaultUniversityId) {
      form.setFieldsValue({ universityId: defaultUniversityId });
    }
  }, [defaultUniversityId, form]);

  useEffect(() => {
    // If editing an existing pending application, prefill form
    let mounted = true;
    const loadForEdit = async () => {
      if (!editId) return;
      const app = await fetchApplicationById(editId);
      if (!app || !mounted) return;
      form.setFieldsValue({
        universityId: app.universityId,
        majorId: app.majorId,
        subjectGroupCode: app.subjectGroupCode,
        admissionRoundId: app.admissionRoundId,
        scores: app.scores,
        priorityGroup: app.priorityGroup ?? 'none'
      });
      setSelectedUniversityId(app.universityId);
      setSelectedMajorId(app.majorId);
      setSelectedSubjectGroupCode(app.subjectGroupCode);
      setTotalScore(app.totalScore ?? 0);
      setSelectedPriorityGroup(app.priorityGroup ?? 'none');
    };
    loadForEdit().catch(err => console.error(err));
    return () => { mounted = false; };
  }, [editId, fetchApplicationById, form]);

  const handleValuesChange = (changedValues: any, allValues: any) => {
    console.log("📝 Form changed:", { changedValues, allValues });
    
    if (changedValues.universityId) {
      setSelectedUniversityId(changedValues.universityId);
      setSelectedMajorId(undefined);
      setSelectedSubjectGroupCode(undefined);
      form.setFieldsValue({ majorId: undefined, subjectGroupCode: undefined, scores: undefined });
      setTotalScore(0);
    }
    
    if (changedValues.majorId) {
      setSelectedMajorId(changedValues.majorId);
      setSelectedSubjectGroupCode(undefined);
      form.setFieldsValue({ subjectGroupCode: undefined, scores: undefined });
      setTotalScore(0);
    }

    if (changedValues.subjectGroupCode) {
      setSelectedSubjectGroupCode(changedValues.subjectGroupCode);
      form.setFieldsValue({ scores: undefined });
      setTotalScore(0);
    }

    // Always recalculate if allValues has scores
    if (allValues.scores) {
      console.log("📊 Calculating total score from:", allValues.scores);
      const scoreTotal = calculateTotalScore(allValues.scores);
      console.log("📊 Calculated total:", scoreTotal);
      setTotalScore(scoreTotal);
    }

    if (changedValues.priorityGroup) {
      setSelectedPriorityGroup(changedValues.priorityGroup);
    }

    if (changedValues.evidenceCategory) {
      setSelectedEvidenceCategory(changedValues.evidenceCategory);
    }
  };

  const currentPriorityScore = getPriorityScore(selectedPriorityGroup);
  const finalAdmissionScore = totalScore + currentPriorityScore;

  const handleUploadChange = (info: any) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-5);
    setFileList(newFileList);
  };

  const onFinish = async (values: any) => {
    if (!candidate || !currentUser) return;

    // Check duplicate
    const isDuplicate = applications.some(
      app => app.candidateId === candidate.id &&
             app.universityId === values.universityId &&
             app.majorId === values.majorId &&
             app.subjectGroupCode === values.subjectGroupCode &&
             (app.status === "pending" || app.status === "approved")
    );

    if (isDuplicate) {
      message.error("Bạn đã nộp một hồ sơ với cùng Trường, Ngành và Tổ hợp này đang chờ duyệt hoặc đã duyệt!");
      return;
    }

    const mockEvidences: EvidenceFile[] = fileList.map(file => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      url: "#",
      type: file.type === "application/pdf" ? "pdf" : "image",
      category: selectedEvidenceCategory,
      size: file.size || 0,
      uploadedAt: new Date().toISOString()
    }));

    const selectedSubjectGroup = availableSubjectGroups.find(
      (group) => String(group.code) === String(values.subjectGroupCode)
    );

    if (!selectedSubjectGroup?.id) {
      message.error("Không tìm thấy tổ hợp xét tuyển phù hợp.");
      return;
    }

    const submitPayload: any = {
      candidateId: Number(candidate.id),
      majorId: Number(values.majorId),
      admissionRoundId: values.admissionRoundId ? Number(values.admissionRoundId) : undefined,
      subjectGroupId: Number(selectedSubjectGroup.id),
      totalScore,
      priorityGroup: selectedPriorityGroup,
      priorityScore: currentPriorityScore,
    };

    await createApplication(submitPayload);

    // If this was editing an existing application, cancel the old one
    if (editId) {
      try {
        await cancelApplication(editId);
      } catch (err) {
        console.error('Failed to cancel original application after edit', err);
      }
    }

    const applicationCode = `HS${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
    const submittedAt = new Date().toISOString();
    const newApp: Application = {
      id: `app_${Date.now()}`,
      applicationCode,
      candidateId: candidate.id,
      universityId: values.universityId,
      majorId: values.majorId,
      subjectGroupCode: values.subjectGroupCode,
      admissionRoundId: values.admissionRoundId,
      priorityGroup: selectedPriorityGroup,
      priorityScore: currentPriorityScore,
      scores: values.scores,
      totalScore,
      evidenceFiles: mockEvidences,
      status: "pending",
      submittedAt,
      createdAt: submittedAt,
      updatedAt: submittedAt
    };

    try {
      const university = getUniversityById(values.universityId);
      const major = getMajorById(values.majorId);
      const admissionRound = values.admissionRoundId ? getAdmissionRoundById(values.admissionRoundId) : undefined;

      const uniName = university?.name || "Không rõ trường";
      const majorName = major?.name || "Không rõ ngành";
      const roundName = admissionRound ? `${admissionRound.code} - ${admissionRound.name}` : "Chưa xác định đợt xét tuyển";

      createNotificationLog({
        recipientUserId: currentUser.id,
        recipientEmail: candidate.email || currentUser.email,
        recipientName: candidate.fullName || "Không rõ thí sinh",
        applicationId: newApp.id,
        type: "application_submitted",
        channel: "in_app",
        subject: "Bạn đã nộp hồ sơ xét tuyển thành công",
        content: `Mã hồ sơ: ${newApp.applicationCode}\nTrường: ${uniName}\nNgành: ${majorName}\nĐợt xét tuyển: ${roundName}`,
      });
    } catch (error) {
      console.error("Failed to create notification log", error);
    }

    message.success("Nộp hồ sơ thành công!");
    navigate("/candidate/applications");
  };

  return (
    <div>
      <PageHeader title="Nộp hồ sơ xét tuyển" />

      {!isProfileComplete && (
        <Alert
          message="Thông tin cá nhân chưa đầy đủ"
          description={
            <Space direction="vertical">
              <Text>Bạn cần cập nhật đầy đủ thông tin cá nhân (CCCD, SĐT, Địa chỉ, Trường THPT) trước khi nộp hồ sơ.</Text>
              <Button type="primary" size="small" onClick={() => navigate("/candidate/profile")}>
                Cập nhật ngay
              </Button>
            </Space>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {isProfileComplete && activeRounds.length === 0 && (
        <Alert
          message="Chưa có đợt xét tuyển"
          description="Hiện chưa có đợt xét tuyển nào đang diễn ra. Bạn không thể nộp hồ sơ vào lúc này."
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Card>
        {!isProfileComplete ? (
          <EmptyState description="Vui lòng cập nhật thông tin cá nhân để tiếp tục" />
        ) : (
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleValuesChange}
          onFinish={onFinish}
          initialValues={{ priorityGroup: "none", evidenceCategory: "other" }}
        >
          <Divider />
          <h3>1. Thông tin thí sinh</h3>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label="Họ và tên">
                <Input disabled value={candidate?.fullName ?? ""} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Số CCCD">
                <Input disabled value={candidate?.citizenId ?? ""} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Email">
                <Input disabled value={candidate?.email ?? ""} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col xs={24} sm={8}>
              <Form.Item 
                name="priorityGroup" 
                label="Đối tượng ưu tiên"
                rules={[{ required: true, message: "Vui lòng chọn đối tượng ưu tiên" }]}
              >
                <Select>
                  {Object.entries(PRIORITY_GROUPS).map(([code, config]) => (
                    <Option key={code} value={code}>
                      {config.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <h3>2. Chọn nguyện vọng</h3>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item 
                name="admissionRoundId" 
                label="Đợt xét tuyển" 
                rules={[{ required: activeRounds.length > 0, message: "Vui lòng chọn đợt xét tuyển" }]}
              >
                <Select placeholder="Chọn đợt xét tuyển" disabled={activeRounds.length === 0}>
                  {activeRounds.map(r => (
                    <Option key={r.id} value={r.id}>{r.code} - {r.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item 
                name="universityId" 
                label="Trường đại học" 
                rules={[{ required: true, message: "Vui lòng chọn trường đại học" }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn trường đại học"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {activeUniversities.map(u => (
                    <Option key={u.id} value={u.id}>{u.code} - {u.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item 
                name="majorId" 
                label="Ngành học" 
                rules={[{ required: true, message: "Vui lòng chọn ngành học" }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn ngành học"
                  disabled={!selectedUniversityId}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {availableMajors.map(m => (
                    <Option key={m.id} value={m.id}>{m.code} - {m.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item 
                name="subjectGroupCode" 
                label="Tổ hợp xét tuyển" 
                rules={[{ required: true, message: "Vui lòng chọn tổ hợp" }]}
              >
                <Select
                  placeholder="Chọn tổ hợp"
                  disabled={!selectedMajorId}
                >
                  {availableSubjectGroups.map(sg => (
                    <Option key={sg.code} value={sg.code}>{sg.code} ({sg.name})</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {selectedSubjectGroupCode && (
            <>
              <Divider />
              <h3>3. Nhập điểm xét tuyển</h3>
              <Alert 
                message="Lưu ý" 
                description="Vui lòng nhập điểm chính xác (từ 0 đến 10). Điểm sẽ được đối chiếu với học bạ/chứng nhận điểm của bạn." 
                type="info" 
                showIcon 
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {requiredSubjects.map(subject => {
                  // Map subject code to Vietnamese name for UI
                  const subjectNames: Record<string, string> = {
                    math: "Toán học",
                    physics: "Vật lý",
                    chemistry: "Hóa học",
                    literature: "Ngữ văn",
                    english: "Tiếng Anh",
                    biology: "Sinh học",
                    history: "Lịch sử",
                    geography: "Địa lý",
                    civicEducation: "GDCD"
                  };
                  
                  return (
                    <Col xs={24} sm={8} key={subject}>
                      <Form.Item 
                        name={["scores", subject]} 
                        label={`Điểm ${subjectNames[subject] || subject}`}
                        rules={[
                          { required: true, message: `Vui lòng nhập điểm ${subjectNames[subject] || subject}` }
                        ]}
                      >
                        <InputNumber 
                          min={0} 
                          max={10} 
                          step={0.25} 
                          style={{ width: "100%" }} 
                          placeholder="0.00 - 10.00"
                        />
                      </Form.Item>
                    </Col>
                  );
                })}
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Card size="small" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                    <Statistic title={<span style={{color: "rgba(255,255,255,0.8)"}}>Tổng điểm thi</span>} value={totalScore} precision={2} valueStyle={{ color: "#fff" }} />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card size="small" style={{ background: "rgba(0,240,255,0.1)", borderColor: "rgba(0,240,255,0.3)" }}>
                    <Statistic title={<span style={{color: "rgba(255,255,255,0.8)"}}>Điểm ưu tiên</span>} value={currentPriorityScore} precision={2} valueStyle={{ color: "var(--neon-cyan)" }} />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card size="small" style={{ background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.3)" }}>
                    <Statistic title={<span style={{color: "rgba(255,255,255,0.8)"}}>Tổng điểm xét tuyển</span>} value={finalAdmissionScore} precision={2} valueStyle={{ color: "#10b981", fontWeight: "bold", textShadow: "0 0 10px rgba(16,185,129,0.3)" }} />
                  </Card>
                </Col>
              </Row>
            </>
          )}

          <Divider />
          <h3>4. Minh chứng đính kèm</h3>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item 
                name="evidenceCategory" 
                label="Loại minh chứng (sẽ được gán cho tất cả các file tải lên)"
              >
                <Select>
                  {Object.entries(EVIDENCE_CATEGORIES).map(([code, config]) => (
                    <Option key={code} value={code}>
                      {config.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Upload Học bạ / Giấy chứng nhận (Tối đa 5 file, định dạng JPG/PNG/PDF)">
            <Upload
              multiple
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false} // Prevent real upload
              accept="image/png, image/jpeg, application/pdf"
            >
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </Form.Item>

          <Divider />
          <h3>5. Xác nhận</h3>
          <Form.Item 
            name="confirm" 
            valuePropName="checked"
            rules={[
              { validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error("Bạn phải xác nhận thông tin trước khi nộp hồ sơ")) }
            ]}
          >
            <Checkbox>
              Tôi xin cam đoan những thông tin khai báo trên là hoàn toàn chính xác và trung thực. Tôi xin chịu mọi trách nhiệm trước pháp luật nếu có sai sót.
            </Checkbox>
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" size="large" block disabled={!isProfileComplete || activeRounds.length === 0}>
              Nộp hồ sơ
            </Button>
          </Form.Item>
        </Form>
        )}
      </Card>
    </div>
  );
};
