import React, { useEffect, useState, useMemo } from "react";
import { Card, Row, Col, Input, Select, Button, Space, Typography, Pagination } from "antd";
import { SearchOutlined, BankOutlined, EnvironmentOutlined, GlobalOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { useUniversityStore } from "../../stores/university.store";
import { loadUniversityListData } from "../../utils/dataLoader";

const { Title, Text } = Typography;
const { Option } = Select;

export const UniversityList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/candidate') ? '/candidate' : '';
  
  const { universities, loading, getActiveUniversities, getUniversities } = useUniversityStore();
  const activeUniversities = getActiveUniversities();

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadUniversityListData();
      } catch (error) {
        console.error("Failed to load university list data:", error);
      }
    };
    loadData();
  }, [getUniversities]);

  const [searchText, setSearchText] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);

  // Extract unique cities for the filter
  const cities = useMemo(() => {
    const allCities = activeUniversities
      .map((u) => (u.city || "").toString().trim())
      .filter((c) => c.length > 0);
    return Array.from(new Set(allCities)).sort();
  }, [activeUniversities]);

  const filteredUniversities = useMemo(() => {
    return activeUniversities.filter((u) => {
      // Filter by city
      if (selectedCity && u.city !== selectedCity) return false;

      // Filter by search text (name, code, shortName)
      if (searchText) {
        const lowerSearch = searchText.toLowerCase();
        const matchName = u.name.toLowerCase().includes(lowerSearch);
        const matchCode = u.code.toLowerCase().includes(lowerSearch);
        const matchShortName = u.shortName.toLowerCase().includes(lowerSearch);
        
        if (!matchName && !matchCode && !matchShortName) return false;
      }

      return true;
    });
  }, [activeUniversities, searchText, selectedCity]);

  // reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedCity]);

  const paginatedUniversities = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUniversities.slice(start, start + pageSize);
  }, [filteredUniversities, currentPage, pageSize]);

  return (
    <div>
      <PageHeader title="Danh sách trường đại học" />
      
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={16} md={18}>
            <Input
              id="uni-search"
              placeholder="Tìm kiếm theo mã trường, tên trường, tên viết tắt..."
              prefix={<SearchOutlined />}
              size="large"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              style={{ width: "100%" }}
              size="large"
              placeholder="Lọc theo Tỉnh/Thành phố"
              allowClear
              value={selectedCity}
              onChange={(value) => setSelectedCity(value)}
            >
              {cities.map(city => (
                <Option key={city} value={city}>{city}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {loading && universities.length === 0 ? (
        <Card>
          <LoadingScreen tip="Đang tải danh sách trường đại học..." />
        </Card>
      ) : filteredUniversities.length > 0 ? (
        <>
        <Row gutter={[24, 24]}>
          {paginatedUniversities.map((university) => (
            <Col xs={24} sm={12} lg={8} key={university.id}>
              <Card
                hoverable
                style={{ height: "100%", display: "flex", flexDirection: "column" }}
                bodyStyle={{ flex: 1, display: "flex", flexDirection: "column" }}
                actions={[
                  <Button type="link" onClick={() => navigate(`${basePath}/universities/${university.id}`)}>
                    Xem chi tiết
                  </Button>,
                  <Button type="primary" onClick={() => navigate(`/candidate/apply?universityId=${university.id}`)}>
                    Nộp hồ sơ
                  </Button>
                ]}
              >
                <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 12, 
                    background: "rgba(16, 185, 129, 0.1)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    marginRight: 16,
                    flexShrink: 0
                  }}>
                    <BankOutlined style={{ fontSize: 24, color: "#10b981" }} />
                  </div>
                  <div>
                    <Title level={5} style={{ margin: 0, lineHeight: 1.4 }}>
                      {university.name}
                    </Title>
                    <Space size="small" style={{ marginTop: 4 }}>
                      <Text type="secondary" strong>{university.code}</Text>
                      <Text type="secondary">•</Text>
                      <Text type="secondary">{university.shortName}</Text>
                    </Space>
                  </div>
                </div>

                <div style={{ marginTop: "auto" }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                    <EnvironmentOutlined style={{ marginRight: 8, color: "#8c8c8c" }} />
                    <Text>{university.city}</Text>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <GlobalOutlined style={{ marginRight: 8, color: "#8c8c8c" }} />
                    <Text
                      style={{ maxWidth: 200 }}
                      ellipsis={{ tooltip: university.website }}
                    >
                      <a href={`https://${university.website}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        {university.website}
                      </a>
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredUniversities.length}
            onChange={(page, size) => { setCurrentPage(page); setPageSize(size || pageSize); }}
            showSizeChanger
            pageSizeOptions={[6,9,12,24].map(n => String(n))}
            showQuickJumper
          />
        </div>
        </>
      ) : (
        <Card>
          <EmptyState description="Không tìm thấy trường đại học phù hợp" />
        </Card>
      )}
    </div>
  );
};
