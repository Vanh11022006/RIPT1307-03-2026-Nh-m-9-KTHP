import React, { useState, useMemo, useEffect, useRef } from "react";
import { Card, Table, Input, Select, Row, Col, Typography, Button, Space, Modal, message } from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { ApplicationStatusTag } from "../../components/status/ApplicationStatusTag";
import { useApplicationStore } from "../../stores/application.store";
import { useCandidateStore } from "../../stores/candidate.store";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";
import { useAdmissionRoundStore } from "../../stores/admissionRound.store";
import { useSubjectGroupStore } from "../../stores/subjectGroup.store";
import { useAuthStore } from "../../stores/auth.store";
import type { Application } from "../../types/application.types";
import { formatDateTime } from "../../utils/date";
import { loadApplicationManagementData } from "../../utils/dataLoader";

const { Option } = Select;

export const ApplicationManagement: React.FC = () => {
  const navigate = useNavigate();
  
  const { applications, loading, getApplications, bulkUpdateApplicationStatus, getAdminApplicationsExcel } = useApplicationStore();
  const { getCandidateById } = useCandidateStore();
  const { universities, getUniversityById } = useUniversityStore();
  const { majors, getMajorById } = useMajorStore();
  const { admissionRounds, getAdmissionRoundById } = useAdmissionRoundStore();
  const { subjectGroups } = useSubjectGroupStore();
  const { currentUser } = useAuthStore();

  const safeApplications = Array.isArray(applications) ? applications : [];
  const safeUniversities = Array.isArray(universities) ? universities : [];
  const safeMajors = Array.isArray(majors) ? majors : [];
  const safeSubjectGroups = Array.isArray(subjectGroups) ? subjectGroups : [];
  const safeAdmissionRounds = Array.isArray(admissionRounds) ? admissionRounds : [];

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [admissionRoundFilter, setAdmissionRoundFilter] = useState<string>("all");
  const [universityFilter, setUniversityFilter] = useState<string>("all");
  const [majorFilter, setMajorFilter] = useState<string>("all");
  const [subjectGroupFilter, setSubjectGroupFilter] = useState<string>("all");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const hasLoadedInitialApplications = useRef(false);

  const buildApplicationFilters = () => ({
    status: statusFilter,
    universityId: universityFilter,
    majorId: majorFilter,
    admissionRoundId: admissionRoundFilter,
  });

  // ⏱️ Optimization: Load all required data in parallel
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadApplicationManagementData();
        await getApplications(buildApplicationFilters());
        hasLoadedInitialApplications.current = true;
      } catch (error) {
        console.error("Failed to load application management data:", error);
      }
    };
    loadData();
  }, []);

  // Refetch applications when filters change
  useEffect(() => {
    if (!hasLoadedInitialApplications.current) {
      return;
    }

    getApplications({
      status: statusFilter,
      universityId: universityFilter,
      majorId: majorFilter,
      admissionRoundId: admissionRoundFilter,
    });
  }, [getApplications, statusFilter, universityFilter, majorFilter, admissionRoundFilter]);

  const filteredMajors = useMemo(() => {
    if (universityFilter === "all") return safeMajors;
    return safeMajors.filter(m => m.universityId === universityFilter);
  }, [safeMajors, universityFilter]);

  const filteredApplications = useMemo(() => {
    return safeApplications.filter(app => {
      // Status filter
      if (statusFilter !== "all" && app.status !== statusFilter) return false;

      // Admission round filter
      if (admissionRoundFilter !== "all" && app.admissionRoundId !== admissionRoundFilter) return false;

      // University filter
      if (universityFilter !== "all" && app.universityId !== universityFilter) return false;

      // Major filter
      if (majorFilter !== "all" && app.majorId !== majorFilter) return false;

      // Subject group filter
      if (subjectGroupFilter !== "all" && app.subjectGroupCode !== subjectGroupFilter) return false;

      // Search text
      if (searchText.trim()) {
        const lowerSearch = searchText.toLowerCase().trim();
        const appCode = (app.applicationCode || "").toLowerCase();
        
        const candidate = getCandidateById(app.candidateId);
        const candidateName = (candidate?.fullName || "").toLowerCase();
        
        const university = getUniversityById(app.universityId);
        const uniName = (university?.name || "").toLowerCase();
        
        const major = getMajorById(app.majorId);
        const majorName = (major?.name || "").toLowerCase();

        if (
          !appCode.includes(lowerSearch) &&
          !candidateName.includes(lowerSearch) &&
          !uniName.includes(lowerSearch) &&
          !majorName.includes(lowerSearch)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    safeApplications, 
    statusFilter, 
    admissionRoundFilter,
    universityFilter, 
    majorFilter, 
    subjectGroupFilter, 
    searchText,
    getCandidateById,
    getUniversityById,
    getMajorById
  ]);

  // Sort applications: pending (chờ duyệt) first, then approved, then rejected
  const sortedApplications = useMemo(() => {
    const order: Record<string, number> = { pending: 0, approved: 1, rejected: 2 };
    return filteredApplications.slice().sort((a, b) => {
      const oa = order[a.status] ?? 99;
      const ob = order[b.status] ?? 99;
      if (oa !== ob) return oa - ob;
      const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return tb - ta;
    });
  }, [filteredApplications]);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [statusFilter, admissionRoundFilter, universityFilter, majorFilter, subjectGroupFilter, searchText]);

  const handleUniversityChange = (value: string) => {
    setUniversityFilter(value);
    setMajorFilter("all"); // reset major when university changes
  };

  const clearSelection = () => {
    setSelectedRowKeys([]);
  };

  const handleBulkStatusChange = (status: "APPROVED" | "REJECTED") => {
    if (!currentUser) {
      message.error("Không xác định được quản trị viên đang đăng nhập");
      return;
    }

    const selectedIds = selectedRowKeys.map(String);
    if (selectedIds.length === 0) {
      message.warning("Chọn ít nhất một hồ sơ để thao tác hàng loạt");
      return;
    }

    Modal.confirm({
      title: status === "APPROVED" ? "Duyệt hồ sơ hàng loạt" : "Từ chối hồ sơ hàng loạt",
      content: `Bạn chắc chắn muốn ${status === "APPROVED" ? "duyệt" : "từ chối"} ${selectedIds.length} hồ sơ đã chọn?`,
      okText: status === "APPROVED" ? "Duyệt" : "Từ chối",
      okButtonProps: { danger: status === "REJECTED" },
      cancelText: "Hủy",
      onOk: async () => {
        setBulkLoading(true);
        try {
          await bulkUpdateApplicationStatus(selectedIds, status, currentUser.id);
          message.success(`Đã ${status === "APPROVED" ? "duyệt" : "từ chối"} ${selectedIds.length} hồ sơ`);
          clearSelection();
        } catch (error) {
          message.error("Không thể thực hiện thao tác hàng loạt");
        } finally {
          setBulkLoading(false);
        }
      }
    });
  };

  const handleExportExcel = async () => {
    try {
      setBulkLoading(true);
      const xlsx = await getAdminApplicationsExcel(buildApplicationFilters());
      const blob = new Blob([xlsx], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `admin-applications-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success("Đã xuất Excel thành công");
    } catch (error) {
      message.error("Không thể xuất Excel");
    } finally {
      setBulkLoading(false);
    }
  };

  const columns = [
    {
      title: "Mã hồ sơ",
      dataIndex: "applicationCode",
      key: "applicationCode",
      render: (text: string) => <strong>{text || "Chưa cập nhật"}</strong>
    },
    {
      title: "Đợt xét tuyển",
      dataIndex: "admissionRoundId",
      key: "admissionRoundId",
      render: (id: string) => {
        const round = id ? getAdmissionRoundById(id) : null;
        return round ? <Typography.Text>{round.code}</Typography.Text> : <Typography.Text type="secondary">Chưa xác định</Typography.Text>;
      }
    },
    {
      title: "Thí sinh",
      dataIndex: "candidateId",
      key: "candidateId",
      render: (id: string) => getCandidateById(id)?.fullName || "Không rõ thí sinh"
    },
    {
      title: "Trường",
      dataIndex: "universityId",
      key: "universityId",
      render: (id: string) => getUniversityById(id)?.name || "Không rõ trường"
    },
    {
      title: "Ngành",
      dataIndex: "majorId",
      key: "majorId",
      render: (id: string) => getMajorById(id)?.name || "Không rõ ngành"
    },
    {
      title: "Tổ hợp",
      dataIndex: "subjectGroupCode",
      key: "subjectGroupCode",
      render: (text: string) => text || "Chưa cập nhật"
    },
    {
      title: "Tổng điểm",
      dataIndex: "totalScore",
      key: "totalScore",
      align: "center" as const,
      render: (val: number, record: any) => {
        const final = record.finalScore ?? (Number(val ?? 0) + Number(record.priorityScore ?? 0));
        return final !== undefined ? <Typography.Text type="danger" strong>{(final ?? 0).toFixed(2)}</Typography.Text> : "Chưa cập nhật";
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
      render: (date: string) => date ? formatDateTime(date) : "Chưa cập nhật"
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Application) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/admin/applications/${record.id}`)}>
          Xem chi tiết
        </Button>
      )
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Quản lý hồ sơ xét tuyển" 
        breadcrumbs={[{ title: "Tra cứu và theo dõi trạng thái các hồ sơ xét tuyển trong hệ thống" }]} 
      />

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm kiếm theo mã hồ sơ, thí sinh, trường, ngành..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
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
          <Col xs={24} sm={12} md={4}>
            <Select
              style={{ width: "100%" }}
              value={admissionRoundFilter}
              onChange={value => setAdmissionRoundFilter(value)}
              showSearch
              filterOption={(input, option) => 
                (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
              }
            >
              <Option value="all">Tất cả đợt</Option>
              {safeAdmissionRounds.map(r => (
                <Option key={r.id} value={r.id}>{r.code} - {r.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              style={{ width: "100%" }}
              value={universityFilter}
              onChange={handleUniversityChange}
              showSearch
              filterOption={(input, option) => 
                (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
              }
            >
              <Option value="all">Tất cả trường</Option>
              {safeUniversities.map(u => (
                <Option key={u.id} value={u.id}>{u.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              style={{ width: "100%" }}
              value={majorFilter}
              onChange={value => setMajorFilter(value)}
              showSearch
              filterOption={(input, option) => 
                (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
              }
              disabled={filteredMajors.length === 0}
            >
              <Option value="all">Tất cả ngành</Option>
              {filteredMajors.map(m => (
                <Option key={m.id} value={m.id}>{m.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              style={{ width: "100%" }}
              value={subjectGroupFilter}
              onChange={value => setSubjectGroupFilter(value)}
              showSearch
            >
              <Option value="all">Tất cả tổ hợp</Option>
              {safeSubjectGroups.map(sg => (
                <Option key={sg.code} value={sg.code}>{sg.code} - {sg.name}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} wrap>
          <Typography.Text type="secondary">
            {selectedRowKeys.length > 0
              ? `Đã chọn ${selectedRowKeys.length} hồ sơ`
              : "Chọn các hồ sơ để duyệt hoặc từ chối hàng loạt"}
          </Typography.Text>
          <Space wrap>
            <Button onClick={handleExportExcel} loading={bulkLoading}>
              Xuất Excel theo bộ lọc
            </Button>
            <Button
              type="primary"
              onClick={() => handleBulkStatusChange("APPROVED")}
              disabled={selectedRowKeys.length === 0}
              loading={bulkLoading}
            >
              Duyệt hàng loạt
            </Button>
            <Button
              danger
              onClick={() => handleBulkStatusChange("REJECTED")}
              disabled={selectedRowKeys.length === 0}
              loading={bulkLoading}
            >
              Từ chối hàng loạt
            </Button>
          </Space>
        </Space>
        {loading && filteredApplications.length === 0 ? (
          <Table
            columns={columns}
            dataSource={[]}
            rowKey="id"
            scroll={{ x: true }}
            loading={true}
            pagination={false}
          />
        ) : filteredApplications.length > 0 ? (
          <Table 
            columns={columns} 
            dataSource={sortedApplications} 
            rowKey="id" 
            scroll={{ x: true }}
            loading={loading}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
            }}
          />
        ) : (
          <EmptyState description="Không tìm thấy hồ sơ xét tuyển phù hợp" />
        )}
      </Card>
    </div>
  );
};
