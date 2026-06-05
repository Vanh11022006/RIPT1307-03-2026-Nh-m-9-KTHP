import React, { useState, useEffect, useMemo } from "react";
import {
  Card, Form, Select, Input, InputNumber, Button, Upload,
  Checkbox, Alert, message, Typography, Row, Col, Space,
  Divider, Statistic, Radio, Switch, Tag
} from "antd";
import { UploadOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { useAuthStore } from "../../stores/auth.store";
import { useCandidateStore } from "../../stores/candidate.store";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";
import { useApplicationStore } from "../../stores/application.store";
import { useAdmissionRoundStore } from "../../stores/admissionRound.store";
import { useNotificationLogStore } from "../../stores/notificationLog.store";
import { useSubjectGroupStore } from "../../stores/subjectGroup.store";
import axiosClient from "../../api/axiosClient";
import { calculateTotalScore } from "../../utils/calculate";
import { PRIORITY_GROUPS, getPriorityScore } from "../../constants/priorityGroups";
import { EVIDENCE_CATEGORIES } from "../../constants/evidenceCategories";
import {
  calculateScoreByMethod,
  convertCertificateScore,
  SUBJECT_NAMES,
} from "../../constants/admissionMethodConfig";
import type { ScoreCalculationResult } from "../../constants/admissionMethodConfig";
import type { Application } from "../../types/application.types";
import type { EvidenceFile } from "../../types/application.types";
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
  const { getCandidateByUserId, getProfile, loading: candidateLoading } = useCandidateStore();
  const { getActiveUniversities, getUniversities, loading: universitiesLoading } = useUniversityStore();
  const { majors, getMajors, loading: majorsLoading } = useMajorStore();
  const { getActiveMajorsByUniversityId } = useMajorStore();
  const { applications, createApplication, saveDraftApplication, submitDraftApplication, loading: applicationsLoading, fetchApplicationById, cancelApplication } = useApplicationStore();
  const { admissionRounds, getAdmissionRoundById, getAdmissionRounds, loading: roundsLoading } = useAdmissionRoundStore();
  const { createNotificationLog } = useNotificationLogStore();
  const { getUniversityById } = useUniversityStore();
  const { getMajorById } = useMajorStore();
  const { subjectGroups } = useSubjectGroupStore();

  const activeRounds = useMemo(() => {
    const safeRounds = Array.isArray(admissionRounds) ? admissionRounds : [];
    return safeRounds.filter(r => r.status === "active");
  }, [admissionRounds]);

  const [selectedUniversityId, setSelectedUniversityId] = useState<string | undefined>(defaultUniversityId || undefined);
  const [selectedMajorId, setSelectedMajorId] = useState<string | undefined>();
  const [selectedSubjectGroupCode, setSelectedSubjectGroupCode] = useState<string | undefined>();
  const [selectedPriorityGroup, setSelectedPriorityGroup] = useState<string>("none");
  const [selectedEvidenceCategory, setSelectedEvidenceCategory] = useState<string>("other");
  const [selectedAdmissionMethod, setSelectedAdmissionMethod] = useState<string | undefined>();
  const [totalScore, setTotalScore] = useState<number>(0);
  const [scoreCalcResult, setScoreCalcResult] = useState<ScoreCalculationResult | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loadedApplication, setLoadedApplication] = useState<Application | null>(null);

  const selectedAdmissionRoundId = Form.useWatch("admissionRoundId", form);
  const gnlType = Form.useWatch(["scores", "gnlType"], form);

  const candidate = currentUser ? getCandidateByUserId(currentUser.id) : null;

  const availableAdmissionMethods = useMemo(() => {
    if (!selectedAdmissionRoundId) return [];
    const safeRounds = Array.isArray(admissionRounds) ? admissionRounds : [];
    const round = safeRounds.find(r => String(r.id) === String(selectedAdmissionRoundId));

    const allMethods = [
      { value: "THPT_SCORE", label: "Điểm thi THPT Quốc gia" },
      { value: "SCHOOL_TRANSCRIPT", label: "Xét học bạ THPT" },
      { value: "COMPETENCY_ASSESSMENT", label: "Đánh giá năng lực" },
      { value: "THINKING_ASSESSMENT", label: "Đánh giá tư duy" },
      { value: "TALENT_ADMISSION", label: "Xét tuyển tài năng" },
      { value: "INTERVIEW", label: "Phỏng vấn / Xét tuyển thẳng" },
    ];

    if (!round || !round.admissionMethods) {
      return allMethods;
    }

    const allowed = round.admissionMethods.split(",").map(s => s.trim());
    return allMethods.filter(m => allowed.includes(m.value));
  }, [selectedAdmissionRoundId, admissionRounds]);

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
    getUniversities().catch((error) => {
      console.error("Failed to refresh universities", error);
    });
  }, [getUniversities]);

  useEffect(() => {
    getMajors().catch((error) => {
      console.error("Failed to refresh majors", error);
    });
    getAdmissionRounds().catch((error) => {
      console.error("Failed to refresh admission rounds", error);
    });
    if (currentUser?.id) {
      getProfile(currentUser.id).catch((error) => {
        console.error("Failed to refresh candidate profile", error);
      });
    }
  }, [currentUser?.id, getAdmissionRounds, getMajors, getProfile]);

  useEffect(() => {
    let mounted = true;
    const loadForEdit = async () => {
      if (!editId) return;
      const app = await fetchApplicationById(editId);
      if (!app || !mounted) return;
      setLoadedApplication(app);
      const existingFiles: UploadFile[] = Array.isArray(app.evidenceFiles)
        ? app.evidenceFiles.map((file, index) => ({
          uid: String(file.id ?? `existing-${index}`),
          name: file.name,
          status: "done",
          url: file.url,
        }))
        : [];
      form.setFieldsValue({
        universityId: app.universityId,
        majorId: app.majorId,
        subjectGroupCode: app.subjectGroupCode,
        admissionRoundId: app.admissionRoundId,
        scores: app.scores,
        priorityGroup: app.priorityGroup ?? 'none',
        admissionMethod: app.admissionMethod ?? undefined,
      });
      setSelectedUniversityId(app.universityId);
      setSelectedMajorId(app.majorId);
      setSelectedSubjectGroupCode(app.subjectGroupCode);
      setTotalScore(app.totalScore ?? 0);
      setSelectedPriorityGroup(app.priorityGroup ?? 'none');
      setFileList(existingFiles);
    };
    loadForEdit().catch(err => console.error(err));
    if (!editId) {
      setLoadedApplication(null);
      setFileList([]);
    }
    return () => { mounted = false; };
  }, [editId, fetchApplicationById, form]);

  const recalcScore = (allValues: any, method?: string) => {
    const currentMethod = method ?? allValues.admissionMethod;
    const scores = allValues.scores ?? {};
    const pGroup = allValues.priorityGroup ?? selectedPriorityGroup;
    const pScore = getPriorityScore(pGroup);

    if (currentMethod && scores) {
      // Tự động tính điểm quy đổi chứng chỉ cho xét tuyển tài năng
      if (currentMethod === "TALENT_ADMISSION" && scores.certificateType && scores.certificateRawScore != null) {
        scores.certificateConvertedScore = convertCertificateScore(scores.certificateType, scores.certificateRawScore);
      }
      const result = calculateScoreByMethod(currentMethod, scores, pScore);
      setScoreCalcResult(result);
      setTotalScore(result.subjectScore);
    } else {
      const scoreTotal = calculateTotalScore(scores, currentMethod);
      setTotalScore(scoreTotal);
      setScoreCalcResult(null);
    }
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.admissionRoundId) {
      form.setFieldsValue({ admissionMethod: undefined, scores: undefined });
      setSelectedAdmissionMethod(undefined);
      setScoreCalcResult(null);
      setTotalScore(0);
    }

    if (changedValues.admissionMethod) {
      const newMethod = changedValues.admissionMethod;
      setSelectedAdmissionMethod(newMethod);
      setScoreCalcResult(null);
      setTotalScore(0);
      // Nếu phương thức mới không cần tổ hợp → xóa tổ hợp đã chọn
      if (newMethod !== "THPT_SCORE" && newMethod !== "SCHOOL_TRANSCRIPT") {
        setSelectedSubjectGroupCode(undefined);
        form.setFieldsValue({ subjectGroupCode: undefined, scores: undefined });
      } else {
        form.setFieldsValue({ scores: undefined });
      }
      return;
    }

    if (changedValues.universityId) {
      setSelectedUniversityId(changedValues.universityId);
      setSelectedMajorId(undefined);
      setSelectedSubjectGroupCode(undefined);
      form.setFieldsValue({ majorId: undefined, subjectGroupCode: undefined, scores: undefined });
      setTotalScore(0);
      setScoreCalcResult(null);
    }

    if (changedValues.majorId) {
      setSelectedMajorId(changedValues.majorId);
      setSelectedSubjectGroupCode(undefined);
      form.setFieldsValue({ subjectGroupCode: undefined, scores: undefined });
      setTotalScore(0);
      setScoreCalcResult(null);
    }

    if (changedValues.subjectGroupCode) {
      setSelectedSubjectGroupCode(changedValues.subjectGroupCode);
      form.setFieldsValue({ scores: undefined });
      setTotalScore(0);
      setScoreCalcResult(null);
    }

    if (changedValues.priorityGroup) {
      setSelectedPriorityGroup(changedValues.priorityGroup);
    }

    if (changedValues.evidenceCategory) {
      setSelectedEvidenceCategory(changedValues.evidenceCategory);
    }

    recalcScore(allValues);
  };

  const currentPriorityScore = getPriorityScore(selectedPriorityGroup);
  const isDirectAdmission = scoreCalcResult?.isDirectAdmission ?? false;
  const pageLoading = candidateLoading || universitiesLoading || majorsLoading || roundsLoading || applicationsLoading;

  const handleUploadChange = (info: any) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-5);
    setFileList(newFileList);
  };

  const buildSubmissionPayload = (values: any, requireSubjectGroup: boolean) => {
    const method = values.admissionMethod;
    // Chỉ có phương thức xét điểm THPT và Xét học bạ mới yêu cầu tổ hợp môn
    const needsSubjectGroup = requireSubjectGroup &&
      (method === "THPT_SCORE" || method === "SCHOOL_TRANSCRIPT");

    const selectedSubjectGroup = availableSubjectGroups.find(
      (group) => String(group.code) === String(values.subjectGroupCode)
    );

    if (!selectedSubjectGroup?.id && needsSubjectGroup) {
      message.error("Không tìm thấy tổ hợp xét tuyển phù hợp.");
      return null;
    }

    const mockEvidences: EvidenceFile[] = fileList.map(file => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      url: file.originFileObj ? URL.createObjectURL(file.originFileObj as File) : (file.url ?? ""),
      type: file.type === "application/pdf" ? "pdf" : "image",
      category: selectedEvidenceCategory,
      size: file.size || 0,
      uploadedAt: new Date().toISOString()
    }));

    const scores = values.scores ?? {};
    // Tự động điền điểm quy đổi chứng chỉ nếu xét tuyển tài năng
    if (method === "TALENT_ADMISSION" && scores.certificateType && scores.certificateRawScore != null) {
      scores.certificateConvertedScore = convertCertificateScore(scores.certificateType, scores.certificateRawScore);
    }

    const finalTotal = scoreCalcResult?.subjectScore ?? totalScore;
    const finalPriority = scoreCalcResult?.convertedPriorityScore ?? currentPriorityScore;

    return {
      payload: {
        candidateId: Number(candidate?.id),
        universityId: values.universityId ? Number(values.universityId) : undefined,
        majorId: values.majorId ? Number(values.majorId) : undefined,
        admissionRoundId: values.admissionRoundId ? Number(values.admissionRoundId) : undefined,
        subjectGroupId: selectedSubjectGroup?.id ? Number(selectedSubjectGroup.id) : undefined,
        subjectGroupCode: values.subjectGroupCode,
        scores,
        totalScore: finalTotal,
        priorityGroup: selectedPriorityGroup,
        priorityScore: finalPriority,
        admissionMethod: method,
        evidenceFiles: mockEvidences,
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: requireSubjectGroup ? "pending" : "draft",
      },
      selectedSubjectGroup,
      mockEvidences,
    };
  };


  const uploadApplicationFiles = async (applicationId: string) => {
    if (!fileList || fileList.length === 0) return;

    const filesToUpload = fileList.filter((item) => Boolean(item.originFileObj));
    if (filesToUpload.length === 0) return;

    const formData = new FormData();
    filesToUpload.forEach((item) => {
      if (item.originFileObj) {
        formData.append("files", item.originFileObj as File);
      }
    });

    await axiosClient.post(`/applications/${applicationId}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    try {
      await fetchApplicationById(applicationId);
    } catch (err) {
      console.warn("Failed to refresh application after file upload", err);
    }
  };

  const handleSaveDraft = async () => {
    if (!candidate || !currentUser) return;

    const values = form.getFieldsValue(true);
    const built = buildSubmissionPayload(values, false);
    if (!built) return;

    const draftPayload = built.payload;
    let savedDraft;
    if (editId && loadedApplication?.status === "draft") {
      savedDraft = await saveDraftApplication({ ...draftPayload, id: editId });
    } else {
      savedDraft = await saveDraftApplication(draftPayload);
    }

    if (!savedDraft) {
      message.error("Lưu nháp thất bại, vui lòng thử lại.");
      return;
    }

    try {
      await uploadApplicationFiles(savedDraft.id);
    } catch (err) {
      console.error("Failed to upload draft files", err);
      message.warning("Đã lưu nháp nhưng một số file chưa tải lên được.");
    }

    message.success("Đã lưu nháp hồ sơ");
    navigate("/candidate/applications");
  };

  const onFinish = async (values: any) => {
    if (!candidate || !currentUser) return;

    // Kiểm tra hồ sơ trùng lặp
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

    const built = buildSubmissionPayload(values, true);
    if (!built) return;

    const submitPayload = built.payload;
    let createdApplication;
    if (editId && loadedApplication?.status === "draft") {
      createdApplication = await submitDraftApplication(editId, submitPayload);
    } else {
      createdApplication = await createApplication(submitPayload);
    }

    if (!createdApplication) {
      message.error("Nộp hồ sơ thất bại, vui lòng thử lại.");
      return;
    }

    try {
      await uploadApplicationFiles(createdApplication.id);
    } catch (err) {
      console.error("Failed to upload files to server", err);
      message.warning("Hồ sơ đã được tạo nhưng một số file không thể tải lên. Vui lòng thử lại sau.");
    }

    if (editId && loadedApplication?.status !== "draft") {
      try {
        await cancelApplication(editId);
      } catch (err) {
        console.error('Failed to cancel original application after edit', err);
      }
    }

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
        applicationId: createdApplication.id,
        type: "application_submitted",
        channel: "in_app",
        subject: "Bạn đã nộp hồ sơ xét tuyển thành công",
        content: `Mã hồ sơ: ${createdApplication.applicationCode || "Chưa cập nhật"}\nTrường: ${uniName}\nNgành: ${majorName}\nĐợt xét tuyển: ${roundName}`,
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

      {pageLoading && applications.length === 0 ? (
        <Card style={{ marginBottom: 24 }}>
          <LoadingScreen tip="Đang tải dữ liệu nộp hồ sơ..." />
        </Card>
      ) : null}

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
        {pageLoading && applications.length === 0 ? null : !isProfileComplete ? (
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
                  name="admissionMethod"
                  label="Phương thức xét tuyển"
                  rules={[{ required: true, message: "Vui lòng chọn phương thức xét tuyển" }]}
                >
                  <Select placeholder="Chọn phương thức" disabled={!selectedAdmissionRoundId}>
                    {availableAdmissionMethods.map(m => (
                      <Option key={m.value} value={m.value}>{m.label}</Option>
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
              {(selectedAdmissionMethod === "THPT_SCORE" || selectedAdmissionMethod === "SCHOOL_TRANSCRIPT") && (
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
              )}
            </Row>

            
            {selectedAdmissionMethod && (
              <>
                <Divider />
                <h3>3. Nhập điểm xét tuyển</h3>

                
                {(selectedAdmissionMethod === "THPT_SCORE" || selectedAdmissionMethod === "SCHOOL_TRANSCRIPT") && (
                  <>
                    <Alert
                      message={selectedAdmissionMethod === "THPT_SCORE" ? "Điểm thi THPT Quốc gia" : "Điểm trung bình học bạ THPT"}
                      description={
                        selectedAdmissionMethod === "THPT_SCORE"
                          ? "Nhập điểm thi THPT của 3 môn trong tổ hợp (thang 10). ĐXT = Môn1 + Môn2 + Môn3 + Điểm ưu tiên"
                          : "Nhập điểm trung bình học bạ (ĐTB) của 3 môn trong tổ hợp (thang 10). ĐXT = ĐTB Môn1 + ĐTB Môn2 + ĐTB Môn3 + Điểm ưu tiên"
                      }
                      type="info" showIcon style={{ marginBottom: 16 }}
                    />
                    {selectedSubjectGroupCode ? (
                      <Row gutter={16}>
                        {requiredSubjects.map(subject => (
                          <Col xs={24} sm={8} key={subject}>
                            <Form.Item
                              name={["scores", subject]}
                              label={selectedAdmissionMethod === "SCHOOL_TRANSCRIPT" ? `ĐTB ${SUBJECT_NAMES[subject] || subject}` : `Điểm ${SUBJECT_NAMES[subject] || subject}`}
                              rules={[{ required: true, message: `Vui lòng nhập điểm ${SUBJECT_NAMES[subject] || subject}` }]}
                            >
                              <InputNumber min={0} max={10} step={0.25} style={{ width: "100%" }} placeholder="0.00 – 10.00" />
                            </Form.Item>
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <Alert message="Vui lòng chọn tổ hợp xét tuyển trước" type="warning" showIcon style={{ marginBottom: 16 }} />
                    )}
                  </>
                )}

                
                {selectedAdmissionMethod === "COMPETENCY_ASSESSMENT" && (
                  <>
                    <Alert
                      message="Đánh giá năng lực (ĐGNL) – Quy về thang 30"
                      description="ĐXT = Điểm ĐGNL × 30/thang gốc + Điểm ưu tiên. HCM (thang 1200): điểm ÷ 40 → thang 30 | HN (thang 150): điểm ÷ 5 → thang 30"
                      type="info" showIcon style={{ marginBottom: 16 }}
                    />
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name={["scores", "gnlType"]}
                          label="Loại kỳ thi ĐGNL"
                          rules={[{ required: true, message: "Vui lòng chọn loại ĐGNL" }]}
                        >
                          <Radio.Group buttonStyle="solid">
                            <Radio.Button value="hcm">🏙️ ĐHQG TP.HCM (Thang 1200)</Radio.Button>
                            <Radio.Button value="hanoi">🏛️ ĐHQG Hà Nội (Thang 150)</Radio.Button>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name={["scores", "gnlScore"]}
                          label="Điểm thi ĐGNL"
                          rules={[{ required: true, message: "Vui lòng nhập điểm thi ĐGNL" }]}
                        >
                          <InputNumber
                            min={0}
                            max={gnlType === "hanoi" ? 150 : 1200}
                            step={1}
                            style={{ width: "100%" }}
                            placeholder={gnlType === "hanoi" ? "0 – 150" : "0 – 1200"}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                )}

                
                {selectedAdmissionMethod === "THINKING_ASSESSMENT" && (
                  <>
                    <Alert
                      message="Đánh giá tư duy (ĐGTD – Bách Khoa Hà Nội)"
                      description="Thang điểm gốc: 100. Công thức quy đổi: ĐXT = (Điểm × 3/10) + Điểm ưu tiên"
                      type="info" showIcon style={{ marginBottom: 16 }}
                    />
                    <Row gutter={16}>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          name={["scores", "gtdScore"]}
                          label="Điểm thi ĐGTD (thang 100)"
                          rules={[{ required: true, message: "Vui lòng nhập điểm thi ĐGTD" }]}
                        >
                          <InputNumber min={0} max={100} step={0.5} style={{ width: "100%" }} placeholder="0 – 100" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card size="small" style={{ background: "rgba(250,173,20,0.1)", borderColor: "rgba(250,173,20,0.4)", marginTop: 28 }}>
                          <Statistic
                            title={<span style={{ fontSize: 12 }}>Điểm quy đổi (× 3/10)</span>}
                            value={scoreCalcResult?.subjectScore ?? 0}
                            precision={2}
                            suffix="/ 30"
                            valueStyle={{ color: "#faad14" }}
                          />
                        </Card>
                      </Col>
                    </Row>
                  </>
                )}

                
                {selectedAdmissionMethod === "TALENT_ADMISSION" && (
                  <>
                    <Alert
                      message="Xét tuyển tài năng (Kết hợp)"
                      description="ĐXT = Điểm CC quy đổi + ĐTB Môn2 (học bạ) + ĐTB Môn3 (học bạ) + Điểm cộng Giải HSG"
                      type="info" showIcon style={{ marginBottom: 16 }}
                    />
                    <Row gutter={16}>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          name={["scores", "certificateType"]}
                          label="Loại chứng chỉ quốc tế"
                          rules={[{ required: true, message: "Vui lòng chọn loại chứng chỉ" }]}
                        >
                          <Select placeholder="Chọn chứng chỉ">
                            <Select.Option value="IELTS">IELTS</Select.Option>
                            <Select.Option value="TOEFL_IBT">TOEFL iBT</Select.Option>
                            <Select.Option value="SAT">SAT</Select.Option>
                            <Select.Option value="ACT">ACT</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          name={["scores", "certificateRawScore"]}
                          label="Điểm chứng chỉ (gốc)"
                          rules={[{ required: true, message: "Vui lòng nhập điểm chứng chỉ" }]}
                        >
                          <InputNumber min={0} step={0.5} style={{ width: "100%" }} placeholder="VD: 6.5 (IELTS)" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card size="small" style={{ background: "rgba(114,46,209,0.1)", borderColor: "rgba(114,46,209,0.4)", marginTop: 28 }}>
                          <Statistic
                            title={<span style={{ fontSize: 12 }}>Điểm CC quy đổi (thang 10)</span>}
                            value={scoreCalcResult ? convertCertificateScore(
                              form.getFieldValue(["scores", "certificateType"]),
                              form.getFieldValue(["scores", "certificateRawScore"])
                            ) : 0}
                            precision={1}
                            suffix="điểm"
                            valueStyle={{ color: "#722ed1" }}
                          />
                        </Card>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          name={["scores", "subject2Score"]}
                          label="ĐTB Môn 2 (học bạ, thang 10)"
                          rules={[{ required: true, message: "Vui lòng nhập ĐTB môn 2" }]}
                        >
                          <InputNumber min={0} max={10} step={0.1} style={{ width: "100%" }} placeholder="0.0 – 10.0" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          name={["scores", "subject3Score"]}
                          label="ĐTB Môn 3 (học bạ, thang 10)"
                          rules={[{ required: true, message: "Vui lòng nhập ĐTB môn 3" }]}
                        >
                          <InputNumber min={0} max={10} step={0.1} style={{ width: "100%" }} placeholder="0.0 – 10.0" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Form.Item name={["scores", "hsgAward"]} label="Có giải Học sinh giỏi?" valuePropName="checked">
                          <Switch checkedChildren="Có" unCheckedChildren="Không" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item noStyle shouldUpdate={(prev, cur) => prev.scores?.hsgAward !== cur.scores?.hsgAward}>
                      {({ getFieldValue }) =>
                        getFieldValue(["scores", "hsgAward"]) ? (
                          <Row gutter={16}>
                            <Col xs={24} sm={8}>
                              <Form.Item name={["scores", "hsgSubject"]} label="Môn đạt giải HSG" rules={[{ required: true, message: "Vui lòng nhập môn" }]}>
                                <Input placeholder="VD: Toán, Văn, Anh..." />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={8}>
                              <Form.Item name={["scores", "hsgLevel"]} label="Cấp giải" rules={[{ required: true, message: "Chọn cấp giải" }]}>
                                <Select placeholder="Chọn cấp giải">
                                  <Select.Option value="national">🥇 Cấp Quốc gia</Select.Option>
                                  <Select.Option value="provincial">🥈 Cấp Tỉnh/Thành phố</Select.Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={8}>
                              <Form.Item name={["scores", "hsgBonusScore"]} label="Điểm cộng HSG (0–2)" rules={[{ required: true, message: "Nhập điểm cộng" }]}>
                                <InputNumber min={0} max={2} step={0.5} style={{ width: "100%" }} placeholder="0 – 2" />
                              </Form.Item>
                            </Col>
                          </Row>
                        ) : null
                      }
                    </Form.Item>
                  </>
                )}

                
                {selectedAdmissionMethod === "INTERVIEW" && (
                  <>
                    <Alert
                      message="Phỏng vấn / Xét tuyển thẳng"
                      description="Xét tuyển thẳng: Đạt/Không đạt dựa trên điều kiện (giải Quốc gia, trường chuyên...). Phỏng vấn: ĐXT = Điểm hồ sơ (0–15) + Điểm phỏng vấn (0–15) = max 30 điểm"
                      type="info" showIcon style={{ marginBottom: 16 }}
                    />
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name={["scores", "directAdmission"]}
                          label="Hình thức xét"
                          rules={[{ required: true, message: "Vui lòng chọn hình thức" }]}
                        >
                          <Radio.Group buttonStyle="solid">
                            <Radio.Button value="">🎤 Phỏng vấn (tính điểm)</Radio.Button>
                            <Radio.Button value="pass">✅ Xét thẳng – ĐẠT</Radio.Button>
                            <Radio.Button value="fail">❌ Xét thẳng – KHÔNG ĐẠT</Radio.Button>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item noStyle shouldUpdate={(prev, cur) => prev.scores?.directAdmission !== cur.scores?.directAdmission}>
                      {({ getFieldValue }) => {
                        const da = getFieldValue(["scores", "directAdmission"]);
                        if (da === "pass") {
                          return (
                            <Alert
                              message={<><Tag color="success">ĐẠT – Xét tuyển thẳng</Tag> Thí sinh sẽ được xếp vào danh sách trúng tuyển, không cần tính tổng điểm.</>}
                              type="success" showIcon
                            />
                          );
                        }
                        if (da === "fail") {
                          return (
                            <Alert message={<><Tag color="error">KHÔNG ĐẠT</Tag> Thí sinh không đủ điều kiện xét thẳng.</>} type="error" showIcon />
                          );
                        }
                        // Phỏng vấn thường
                        return (
                          <Row gutter={16}>
                            <Col xs={24} sm={8}>
                              <Form.Item
                                name={["scores", "profileScore"]}
                                label="Điểm hồ sơ (học bạ/giải thưởng) – max 15"
                                rules={[{ required: true, message: "Vui lòng nhập điểm hồ sơ" }]}
                              >
                                <InputNumber min={0} max={15} step={0.5} style={{ width: "100%" }} placeholder="0 – 15" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={8}>
                              <Form.Item
                                name={["scores", "interviewScore"]}
                                label="Điểm phỏng vấn trực tiếp – max 15"
                                rules={[{ required: true, message: "Vui lòng nhập điểm phỏng vấn" }]}
                              >
                                <InputNumber min={0} max={15} step={0.5} style={{ width: "100%" }} placeholder="0 – 15" />
                              </Form.Item>
                            </Col>
                          </Row>
                        );
                      }}
                    </Form.Item>
                  </>
                )}

                
                {scoreCalcResult && !isDirectAdmission && (
                  <>
                    <Alert
                      icon={<InfoCircleOutlined />}
                      message={<><strong>Công thức:</strong> {scoreCalcResult.formula}</>}
                      type="info"
                      style={{ marginBottom: 16, marginTop: 16 }}
                      showIcon
                    />
                    <Row gutter={16}>
                      <Col xs={24} sm={8}>
                        <Card size="small" style={{ background: "transparent", borderColor: "var(--border-color)" }}>
                          <Statistic
                            title={<span style={{ color: "var(--text-secondary)" }}>Điểm môn học</span>}
                            value={scoreCalcResult.subjectScore}
                            precision={2}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card size="small" style={{ background: "rgba(0,240,255,0.1)", borderColor: "rgba(0,240,255,0.3)" }}>
                          <Statistic
                            title={<span style={{ color: "var(--text-secondary)" }}>Điểm ưu tiên{selectedAdmissionMethod === "COMPETENCY_ASSESSMENT" ? " (quy đổi)" : ""}</span>}
                            value={scoreCalcResult.convertedPriorityScore}
                            precision={2}
                            valueStyle={{ color: "var(--accent-blue)" }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card size="small" style={{ background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.3)" }}>
                          <Statistic
                            title={<span style={{ color: "var(--text-secondary)" }}>Tổng điểm xét tuyển</span>}
                            value={scoreCalcResult.finalScore}
                            precision={2}
                            valueStyle={{ color: "var(--accent-green)", fontWeight: "bold" }}
                          />
                        </Card>
                      </Col>
                    </Row>
                  </>
                )}

                {isDirectAdmission && (
                  <Alert
                    message="Xét tuyển thẳng – ĐẠT"
                    description="Hồ sơ này sẽ được xếp thẳng vào danh sách trúng tuyển mà không cần tính tổng điểm."
                    type="success"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                )}
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
                beforeUpload={() => false} // Ngăn chặn tự động upload thực tế khi chưa bấm nút gửi
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
              <Space style={{ width: "100%" }}>
                {(!editId || loadedApplication?.status === "draft") && (
                  <Button size="large" onClick={handleSaveDraft} disabled={!isProfileComplete}>
                    Lưu nháp
                  </Button>
                )}
                <Button type="primary" htmlType="submit" size="large" block disabled={!isProfileComplete || activeRounds.length === 0}>
                  Nộp hồ sơ
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};
