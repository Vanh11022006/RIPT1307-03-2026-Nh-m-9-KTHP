import React, { useState, useMemo } from "react";
import { Card, Table, Input, Select, Row, Col, Button, Drawer, Descriptions, Statistic, Space, Tag, Typography } from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { ApplicationStatusTag } from "../../components/status/ApplicationStatusTag";
import { useCandidateStore } from "../../stores/candidate.store";
import { useApplicationStore } from "../../stores/application.store";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";
import type { Candidate } from "../../types/candidate.types";
import { formatDate, formatDateTime } from "../../utils/date";

const { Option } = Select;

export const CandidateManagement: React.FC = () => {
  const navigate = useNavigate();
  const { candidates } = useCandidateStore();
  const { applications, getApplicationsByCandidateId } = useApplicationStore();
  const { getUniversityById } = useUniversityStore();
  const { getMajorById } = useMajorStore();

  const safeCandidates = Array.isArray(candidates) ? candidates : [];
  const safeApplications = Array.isArray(applications) ? applications : [];

  const [searchText, setSearchText] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const cities = useMemo(() => {
    const allCities = safeCandidates.map(c => c.city).filter(Boolean);
    return Array.from(new Set(allCities)).sort();
  }, [safeCandidates]);

  const years = useMemo(() => {
    const allYears = safeCandidates.map(c => c.graduationYear).filter(Boolean);
    return Array.from(new Set(allYears)).sort((a, b) => b - a); // Descending
  }, [safeCandidates]);

  const filteredCandidates = useMemo(() => {
    return safeCandidates.filter((c) => {
      // City filter
      if (cityFilter !== "all" && c.city !== cityFilter) return false;

      // Year filter
      if (yearFilter !== "all" && String(c.graduationYear) !== yearFilter) return false;

      // Search text
      if (searchText.trim()) {
        const lowerSearch = searchText.toLowerCase().trim();
        const name = (c.fullName || "").toLowerCase();
        const email = (c.email || "").toLowerCase();
        const phone = (c.phone || "").toLowerCase();
        const citizenId = (c.citizenId || "").toLowerCase();
        
        if (!name.includes(lowerSearch) && 
            !email.includes(lowerSearch) && 
            !phone.includes(lowerSearch) && 
            !citizenId.includes(lowerSearch)) {
          return false;
        }
      }

      return true;
    });
  }, [safeCandidates, searchText, cityFilter, yearFilter]);

  const getApplicationCount = (candidateId: string) => {
    return safeApplications.filter(a => a.candidateId === candidateId).length;
  };

  const handleViewDetail = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerVisible(false);
    setSelectedCandidate(null);
  };

  const columns = [
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => <strong>{text || "Chưa cập nhật"}</strong>
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text: string) => text || "Chưa cập nhật"
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (text: string) => text || "Chưa cập nhật"
    },
    {
      title: "CCCD",
      dataIndex: "citizenId",
      key: "citizenId",
      render: (text: string) => text || "Chưa cập nhật"
    },
    {
      title: "Thành phố",
      dataIndex: "city",
      key: "city",
      render: (text: string) => text || "Chưa cập nhật"
    },
    {
      title: "Trường THPT",
      dataIndex: "highSchool",
      key: "highSchool",
      render: (text: string) => text || "Chưa cập nhật"
    },
    {
      title: "Năm tốt nghiệp",
      dataIndex: "graduationYear",
      key: "graduationYear",
      align: "center" as const,
      render: (val: number) => val || "Chưa cập nhật"
    },
    {
      title: "Số hồ sơ",
      key: "applicationCount",
      align: "center" as const,
      render: (_: any, record: Candidate) => getApplicationCount(record.id)
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Candidate) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
          Xem chi tiết
        </Button>
      )
    }
  ];

  // Selected candidate's applications
  const selectedCandidateApps = useMemo(() => {
    if (!selectedCandidate) return [];
    if (getApplicationsByCandidateId) {
      return getApplicationsByCandidateId(selectedCandidate.id);
    }
    return safeApplications.filter(a => a.candidateId === selectedCandidate.id);
  }, [selectedCandidate, getApplicationsByCandidateId, safeApplications]);

  const appStats = useMemo(() => {
    return {
      total: selectedCandidateApps.length,
      pending: selectedCandidateApps.filter(a => a.status === "pending").length,
      approved: selectedCandidateApps.filter(a => a.status === "approved").length,
      rejected: selectedCandidateApps.filter(a => a.status === "rejected").length,
    };
  }, [selectedCandidateApps]);

  const drawerColumns = [
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
    },
    {
      title: "Tổng điểm",
      dataIndex: "totalScore",
      key: "totalScore",
      render: (val: number) => <Typography.Text type="danger" strong>{val.toFixed(2)}</Typography.Text>
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
      render: (date: string) => formatDateTime(date)
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => navigate(`/admin/applications/${record.id}`)}>
          Xem hồ sơ
        </Button>
      )
    }
  ];

  const genderMap: Record<string, string> = {
    male: "Nam",
    female: "Nữ",
    other: "Khác"
  };

  return (
    <div>
      <PageHeader 
        title="Quản lý thí sinh" 
        breadcrumbs={[{ title: "Tra cứu và xem thông tin thí sinh trong hệ thống" }]} 
      />

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={10}>
            <Input
              placeholder="Tìm kiếm theo họ tên, email, SĐT, CCCD..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={6} md={7}>
            <Select
              style={{ width: "100%" }}
              value={cityFilter}
              onChange={value => setCityFilter(value)}
              showSearch
            >
              <Option value="all">Tất cả thành phố</Option>
              {cities.map(city => (
                <Option key={city} value={city}>{city}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={6} md={7}>
            <Select
              style={{ width: "100%" }}
              value={yearFilter}
              onChange={value => setYearFilter(value)}
              showSearch
            >
              <Option value="all">Tất cả năm tốt nghiệp</Option>
              {years.map(year => (
                <Option key={year} value={String(year)}>{year}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        {filteredCandidates.length > 0 ? (
          <Table 
            columns={columns} 
            dataSource={filteredCandidates} 
            rowKey="id" 
            scroll={{ x: true }}
          />
        ) : (
          <EmptyState description="Không tìm thấy thí sinh phù hợp" />
        )}
      </Card>

      <Drawer
        title="Chi tiết thí sinh"
        placement="right"
        width={900}
        onClose={handleCloseDrawer}
        open={isDrawerVisible}
      >
        {selectedCandidate ? (
          <div>
            <Descriptions title="Thông tin cá nhân" bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Họ tên" span={2}><strong>{selectedCandidate.fullName || "Chưa cập nhật"}</strong></Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">{selectedCandidate.dateOfBirth ? formatDate(selectedCandidate.dateOfBirth) : "Chưa cập nhật"}</Descriptions.Item>
              <Descriptions.Item label="Giới tính">{selectedCandidate.gender ? genderMap[selectedCandidate.gender] : "Chưa cập nhật"}</Descriptions.Item>
              <Descriptions.Item label="CCCD">{selectedCandidate.citizenId || "Chưa cập nhật"}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedCandidate.phone || "Chưa cập nhật"}</Descriptions.Item>
              <Descriptions.Item label="Email" span={2}>{selectedCandidate.email || "Chưa cập nhật"}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>{selectedCandidate.address || "Chưa cập nhật"}</Descriptions.Item>
            </Descriptions>

            <Descriptions title="Thông tin học vấn" bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Trường THPT" span={2}>{selectedCandidate.highSchool || "Chưa cập nhật"}</Descriptions.Item>
              <Descriptions.Item label="Thành phố">{selectedCandidate.city || "Chưa cập nhật"}</Descriptions.Item>
              <Descriptions.Item label="Năm tốt nghiệp">{selectedCandidate.graduationYear || "Chưa cập nhật"}</Descriptions.Item>
            </Descriptions>

            <Card title="Thống kê hồ sơ xét tuyển" size="small">
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic title="Tổng số hồ sơ" value={appStats.total} />
                </Col>
                <Col span={6}>
                  <Statistic 
                    title={<Space><Tag color="orange">Chờ duyệt</Tag></Space>} 
                    value={appStats.pending} 
                    valueStyle={{ color: '#faad14' }} 
                  />
                </Col>
                <Col span={6}>
                  <Statistic 
                    title={<Space><Tag color="green">Đã duyệt</Tag></Space>} 
                    value={appStats.approved} 
                    valueStyle={{ color: '#52c41a' }} 
                  />
                </Col>
                <Col span={6}>
                  <Statistic 
                    title={<Space><Tag color="red">Từ chối</Tag></Space>} 
                    value={appStats.rejected} 
                    valueStyle={{ color: '#ff4d4f' }} 
                  />
                </Col>
              </Row>
            </Card>

            <div style={{ marginTop: 24 }}>
              <Typography.Title level={5} style={{ marginBottom: 16 }}>Danh sách hồ sơ xét tuyển</Typography.Title>
              {selectedCandidateApps.length > 0 ? (
                <Table
                  columns={drawerColumns}
                  dataSource={selectedCandidateApps}
                  rowKey="id"
                  scroll={{ x: true }}
                  pagination={{ pageSize: 5 }}
                />
              ) : (
                <EmptyState description="Thí sinh này chưa có hồ sơ xét tuyển" />
              )}
            </div>
          </div>
        ) : (
          <EmptyState description="Không có dữ liệu thí sinh" />
        )}
      </Drawer>
    </div>
  );
};
