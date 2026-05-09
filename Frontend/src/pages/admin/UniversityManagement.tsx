import React, { useState, useMemo } from "react";
import { Card, Table, Input, Select, Row, Col, Typography, Button, Modal, Form, Space, message, Popconfirm } from "antd";
import { SearchOutlined, PlusOutlined, EditOutlined, CloseOutlined } from "@ant-design/icons";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { EntityStatusTag } from "../../components/status/EntityStatusTag";
import { useUniversityStore } from "../../stores/university.store";
import type { University } from "../../types/university.types";

const { Option } = Select;
const { Text } = Typography;

export const UniversityManagement: React.FC = () => {
  const { universities, createUniversity, updateUniversity, toggleUniversityStatus } = useUniversityStore();
  const safeUniversities = Array.isArray(universities) ? universities : [];

  const [searchText, setSearchText] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const cities = useMemo(() => {
    const allCities = safeUniversities.map(u => u.city).filter(Boolean);
    return Array.from(new Set(allCities)).sort();
  }, [safeUniversities]);

  const filteredUniversities = useMemo(() => {
    return safeUniversities.filter((u) => {
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (cityFilter !== "all" && u.city !== cityFilter) return false;
      
      if (searchText.trim()) {
        const lowerSearch = searchText.toLowerCase().trim();
        const code = (u.code || "").toLowerCase();
        const name = (u.name || "").toLowerCase();
        const shortName = (u.shortName || "").toLowerCase();
        const city = (u.city || "").toLowerCase();
        
        if (!code.includes(lowerSearch) && 
            !name.includes(lowerSearch) && 
            !shortName.includes(lowerSearch) && 
            !city.includes(lowerSearch)) {
          return false;
        }
      }
      return true;
    });
  }, [safeUniversities, searchText, cityFilter, statusFilter]);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ status: "active" });
    setIsModalVisible(true);
  };

  const handleEdit = (record: University) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingId(null);
  };

  const handleModalSubmit = (values: any) => {
    const now = new Date().toISOString();
    
    if (editingId) {
      updateUniversity(editingId, {
        ...values,
        updatedAt: now
      });
      message.success("Cập nhật trường đại học thành công");
    } else {
      const newId = `university_${Date.now()}`;
      createUniversity({
        ...values,
        id: newId,
        createdAt: now,
        updatedAt: now
      });
      message.success("Thêm trường đại học thành công");
    }
    
    setIsModalVisible(false);
    form.resetFields();
    setEditingId(null);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    toggleUniversityStatus(id);
    if (currentStatus === "active") {
      message.success("Đã ngừng hoạt động trường đại học");
    } else {
      message.success("Đã kích hoạt trường đại học");
    }
  };

  const columns = [
    {
      title: "Mã trường",
      dataIndex: "code",
      key: "code",
      render: (text: string) => <strong>{text || "Chưa cập nhật"}</strong>
    },
    {
      title: "Tên trường",
      dataIndex: "name",
      key: "name",
      render: (text: string) => text || "Chưa cập nhật"
    },
    {
      title: "Tên viết tắt",
      dataIndex: "shortName",
      key: "shortName",
      render: (text: string) => text || "Chưa cập nhật"
    },
    {
      title: "Thành phố",
      dataIndex: "city",
      key: "city",
      render: (text: string) => text || "Chưa cập nhật"
    },
    {
      title: "Website",
      dataIndex: "website",
      key: "website",
      render: (text: string) => {
        if (!text) return <Text type="secondary">Chưa cập nhật</Text>;
        return (
          <a href={`https://${text}`} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        );
      }
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: any) => <EntityStatusTag status={status} />
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: University) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title={record.status === "active" ? "Bạn có chắc muốn ngừng hoạt động trường này?" : "Bạn có chắc muốn kích hoạt lại trường này?"}
            okText="Xác nhận"
            cancelText="Hủy"
            onConfirm={() => handleToggleStatus(record.id, record.status)}
          >
            <Button type="link" danger={record.status === "active"}>
              {record.status === "active" ? "Ngừng hoạt động" : "Kích hoạt"}
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Quản lý trường đại học" 
        breadcrumbs={[{ title: "Danh sách và tra cứu các trường đại học trong hệ thống" }]} 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm trường
          </Button>
        }
      />

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={10}>
            <Input
              placeholder="Tìm kiếm theo mã, tên, viết tắt, thành phố..."
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
              value={statusFilter}
              onChange={value => setStatusFilter(value)}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Đang hoạt động</Option>
              <Option value="inactive">Ngừng hoạt động</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        {filteredUniversities.length > 0 ? (
          <Table 
            columns={columns} 
            dataSource={filteredUniversities} 
            rowKey="id" 
            scroll={{ x: true }}
          />
        ) : (
          <EmptyState description="Không tìm thấy trường đại học phù hợp" />
        )}
      </Card>

      <Modal
        className="dark-modal"
        title={<span style={{ color: "#fff" }}>{editingId ? "Cập nhật trường đại học" : "Thêm trường đại học"}</span>}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={800}
        destroyOnClose

        closeIcon={<CloseOutlined style={{ color: "rgba(255,255,255,0.6)" }} />}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="code"
                label="Mã trường"
                rules={[
                  { required: true, message: "Vui lòng nhập mã trường" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const isDuplicate = safeUniversities.some(u => 
                        u.code.trim().toLowerCase() === value.trim().toLowerCase() && 
                        u.id !== editingId
                      );
                      if (isDuplicate) return Promise.reject(new Error("Mã trường này đã tồn tại"));
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input placeholder="Nhập mã trường" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Tên trường"
                rules={[{ required: true, message: "Vui lòng nhập tên trường" }]}
              >
                <Input placeholder="Nhập tên trường" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="shortName"
                label="Tên viết tắt"
                rules={[{ required: true, message: "Vui lòng nhập tên viết tắt" }]}
              >
                <Input placeholder="VD: BKHN, KHTN" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="city"
                label="Thành phố"
                rules={[{ required: true, message: "Vui lòng nhập thành phố" }]}
              >
                <Input placeholder="Nhập thành phố" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="address"
                label="Địa chỉ"
              >
                <Input placeholder="Nhập địa chỉ chi tiết" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="website"
                label="Website"
                rules={[{ type: "url", message: "Vui lòng nhập đúng định dạng URL" }]}
              >
                <Input placeholder="VD: www.hust.edu.vn" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: "email", message: "Vui lòng nhập đúng định dạng email" }]}
              >
                <Input placeholder="Nhập email liên hệ" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="description"
                label="Mô tả"
              >
                <Input.TextArea rows={4} placeholder="Nhập mô tả về trường" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
              >
                <Select>
                  <Option value="active">Đang hoạt động</Option>
                  <Option value="inactive">Ngừng hoạt động</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Space style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Button onClick={handleModalCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              {editingId ? "Cập nhật" : "Thêm mới"}
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};
