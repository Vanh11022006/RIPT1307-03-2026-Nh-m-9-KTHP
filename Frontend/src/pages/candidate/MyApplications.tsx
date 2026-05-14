import React, { useEffect, useMemo, useState } from "react";
import { Card, Table, Input, Select, Button, Row, Col, Modal, Form, InputNumber, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { ApplicationStatusTag } from "../../components/status/ApplicationStatusTag";
import { useAuthStore } from "../../stores/auth.store";
import { useCandidateStore } from "../../stores/candidate.store";
import { useApplicationStore } from "../../stores/application.store";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";
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
  const { majors, getMajors } = useMajorStore();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [form] = Form.useForm();

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
                  form.setFieldsValue({
                    universityId: record.universityId,
                    majorId: record.majorId,
                    subjectGroupCode: record.subjectGroupCode,
                    totalScore: record.totalScore,
                    priorityGroup: record.priorityGroup ?? 'none',
                    priorityScore: record.priorityScore ?? 0,
                    candidateNote: record.candidateNote ?? ''
                  });
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
      const payload: any = {
        candidateId: Number(editingApp.candidateId),
        majorId: Number(values.majorId),
        admissionRoundId: values.admissionRoundId ? Number(values.admissionRoundId) : undefined,
        subjectGroupId: undefined, // subject group id mapping not available here; keep subjectGroupCode
        subjectGroupId: values.subjectGroupId,
        totalScore: Number(values.totalScore || 0),
        priorityGroup: values.priorityGroup,
        priorityScore: Number(values.priorityScore || 0),
      };

      await appStore.updateApplication(editingApp.id, payload);
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
              title="Chỉnh sửa hồ sơ"
              open={isEditModalOpen}
              onOk={handleEditSave}
              onCancel={() => { setIsEditModalOpen(false); setEditingApp(null); }}
              okText="Lưu"
            >
              <Form form={form} layout="vertical">
                <Form.Item label="Trường" name="universityId">
                  <Select>
                    {Array.isArray(universities) && universities.map(u => <Option key={u.id} value={u.id}>{u.name}</Option>)}
                  </Select>
                </Form.Item>
                <Form.Item label="Ngành" name="majorId">
                  <Select>
                    {Array.isArray(majors) && majors.map(m => <Option key={m.id} value={m.id}>{m.name}</Option>)}
                  </Select>
                </Form.Item>
                <Form.Item label="Tổ hợp" name="subjectGroupCode">
                  <Input />
                </Form.Item>
                <Form.Item label="Tổng điểm thi" name="totalScore">
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="Đối tượng ưu tiên" name="priorityGroup">
                  <Select>
                    {Object.entries(PRIORITY_GROUPS).map(([code, cfg]) => (
                      <Option key={code} value={code}>{(cfg as any).label}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Điểm ưu tiên" name="priorityScore">
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="Ghi chú thí sinh" name="candidateNote">
                  <Input.TextArea rows={3} />
                </Form.Item>
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
