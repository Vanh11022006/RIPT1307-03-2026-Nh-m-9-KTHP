import React, { useEffect, useMemo, useState, useRef } from "react";
import { Card, Table, Input, Select, Button, Row, Col, Modal, Form, InputNumber, message, Upload, Divider } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { ApplicationStatusTag } from "../../components/status/ApplicationStatusTag";
import { useAuthStore } from "../../stores/auth.store";
import { useCandidateStore } from "../../stores/candidate.store";
import { useNotificationLogStore } from "../../stores/notificationLog.store";
import { useApplicationStore } from "../../stores/application.store";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";
import { useSubjectGroupStore } from "../../stores/subjectGroup.store";
import { PRIORITY_GROUPS, getPriorityScore } from "../../constants/priorityGroups";
import type { Application } from "../../types/application.types";
import { formatDate } from "../../utils/date";

const { Option } = Select;

export const MyApplications: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { getCandidateByUserId } = useCandidateStore();
  const { createNotificationLog } = useNotificationLogStore();
  const { getApplicationsByCandidateId } = useApplicationStore();
  const { universities, getUniversities } = useUniversityStore();
  const { majors, getMajors } = useMajorStore();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [form] = Form.useForm();
  const [editTotal, setEditTotal] = useState<string>("0.00");
  const [selectedSubjectGroup, setSelectedSubjectGroup] = useState<string | undefined>(undefined);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const originalValuesRef = useRef<any>(null);

  const normalizeSnapshot = (v: any) => ({
    majorId: v?.majorId ?? null,
    subjectGroupCode: v?.subjectGroupCode ?? null,
    info1: Number(v?.info1 ?? 0),
    info2: Number(v?.info2 ?? 0),
    info3: Number(v?.info3 ?? 0),
    priorityGroup: v?.priorityGroup ?? null,
    priorityScore: Number(v?.priorityScore ?? 0),
    candidateNote: v?.candidateNote ?? ''
  });
  const { subjectGroups } = useSubjectGroupStore();
  const availableMajors = useMemo(() => {
    const uniId = form.getFieldValue('universityId') ?? (editingApp ? String(editingApp.universityId) : undefined);
    if (!uniId) return majors;
    return majors.filter(m => String(m.universityId) === String(uniId));
  }, [majors, editingApp, form]);

  const SUBJECT_NAMES: Record<string, string> = {
    math: "Toán",
    literature: "Ngữ văn",
    english: "Tiếng Anh",
    physics: "Vật lý",
    chemistry: "Hóa học",
    biology: "Sinh học",
    history: "Lịch sử",
    geography: "Địa lý",
    civicEducation: "Giáo dục công dân"
  };

  const subjectFields = useMemo(() => {
    const code = selectedSubjectGroup ?? (editingApp ? editingApp.subjectGroupCode : undefined);
    if (!code) return [];
    const sg = Array.isArray(subjectGroups) ? subjectGroups.find(s => s.code === code) : undefined;
    const subs = Array.isArray(sg?.subjects) ? sg.subjects : [];
    // limit to 3 fields used by the form
    return subs.slice(0, 3);
  }, [subjectGroups, selectedSubjectGroup, editingApp]);

  const candidate = currentUser ? getCandidateByUserId(currentUser.id) : null;

  useEffect(() => {
    let mounted = true;

    const loadApplications = async () => {
      if (!candidate?.id) {
        if (mounted) setApplications([]);
        return;
      }

      // ensure reference data loaded
      await Promise.all([getUniversities(), getMajors()]);

      setLoading(true);
      const data = await getApplicationsByCandidateId(candidate.id);

      if (mounted) {
        setApplications(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    };

    loadApplications().catch((error) => {
      console.error("Failed to load my applications", error);
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [candidate?.id, getApplicationsByCandidateId]);

  const getUniversityName = (id: string) => {
    return universities.find(u => u.id === id)?.name || "N/A";
  };

  const getMajorName = (id: string) => {
    return majors.find(m => m.id === id)?.name || "N/A";
  };

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      if (statusFilter !== "all" && app.status !== statusFilter) {
        return false;
      }
      
      if (searchText) {
        const lowerSearch = searchText.toLowerCase();
        const uniName = getUniversityName(app.universityId).toLowerCase();
        const majorName = getMajorName(app.majorId).toLowerCase();
        const codeMatch = app.applicationCode.toLowerCase().includes(lowerSearch);
        
        if (!codeMatch && !uniName.includes(lowerSearch) && !majorName.includes(lowerSearch)) {
          return false;
        }
      }
      
      return true;
    });
  }, [applications, searchText, statusFilter]);

  const appStore = useApplicationStore.getState();

  const columns = [
    {
      title: "Mã hồ sơ",
      dataIndex: "applicationCode",
      key: "applicationCode",
      render: (text: string) => <strong>{text}</strong>
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
      title: "Tổ hợp",
      dataIndex: "subjectGroupCode",
      key: "subjectGroupCode",
      align: "center" as const
    },
    {
      title: "Tổng điểm",
      dataIndex: "totalScore",
      key: "totalScore",
      align: "center" as const,
      render: (val: number, record: Application) => {
        const final = record.finalScore ?? (Number(val ?? 0) + Number(record.priorityScore ?? 0));
        return <span style={{ fontWeight: 700 }}>{(final ?? 0).toFixed(2)}</span>;
      }
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
      render: (_: any, record: any) => {
        const isPending = record.status === "pending";
        return (
          <div>
            <Button type="link" onClick={() => navigate(`/candidate/applications/${record.id}`)}>Xem chi tiết</Button>
            {isPending && (
              <>
                <Button type="link" onClick={() => {
                  setEditingApp(record);
                      setSelectedSubjectGroup(record.subjectGroupCode);
                  const initialPriorityGroup = record.priorityGroup ?? 'none';
                  const initialPriorityScore = getPriorityScore(initialPriorityGroup);

                  // determine subject fields for this application's subject group
                  const sg = Array.isArray(subjectGroups) ? subjectGroups.find(s => s.code === record.subjectGroupCode) : undefined;
                  const subs = Array.isArray(sg?.subjects) ? sg.subjects.slice(0, 3) : [];

                  // populate info1..info3 from record.scores if available
                  const scores = record.scores ?? {};
                  const infoValues: any = {};
                  let subjectSum = 0;

                  // try to map by subject key first
                  for (let i = 0; i < 3; i++) {
                    const key = `info${i + 1}`;
                    const subjectKey = subs[i];
                    const v = subjectKey && scores && scores[subjectKey] !== undefined ? Number(scores[subjectKey]) : undefined;
                    infoValues[key] = v;
                    if (v !== undefined && !Number.isNaN(v)) subjectSum += Number(v);
                  }

                  // if none matched by key, try to pick numeric values from scores object in order
                  const hasAny = [infoValues.info1, infoValues.info2, infoValues.info3].some(v => v !== undefined);
                  if (!hasAny) {
                    const numericValues = Object.values(scores).map((x: any) => Number(x)).filter(n => !Number.isNaN(n));
                    for (let i = 0; i < 3; i++) {
                      const key = `info${i + 1}`;
                      const v = numericValues[i] !== undefined ? numericValues[i] : undefined;
                      infoValues[key] = v;
                      if (v !== undefined) subjectSum += Number(v);
                    }
                  }

                  // no fallback to totalScore: prefer showing individual subject scores only

                  form.setFieldsValue({
                    universityId: record.universityId,
                    majorId: record.majorId,
                    subjectGroupCode: record.subjectGroupCode,
                    priorityGroup: initialPriorityGroup,
                    priorityScore: initialPriorityScore,
                    candidateNote: record.candidateNote ?? '',
                    ...infoValues,
                    scores: record.scores ?? {}
                  });

                  // snapshot the initial values so we can detect user edits
                  const initialSnapshot = normalizeSnapshot({
                    majorId: record.majorId,
                    subjectGroupCode: record.subjectGroupCode,
                    info1: infoValues.info1,
                    info2: infoValues.info2,
                    info3: infoValues.info3,
                    priorityGroup: initialPriorityGroup,
                    priorityScore: initialPriorityScore,
                    candidateNote: record.candidateNote ?? ''
                  });
                  originalValuesRef.current = initialSnapshot;
                  setIsFormDirty(false);

                  setEditTotal((subjectSum + initialPriorityScore).toFixed(2));
                  setIsEditModalOpen(true);
                }}>Sửa</Button>
                <Button type="link" danger onClick={async () => {
                  if (!window.confirm('Bạn có chắc muốn xóa hồ sơ này? Hành động này không thể hoàn tác.')) return;
                  try {
                    await appStore.deleteApplication(record.id);
                    const candidateId = record.candidateId;
                    const apps = await appStore.getApplicationsByCandidateId(candidateId);
                    setApplications(apps);
                    try {
                      // create in-app notification for deletion
                      createNotificationLog({
                        recipientUserId: currentUser?.id ?? '',
                        recipientEmail: candidate?.email || currentUser?.email || '',
                        recipientName: candidate?.fullName || currentUser?.fullName || '',
                        applicationId: record.id,
                        type: 'system',
                        channel: 'in_app',
                        subject: 'Bạn đã xóa hồ sơ',
                        content: `Mã hồ sơ: ${record.applicationCode || ''}`
                      });
                    } catch (e) {
                      console.error('Failed to create deletion notification', e);
                    }
                    message.success('Xóa hồ sơ thành công');
                  } catch (e) {
                    console.error(e);
                    message.error('Xóa hồ sơ thất bại');
                  }
                }}>Xóa</Button>
              </>
            )}
          </div>
        );
      }
    }
  ];

  const handleEditSave = async () => {
    try {
      if (!isFormDirty) {
        message.info('Không có thay đổi để lưu');
        return;
      }
      const values = await form.validateFields();
      if (!editingApp) return;
      // build scores object based on current subjectFields mapping
      const scoresPayload: any = { ...(editingApp.scores ?? {}) };
      if (Array.isArray(subjectFields) && subjectFields.length > 0) {
        subjectFields.forEach((sub, idx) => {
          const val = values[`info${idx + 1}`];
          if (val !== undefined) scoresPayload[sub] = Number(val);
        });
      } else {
        // fallback to write info1..info3 into generic numeric slots if needed
        if (values.info1 !== undefined) scoresPayload.math = Number(values.info1);
        if (values.info2 !== undefined) scoresPayload.literature = Number(values.info2);
        if (values.info3 !== undefined) scoresPayload.english = Number(values.info3);
      }

      const totalExam = Object.values(scoresPayload).reduce<number>((acc, v) => acc + Number(v || 0), 0);

      const payload: any = {
        candidateId: Number(editingApp.candidateId),
        majorId: Number(values.majorId),
        admissionRoundId: values.admissionRoundId ? Number(values.admissionRoundId) : undefined,
        subjectGroupCode: values.subjectGroupCode,
        scores: scoresPayload,
        totalScore: totalExam,
        priorityGroup: values.priorityGroup,
        priorityScore: Number(values.priorityScore || 0),
      };

      await appStore.updateApplication(editingApp.id, payload);
      const apps = await appStore.getApplicationsByCandidateId(editingApp.candidateId);
      setApplications(apps);
      setIsEditModalOpen(false);
      setEditingApp(null);
      originalValuesRef.current = null;
      setIsFormDirty(false);
      try {
        // create in-app notification for update
        createNotificationLog({
          recipientUserId: currentUser?.id ?? '',
          recipientEmail: candidate?.email || currentUser?.email || '',
          recipientName: candidate?.fullName || currentUser?.fullName || '',
          applicationId: editingApp.id,
          type: 'system',
          channel: 'in_app',
          subject: 'Bạn đã cập nhật hồ sơ',
          content: `Mã hồ sơ: ${editingApp.applicationCode || ''}`
        });
      } catch (e) {
        console.error('Failed to create update notification', e);
      }
      message.success('Cập nhật hồ sơ thành công');
    } catch (err) {
      console.error(err);
      message.error('Cập nhật hồ sơ thất bại');
    }
  };

  return (
    <div>
      <PageHeader 
        title="Hồ sơ của tôi" 
        extra={
          <Button type="primary" onClick={() => navigate("/candidate/apply")}>
            Nộp hồ sơ mới
          </Button>
        }
      />
      
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={16}>
            <Input
              placeholder="Tìm kiếm theo mã hồ sơ, tên trường, tên ngành..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8}>
            <Select
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={value => setStatusFilter(value)}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="pending">Chờ duyệt</Option>
              <Option value="approved">Đã duyệt</Option>
              <Option value="rejected">Từ chối</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        {applications.length > 0 ? (
          <>
            <Table
              columns={columns}
              dataSource={filteredApplications}
              rowKey="id"
              loading={loading}
              scroll={{ x: true }}
            />
            <Modal
              className="light-modal"
              open={isEditModalOpen}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingApp(null);
                originalValuesRef.current = null;
                setIsFormDirty(false);
                form.resetFields();
              }}
              footer={null}
              width={800}
            >
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 22, fontWeight: 700 }}>Cập nhật hồ sơ</div>
                <div style={{ color: '#6b7280', marginTop: 6 }}>Vui lòng điền đầy đủ các thông tin cần thiết bên dưới để cập nhật hệ thống.</div>
              </div>
              <Form form={form} layout="vertical" onValuesChange={(changed, all) => {
                // if priorityGroup changed, auto-fill priorityScore from mapping
                if (changed && changed.priorityGroup !== undefined) {
                  const code = changed.priorityGroup;
                  const score = getPriorityScore(code);
                  form.setFieldsValue({ priorityScore: score });
                  all.priorityScore = score;
                }

                // when major changes, select the first subject group for that major (if any)
                if (changed && changed.majorId !== undefined) {
                  const major = Array.isArray(majors) ? majors.find(m => m.id === changed.majorId) : undefined;
                  const codes = Array.isArray(major?.subjectGroupCodes) ? major.subjectGroupCodes : [];
                  const firstCode = codes.length > 0 ? codes[0] : undefined;
                  if (firstCode) {
                    form.setFieldsValue({ subjectGroupCode: firstCode });
                    all.subjectGroupCode = firstCode;
                    setSelectedSubjectGroup(firstCode);
                  } else {
                    form.setFieldsValue({ subjectGroupCode: undefined });
                    all.subjectGroupCode = undefined;
                    setSelectedSubjectGroup(undefined);
                  }
                  // clear subject scores when major changes
                  form.setFieldsValue({ info1: undefined, info2: undefined, info3: undefined });
                }

                // when subject group changes, clear subject scores
                if (changed && changed.subjectGroupCode !== undefined) {
                  form.setFieldsValue({ info1: undefined, info2: undefined, info3: undefined });
                  setSelectedSubjectGroup(changed.subjectGroupCode);
                }

                // compute sum of subject info fields dynamically based on selected subject fields
                const subjectSum = (subjectFields && subjectFields.length > 0)
                  ? subjectFields.reduce((acc, _, idx) => acc + Number(all[`info${idx + 1}`] || 0), 0)
                  : (Number(all?.info1 || 0) + Number(all?.info2 || 0) + Number(all?.info3 || 0));

                const add = Number(all?.priorityScore || 0);
                setEditTotal((subjectSum + add).toFixed(2));

                // determine if form values differ from original snapshot
                try {
                  const cur = form.getFieldsValue();
                  const curNorm = normalizeSnapshot(cur);
                  const origNorm = normalizeSnapshot(originalValuesRef.current ?? {});
                  const dirty = JSON.stringify(curNorm) !== JSON.stringify(origNorm);
                  setIsFormDirty(Boolean(dirty));
                } catch (e) {
                  setIsFormDirty(true);
                }
              }}>
                <Row gutter={24}>
                  <Col span={24}>
                    <Form.Item label={"Ngành đào tạo"} name="majorId" rules={[{ required: true, message: 'Vui lòng chọn ngành' }]}>
                      <Select placeholder="Chọn ngành">
                        {Array.isArray(availableMajors) && availableMajors.map(m => <Option key={m.id} value={m.id}>{m.name}</Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col span={24}>
                    <Form.Item name="subjectGroupCode" label="Tổ hợp">
                      <Select placeholder="Chọn tổ hợp">
                        {(() => {
                          const majorId = form.getFieldValue('majorId') ?? (editingApp ? editingApp.majorId : undefined);
                          const major = Array.isArray(majors) ? majors.find(m => m.id === majorId) : undefined;
                          const codes = Array.isArray(major?.subjectGroupCodes) ? major.subjectGroupCodes : [];
                          // fallback: show all subject groups
                          const options = codes.length > 0 ? subjectGroups.filter(sg => codes.includes(sg.code || '')) : subjectGroups;
                          return options.map(sg => <Select.Option key={sg.code} value={sg.code}>{sg.code} - {sg.name}</Select.Option>);
                        })()}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  {subjectFields.length > 0 ? (
                    subjectFields.map((sub, idx) => (
                      <Col xs={24} sm={8} key={sub + idx}>
                        <Form.Item name={`info${idx + 1}`} label={SUBJECT_NAMES[sub] || sub}>
                          <InputNumber
                            className="score-input"
                            min={0}
                            max={10}
                            step={0.01}
                            style={{ width: '100%' }}
                            placeholder={`Nhập điểm ${SUBJECT_NAMES[sub] || sub}...`}
                            onBlur={() => {
                              const field = `info${idx + 1}`;
                              const v = Number(form.getFieldValue(field) || 0);
                              if (v > 10) form.setFieldsValue({ [field]: 10 });
                            }}
                          />
                        </Form.Item>
                      </Col>
                    ))
                  ) : (
                    // default to three inputs if no subject group selected
                    [1,2,3].map(i => (
                      <Col xs={24} sm={8} key={i}>
                        <Form.Item name={`info${i}`} label={i === 1 ? "Toán" : i === 2 ? "Ngữ Văn" : "Tiếng Anh"}>
                          <InputNumber
                            className="score-input"
                            min={0}
                            max={10}
                            step={0.01}
                            style={{ width: '100%' }}
                            placeholder={i === 1 ? "Nhập điểm Toán..." : i === 2 ? "Nhập điểm Ngữ Văn..." : "Nhập điểm Tiếng Anh..."}
                            onBlur={() => {
                              const field = `info${i}`;
                              const v = Number(form.getFieldValue(field) || 0);
                              if (v > 10) form.setFieldsValue({ [field]: 10 });
                            }}
                          />
                        </Form.Item>
                      </Col>
                    ))
                  )}
                </Row>

                <Row gutter={16} align="middle">
                  <Col xs={24} sm={12} md={10}>
                    <Form.Item name="priorityGroup" label="Đối tượng ưu tiên">
                      <Select placeholder="Đối tượng ưu tiên">
                        {Object.entries(PRIORITY_GROUPS).map(([code, cfg]) => (
                          <Option key={code} value={code}>{(cfg as any).label}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={6} md={6}>
                    <Form.Item name="priorityScore" label="Hệ số">
                      <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row>
                  <Col span={24} style={{ textAlign: 'right', marginTop: 8 }}>
                    <div style={{ fontSize: 14, color: '#000', fontWeight: 600 }}>Tổng cộng</div>
                    <div style={{ fontSize: 28, color: '#d33', fontWeight: 800, marginTop: 4 }}>{editTotal}</div>
                  </Col>
                </Row>

                <Divider />
                <Row>
                  <Col span={24}>
                    <Upload beforeUpload={() => false} maxCount={1}>
                      <Button type="default" icon={<UploadOutlined />}>Chọn file</Button>
                    </Upload>
                    <div style={{ color: '#6b7280', marginTop: 6 }}>Hỗ trợ định dạng PDF, JPG, PNG (Tối đa 5MB)</div>
                  </Col>
                </Row>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
                  <Button className="modal-cancel-btn" onClick={() => { setIsEditModalOpen(false); setEditingApp(null); originalValuesRef.current = null; setIsFormDirty(false); form.resetFields(); }}>Hủy</Button>
                  <Button type="primary" onClick={handleEditSave} disabled={!isFormDirty}>Lưu</Button>
                </div>
              </Form>
            </Modal>
          </>
        ) : (
          <EmptyState 
            description="Bạn chưa nộp hồ sơ nào" 
            actionText="Nộp hồ sơ ngay"
            onAction={() => navigate("/candidate/apply")}
          />
        )}
      </Card>
    </div>
  );
};
