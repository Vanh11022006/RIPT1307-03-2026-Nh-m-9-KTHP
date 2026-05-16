import React, { useEffect, useMemo, useState } from "react";
import { Card, Table, Input, Select, Button, Row, Col, Modal, Form, InputNumber, message, Upload } from "antd";
import { SearchOutlined, PaperClipOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { ApplicationStatusTag } from "../../components/status/ApplicationStatusTag";
import { useAuthStore } from "../../stores/auth.store";
import { useCandidateStore } from "../../stores/candidate.store";
import { useApplicationStore } from "../../stores/application.store";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";
import { useSubjectGroupStore } from "../../stores/subjectGroup.store";
import { getPriorityScore } from "../../constants/priorityGroups";
import { PRIORITY_GROUPS } from "../../constants/priorityGroups";
import type { Application } from "../../types/application.types";
import { formatDate } from "../../utils/date";

const { Option } = Select;

export const MyApplications: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { getCandidateByUserId } = useCandidateStore();
  const { getApplicationsByCandidateId } = useApplicationStore();
  const { universities, getUniversities } = useUniversityStore();
  const { majors, getMajors, getActiveMajorsByUniversityId, getMajorById } = useMajorStore();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [form] = Form.useForm();
  const [availableMajors, setAvailableMajors] = useState<any[]>([]);
  const [subjectFields, setSubjectFields] = useState<string[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [computedTotal, setComputedTotal] = useState<number>(0);

  const candidate = useMemo(() => {
    if (!currentUser) return null;
    return getCandidateByUserId(currentUser.id);
  }, [currentUser, getCandidateByUserId]);

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

  const { subjectGroups } = useSubjectGroupStore();

  useEffect(() => {
    // when opening edit modal, prepare dependent lists and subject inputs
    if (isEditModalOpen && editingApp) {
      const uniId = editingApp.universityId;
      const majorsForUni = getActiveMajorsByUniversityId(uniId);
      setAvailableMajors(majorsForUni);

      // find subject group code: prefer application.subjectGroupCode or derive from major
      const sgCode = editingApp.subjectGroupCode;
      let sg = subjectGroups.find(s => s.code === sgCode) || subjectGroups.find(s => s.name === sgCode);
      if (!sg) {
        // try major's subjectGroupCodes
        try {
          const majorObj = getMajorById ? getMajorById(editingApp.majorId) : null;
          if (majorObj && Array.isArray(majorObj.subjectGroupCodes) && majorObj.subjectGroupCodes.length > 0) {
            const found = subjectGroups.find(sgItem => sgItem.code && majorObj.subjectGroupCodes.includes(String(sgItem.code)));
            if (found) sg = found;
          }
        } catch (e) {
          // ignore
        }
      }

      const subjects = sg ? sg.subjects.slice(0, 3) : ["subject1", "subject2", "subject3"];
      // debug: log resolved subjects (development only)
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug('Resolved subject fields for edit modal:', subjects, 'sg:', sg?.code ?? sg);
      }
      setSubjectFields(subjects);

      // populate form nested scores if present
      const initialScores: Record<string, any> = (editingApp.scores ?? {});
      const scoreValues: Record<string, number | null> = {};
      subjects.forEach((sub) => {
        const key = String(sub);
        scoreValues[key] = (initialScores as Record<string, any>)[key] ?? null;
      });
      form.setFieldsValue({ scores: scoreValues });

      // compute initial total (scores + priorityScore)
      try {
        const sumInitial = Object.values(scoreValues).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);
        const initialPriority = Number(editingApp.priorityScore ?? form.getFieldValue('priorityScore') ?? 0);
        setComputedTotal(Number((sumInitial + (isNaN(initialPriority) ? 0 : initialPriority)).toFixed(2)));
      } catch (e) {
        setComputedTotal(0);
      }

      // set initial file list from application evidenceFiles if any
      const evidences = Array.isArray(editingApp.evidenceFiles) ? editingApp.evidenceFiles : [];
      setFileList(evidences.map((f) => ({ uid: f.id, name: f.name, status: 'done', url: f.url })));
    }
  }, [isEditModalOpen, editingApp, subjectGroups, getActiveMajorsByUniversityId, getMajorById, form]);

  // compute total when scores or priorityScore change in the form
  // computedTotal is updated by Form.onValuesChange

  const getUniversityName = (id: string) => {
    return universities.find(u => u.id === id)?.name || "N/A";
  };

  const getMajorName = (id: string) => {
    return majors.find(m => m.id === id)?.name || "N/A";
  };

  const subjectNames: Record<string, string> = {
    math: "Toán",
    physics: "Vật lý",
    chemistry: "Hóa",
    literature: "Ngữ văn",
    english: "Tiếng Anh",
    biology: "Sinh",
    history: "Lịch sử",
    geography: "Địa lý",
    civicEducation: "GDCD",
  };

  const getSubjectLabel = (sub: any, idx: number) => {
    if (!sub) return `Môn ${idx + 1}`;
    // If it's already Vietnamese (contains non-ascii letters like â, ơ, ư, ă, đ), return as-is
    if (typeof sub === 'string' && /[\u00C0-\u017F\u0100-\u017F\u00E0-\u017F\u00F1-\u017F\u1EA0-\u1EF9\u0110\u0111]/.test(sub)) {
      return sub;
    }
    const key = String(sub).toLowerCase().replace(/[^a-z]/g, '');
    if (subjectNames[key]) return subjectNames[key];

    // common code variations
    const mapping: Record<string, string> = {
      math: 'Toán',
      toan: 'Toán',
      physics: 'Vật lý',
      vatly: 'Vật lý',
      chemistry: 'Hóa',
      hoa: 'Hóa',
      literature: 'Ngữ văn',
      van: 'Ngữ văn',
      english: 'Tiếng Anh',
      tienganh: 'Tiếng Anh',
      biology: 'Sinh',
      sinh: 'Sinh',
      history: 'Lịch sử',
      lichsu: 'Lịch sử',
      geography: 'Địa lý',
      dialy: 'Địa lý',
      gdcd: 'GDCD',
      civiceducation: 'GDCD'
    };

    if (mapping[key]) return mapping[key];

    // If looks like a subject code (A00, B00) fallback to Môn X
    if (/^[A-Z0-9]+$/i.test(String(sub))) return `Môn ${idx + 1}`;

    // last resort: return original string capitalized
    if (typeof sub === 'string') return sub.charAt(0).toUpperCase() + sub.slice(1);
    return `Môn ${idx + 1}`;
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
                  form.setFieldsValue({
                    universityId: record.universityId,
                    majorId: record.majorId,
                    subjectGroupCode: record.subjectGroupCode,
                    totalScore: record.totalScore,
                    priorityGroup: record.priorityGroup ?? 'none',
                    priorityScore: record.priorityScore ?? 0
                  });
                      // prepare available majors for this university
                      try {
                        const majorsForUni = getActiveMajorsByUniversityId(record.universityId);
                        setAvailableMajors(majorsForUni);
                      } catch (err) {
                        setAvailableMajors([]);
                      }
                  setIsEditModalOpen(true);
                }}>Sửa</Button>
                <Button type="link" danger onClick={async () => {
                  if (!window.confirm('Bạn có chắc muốn xóa hồ sơ này? Hành động này không thể hoàn tác.')) return;
                  try {
                    await appStore.deleteApplication(record.id);
                    const candidateId = record.candidateId;
                    const apps = await appStore.getApplicationsByCandidateId(candidateId);
                    setApplications(apps);
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
      const values = await form.validateFields();
      if (!editingApp) return;
      // compute total score from per-subject inputs if provided
      const scores = values.scores ?? {};
      const totalFromParts = Object.values(scores).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);
      const payload: any = {
        candidateId: Number(editingApp.candidateId),
        majorId: Number(values.majorId),
        admissionRoundId: values.admissionRoundId ? Number(values.admissionRoundId) : undefined,
        subjectGroupCode: values.subjectGroupCode,
        totalScore: Number(totalFromParts || values.totalScore || 0),
        priorityGroup: values.priorityGroup,
        priorityScore: Number(values.priorityScore || 0),
        scores: scores,
        evidenceFiles: fileList.map(f => ({ id: f.uid, name: f.name, url: f.url || '#' }))
      };

      await appStore.updateApplication(editingApp.id, payload);
      // refresh list
      const apps = await appStore.getApplicationsByCandidateId(editingApp.candidateId);
      setApplications(apps);
      setIsEditModalOpen(false);
      setEditingApp(null);
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
              title={<div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 18, fontWeight: 700 }}>Cập nhật hồ sơ</span>
                <span style={{ fontSize: 11, color: '#6b7280', marginTop: 6 }}>Vui lòng điền đầy đủ thông tin cần thiết bên dưới để cập nhật hồ sơ</span>
              </div>}
              open={isEditModalOpen}
              onCancel={() => { setIsEditModalOpen(false); setEditingApp(null); }}
              width={960}
              bodyStyle={{ padding: 32, borderRadius: 12 }}
              className="edit-application-modal"
              destroyOnClose
              centered
              footer={(
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div />
                  <div>
                    <Button style={{ marginRight: 12 }} onClick={() => { setIsEditModalOpen(false); setEditingApp(null); }}>Hủy</Button>
                    <Button type="primary" onClick={handleEditSave} style={{ borderRadius: 24, background: '#00bfff', borderColor: '#00bfff' }}>Lưu</Button>
                  </div>
                </div>
              )}
            >
                <Form form={form} layout="vertical" onValuesChange={(_, allValues) => {
                  const scores = (allValues?.scores) ?? {};
                  const sum = Object.values(scores).reduce((acc: number, v: any) => {
                    const n = Number(v);
                    return acc + (isNaN(n) ? 0 : n);
                  }, 0);
                  const priority = Number(allValues?.priorityScore ?? 0);
                  const p = isNaN(priority) ? 0 : priority;
                  setComputedTotal(Number((sum + p).toFixed(2)));
                }}>
                <Row gutter={24}>
                  <Col xs={24} sm={16}>
                    <Form.Item label="Ngành đào tạo" name="majorId" rules={[{ required: true, message: 'Vui lòng chọn ngành' }]}>
                      <Select placeholder="Chọn ngành">
                        {Array.isArray(availableMajors) && availableMajors.map(m => <Option key={m.id} value={m.id}>{m.name}</Option>)}
                      </Select>
                    </Form.Item>

                    <Row gutter={12} style={{ marginBottom: 12 }}>
                      {subjectFields.map((sub, idx) => (
                        <Col xs={24} sm={8} key={sub}>
                          <Form.Item label={getSubjectLabel(sub, idx)} name={["scores", sub]}>
                            <InputNumber min={0} step={0.01} placeholder="Nhập dữ liệu..." style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                      ))}
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Đối tượng ưu tiên" name="priorityGroup">
                          <Select placeholder="Chọn đối tượng ưu tiên" onChange={(val) => {
                            const score = getPriorityScore(val as string) || 0;
                            form.setFieldsValue({ priorityScore: score });
                            // update computed total immediately in case setFieldsValue doesn't trigger onValuesChange
                            const currentScores = form.getFieldValue('scores') ?? {};
                            const sumNow = Object.values(currentScores).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);
                            setComputedTotal(Number((sumNow + Number(score)).toFixed(2)));
                          }}>
                            {Object.entries(PRIORITY_GROUPS).map(([code, cfg]) => (
                              <Option key={code} value={code}>{(cfg as any).label}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item label="Hệ số" name="priorityScore">
                          <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item>
                      <Upload
                        fileList={fileList}
                        onChange={({ fileList: newList }) => setFileList(newList)}
                        beforeUpload={() => false}
                        multiple
                      >
                        <a><PaperClipOutlined style={{ marginRight: 8 }} />Chọn file</a>
                      </Upload>
                      <div style={{ marginTop: 12, color: '#6b7280' }}>Hỗ trợ định dạng PDF, JPG, PNG (Tối đa 5MB)</div>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={8} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', paddingBottom: 8 }}>
                    <div className="total-block">
                      <div className="total-label">Tổng cộng</div>
                      <div className="total-value">{computedTotal.toFixed(2)}</div>
                    </div>
                  </Col>
                </Row>
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
