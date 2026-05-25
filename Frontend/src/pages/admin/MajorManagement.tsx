import React, { useState, useMemo } from "react";
import { Card, Table, Input, Select, Row, Col, Typography, Tag, Button, Modal, Form, Space, message, InputNumber, Popconfirm } from "antd";
import { SearchOutlined, PlusOutlined, EditOutlined, CloseOutlined } from "@ant-design/icons";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { EntityStatusTag } from "../../components/status/EntityStatusTag";
import { useMajorStore } from "../../stores/major.store";
import { useUniversityStore } from "../../stores/university.store";
import { useSubjectGroupStore } from "../../stores/subjectGroup.store";
import type { Major } from "../../types/major.types";

const { Option } = Select;
const { Text } = Typography;

export const MajorManagement: React.FC = () => {
  const { majors, createMajor, updateMajor, toggleMajorStatus, getMajors } = useMajorStore();
  const { universities, getUniversityById } = useUniversityStore();
  const { subjectGroups } = useSubjectGroupStore();

  const safeMajors = Array.isArray(majors) ? majors : [];
  const safeUniversities = Array.isArray(universities) ? universities : [];
  const safeSubjectGroups = Array.isArray(subjectGroups) ? subjectGroups : [];

  const [searchText, setSearchText] = useState("");
  const [universityFilter, setUniversityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const filteredMajors = useMemo(() => {
    return safeMajors.filter((m) => {
      // Status filter
      if (statusFilter !== "all" && m.status !== statusFilter) return false;

      // University filter
      if (universityFilter !== "all" && m.universityId !== universityFilter) return false;

      // Search text
      if (searchText.trim()) {
        const lowerSearch = searchText.toLowerCase().trim();
        const code = (m.code || "").toLowerCase();
        const name = (m.name || "").toLowerCase();
        
        if (!code.includes(lowerSearch) && !name.includes(lowerSearch)) {
          return false;
        }
      }

      return true;
    });
  }, [safeMajors, searchText, universityFilter, statusFilter]);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ status: "active" });
    setIsModalVisible(true);
  };

  const handleEdit = (record: Major) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingId(null);
  };

  const handleModalSubmit = async (values: any) => {
    const now = new Date().toISOString();
    
    // Safety for subjectGroupCodes
    const finalSubjectGroupCodes = Array.isArray(values.subjectGroupCodes) ? values.subjectGroupCodes : [];

    const payload = {
      ...values,
      subjectGroupCodes: finalSubjectGroupCodes,
      description: values.description || ""
    };

    try {
      if (editingId) {
        await updateMajor(editingId, {
          ...payload,
          updatedAt: now
        });
        await getMajors();
        message.success("Cập nhật ngành học thành công");
      } else {
        await createMajor({
          ...payload,
          createdAt: now,
          updatedAt: now
        });
        await getMajors();
        message.success("Thêm ngành học thành công");
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingId(null);
    } catch (error) {
      message.error("Không thể lưu thông tin ngành học");
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    toggleMajorStatus(id);
    if (currentStatus === "active") {
      message.success("Đã ngừng hoạt động ngành học");
    } else {
      message.success("Đã kích hoạt ngành học");
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "Chưa cập nhật";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value) + " / năm";
  };

  const columns = [
    {
      title: "Mã ngành",
      dataIndex: "code",
      key: "code",
      render: (text: string) => <strong>{text || "Chưa cập nhật"}</strong>
    },
    {
      title: "Tên ngành",
      dataIndex: "name",
      key: "name",
      render: (text: string) => text || "Chưa cập nhật"
    },
    {
      title: "Trường",
      dataIndex: "universityId",
      key: "universityId",
      render: (id: string) => {
        const university = getUniversityById(id);
        return university ? university.name : "Không rõ trường";
      }
    },
    {
      title: "Chỉ tiêu",
      dataIndex: "admissionQuota",
      key: "admissionQuota",
      align: "center" as const,
      render: (val: number) => val !== undefined ? val : "Chưa cập nhật"
    },
    {
      title: "Tổ hợp",
      dataIndex: "subjectGroupCodes",
      key: "subjectGroupCodes",
      render: (codes: any) => {
        const safeCodes = Array.isArray(codes) ? codes : [];
        if (safeCodes.length === 0) return <Text type="secondary">Chưa cập nhật</Text>;
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {safeCodes.map(c => <Tag color="blue" key={c}>{c}</Tag>)}
          </div>
        );
      }
    },
    {
      title: "Điểm sàn",
      dataIndex: "minScore",
      key: "minScore",
      align: "center" as const,
      render: (val: number) => val !== undefined ? <Text type="danger" strong>{val.toFixed(2)}</Text> : "Chưa cập nhật"
    },
    {
      title: "Học phí",
      dataIndex: "tuitionFeePerYear",
      key: "tuitionFeePerYear",
      render: (val: number) => formatCurrency(val)
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (status: any) => <EntityStatusTag status={status} />
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Major) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title={record.status === "active" ? "Bạn có chắc muốn ngừng hoạt động ngành này?" : "Bạn có chắc muốn kích hoạt lại ngành này?"}
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

  const activeUniversities = safeUniversities.filter(u => u.status === "active");

  return (
    <div>
      <PageHeader 
        title="Quản lý ngành học" 
        breadcrumbs={[{ title: "Danh sách và tra cứu các ngành học trong hệ thống" }]} 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm ngành
          </Button>
        }
      />

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={10}>
            <Input
              placeholder="Tìm kiếm theo mã ngành, tên ngành..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={6} md={7}>
            <Select
              style={{ width: "100%" }}
              value={universityFilter}
              onChange={value => setUniversityFilter(value)}
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
        {filteredMajors.length > 0 ? (
          <Table 
            columns={columns} 
            dataSource={filteredMajors} 
            rowKey="id" 
            scroll={{ x: true }}
          />
        ) : (
          <EmptyState description="Không tìm thấy ngành học phù hợp" />
        )}
      </Card>

      <Modal
        className="dark-modal"
        title={<span style={{ color: "#fff" }}>{editingId ? "Cập nhật ngành học" : "Thêm ngành học"}</span>}
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
            <Col xs={24}>
              <Form.Item
                name="universityId"
                label="Trường đại học"
                rules={[{ required: true, message: "Vui lòng chọn trường đại học" }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn trường đại học"
                  filterOption={(input, option) => 
                    (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                  }
                  notFoundContent="Không có trường đại học nào đang hoạt động"
                >
                  {(editingId ? safeUniversities : activeUniversities).map(u => (
                    <Option key={u.id} value={u.id}>{u.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="code"
                label="Mã ngành"
                rules={[
                  { required: true, message: "Vui lòng nhập mã ngành" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      const uniId = getFieldValue("universityId");
                      if (!uniId) return Promise.resolve(); // cannot validate without uniId
                      
                      const isDuplicate = safeMajors.some(m => 
                        m.universityId === uniId &&
                        m.code.trim().toLowerCase() === value.trim().toLowerCase() &&
                        m.id !== editingId
                      );
                      
                      if (isDuplicate) return Promise.reject(new Error("Mã ngành này đã tồn tại trong trường đã chọn"));
                      return Promise.resolve();
                    }
                  })
                ]}
              >
                <Input placeholder="VD: IT1" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={16}>
              <Form.Item
                name="name"
                label="Tên ngành"
                rules={[{ required: true, message: "Vui lòng nhập tên ngành" }]}
              >
                <Input placeholder="Nhập tên ngành" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="admissionQuota"
                label="Chỉ tiêu"
                rules={[
                  { required: true, message: "Vui lòng nhập chỉ tiêu" },
                  { type: "number", min: 1, message: "Chỉ tiêu phải lớn hơn 0" }
                ]}
              >
                <InputNumber style={{ width: "100%" }} placeholder="Nhập số lượng chỉ tiêu" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="minScore"
                label="Điểm sàn"
                rules={[
                  { required: true, message: "Vui lòng nhập điểm sàn" },
                  { type: "number", min: 0, max: 30, message: "Điểm sàn phải từ 0 đến 30" }
                ]}
              >
                <InputNumber style={{ width: "100%" }} placeholder="Nhập điểm sàn (VD: 20.5)" step={0.25} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="subjectGroupCodes"
                label="Tổ hợp xét tuyển"
                rules={[
                  { required: true, message: "Vui lòng chọn ít nhất 1 tổ hợp" },
                  { type: "array", min: 1, message: "Vui lòng chọn ít nhất 1 tổ hợp" }
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn các tổ hợp xét tuyển"
                  allowClear
                >
                  {safeSubjectGroups.map(sg => (
                    <Option key={sg.code} value={sg.code}>{sg.code} - {sg.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="tuitionFeePerYear"
                label="Học phí mỗi năm (VNĐ)"
                rules={[
                  { required: true, message: "Vui lòng nhập học phí" },
                  { type: "number", min: 0, message: "Học phí không được âm" }
                ]}
              >
                <InputNumber 
                  style={{ width: "100%" }} 
                  placeholder="Nhập học phí mỗi năm" 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="description"
                label="Mô tả"
              >
                <Input.TextArea rows={4} placeholder="Nhập mô tả về ngành học" />
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
