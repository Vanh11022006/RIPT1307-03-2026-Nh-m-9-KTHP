import React, { useState, useMemo } from "react";
import { Card, Table, Input, Select, Button, Row, Col } from "antd";
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
import { formatDate } from "../../utils/date";

const { Option } = Select;

export const MyApplications: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { getCandidateByUserId } = useCandidateStore();
  const { getApplicationsByCandidateId } = useApplicationStore();
  const { universities } = useUniversityStore();
  const { majors } = useMajorStore();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const candidate = currentUser ? getCandidateByUserId(currentUser.id) : null;

  const applications = useMemo(() => {
    if (!candidate) return [];
    return getApplicationsByCandidateId(candidate.id);
  }, [candidate, getApplicationsByCandidateId]);

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
      align: "center" as const
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
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => navigate(`/candidate/applications/${record.id}`)}>
          Xem chi tiết
        </Button>
      )
    }
  ];

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
          <Table
            columns={columns}
            dataSource={filteredApplications}
            rowKey="id"
            scroll={{ x: true }}
          />
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
