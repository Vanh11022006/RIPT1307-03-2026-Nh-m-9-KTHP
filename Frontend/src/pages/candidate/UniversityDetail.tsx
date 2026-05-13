import React, { useMemo } from "react";
import { Card, Result, Button, Descriptions, Table, Typography, Space, Tag, Row, Col } from "antd";
import { BankOutlined, EnvironmentOutlined, GlobalOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { PageHeader } from "../../components/common/PageHeader";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";
import { formatCurrency } from "../../utils/format";

const { Title, Paragraph, Text } = Typography;

export const UniversityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/candidate') ? '/candidate' : '';
  const listPath = basePath ? `${basePath}/universities` : '/universities';
  
  const { getUniversityById } = useUniversityStore();
  const { getActiveMajorsByUniversityId } = useMajorStore();

  const university = useMemo(() => {
    if (!id) return undefined;
    return getUniversityById(id);
  }, [id, getUniversityById]);

  const majors = useMemo(() => {
    if (!id) return [];
    return getActiveMajorsByUniversityId(id);
  }, [id, getActiveMajorsByUniversityId]);

  if (!university || university.status !== "active") {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Result
            status="404"
            title="Trường không tồn tại"
            subTitle="Xin lỗi, trường đại học bạn tìm kiếm không tồn tại hoặc đã ngừng tuyển sinh."
            extra={<Button type="primary" onClick={() => navigate(listPath)}>Quay lại danh sách trường</Button>}
          />
        </Card>
      </div>
    );
  }

  const majorColumns = [
    {
      title: "Mã ngành",
      dataIndex: "code",
      key: "code",
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: "Tên ngành",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Chỉ tiêu",
      dataIndex: "admissionQuota",
      key: "admissionQuota",
      align: "center" as const,
    },
    {
      title: "Tổ hợp xét tuyển",
      dataIndex: "subjectGroupCodes",
      key: "subjectGroupCodes",
      render: (groups: string[]) => {
        const safeGroups = Array.isArray(groups) ? groups : [];
        return (
          <Space wrap>
            {safeGroups.map(group => (
              <Tag color="blue" key={group}>{group}</Tag>
            ))}
          </Space>
        );
      }
    },
    {
      title: "Điểm sàn",
      dataIndex: "minScore",
      key: "minScore",
      align: "center" as const,
      render: (score: number) => <Text type="danger" strong>{score}</Text>
    },
    {
      title: "Học phí dự kiến",
      dataIndex: "tuitionFeePerYear",
      key: "tuitionFeePerYear",
      render: (fee: number) => formatCurrency(fee)
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Chi tiết trường đại học" 
        breadcrumbs={[
          { title: "Danh sách trường", href: listPath }, 
          { title: university.shortName }
        ]} 
        extra={
          <Button type="primary" size="large" onClick={() => navigate(`/candidate/apply?universityId=${university.id}`)}>
            Nộp hồ sơ vào trường này
          </Button>
        }
      />
      
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 24 }}>
              <div style={{ 
                width: 80, 
                height: 80, 
                borderRadius: 12, 
                background: "#f0f2f5", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                marginRight: 24,
                flexShrink: 0
              }}>
                <BankOutlined style={{ fontSize: 40, color: "#1677ff" }} />
              </div>
              <div style={{ flex: 1 }}>
                <Title level={3} style={{ margin: 0 }}>{university.name}</Title>
                <Space size="large" style={{ marginTop: 8 }}>
                  <Text type="secondary" strong>Mã: {university.code}</Text>
                  <Text type="secondary">Viết tắt: {university.shortName}</Text>
                </Space>
              </div>
            </div>

            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
              <Descriptions.Item label={<><EnvironmentOutlined /> Tỉnh/Thành phố</>}>
                {university.city}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ chi tiết" span={1}>
                {university.address}
              </Descriptions.Item>
              <Descriptions.Item label={<><GlobalOutlined /> Website</>}>
                <a href={`https://${university.website}`} target="_blank" rel="noopener noreferrer">
                  {university.website}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined /> Email</>}>
                <a href={`mailto:${university.email}`}>
                  {university.email}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label={<><PhoneOutlined /> Điện thoại</>}>
                {university.phone}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <Title level={5}>Giới thiệu chung</Title>
              <Paragraph style={{ whiteSpace: "pre-line" }}>
                {university.description}
              </Paragraph>
            </div>
          </Card>
        </Col>

        <Col span={24}>
          <Card title={<Title level={4} style={{ margin: 0 }}>Danh sách ngành tuyển sinh</Title>}>
            <Table 
              dataSource={majors} 
              columns={majorColumns} 
              rowKey="id" 
              pagination={false}
              scroll={{ x: true }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
